import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileFloatingBudgetBar: React.FC = () => {
  const { totalCount, totalPrice, isOpen, setIsOpen } = useCart();

  if (totalCount === 0 || isOpen) {
    return null;
  }

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="md:hidden fixed bottom-4 inset-x-3 z-40 animate-fade-in pointer-events-none">
      <button
        onClick={() => setIsOpen(true)}
        className="pointer-events-auto w-full py-3 px-4 rounded-2xl bg-[#174B2A] text-[#F0E5C9] border-2 border-[#D8BD83] shadow-2xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
        aria-label="Abrir orçamento no celular"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#171713] border border-[#D8BD83] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#D8BD83]" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-[#A52B20] text-[#F0E5C9] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#171713] animate-pulse">
              {totalCount}
            </span>
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold block text-white">Ver Orçamento</span>
            <span className="text-[10px] text-[#D8BD83] block">
              {totalCount} {totalCount === 1 ? 'produto selecionado' : 'produtos selecionados'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-['Cinzel'] text-sm font-extrabold text-[#D8BD83]">
            {totalPrice > 0 ? formatBRL(totalPrice) : 'Sob consulta'}
          </span>
          <div className="w-7 h-7 rounded-full bg-[#171713] border border-[#D8BD83] flex items-center justify-center text-[#D8BD83]">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>
    </div>
  );
};
