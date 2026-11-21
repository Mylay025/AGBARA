import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LOCAL_PRODUCTS } from './src/data/catalogData.ts';
import type { Product } from './src/types/index.ts';

interface ProductOverride {
  name?: string;
  price?: number;
  shortDescription?: string;
  fullDescription?: string;
  status?: 'available' | 'unavailable' | 'out_of_stock';
  isActive?: boolean;
  updatedAt?: string;
}

interface StoredAdminAuth {
  username: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const OVERRIDES_FILE = path.join(DATA_DIR, 'catalog-overrides.json');
const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim() !== ''
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const KNOWN_PRODUCT_IDS = new Set(LOCAL_PRODUCTS.map((p) => p.id));

// Rate limiting simples em memória para tentativas de login
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 12;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sha256Digest(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function safeCompareText(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256Digest(a), sha256Digest(b));
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPasswordHash(password: string, salt: string, expectedHex: string): boolean {
  const actualBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function isEnvAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim() !== '');
}

function readStoredAuth(): StoredAdminAuth | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null;
    const raw = fs.readFileSync(AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredAdminAuth>;
    if (
      typeof parsed.username === 'string' &&
      typeof parsed.salt === 'string' &&
      typeof parsed.passwordHash === 'string'
    ) {
      return parsed as StoredAdminAuth;
    }
    return null;
  } catch {
    return null;
  }
}

