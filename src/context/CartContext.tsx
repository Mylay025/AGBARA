import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BudgetItem, Product } from '../types';
import { formatWhatsAppUrl } from '../utils/linkHelpers';

interface CartContextType {
  items: BudgetItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  generateBudgetText: (storeName: string) => string;
  copyBudgetToClipboard: (storeName: string) => Promise<boolean>;
  sendOrderViaWhatsApp: (storeName: string, whatsappNumber: string, prefix?: string) => void;
}

const LOCAL_STORAGE_KEY = 'agbara_orcamento_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Falha ao salvar orçamento no LocalStorage:', e);
    }
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    if (product.status === 'out_of_stock' || !product.isActive) {
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productId === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as BudgetItem[]
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const generateBudgetText = (storeName = 'AGBÁRA – ANCESTRALIDADE VIVA') => {
    const lines: string[] = [
      storeName.toUpperCase(),
      '',
      'ORÇAMENTO',
      '',
    ];

    let hasUnpriced = false;
    items.forEach((item) => {
      if (item.price > 0) {
        const subtotal = item.price * item.quantity;
        lines.push(
          `${item.productName} — Quantidade: ${item.quantity} — ${formatBRL(subtotal)}`
        );
      } else {
        hasUnpriced = true;
        lines.push(
          `${item.productName} — Quantidade: ${item.quantity} — Sob consulta`
        );
      }
    });

    const totalText =
      totalPrice > 0
        ? hasUnpriced
          ? `${formatBRL(totalPrice)} (+ itens sob consulta)`
          : formatBRL(totalPrice)
        : 'Sob consulta';

    lines.push('');
    lines.push(`Total: ${totalText}`);
    lines.push('');
    lines.push('🌿 Gerado pelo catálogo oficial AGBÁRA – Ancestralidade Viva');

    return lines.join('\n');
  };

  const copyBudgetToClipboard = async (storeName: string): Promise<boolean> => {
    try {
      const text = generateBudgetText(storeName);
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback textarea
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        textArea.remove();
        return success;
      }
    } catch (e) {
      console.error('Falha ao copiar:', e);
      return false;
    }
  };

  const sendOrderViaWhatsApp = (
    storeName: string,
    whatsappNumber: string,
    prefix?: string
  ) => {
    const defaultPrefix =
      prefix ||
      `Olá! Gostaria de consultar a disponibilidade e confirmar o seguinte orçamento da ${storeName}:`;

    const hasUnpriced = items.some((i) => !(i.price > 0));
    const itemsSummary = items
      .map((item) => {
        if (item.price > 0) {
          const subtotal = item.price * item.quantity;
          return `• *${item.productName}*\n  Qtd: ${item.quantity} × ${formatBRL(item.price)} = ${formatBRL(subtotal)}`;
        }
        return `• *${item.productName}*\n  Qtd: ${item.quantity} (Sob consulta)`;
      })
      .join('\n\n');

    const totalText =
      totalPrice > 0
        ? hasUnpriced
          ? `${formatBRL(totalPrice)} (+ itens sob consulta)`
          : formatBRL(totalPrice)
        : 'Sob consulta';

    const message = `${defaultPrefix}

*${storeName.toUpperCase()}*
*ORÇAMENTO DE ITENS SELECIONADOS:*

${itemsSummary}

-----------------------------------
*VALOR TOTAL ESTIMADO:* ${totalText}
-----------------------------------

Aguardo instruções para pagamento e detalhes para envio/retirada. Gratidão! 🙏✨`;

    const url = formatWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        totalPrice,
        isOpen,
        setIsOpen,
        generateBudgetText,
        copyBudgetToClipboard,
        sendOrderViaWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
