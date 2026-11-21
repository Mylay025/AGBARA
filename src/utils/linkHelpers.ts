/**
 * Utilitários para formatação e manipulação de links do WhatsApp e redes sociais (Instagram).
 * Suporta cadastro de URLs completas (ex: https://wa.me/..., https://instagram.com/...)
 * bem como números de telefone ou @arrobas.
 */

/**
 * Retorna o link completo do WhatsApp pronto para redirecionamento.
 * Aceita URL completa (wa.me, api.whatsapp.com) ou número com DDI/DDD.
 *
 * @param input Link completo ou número do WhatsApp
 * @param messageText Mensagem opcional pré-formatada para envio
 */
export function formatWhatsAppUrl(input?: string, messageText?: string): string {
  if (!input || !input.trim()) {
    const defaultNumber = '5511998765432';
    return `https://wa.me/${defaultNumber}${
      messageText ? `?text=${encodeURIComponent(messageText)}` : ''
    }`;
  }

  const trimmed = input.trim();

  // Caso seja uma URL completa
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (!messageText) return trimmed;

    // Se já tem parâmetro text
    if (trimmed.includes('text=')) {
      return trimmed;
    }

    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}text=${encodeURIComponent(messageText)}`;
  }

  // Se começou sem protocolo, mas com wa.me ou api.whatsapp
  if (trimmed.startsWith('wa.me/') || trimmed.startsWith('api.whatsapp.com/')) {
    const url = `https://${trimmed}`;
    if (!messageText) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}text=${encodeURIComponent(messageText)}`;
  }

  // Caso seja apenas números ou telefone com máscara
  const cleanDigits = trimmed.replace(/\D/g, '');
  const finalDigits = cleanDigits || '5511998765432';

  return `https://wa.me/${finalDigits}${
    messageText ? `?text=${encodeURIComponent(messageText)}` : ''
  }`;
}

/**
 * Retorna a URL completa para a rede social / Instagram.
 * Aceita link completo (https://instagram.com/...), @perfil ou apenas nome do usuário.
 *
 * @param input Link completo ou identificador da rede social
 */
export function formatSocialUrl(input?: string): string {
  if (!input || !input.trim()) {
    return 'https://instagram.com/agbara.ancestralidade';
  }

  const trimmed = input.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('instagram.com/') || trimmed.startsWith('www.instagram.com/')) {
    return `https://${trimmed}`;
  }

  const cleanHandle = trimmed.replace(/^@+/, '').trim();
  return `https://instagram.com/${cleanHandle}`;
}

/**
 * Retorna uma representação limpa para exibição visual do perfil ou link.
 */
export function displaySocialLabel(input?: string): string {
  if (!input || !input.trim()) return '@agbara.ancestralidade';
  const trimmed = input.trim();

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const pathname = url.pathname.replace(/^\/+|\/+$/g, '');
      if (pathname) {
        return `@${pathname}`;
      }
      return url.hostname;
    }
  } catch {
    // fallback
  }

  if (trimmed.startsWith('@')) return trimmed;
  return `@${trimmed}`;
}

/**
 * Retorna uma representação limpa para exibição visual do WhatsApp.
 */
export function displayWhatsAppLabel(input?: string): string {
  if (!input || !input.trim()) return '(11) 99876-5432';
  const trimmed = input.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Se for URL wa.me/55...
    const match = trimmed.match(/wa\.me\/(\d+)/i) || trimmed.match(/phone=(\d+)/i);
    if (match && match[1]) {
      const num = match[1];
      if (num.length >= 12 && num.startsWith('55')) {
        const ddd = num.slice(2, 4);
        const part1 = num.slice(4, 9);
        const part2 = num.slice(9);
        return `+55 (${ddd}) ${part1}-${part2}`;
      }
      return `WhatsApp (${num})`;
    }
    return 'WhatsApp Vendedor';
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 9);
    const part2 = digits.slice(9);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  return trimmed;
}
