import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  X,
  Search,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Check,
  AlertTriangle,
  Leaf,
  Lock,
} from 'lucide-react';
import type { Product } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  onSetAdminToken: (token: string | null) => void;
  onProductsUpdated: () => Promise<void> | void;
}

interface AuthStatus {
  configured: boolean;
  envConfigured: boolean;
  suggestedUsername: string;
}

interface PendingConfirm {
  title: string;
  question: string;
  confirmLabel: string;
  variant: 'warning' | 'primary';
  onConfirm: () => Promise<void>;
}

interface EditDraft {
  product: Product;
  name: string;
  price: string;
  shortDescription: string;
  fullDescription: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  onSetAdminToken,
  onProductsUpdated,
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Login / Primeiro acesso
  const [username, setUsername] = useState('agbara');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Lista de produtos no painel
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingAction, setSavingAction] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Edição (somente nome, valor e descrição)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [editError, setEditError] = useState('');

  // Confirmação antes da ação
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchAuthStatus = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth-status');
      if (!res.ok) throw new Error('Falha ao verificar status de acesso.');
      const data = (await res.json()) as AuthStatus;
      setAuthStatus(data);
      if (data.suggestedUsername && !username) {
        setUsername(data.suggestedUsername);
      }
    } catch {
      setAuthError('Não foi possível conectar ao servidor administrativo.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAdminProducts = async (token: string) => {
    setLoadingProducts(true);
    setProductsError('');
    try {
      const res = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        onSetAdminToken(null);
        setAuthError('Sessão expirada. Faça login novamente.');
        return;
      }
      if (!res.ok) throw new Error('Erro ao carregar produtos.');
      const data = (await res.json()) as { products: Product[] };
      setAdminProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      setProductsError('Erro ao carregar a lista de produtos.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (adminToken) {
      void fetchAdminProducts(adminToken);
    } else {
      void fetchAuthStatus();
    }
  }, [isOpen, adminToken]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return adminProducts;
    return adminProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [adminProducts, searchTerm]);

  const availableCount = useMemo(
    () => adminProducts.filter((p) => p.isActive && p.status !== 'unavailable').length,
    [adminProducts]
  );

  const unavailableCount = adminProducts.length - availableCount;

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('As senhas digitadas não coincidem.');
      return;
    }

    setSubmittingAuth(true);
    try {
      const res = await fetch('/api/admin/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Não foi possível configurar as credenciais.');
        return;
      }
      setPassword('');
      setConfirmPassword('');
      onSetAdminToken(data.token);
    } catch {
      setAuthError('Erro de conexão ao salvar as credenciais.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSubmittingAuth(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Usuário ou senha inválidos.');
        return;
      }
      setPassword('');
      onSetAdminToken(data.token);
    } catch {
      setAuthError('Erro de conexão ao realizar login.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const showTempFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev === msg ? '' : prev));
    }, 3500);
  };

  const patchProduct = async (
    productId: string,
    payload: {
      name?: string;
      price?: number;
      shortDescription?: string;
      fullDescription?: string;
      available?: boolean;
    }
  ): Promise<Product | null> => {
    if (!adminToken) return null;
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      onSetAdminToken(null);
      setAuthError('Sessão expirada. Faça login novamente.');
      return null;
    }

    const data = (await res.json()) as { product?: Product; error?: string };
    if (!res.ok || !data.product) {
      throw new Error(data.error || 'Não foi possível atualizar o produto.');
    }

    setAdminProducts((prev) =>
      prev.map((p) => (p.id === data.product!.id ? data.product! : p))
    );
    await onProductsUpdated();
    return data.product;
  };

  const requestToggleAvailability = (product: Product) => {
    const currentlyAvailable = product.isActive && product.status !== 'unavailable';
    const nextAvailable = !currentlyAvailable;

    setPendingConfirm({
      title: nextAvailable ? 'Tornar produto disponível' : 'Ocultar produto do site',
      question: nextAvailable
        ? `Deseja marcar "${product.name}" como DISPONÍVEL para que ele apareça no catálogo do site?`
        : `Deseja marcar "${product.name}" como INDISPONÍVEL? Ele desaparecerá do site imediatamente.`,
      confirmLabel: nextAvailable ? 'Sim, deixar disponível' : 'Sim, tornar indisponível',
      variant: nextAvailable ? 'primary' : 'warning',
      onConfirm: async () => {
        setSavingAction(true);
        try {
          const updated = await patchProduct(product.id, { available: nextAvailable });
          if (updated) {
            showTempFeedback(
              nextAvailable
                ? `"${updated.name}" agora está disponível e visível no site.`
                : `"${updated.name}" foi marcado como indisponível e ocultado do site.`
            );
          }
          setPendingConfirm(null);
        } catch (err: unknown) {
          setProductsError(
            err instanceof Error ? err.message : 'Erro ao atualizar disponibilidade.'
          );
          setPendingConfirm(null);
        } finally {
          setSavingAction(false);
        }
      },
    });
  };

  const openEditModal = (product: Product) => {
    setEditError('');
    setEditDraft({
      product,
      name: product.name,
      price: String(product.price ?? 0),
      shortDescription: product.shortDescription || '',
      fullDescription: product.fullDescription || '',
    });
  };

  const requestSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDraft) return;
    setEditError('');

    const trimmedName = editDraft.name.trim();
    if (!trimmedName) {
      setEditError('O nome do produto não pode ficar vazio.');
      return;
    }

    const normalizedPriceInput = editDraft.price.replace(',', '.').trim();
    const parsedPrice = normalizedPriceInput === '' ? 0 : Number(normalizedPriceInput);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setEditError('Informe um valor válido (0 ou maior).');
      return;
    }

    setPendingConfirm({
      title: 'Confirmar edição do produto',
      question: `Deseja confirmar as alterações de nome, valor (${
        parsedPrice > 0 ? formatBRL(parsedPrice) : 'Sob consulta'
      }) e descrição em "${trimmedName}"?`,
      confirmLabel: 'Confirmar e Salvar',
      variant: 'primary',
      onConfirm: async () => {
        setSavingAction(true);
        try {
          const updated = await patchProduct(editDraft.product.id, {
            name: trimmedName,
            price: parsedPrice,
            shortDescription: editDraft.shortDescription.trim(),
            fullDescription: editDraft.fullDescription.trim(),
          });
          if (updated) {
            setEditDraft(null);
            showTempFeedback(`Alterações salvas em "${updated.name}".`);
          }
          setPendingConfirm(null);
        } catch (err: unknown) {
          setEditError(err instanceof Error ? err.message : 'Erro ao salvar alterações.');
          setPendingConfirm(null);
        } finally {
          setSavingAction(false);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-[#FAF6ED] border-2 border-[#D8BD83] rounded-2xl sm:rounded-3xl shadow-2xl text-[#171713] z-10 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header do Painel */}
        <div className="bg-[#171713] text-[#F0E5C9] px-4 sm:px-6 py-4 border-b border-[#D8BD83]/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#174B2A] border border-[#D8BD83]/60 flex items-center justify-center text-[#D8BD83] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-['Cinzel'] text-sm sm:text-lg font-bold tracking-wide truncate">
                Painel Administrativo
              </h2>
              <p className="text-[11px] text-[#D8BD83]/80 truncate">
                Controle de disponibilidade, nome, valor e descrição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {adminToken && (
              <button
                type="button"
                onClick={() => {
                  onSetAdminToken(null);
                  setAdminProducts([]);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#22221C] hover:bg-[#A52B20] text-[#F0E5C9] border border-[#D8BD83]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Encerrar sessão administrativa"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#22221C] hover:bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83]/40 transition-colors cursor-pointer"
              aria-label="Fechar painel administrativo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!adminToken ? (
            <div className="max-w-md mx-auto py-4 sm:py-8">
              {authLoading ? (
                <p className="text-center text-sm text-[#4A4A40] py-8">
                  Verificando acesso administrativo...
                </p>
              ) : authStatus && !authStatus.configured ? (
                /* Primeiro acesso: definição segura da senha no servidor */
                <form
                  onSubmit={handleClaimSubmit}
                  className="bg-[#FFFDF9] border border-[#D8BD83] rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-[#174B2A]">
                    <Lock className="w-5 h-5 shrink-0" />
                    <h3 className="font-['Cinzel'] text-base font-bold">
                      Primeiro Acesso — Definir Credenciais
                    </h3>
                  </div>

                  <p className="text-xs text-[#4A4A40] leading-relaxed">
                    Defina o usuário e a senha do administrador para proteger este painel. As credenciais são armazenadas com hash seguro no servidor.
                  </p>

                  {authError && (
                    <div className="p-3 rounded-xl bg-[#A52B20]/10 border border-[#A52B20]/40 text-xs text-[#A52B20] font-semibold">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#171713]">
                      Usuário
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#171713]">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#FAF6ED] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#605F52] hover:text-[#171713] p-1 cursor-pointer"
                        aria-label="Mostrar ou ocultar senha"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#171713]">
                      Confirmar Senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAuth}
                    className="w-full py-3 rounded-xl bg-[#174B2A] hover:bg-[#123B21] disabled:opacity-60 text-[#F0E5C9] text-sm font-bold border border-[#D8BD83] shadow-md transition-colors cursor-pointer"
                  >
                    {submittingAuth ? 'Configurando...' : 'Salvar e Entrar'}
                  </button>
                </form>
              ) : (
                /* Formulário padrão de login */
                <form
                  onSubmit={handleLoginSubmit}
                  className="bg-[#FFFDF9] border border-[#D8BD83] rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-[#174B2A]">
                    <Lock className="w-5 h-5 shrink-0" />
                    <h3 className="font-['Cinzel'] text-base font-bold">
                      Acesso Restrito
                    </h3>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-[#A52B20]/10 border border-[#A52B20]/40 text-xs text-[#A52B20] font-semibold">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#171713]">
                      Usuário
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                      placeholder="agbara"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#171713]">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#FAF6ED] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#605F52] hover:text-[#171713] p-1 cursor-pointer"
                        aria-label="Mostrar ou ocultar senha"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAuth}
                    className="w-full py-3 rounded-xl bg-[#174B2A] hover:bg-[#123B21] disabled:opacity-60 text-[#F0E5C9] text-sm font-bold border border-[#D8BD83] shadow-md transition-colors cursor-pointer"
                  >
                    {submittingAuth ? 'Entrando...' : 'Entrar no Painel'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Lista dos 37 produtos */
            <div className="space-y-4">
              {/* Resumo e Busca */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-3.5 rounded-2xl border border-[#D8BD83]/70">
                <div className="text-xs sm:text-sm text-[#36352E] flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    <strong className="text-[#171713] tabular-nums">{adminProducts.length}</strong> produtos cadastrados
                  </span>
                  <span className="text-[#174B2A] font-semibold tabular-nums">
                    • {availableCount} disponíveis
                  </span>
                  <span className="text-[#A52B20] font-semibold tabular-nums">
                    • {unavailableCount} indisponíveis (ocultos)
                  </span>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#77964A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produto ou categoria..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6ED] border border-[#D8BD83] text-xs sm:text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                  />
                </div>
              </div>

              {feedbackMessage && (
                <div className="p-3 rounded-xl bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83] text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
                  <Check className="w-4 h-4 text-[#D8BD83] shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {productsError && (
                <div className="p-3 rounded-xl bg-[#A52B20]/10 border border-[#A52B20]/40 text-xs text-[#A52B20] font-semibold">
                  {productsError}
                </div>
              )}

              {loadingProducts ? (
                <p className="text-center text-sm text-[#4A4A40] py-10">
                  Carregando produtos cadastrados...
                </p>
              ) : (
                <div className="space-y-2.5">
                  {filteredProducts.map((product) => {
                    const isAvailable = product.isActive && product.status !== 'unavailable';
                    return (
                      <div
                        key={product.id}
                        className={`p-3 sm:p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isAvailable
                            ? 'bg-[#FFFDF9] border-[#D8BD83]/70'
                            : 'bg-[#EFE8D6]/80 border-[#A52B20]/35'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EBDDC0] border border-[#D8BD83]/60 shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className={`w-full h-full object-cover ${
                                  isAvailable ? '' : 'grayscale opacity-60'
                                }`}
                              />
                            ) : (
                              <Leaf className="w-5 h-5 text-[#174B2A]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#77964A] block">
                              {product.category}
                            </span>
                            <h4 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#171713] truncate">
                              {product.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs">
                              <span className="font-bold text-[#174B2A] tabular-nums">
                                {product.price > 0 ? formatBRL(product.price) : 'Sob consulta'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  isAvailable
                                    ? 'bg-[#174B2A]/12 text-[#174B2A]'
                                    : 'bg-[#A52B20]/12 text-[#A52B20]'
                                }`}
                              >
                                {isAvailable ? 'Disponível (no site)' : 'Indisponível (oculto)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ações: Disponível/Indisponível e Editar */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => requestToggleAvailability(product)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
                              isAvailable
                                ? 'bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] border-[#77964A]'
                                : 'bg-[#A52B20] hover:bg-[#8a231a] text-[#F0E5C9] border-[#A52B20]'
                            }`}
                            title={
                              isAvailable
                                ? 'Clique para tornar indisponível e ocultar do site'
                                : 'Clique para tornar disponível e exibir no site'
                            }
                          >
                            {isAvailable ? (
                              <>
                                <Eye className="w-3.5 h-3.5 shrink-0" />
                                <span>Disponível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 shrink-0" />
                                <span>Indisponível</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF6ED] hover:bg-[#EBDDC0] text-[#171713] border border-[#D8BD83] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#174B2A] shrink-0" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <p className="text-center text-sm text-[#605F52] py-8">
                      Nenhum produto encontrado para "{searchTerm}".
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-modal: Editar Nome, Valor e Descrição */}
      {editDraft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setEditDraft(null)}
          />
          <form
            onSubmit={requestSaveEdit}
            className="relative z-10 w-full max-w-lg bg-[#FAF6ED] border-2 border-[#D8BD83] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
          >
            <div className="bg-[#171713] text-[#F0E5C9] px-5 py-3.5 border-b border-[#D8BD83]/40 flex items-center justify-between">
              <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold truncate pr-2">
                Editar Produto
              </h3>
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                className="p-1.5 rounded-lg hover:bg-[#22221C] text-[#D8BD83] cursor-pointer"
                aria-label="Cancelar edição"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {editError && (
                <div className="p-3 rounded-xl bg-[#A52B20]/10 border border-[#A52B20]/40 text-xs text-[#A52B20] font-semibold">
                  {editError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#171713]">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={editDraft.name}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  required
                  maxLength={160}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#171713]">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editDraft.price}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, price: e.target.value } : null))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                />
                <span className="text-[11px] text-[#605F52] block">
                  Deixe 0 para exibir "Sob consulta" no catálogo.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#171713]">
                  Descrição Curta (cartão)
                </label>
                <input
                  type="text"
                  value={editDraft.shortDescription}
                  onChange={(e) =>
                    setEditDraft((prev) =>
                      prev ? { ...prev, shortDescription: e.target.value } : null
                    )
                  }
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#D8BD83] text-sm text-[#171713] focus:outline-none focus:border-[#174B2A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#171713]">
                  Descrição Completa
                </label>
                <textarea
                  rows={6}
                  value={editDraft.fullDescription}
                  onChange={(e) =>
                    setEditDraft((prev) =>
                      prev ? { ...prev, fullDescription: e.target.value } : null
                    )
                  }
                  maxLength={12000}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#D8BD83] text-xs sm:text-sm text-[#171713] focus:outline-none focus:border-[#174B2A] leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#F0E5C9] border-t border-[#D8BD83]/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF6ED] hover:bg-[#EBDDC0] text-[#171713] border border-[#D8BD83] text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] border border-[#D8BD83] text-xs font-bold cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-modal de Confirmação antes de executar qualquer ação */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => !savingAction && setPendingConfirm(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#FAF6ED] border-2 border-[#D8BD83] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  pendingConfirm.variant === 'warning'
                    ? 'bg-[#A52B20]/15 text-[#A52B20]'
                    : 'bg-[#174B2A]/15 text-[#174B2A]'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Cinzel'] text-base font-bold text-[#171713]">
                  {pendingConfirm.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#36352E] leading-relaxed">
                  {pendingConfirm.question}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={savingAction}
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-[#FFFDF9] hover:bg-[#EBDDC0] text-[#171713] border border-[#D8BD83] text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingAction}
                onClick={() => void pendingConfirm.onConfirm()}
                className={`px-4 py-2.5 rounded-xl text-[#F0E5C9] border text-xs font-bold cursor-pointer disabled:opacity-60 ${
                  pendingConfirm.variant === 'warning'
                    ? 'bg-[#A52B20] hover:bg-[#8a231a] border-[#A52B20]'
                    : 'bg-[#174B2A] hover:bg-[#123B21] border-[#D8BD83]'
                }`}
              >
                {savingAction ? 'Aplicando...' : pendingConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
