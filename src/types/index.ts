export type ProductStatus = 'available' | 'unavailable' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  imageUrl?: string;
  imageUrls?: string[];
  suggestedImagePath?: string;
  status: ProductStatus;
  isActive: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order?: number;
  createdAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  institutionalText: string;
  whatsappNumber: string;
  whatsappMessagePrefix: string;
  instagram: string;
  email: string;
  bannerUrl: string;
  bannerImages?: string[];
  logoUrl: string;
  disclaimerText: string;
  updatedAt?: string;
}

export interface BudgetItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