function readOverrides(): Record<string, ProductOverride> {
  try {
    if (!fs.existsSync(OVERRIDES_FILE)) return {};
    const raw = fs.readFileSync(OVERRIDES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, ProductOverride>;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, ProductOverride>): void {
  ensureDataDir();
  const tmpFile = `${OVERRIDES_FILE}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(overrides, null, 2), 'utf8');
  fs.renameSync(tmpFile, OVERRIDES_FILE);
}

function getMergedProducts(): Product[] {
  const overrides = readOverrides();
  return LOCAL_PRODUCTS.map((base) => {
    const patch = overrides[base.id];
    if (!patch) return base;
    return {
      ...base,
      name: typeof patch.name === 'string' ? patch.name : base.name,
      price: typeof patch.price === 'number' ? patch.price : base.price,
      shortDescription:
        typeof patch.shortDescription === 'string'
          ? patch.shortDescription
          : base.shortDescription,
      fullDescription:
        typeof patch.fullDescription === 'string'
          ? patch.fullDescription
          : base.fullDescription,
      status:
        patch.status === 'available' ||
        patch.status === 'unavailable' ||
        patch.status === 'out_of_stock'
          ? patch.status
          : base.status,
      isActive: typeof patch.isActive === 'boolean' ? patch.isActive : base.isActive,
      updatedAt: typeof patch.updatedAt === 'string' ? patch.updatedAt : base.updatedAt,
    };
  });
}

function signSessionToken(username: string): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload: SessionPayload = { sub: username, iat: now, exp: expiresAt };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return { token: `${encodedPayload}.${signature}`, expiresAt };
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as Partial<SessionPayload>;
    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.exp !== 'number' ||
      decoded.exp <= Date.now()
    ) {
      return null;
    }
    return decoded as SessionPayload;
  } catch {
    return null;
  }
}

interface AuthenticatedRequest extends Request {
  adminUser?: string;
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autenticação administrativa necessária.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
    return;
  }
  req.adminUser = payload.sub;
  next();
}

function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(clientKey);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(clientKey, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function clearRateLimit(clientKey: string): void {
  loginAttempts.delete(clientKey);
}

async function startServer(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));

  // Catálogo público: exibe apenas produtos ativos e disponíveis
  app.get('/api/products', (_req: Request, res: Response) => {
    const publicProducts = getMergedProducts().filter(
      (p) => p.isActive && p.status !== 'unavailable'
    );
    res.json({ products: publicProducts });
  });

  // Status de configuração da autenticação administrativa
  app.get('/api/admin/auth-status', (_req: Request, res: Response) => {
    const envConfigured = isEnvAuthConfigured();
    const stored = readStoredAuth();
    res.json({
      configured: envConfigured || Boolean(stored),
      envConfigured,
      suggestedUsername: 'agbara',
    });
  });

  // Bootstrap único para primeiro acesso quando ADMIN_PASSWORD não está em process.env
  app.post('/api/admin/claim', (req: Request, res: Response) => {
    if (isEnvAuthConfigured() || readStoredAuth() !== null) {
      res.status(403).json({
        error: 'As credenciais administrativas já foram configuradas.',
      });
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;
    const rawUsername = typeof body?.username === 'string' ? body.username.trim() : '';
    const rawPassword = typeof body?.password === 'string' ? body.password : '';

    if (rawUsername.length < 3 || rawUsername.length > 60) {
      res.status(400).json({ error: 'Informe um nome de usuário válido (mínimo 3 caracteres).' });
      return;
    }
    if (rawPassword.length < 6 || rawPassword.length > 128) {
      res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const authRecord: StoredAdminAuth = {
      username: rawUsername,
      salt,
      passwordHash: hashPassword(rawPassword, salt),
      createdAt: new Date().toISOString(),
    };

    try {
      ensureDataDir();
      fs.writeFileSync(AUTH_FILE, JSON.stringify(authRecord, null, 2), {
        encoding: 'utf8',
        flag: 'wx',
      });
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'EEXIST') {
        res.status(403).json({
          error: 'As credenciais administrativas já foram configuradas.',
        });
        return;
      }
      res.status(500).json({ error: 'Não foi possível salvar a configuração inicial.' });
      return;
    }

    const session = signSessionToken(rawUsername);
    res.status(201).json({
      token: session.token,
      expiresAt: session.expiresAt,
      username: rawUsername,
    });
  });

  // Login administrativo
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        error: 'Muitas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.',
      });
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      res.status(400).json({ error: 'Informe usuário e senha.' });
      return;
    }

    if (isEnvAuthConfigured()) {
      const expectedUser = (process.env.ADMIN_USERNAME || 'agbara').trim();
      const expectedPassword = process.env.ADMIN_PASSWORD || '';
      const validUser = safeCompareText(username, expectedUser);
      const validPass =
        safeCompareText(password, expectedPassword) ||
        safeCompareText(password.trim(), expectedPassword.trim());
      if (!validUser || !validPass) {
        res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        return;
      }
      clearRateLimit(clientIp);
      const session = signSessionToken(expectedUser);
      res.json({
        token: session.token,
        expiresAt: session.expiresAt,
        username: expectedUser,
      });
      return;
    }

    const stored = readStoredAuth();
    if (!stored) {
      res.status(409).json({
        error: 'Defina as credenciais iniciais de administrador antes de entrar.',
      });
      return;
    }

    const validUser = safeCompareText(username, stored.username);
    const validPass = verifyPasswordHash(password, stored.salt, stored.passwordHash);
    if (!validUser || !validPass) {
      res.status(401).json({ error: 'Usuário ou senha inválidos.' });
      return;
    }

    clearRateLimit(clientIp);
    const session = signSessionToken(stored.username);
    res.json({
      token: session.token,
      expiresAt: session.expiresAt,
      username: stored.username,
    });
  });

  // Listar todos os 37 produtos para o admin (disponíveis e indisponíveis)
  app.get('/api/admin/products', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    res.json({ products: getMergedProducts() });
  });

  // Editar nome, valor, descrição e/ou disponibilidade (Disponível / Indisponível)
  app.patch('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const productId = String(req.params.id || '');
    if (!KNOWN_PRODUCT_IDS.has(productId)) {
      res.status(404).json({ error: 'Produto não encontrado no catálogo.' });
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ error: 'Dados inválidos.' });
      return;
    }

    const overrides = readOverrides();
    const currentPatch: ProductOverride = overrides[productId] ? { ...overrides[productId] } : {};

    if ('name' in body) {
      if (typeof body.name !== 'string') {
        res.status(400).json({ error: 'Nome inválido.' });
        return;
      }
      const trimmedName = body.name.trim();
      if (trimmedName.length === 0 || trimmedName.length > 160) {
        res.status(400).json({ error: 'O nome do produto deve ter entre 1 e 160 caracteres.' });
        return;
      }
      currentPatch.name = trimmedName;
    }

    if ('price' in body) {
      if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0 || body.price > 1000000) {
        res.status(400).json({ error: 'Valor inválido. Informe um número maior ou igual a zero.' });
        return;
      }
      currentPatch.price = Math.round(body.price * 100) / 100;
    }

    if ('shortDescription' in body) {
      if (typeof body.shortDescription !== 'string' || body.shortDescription.length > 500) {
        res.status(400).json({ error: 'Descrição curta inválida (máximo 500 caracteres).' });
        return;
      }
      currentPatch.shortDescription = body.shortDescription.trim();
    }

    if ('fullDescription' in body) {
      if (typeof body.fullDescription !== 'string' || body.fullDescription.length > 12000) {
        res.status(400).json({ error: 'Descrição completa inválida (máximo 12000 caracteres).' });
        return;
      }
      currentPatch.fullDescription = body.fullDescription.trim();
    }

    if ('available' in body) {
      if (typeof body.available !== 'boolean') {
        res.status(400).json({ error: 'Status de disponibilidade inválido.' });
        return;
      }
      currentPatch.status = body.available ? 'available' : 'unavailable';
      currentPatch.isActive = body.available;
    }

    currentPatch.updatedAt = new Date().toISOString();
    overrides[productId] = currentPatch;
    writeOverrides(overrides);

    const updatedProduct = getMergedProducts().find((p) => p.id === productId);
    res.json({ product: updatedProduct });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor AGBÁRA rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erro fatal ao iniciar servidor:', err);
  process.exit(1);
});
