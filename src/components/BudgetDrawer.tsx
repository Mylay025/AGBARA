import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  Send,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatWhatsAppUrl, displayWhatsAppLabel } from '../utils/linkHelpers';
import type { StoreSettings } from '../types';

interface BudgetDrawerProps {
  settings: StoreSettings;
}

export const BudgetDrawer: React.FC<BudgetDrawerProps> = ({ settings }) => {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
    copyBudgetToClipboard,
    sendOrderViaWhatsApp,
  } = useCart();

  const [copied, setCopied] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Trava a rolagem da página de fundo no mobile enquanto a gaveta estiver aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyBudgetToClipboard(settings.storeName);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    }
  };

  const handleWhatsApp = () => {
    sendOrderViaWhatsApp(
      settings.storeName,
      settings.whatsappNumber,
      settings.whatsappMessagePrefix
    );
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-[#171713] border-l border-[#D8BD83]/40 text-[#F0E5C9] shadow-2xl flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#D8BD83]/30 flex items-center justify-between bg-[#174B2A] shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#171713] border border-[#D8BD83] flex items-center justify-center text-[#D8BD83] shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-['Cinzel'] text-base sm:text-lg font-bold text-[#F0E5C9] leading-tight">
                  Lista de Orçamento
                </h2>
                <p className="text-[11px] sm:text-xs text-[#D8BD83]">
                  {items.length === 0
                    ? 'Nenhum produto selecionado'
                    : `${items.length} ${items.length === 1 ? 'item selecionado' : 'itens selecionados'}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#171713] hover:bg-[#22221C] text-[#F0E5C9] border border-[#D8BD83]/40 transition-colors cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
              aria-label="Fechar orçamento"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification de Cópia */}
          {copied && (
            <div className="bg-[#D8BD83] text-[#171713] px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-fade-in border-b border-[#174B2A] shrink-0">
              <Check className="w-4 h-4 stroke-[3] text-[#174B2A]" />
              <span>Orçamento copiado com sucesso! Pronto para colar.</span>
            </div>
          )}

          {/* Items List (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 overscroll-contain">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#D8BD83]/70">
                <div className="w-16 h-16 rounded-full bg-[#22221C] border border-[#D8BD83]/40 flex items-center justify-center mb-4 text-[#D8BD83]">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-['Cinzel'] text-base font-semibold text-[#F0E5C9] mb-1">
                  Seu orçamento está vazio
                </h3>
                <p className="text-xs text-[#D8BD83]/80 max-w-xs mb-6">
                  Navegue pelo catálogo e adicione os itens que deseja orçar.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 rounded-xl bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] text-xs font-bold flex items-center gap-2 transition-all border border-[#D8BD83] min-h-[44px]"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4 text-[#D8BD83]" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#22221C] border border-[#D8BD83]/30 hover:border-[#D8BD83] transition-all flex gap-3 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-[#171713] border border-[#D8BD83]/40 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imageUrl && !brokenImages[item.productId] ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [item.productId]: true,
                          }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-[#D8BD83]/70" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 pr-1">
                        <h4 className="text-xs font-bold text-[#F0E5C9] leading-snug line-clamp-1">
                          {item.productName}
                        </h4>
                        <span className="text-[10px] text-[#D8BD83] block truncate">
                          {item.category}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-[#D8BD83]/70 hover:text-[#A52B20] p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center transition-colors cursor-pointer"
                        title="Remover produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#D8BD83]/20">
                      {/* Controles de quantidade grandes e confortáveis para o polegar no mobile */}
                      <div className="flex items-center gap-1 bg-[#171713] border border-[#D8BD83]/40 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D8BD83] hover:text-white active:bg-[#22221C] cursor-pointer"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#F0E5C9] px-2 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D8BD83] hover:text-white active:bg-[#22221C] cursor-pointer"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.price > 0 ? (
                          <>
                            <span className="text-[10px] text-[#D8BD83]/70 block">
                              {formatBRL(item.price)} un.
                            </span>
                            <span className="text-xs font-extrabold text-[#D8BD83]">
                              {formatBRL(item.price * item.quantity)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-[#D8BD83]/85">
                            Sob consulta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Buttons (Fixed at Bottom with Safe Spacing) */}
          {items.length > 0 && (
            <div className="p-4 bg-[#171713] border-t border-[#D8BD83]/30 space-y-3 shrink-0 pb-6 sm:pb-5">
              {/* Total Calculation */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#D8BD83]/20">
                <span className="text-xs font-bold text-[#D8BD83] uppercase tracking-wider">
                  Total Estimado:
                </span>
                <span className="font-['Cinzel'] text-xl font-extrabold text-[#D8BD83]">
                  {totalPrice > 0 ? formatBRL(totalPrice) : 'Sob consulta'}
                </span>
              </div>

              {/* Botões Principais Requeridos com Ergonomia Mobile */}
              <div className="space-y-2.5">
                {/* BOTÃO 1 — COPIAR ORÇAMENTO */}
                <button
                  onClick={handleCopy}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D8BD83] hover:bg-[#c9ae72] text-[#171713] font-bold text-xs tracking-wide border border-[#174B2A] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm min-h-[48px] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#174B2A]" />
                      <span className="text-[#174B2A]">Orçamento Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#171713]" />
                      <span>BOTÃO 1 — COPIAR ORÇAMENTO</span>
                    </>
                  )}
                </button>

                {/* BOTÃO 2 — ENVIAR PEDIDO PELO WHATSAPP */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-4 px-4 rounded-xl bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] font-extrabold text-xs sm:text-sm tracking-wide border border-[#D8BD83] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[50px] cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D8BD83]" />
                  <span>BOTÃO 2 — ENVIAR PEDIDO PELO WHATSAPP</span>
                </button>
              </div>

              {/* Clear Cart Option */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-[#A52B20]/25 hover:bg-[#A52B20] border border-[#E06C62]/70 hover:border-[#A52B20] text-xs font-semibold text-[#FADBD8] hover:text-[#F0E5C9] shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#F59B93] group-hover:text-[#F0E5C9] shrink-0 transition-colors" />
                  <span>Limpar orçamento</span>
                </button>
                <a
                  href={formatWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#D8BD83]/70 hover:text-[#F0E5C9] underline underline-offset-2 truncate max-w-[200px] transition-colors"
                >
                  WhatsApp: {displayWhatsAppLabel(settings.whatsappNumber)}
                </a>
              </div>

              {/* Legal restriction note */}
              <div className="pt-2 border-t border-[#D8BD83]/20 flex items-start gap-1.5 text-[10px] text-[#D8BD83]/70 leading-tight">
                <ShieldAlert className="w-3.5 h-3.5 text-[#A52B20] shrink-0 mt-0.5" />
                <span>
                  Uso tradicional e cultural. Venda proibida para menores de 18 anos. Os itens não substituem orientação médica.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
