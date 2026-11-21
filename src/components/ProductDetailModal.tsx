import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Minus, ShoppingBag, ShieldAlert, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addItem, setIsOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [activeSlide, setActiveSlide] = useState(0);

  const carouselImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls.filter(Boolean);
    }
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  // Trava scroll de fundo enquanto o modal de detalhes estiver aberto e reseta quantidade ao trocar produto
  useEffect(() => {
    setQuantity(1);
    setFailedImages({});
    setActiveSlide(0);
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  useEffect(() => {
    if (!product || carouselImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [product, carouselImages.length]);

  if (!product) return null;

  const hasVisibleImages =
    carouselImages.length > 0 &&
    carouselImages.some((_, idx) => !failedImages[idx]);

  const isAvailable = product.status === 'available' && product.isActive;
  const isOutOfStock = product.status === 'out_of_stock';

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#FAF6ED] border-2 border-[#D8BD83] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-[#171713] z-10 max-h-[90vh] flex flex-col my-auto">
        {/* Close Button com alvo de toque amplo */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-[#FAF6ED]/95 hover:bg-[#174B2A] text-[#171713] hover:text-[#F0E5C9] border border-[#D8BD83] transition-colors shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container on Mobile */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Visual Product Image Area */}
            <div className="relative h-56 sm:h-72 md:h-full bg-[#EBDDC0] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#D8BD83]/40">
              {hasVisibleImages ? (
                carouselImages.length > 1 ? (
                  <>
                    {carouselImages.map((src, idx) => (
                      <img
                        key={`${product.id}-modal-slide-${idx}`}
                        src={src}
                        alt={`${product.name} - imagem ${idx + 1}`}
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [idx]: true }))
                        }
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                          idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlide(
                          (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
                        )
                      }
                      aria-label="Imagem anterior"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#171713]/70 hover:bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83]/60 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlide((prev) => (prev + 1) % carouselImages.length)
                      }
                      aria-label="Próxima imagem"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#171713]/70 hover:bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83]/60 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#171713]/70 border border-[#D8BD83]/50">
                      {carouselImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          aria-label={`Ver imagem ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === activeSlide
                              ? 'w-5 bg-[#D8BD83]'
                              : 'w-1.5 bg-[#F0E5C9]/60 hover:bg-[#F0E5C9]'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <img
                    src={carouselImages[0]}
                    alt={product.name}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [0]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F0E5C9]">
                  <div className="w-20 h-20 rounded-full border-2 border-[#D8BD83] bg-[#174B2A] flex items-center justify-center text-[#D8BD83] shadow-md mb-2">
                    <Leaf className="w-10 h-10" />
                  </div>
                  <span className="font-['Cinzel'] text-xs font-bold text-[#171713] uppercase">
                    AGBÁRA
                  </span>
                  <span className="text-[10px] text-[#4A4A40] font-medium">Ancestralidade Viva</span>
                </div>
              )}

              <div className="absolute top-3 left-3 max-w-[calc(100%-76px)] z-10">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#174B2A] text-[#F0E5C9] border border-[#77964A] shadow-sm block truncate">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info & Actions */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-5 min-w-0">
              <div className="space-y-3 sm:space-y-4 min-w-0">
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#77964A] font-extrabold block break-words">
                    Catálogo Oficial AGBÁRA • {product.category}
                  </span>
                  <h2 className="font-['Cinzel'] text-lg sm:text-xl md:text-2xl font-bold text-[#171713] mt-1 leading-snug break-words">
                    {product.name}
                  </h2>
                </div>

                {/* Price & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D8BD83]/40">
                  <div>
                    <span className="text-[10px] uppercase text-[#605F52] block font-semibold">
                      Valor de Referência
                    </span>
                    {product.price > 0 ? (
                      <span className="font-['Cinzel'] text-xl sm:text-2xl font-extrabold text-[#174B2A] tabular-nums whitespace-nowrap">
                        {formatBRL(product.price)}
                      </span>
                    ) : (
                      <span className="font-['Cinzel'] text-base sm:text-lg font-bold text-[#605F52] whitespace-nowrap">
                        Sob consulta
                      </span>
                    )}
                  </div>

                  <div>
                    {isOutOfStock ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#A52B20] text-[#F0E5C9] shadow-sm inline-block">
                        Sem Estoque
                      </span>
                    ) : isAvailable ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#174B2A] text-[#F0E5C9] border border-[#77964A] shadow-sm inline-block">
                        Disponível
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#4A4A40] text-[#F0E5C9] inline-block">
                        Indisponível
                      </span>
                    )}
                  </div>
                </div>

                {/* Descriptions */}
                {(product.shortDescription || product.fullDescription) && (
                  <div className="space-y-2.5 text-xs sm:text-sm text-[#36352E] leading-relaxed break-words">
                    {product.shortDescription && (
                      <p className="font-medium text-[#171713]">
                        {product.shortDescription}
                      </p>
                    )}
                    {product.fullDescription && (
                      <p className="text-[#4A4A40] text-xs sm:text-sm pt-2 border-t border-[#D8BD83]/40 whitespace-pre-line leading-relaxed">
                        {product.fullDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3.5 pt-3 border-t border-[#D8BD83]/40">
                {isAvailable ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#171713]">
                        Quantidade para orçamento:
                      </span>
                      <div className="flex items-center gap-1.5 bg-[#F0E5C9] border border-[#D8BD83] rounded-xl p-1 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#171713] hover:text-[#174B2A] font-bold cursor-pointer"
                          aria-label="Diminuir"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-extrabold px-2 text-[#171713] min-w-[24px] text-center tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#171713] hover:text-[#174B2A] font-bold cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] font-bold text-sm tracking-wide shadow-lg border border-[#D8BD83] flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[48px] cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#D8BD83] shrink-0" />
                      <span>Adicionar {quantity}x ao Orçamento</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#EBDDC0] border border-[#D8BD83] text-center text-xs text-[#605F52] font-semibold">
                    Este item não pode ser adicionado ao orçamento no momento devido ao estoque.
                  </div>
                )}

                {/* Aviso Legal */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F0E5C9] border border-[#D8BD83] text-[10px] text-[#605F52]">
                  <ShieldAlert className="w-4 h-4 text-[#A52B20] shrink-0 mt-0.5" />
                  <span>
                    Uso estritamente tradicional e consagrado. Venda proibida para menores de 18 anos.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
