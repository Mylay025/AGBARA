import React, { useState, useEffect } from 'react';
import { Plus, Check, Eye, AlertCircle, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const { items, addItem } = useCart();
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [activeSlide, setActiveSlide] = useState(0);

  const carouselImages = React.useMemo(() => {
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls.filter(Boolean);
    }
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product.imageUrl, product.imageUrls]);

  useEffect(() => {
    setFailedImages({});
    setActiveSlide(0);
  }, [product.id, product.imageUrl, product.imageUrls]);

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const cartItem = items.find((i) => i.productId === product.id);
  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity || 0;

  const isAvailable = product.status === 'available' && product.isActive;
  const isOutOfStock = product.status === 'out_of_stock';
  const hasVisibleImages =
    carouselImages.length > 0 &&
    carouselImages.some((_, idx) => !failedImages[idx]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#A52B20] text-[#F0E5C9] shadow-sm">
          Sem Estoque
        </span>
      );
    }
    if (product.status === 'unavailable' || !product.isActive) {
      return (
        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#4A4A40] text-[#F0E5C9] shadow-sm">
          Indisponível
        </span>
      );
    }
    return null;
  };
  const statusBadge = getStatusBadge();

  return (
    <div className="group rounded-2xl bg-[#FAF6ED] border border-[#D8BD83]/70 hover:border-[#174B2A] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden min-w-0">
      {/* Product Image Area: Proporção uniforme 4:3 em todas as telas */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative aspect-[4/3] w-full bg-[#EBDDC0] overflow-hidden cursor-pointer flex items-center justify-center select-none"
      >
        {hasVisibleImages ? (
          carouselImages.length > 1 ? (
            <>
              {carouselImages.map((src, idx) => (
                <img
                  key={`${product.id}-slide-${idx}`}
                  src={src}
                  alt={`${product.name} - imagem ${idx + 1}`}
                  loading="lazy"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [idx]: true }))
                  }
                  className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${
                    idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              ))}
              {/* Indicadores discretos do carrossel */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#171713]/65 border border-[#D8BD83]/40">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(idx);
                    }}
                    aria-label={`Ver imagem ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === activeSlide
                        ? 'w-4 bg-[#D8BD83]'
                        : 'w-1.5 bg-[#F0E5C9]/55 hover:bg-[#F0E5C9]'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <img
              src={carouselImages[0]}
              alt={product.name}
              loading="lazy"
              onError={() => setFailedImages((prev) => ({ ...prev, [0]: true }))}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          /* Espaço visual elegante caso não haja foto com identidade AGbára */
          <div className="w-full h-full flex flex-col items-center justify-center p-2.5 sm:p-6 text-center bg-gradient-to-br from-[#F0E5C9] to-[#E3D3B1] relative overflow-hidden">
            <div className="absolute inset-0 opacity-15">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <pattern id="card-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 0 12 L 12 0 L 24 12 L 12 24 Z" fill="none" stroke="#77964A" strokeWidth="0.75" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#card-pattern)" />
              </svg>
            </div>
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 border-[#D8BD83] bg-[#174B2A] flex items-center justify-center text-[#D8BD83] shadow-md mb-1 sm:mb-2 relative z-10">
              <Leaf className="w-5 h-5 sm:w-8 sm:h-8" />
            </div>
            <span className="font-['Cinzel'] text-[10px] sm:text-xs font-bold text-[#171713] tracking-wider uppercase relative z-10">
              AGBÁRA
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#4A4A40] mt-0.5 font-medium relative z-10 hidden sm:inline">
              Ancestralidade Viva
            </span>
          </div>
        )}

        {/* Status Tag in Top-Left Corner (somente quando indisponível ou sem estoque) */}
        {statusBadge && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">{statusBadge}</div>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-[#171713]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-4 py-2 rounded-xl bg-[#171713]/90 text-[#F0E5C9] text-xs font-bold flex items-center gap-1.5 border border-[#D8BD83] shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#D8BD83]" />
            <span>Ver Detalhes</span>
          </span>
        </div>
      </div>

      {/* Product Content Details: Espaçamento otimizado para 2 colunas no mobile */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          {/* Category Kicker — sem sobreposição sobre a imagem */}
          <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#77964A] mb-1 leading-tight line-clamp-1 break-words">
            {product.category}
          </span>

          <h3
            onClick={() => onOpenDetails(product)}
            className="font-['Cinzel'] text-[13px] sm:text-base md:text-lg font-bold text-[#171713] group-hover:text-[#174B2A] transition-colors cursor-pointer line-clamp-2 leading-snug break-words [overflow-wrap:anywhere]"
            title={product.name}
          >
            {product.name}
          </h3>

          {(product.shortDescription || product.fullDescription) && (
            <p
              onClick={() => onOpenDetails(product)}
              className="mt-1 sm:mt-1.5 text-[11px] sm:text-sm text-[#4A4A40] hover:text-[#174B2A] line-clamp-2 leading-snug sm:leading-relaxed break-words cursor-pointer transition-colors"
            >
              {product.shortDescription || 'Click para ver mais'}
            </p>
          )}
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3.5 border-t border-[#D8BD83]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          {/* Price */}
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-[#605F52] block uppercase tracking-wider font-semibold">
              Valor
            </span>
            {product.price > 0 ? (
              <span className="font-['Cinzel'] text-base sm:text-xl font-extrabold text-[#174B2A] leading-tight block tabular-nums whitespace-nowrap">
                {formatBRL(product.price)}
              </span>
            ) : (
              <span className="font-['Cinzel'] text-xs sm:text-sm font-bold text-[#605F52] leading-tight block whitespace-nowrap">
                Sob consulta
              </span>
            )}
          </div>

          {/* Action Button: Adicionar ao Orçamento */}
          {isAvailable ? (
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              className={`w-full sm:w-auto px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm min-h-[40px] sm:min-h-[44px] cursor-pointer whitespace-nowrap ${
                isInCart
                  ? 'bg-[#D8BD83] hover:bg-[#c9ae72] text-[#171713] border border-[#174B2A]'
                  : 'bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] border border-[#D8BD83]/70'
              }`}
              title="Adicionar à lista de orçamento"
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] text-[#171713] shrink-0" />
                  <span>Orçamento ({cartQuantity})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8BD83] shrink-0" />
                  <span>Adicionar</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-[#E3D9C3] text-[#605F52] border border-[#D8BD83]/50 cursor-not-allowed flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] whitespace-nowrap"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Indisponível</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
