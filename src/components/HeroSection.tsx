import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  ImageIcon,
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/linkHelpers';
import { sanitizeBannerImages } from '../data/catalogData';
import type { StoreSettings } from '../types';

interface HeroSectionProps {
  settings: StoreSettings;
  onExploreCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onExploreCatalog,
}) => {
  const bannerSlides = sanitizeBannerImages(
    settings.bannerImages,
    Array.isArray(settings.bannerImages) ? '' : settings.bannerUrl
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Ajusta o índice caso o número de imagens diminua
  useEffect(() => {
    if (activeSlide >= bannerSlides.length) {
      setActiveSlide(0);
    }
  }, [bannerSlides.length, activeSlide]);

  // Rotação automática do banner quando houver mais de 1 imagem
  useEffect(() => {
    if (bannerSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerSlides.length, isPaused]);

  const handlePrevSlide = () => {
    if (bannerSlides.length <= 1) return;
    setActiveSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const handleNextSlide = () => {
    if (bannerSlides.length <= 1) return;
    setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  return (
    <section id="inicio" className="relative overflow-hidden bg-parchment border-b border-[#D8BD83]/40 text-[#171713]">
      {/* Background Graphic Patterns Étnicos Sutis */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ethnic-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 0 24 L 24 0 L 48 24 L 24 48 Z M 12 24 L 24 12 L 36 24 L 24 36 Z"
                fill="none"
                stroke="#D8BD83"
                strokeWidth="0.85"
              />
              <circle cx="24" cy="24" r="2.5" fill="#77964A" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ethnic-grid)" />
        </svg>
      </div>

      {/* Atmospheric Soft Light Spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#D8BD83]/25 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-[#77964A]/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Main Headline */}
            <h1 className="font-['Cinzel'] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#171713] leading-[1.18] tracking-tight">
              {settings.heroTitle || 'Ancestralidade Viva & Medicinas da Floresta'}
            </h1>

            {/* Subtitle / Institutional Introduction */}
            <p className="text-xs sm:text-base md:text-lg text-[#36352E] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {settings.heroSubtitle ||
                'Catálogo interativo de rapés sagrados, instrumentos de poder, aplicadores esculpidos à mão e defumações nativas, produzidos em reverência aos saberes ancestrais.'}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              {/* Botão Principal: Verde Floresta com Dourado */}
              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-[#174B2A] hover:bg-[#123B21] text-[#F0E5C9] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#174B2A]/25 border border-[#D8BD83] flex items-center justify-center gap-2.5 transition-all active:scale-95 group min-h-[48px] cursor-pointer"
              >
                <span>Acessar Catálogo de Produtos</span>
                <ArrowRight className="w-4 h-4 text-[#D8BD83] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Botão Secundário: Dourado Envelhecido */}
              <a
                href={formatWhatsAppUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-xl bg-[#D8BD83] hover:bg-[#c9ae72] text-[#171713] font-bold text-xs sm:text-sm border border-[#A52B20]/30 shadow-md flex items-center justify-center gap-2 transition-all min-h-[48px] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#A52B20]" />
                <span>Atendimento WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Banner Visual Presentation - Catálogo Oficial (Carrossel Automático 4:3 / 800x600px) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div
              className="relative w-full max-w-md lg:max-w-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Outer decorative halo */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#A52B20]/30 via-[#D8BD83]/40 to-[#174B2A]/30 blur-xl opacity-70" />

              <div className="relative rounded-2xl overflow-hidden border-2 border-[#D8BD83] shadow-2xl bg-[#171713] w-full aspect-[4/3]">
                {bannerSlides.length > 0 ? (
                  <>
                    {bannerSlides.map((imgUrl, idx) => (
                      <img
                        key={`${idx}_${imgUrl.slice(0, 32)}`}
                        src={imgUrl}
                        alt={`${settings.storeName} - Catálogo Oficial ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                          idx === activeSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                        }`}
                      />
                    ))}

                    {/* Controles discretos quando houver mais de 1 imagem */}
                    {bannerSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          aria-label="Imagem anterior"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#171713]/70 hover:bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83]/50 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          aria-label="Próxima imagem"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#171713]/70 hover:bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83]/50 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Indicadores de slide */}
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#171713]/70 border border-[#D8BD83]/40 backdrop-blur-sm">
                          {bannerSlides.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveSlide(idx)}
                              aria-label={`Ir para imagem ${idx + 1}`}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                idx === activeSlide
                                  ? 'w-5 bg-[#D8BD83]'
                                  : 'w-2 bg-[#F0E5C9]/45 hover:bg-[#F0E5C9]/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1B2219] via-[#171713] to-[#231E14]">
                    <div className="w-14 h-14 rounded-2xl bg-[#174B2A]/40 border border-[#D8BD83]/50 flex items-center justify-center text-[#D8BD83] mb-3">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="font-['Cinzel'] text-sm font-bold text-[#F0E5C9]">
                      Catálogo Oficial {settings.storeName ? `• ${settings.storeName}` : ''}
                    </p>
                  </div>
                )}

                {/* Overlay Badge with Official Logo */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 bg-gradient-to-t from-[#171713] via-[#171713]/85 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.logoUrl && (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D8BD83] shadow-md shrink-0 bg-[#171713]">
                        <img
                          src={settings.logoUrl}
                          alt={settings.storeName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-['Cinzel'] text-sm font-bold text-[#F0E5C9] leading-tight uppercase">
                        AGBÁRA
                      </h3>
                      <p className="text-[11px] text-[#D8BD83] font-medium">Ancestralidade Viva</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#174B2A] text-[#D8BD83] border border-[#D8BD83]/40 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    Catálogo Oficial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
