export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  shortDescription: string;
  concept: string;
  material: string;
  fit: string;
  care: string;
  images: string[];
  status: "Available" | "Coming Soon";
  coCreator?: string;
  totalSales?: number;
  stockQuantity?: number;
  featured?: boolean;
  variations?: ProductVariation[];
  availableColors?: string[];
  availableSizes?: string[];
  categories?: string[];
  colorSwatches?: Record<string, { type: 'color' | 'image' | 'label', value: string }>;
  colorAttributeName?: string;
  sizeAttributeName?: string;
  type?: "simple" | "variable" | "grouped";
  groupedProducts?: string[];
}

export interface ProductVariation {
  id: string;
  attributes: { color?: string; size?: string };
  price: number;
  stockQuantity: number;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  manageStock?: boolean;
  images: string[];
}

export interface ComboSubItem {
  id: string;
  name: string;
  selectedSize: string;
  selectedColor: string;
  image: string;
  price: number;
  variations?: ProductVariation[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  isCombo?: boolean;
  comboItems?: ComboSubItem[];
  comboId?: string;
  comboName?: string;
}

export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  firstName?: string;
  lastName?: string;
  onWaitlist?: boolean;
  bespokeUnlocked?: boolean;
  coCreatorInterest?: boolean;
  pseudoName?: string;
  wishlist?: Product[];
  cart?: CartItem[];
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address_1?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}


export interface SignalItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Signal {
  id: string;
  signalId: string;
  status: string;
  date: string;
  total: number;
  currency: string;
  items: SignalItem[];
  dateCompleted?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  shipping: {
    address: string;
    method: string;
    awb?: string | null;
    courier?: string | null;
    trackingStatus?: string | null;
    trackingUrl?: string | null;
    etd?: string | null;
  };
  orderKey?: string;
  rmaSwaps?: RmaSwapItem[] | null;
}

export interface RmaSwapItem {
  originalProductId: string;
  originalProductName: string;
  swapProductId: string;
  swapProductName: string;
  swapSize: string;
  swapProductImage?: string | null;
  quantity: number;
  delta: number;
  type: 'refund' | 'charge';
}


export interface ProductReview {
  id: number;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  date_created: string;
  images?: string[];
}


