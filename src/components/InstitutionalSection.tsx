import React from 'react';
import { Feather, Heart, TreePine, ShieldCheck, Leaf } from 'lucide-react';
import type { StoreSettings } from '../types';

interface InstitutionalSectionProps {
  settings: StoreSettings;
}

export const InstitutionalSection: React.FC<InstitutionalSectionProps> = ({
  settings,
}) => {
  return (
    <section id="sobre" className="py-20 md:py-28 bg-[#174B2A] text-[#F0E5C9] relative overflow-hidden border-t border-[#D8BD83]/40">
      {/* Background Soft Atmospheric Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D8BD83]/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A52B20]/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Subtle Ethnic Geometric Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="inst-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 0 30 L 30 0 L 60 30 L 30 60 Z" fill="none" stroke="#D8BD83" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#inst-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Showcase with Logo Emblem */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#A52B20] via-[#D8BD83] to-[#77964A] opacity-40 blur-lg group-hover:opacity-70 transition duration-500" />
              <div className="relative rounded-3xl bg-[#171713] border-2 border-[#D8BD83] p-6 shadow-2xl flex flex-col items-center text-center">
                {settings.logoUrl ? (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#D8BD83] shadow-2xl bg-[#171713] mb-6">
                    <img
                      src={settings.logoUrl}
                      alt={settings.storeName}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-[#D8BD83] shadow-2xl bg-[#174B2A]/40 mb-6 flex items-center justify-center">
                    <Leaf className="w-16 h-16 sm:w-20 sm:h-20 text-[#D8BD83] opacity-90" />
                  </div>
                )}

                <h3 className="font-['Cinzel'] text-xl font-bold text-[#F0E5C9] tracking-wider uppercase">
                  AGBÁRA
                </h3>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D8BD83] font-bold mt-1">
                  Ancestralidade Viva
                </p>

                <p className="mt-4 text-xs text-[#D8BD83]/90 leading-relaxed italic">
                  "AGBÁRA: A força vital que brota da terra e ecoa a sabedoria eterna dos ancestrais."
                </p>

                <div className="mt-6 pt-4 border-t border-[#D8BD83]/30 w-full flex items-center justify-around text-center">
                  <div>
                    <span className="block font-['Cinzel'] text-lg font-bold text-[#D8BD83]">
                      100%
                    </span>
                    <span className="text-[10px] text-[#F0E5C9]/70 uppercase font-medium">Artesanal</span>
                  </div>
                  <div className="h-6 w-px bg-[#D8BD83]/30" />
                  <div>
                    <span className="block font-['Cinzel'] text-lg font-bold text-[#A52B20]">
                      Força
                    </span>
                    <span className="text-[10px] text-[#F0E5C9]/70 uppercase font-medium">Ancestral</span>
                  </div>
                  <div className="h-6 w-px bg-[#D8BD83]/30" />
                  <div>
                    <span className="block font-['Cinzel'] text-lg font-bold text-[#77964A]">
                      Viva
                    </span>
                    <span className="text-[10px] text-[#F0E5C9]/70 uppercase font-medium">Tradição</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171713] border border-[#D8BD83] text-xs font-semibold text-[#D8BD83]">
              <Feather className="w-3.5 h-3.5 text-[#A52B20]" />
              <span className="uppercase tracking-widest text-[10px] font-bold">
                Nossa Missão & Sabedoria
              </span>
            </div>

            <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-extrabold text-[#F0E5C9] leading-tight">
              A Força Ancestral Conectada à sua Caminhada
            </h2>

            <div className="text-sm sm:text-base text-[#F0E5C9]/90 leading-relaxed space-y-4 font-normal">
              <p className="whitespace-pre-line">
                {settings.institutionalText ||
                  'A AGBÁRA nasce do profundo respeito e honra à memória ancestral e à força sagrada da natureza. Cada medicina, instrumento e artefato em nosso catálogo é fruto de relações éticas com guardiões e artesãos da tradição.'}
              </p>
            </div>

            {/* 3 Pillars of Respect */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#171713]/90 border border-[#D8BD83]/50 space-y-2 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-[#77964A]/20 text-[#77964A] flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-[#D8BD83]" />
                </div>
                <h4 className="font-['Cinzel'] text-sm font-bold text-[#F0E5C9]">
                  Colheita Consciente
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-[#171713]/90 border border-[#D8BD83]/50 space-y-2 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-[#A52B20]/20 text-[#A52B20] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#A52B20]" />
                </div>
                <h4 className="font-['Cinzel'] text-sm font-bold text-[#F0E5C9]">
                  Comércio Justo
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-[#171713]/90 border border-[#D8BD83]/50 space-y-2 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-[#77964A]/20 text-[#77964A] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#77964A]" />
                </div>
                <h4 className="font-['Cinzel'] text-sm font-bold text-[#F0E5C9]">
                  Compromisso Ético
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
