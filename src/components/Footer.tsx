import React from 'react';
import { Phone, Instagram, Mail, ShieldAlert } from 'lucide-react';
import {
  formatWhatsAppUrl,
  formatSocialUrl,
  displayWhatsAppLabel,
  displaySocialLabel,
} from '../utils/linkHelpers';
import type { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
}) => {
  return (
    <footer id="contato" className="bg-[#171713] text-[#F0E5C9] border-t border-[#D8BD83]/30 pt-16 pb-24 md:pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#D8BD83]/20">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              {settings.logoUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D8BD83] bg-[#171713] shrink-0 shadow-md">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="font-['Cinzel'] tracking-wider text-xl font-bold text-[#F0E5C9] block uppercase">
                  AGBÁRA
                </span>
                <span className="text-xs tracking-widest text-[#D8BD83] uppercase font-bold">
                  Ancestralidade Viva
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#D8BD83]/80 max-w-sm leading-relaxed">
              {settings.tagline ||
                'Conexão sagrada com a sabedoria da terra, medicinas tradicionais e arte ancestral.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {settings.instagram && (
                <a
                  href={formatSocialUrl(settings.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#22221C] hover:bg-[#174B2A] border border-[#D8BD83]/40 text-[#D8BD83] hover:text-[#F0E5C9] transition-colors shadow-sm"
                  title="Rede Social / Instagram Oficial"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.whatsappNumber && (
                <a
                  href={formatWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#22221C] hover:bg-[#174B2A] border border-[#D8BD83]/40 text-[#D8BD83] hover:text-[#F0E5C9] transition-colors shadow-sm"
                  title="WhatsApp do Vendedor"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="p-2.5 rounded-xl bg-[#22221C] hover:bg-[#174B2A] border border-[#D8BD83]/40 text-[#D8BD83] hover:text-[#F0E5C9] transition-colors shadow-sm"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-['Cinzel'] text-sm font-bold text-[#D8BD83] tracking-wider uppercase">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-[#F0E5C9]/85">
              <li>
                <a href="#inicio" className="hover:text-[#D8BD83] transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#D8BD83] transition-colors">
                  Catálogo de Produtos & Orçamentos
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-[#D8BD83] transition-colors">
                  Ancestralidade & Origem
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-['Cinzel'] text-sm font-bold text-[#D8BD83] tracking-wider uppercase">
              Atendimento Direto
            </h4>
            <div className="space-y-2.5 text-xs text-[#F0E5C9]/85 [&>p:nth-of-type(3)]:hidden">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#77964A] shrink-0" />
                <a
                  href={formatWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D8BD83] underline underline-offset-2 transition-colors"
                >
                  WhatsApp: {displayWhatsAppLabel(settings.whatsappNumber)}
                </a>
              </p>
              {settings.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#D8BD83] shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-[#D8BD83] transition-colors"
                  >
                    Email: {settings.email}
                  </a>
                </p>
              )}
              {settings.instagram && (
                <p className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5 text-[#A52B20] shrink-0" />
                  <a
                    href={formatSocialUrl(settings.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D8BD83] underline underline-offset-2 transition-colors"
                  >
                    Rede Social: {displaySocialLabel(settings.instagram)}
                  </a>
                </p>
              )}
              <p className="text-[11px] text-[#D8BD83]/70 pt-1">
                Atendimento dedicado para tirar dúvidas sobre medicinas, instrumentos e envios com respeito e carinho.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Required by Law & Prompt */}
        <div className="mt-8 p-4 rounded-2xl bg-[#22221C] border border-[#A52B20]/40 flex items-start gap-3 shadow-md">
          <ShieldAlert className="w-5 h-5 text-[#A52B20] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#F0E5C9]/80 leading-relaxed">
            <strong className="text-[#D8BD83] block mb-0.5">
              Aviso Legal, Ético e Sanitário Obrigatório:
            </strong>
            <p>
              {settings.disclaimerText ||
                'Os produtos deste catálogo são destinados a práticas tradicionais, rituais espirituais e uso cultural consciente. Venda estritamente proibida para menores de 18 anos. Nossos produtos não constituem tratamento médico, diagnóstico ou cura de patologias, nem possuem propriedades terapêuticas alegadas sem comprovação e autorização sanitária dos órgãos competentes.'}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[#D8BD83]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D8BD83]/70">
          <p>© {new Date().getFullYear()} AGBÁRA – Ancestralidade Viva. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
