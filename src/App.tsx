import React, { useState, useEffect, useCallback } from 'react';
import {
  LOCAL_PRODUCTS,
  LOCAL_CATEGORIES,
  LOCAL_STORE_SETTINGS,
} from './data/catalogData';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CatalogueSection } from './components/CatalogueSection';
import { InstitutionalSection } from './components/InstitutionalSection';
import { Footer } from './components/Footer';
import { BudgetDrawer } from './components/BudgetDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MobileFloatingBudgetBar } from './components/MobileFloatingBudgetBar';
import { AdminPanelModal } from './components/AdminPanelModal';
import type { Product } from './types';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() =>
    LOCAL_PRODUCTS.filter((p) => p.isActive && p.status !== 'unavailable')
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const refreshPublicProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = (await res.json()) as { products?: Product[] };
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        setSelectedProduct((prev) =>
          prev ? data.products!.find((p) => p.id === prev.id) || null : null
        );
      }
    } catch {
      // Mantém lista local caso a requisição falhe
    }
  }, []);

  useEffect(() => {
    void refreshPublicProducts();
  }, [refreshPublicProducts]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-parchment text-[#171713] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <Header
          settings={LOCAL_STORE_SETTINGS}
          onOpenAdmin={() => setAdminModalOpen(true)}
        />

        {/* Hero Section */}
        <HeroSection
          settings={LOCAL_STORE_SETTINGS}
          onExploreCatalog={scrollToCatalog}
        />

        {/* Interactive Catalogue */}
        <CatalogueSection
          products={products}
          categories={LOCAL_CATEGORIES}
          onOpenDetails={(prod) => setSelectedProduct(prod)}
        />

        {/* Institutional Section */}
        <InstitutionalSection settings={LOCAL_STORE_SETTINGS} />

        {/* Footer */}
        <Footer settings={LOCAL_STORE_SETTINGS} />

        {/* Floating Budget Drawer */}
        <BudgetDrawer settings={LOCAL_STORE_SETTINGS} />

        {/* Mobile Sticky Floating Budget Bar */}
        <MobileFloatingBudgetBar />

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        {/* Admin Panel Modal */}
        <AdminPanelModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          adminToken={adminToken}
          onSetAdminToken={setAdminToken}
          onProductsUpdated={refreshPublicProducts}
        />
      </div>
    </CartProvider>
  );
}
