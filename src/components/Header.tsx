import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Phone, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatWhatsAppUrl } from '../utils/linkHelpers';
import type { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenAdmin,
}) => {
  const { totalCount, setIsOpen, totalPrice } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#171713]/98 backdrop-blur-md border-b border-[#D8BD83]/30 text-[#F0E5C9] shadow-md transition-all">

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Name */}
          <div
            onClick={() => scrollToSection('inicio')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none min-w-0"
          >
            {settings.logoUrl && (
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D8BD83] shadow-md group-hover:border-[#A52B20] transition-colors bg-[#171713] shrink-0">
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-['Cinzel'] tracking-wider text-base sm:text-xl font-bold text-[#F0E5C9] group-hover:text-[#D8BD83] transition-colors leading-tight truncate uppercase">
                AGBÁRA
              </span>
              <span className="text-[9px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#D8BD83] uppercase font-semibold truncate">
                Ancestralidade Viva
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium text-[#F0E5C9]/90">
            <button
              onClick={() => scrollToSection('inicio')}
              className="hover:text-[#D8BD83] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D8BD83] after:absolute after:bottom-0 after:left-0 after:transition-all cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('catalogo')}
              className="hover:text-[#D8BD83] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D8BD83] after:absolute after:bottom-0 after:left-0 after:transition-all cursor-pointer"
            >
              Catálogo de Produtos
            </button>
            <button
              onClick={() => scrollToSection('sobre')}
              className="hover:text-[#D8BD83] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D8BD83] after:absolute after:bottom-0 after:left-0 after:transition-all cursor-pointer"
            >
              Ancestralidade & Origem
            </button>
            <button
              onClick={() => scrollToSection('contato')}
              className="hover:text-[#D8BD83] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D8BD83] after:absolute after:bottom-0 after:left-0 after:transition-all cursor-pointer"
            >
              Contato & WhatsApp
            </button>
          </nav>

          {/* Actions: Budget Bag, WhatsApp & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Direct WhatsApp fast contact (Desktop) */}
            <a
              href={formatWhatsAppUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#174B2A] hover:bg-[#1f5e36] border border-[#77964A] text-xs font-semibold text-[#F0E5C9] transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-[#D8BD83]" />
              <span>WhatsApp</span>
            </a>

            {/* Budget Bag Trigger (Mobile & Desktop) */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#174B2A] hover:bg-[#1f5e36] border border-[#D8BD83] text-[#F0E5C9] shadow-md transition-all active:scale-95 cursor-pointer min-h-[42px]"
              aria-label="Abrir Lista de Orçamento"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D8BD83]" />
                {totalCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[#A52B20] text-[#F0E5C9] text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-[#171713] animate-pulse">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wide hidden sm:inline">
                Orçamento
              </span>
            </button>

            {/* Discreet Admin Shield Button */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="p-2 rounded-lg text-[#D8BD83]/40 hover:text-[#D8BD83] hover:bg-[#22221C]/60 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Acesso administrativo"
              title="Acesso administrativo"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#171713] border border-[#D8BD83]/40 text-[#F0E5C9] cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
              aria-label="Abrir Menu de Navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D8BD83]" /> : <Menu className="w-5 h-5 text-[#D8BD83]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer com Acessibilidade Total */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171713] border-b border-[#D8BD83]/30 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-fade-in">
          <button
            onClick={() => scrollToSection('inicio')}
            className="w-full text-left py-3 px-3.5 rounded-xl text-sm font-semibold text-[#F0E5C9] hover:bg-[#174B2A] hover:text-[#D8BD83] transition-colors"
          >
            Início
          </button>
          <button
            onClick={() => scrollToSection('catalogo')}
            className="w-full text-left py-3 px-3.5 rounded-xl text-sm font-semibold text-[#F0E5C9] hover:bg-[#174B2A] hover:text-[#D8BD83] transition-colors"
          >
            Catálogo de Produtos
          </button>
          <button
            onClick={() => scrollToSection('sobre')}
            className="w-full text-left py-3 px-3.5 rounded-xl text-sm font-semibold text-[#F0E5C9] hover:bg-[#174B2A] hover:text-[#D8BD83] transition-colors"
          >
            Ancestralidade & Origem
          </button>
          <button
            onClick={() => scrollToSection('contato')}
            className="w-full text-left py-3 px-3.5 rounded-xl text-sm font-semibold text-[#F0E5C9] hover:bg-[#174B2A] hover:text-[#D8BD83] transition-colors"
          >
            Contato
          </button>

          {/* Atalhos Rápidos Mobile */}
          <div className="pt-3 mt-2 border-t border-[#D8BD83]/20 space-y-2.5">
            {/* Abrir Orçamento no Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsOpen(true);
              }}
              className="w-full py-3 px-3.5 rounded-xl bg-[#174B2A] text-[#F0E5C9] border border-[#D8BD83] text-xs font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D8BD83]" />
                <span>Ver Lista de Orçamento</span>
              </div>
              <span className="text-[#D8BD83] font-['Cinzel'] font-bold">
                {totalCount} {totalCount === 1 ? 'item' : 'itens'} {totalCount > 0 && `• ${formatBRL(totalPrice)}`}
              </span>
            </button>

            {/* Direct WhatsApp Mobile */}
            <a
              href={formatWhatsAppUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-3.5 rounded-xl bg-[#22221C] text-[#F0E5C9] border border-[#D8BD83]/40 text-xs font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#77964A]" />
                <span>Atendimento WhatsApp</span>
              </div>
              <span className="text-[11px] text-[#D8BD83]">Falar Agora</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
