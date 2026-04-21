export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  concept: string;
  material: string;
  fit: string;
  care: string;
  images: string[];
  status: "Available" | "Coming Soon";
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  firstName?: string;
  lastName?: string;
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
  shipping: {
    address: string;
    method: string;
  };
}
