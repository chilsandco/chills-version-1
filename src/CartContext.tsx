import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product } from './types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Storage key is user-specific if authenticated
  const storageKey = useMemo(() => {
    return isAuthenticated && user ? `chils-cart-${user.email}` : 'chils-cart-guest';
  }, [user, isAuthenticated]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load cart when storageKey changes (e.g., user logs in/out)
  // If transitioning from guest → authenticated, merge the guest cart items
  useEffect(() => {
    const userCart: CartItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (isAuthenticated && user) {
      // User just logged in — check if there were guest cart items to carry over
      const guestCart: CartItem[] = JSON.parse(localStorage.getItem('chils-cart-guest') || '[]');

      if (guestCart.length > 0) {
        // Merge guest items into the user's cart (avoid duplicates by id+size)
        const merged = [...userCart];
        for (const guestItem of guestCart) {
          const existing = merged.find(
            item => item.id === guestItem.id && 
                    item.selectedSize === guestItem.selectedSize &&
                    item.selectedColor === guestItem.selectedColor
          );
          if (existing) {
            existing.quantity += guestItem.quantity;
          } else {
            merged.push(guestItem);
          }
        }
        setCart(merged);
        // Clear the guest cart so items don't get re-merged on next login
        localStorage.removeItem('chils-cart-guest');
      } else {
        setCart(userCart);
      }
    } else {
      setCart(userCart);
    }

    setHasInitialized(true);
  }, [storageKey]);

  // Save cart whenever it changes (only after initial load to avoid overwriting)
  useEffect(() => {
    if (hasInitialized) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, storageKey, hasInitialized]);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedSize === size && item.selectedColor === color) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === productId && item.selectedSize === size && item.selectedColor === color ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
