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
}
