import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, ComboSubItem } from './types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  addComboToCart: (comboProduct: Product, items: ComboSubItem[]) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token, updateUser } = useAuth();
  
  const storageKey = useMemo(() => {
    return isAuthenticated && user ? `chils-cart-${user.email}` : 'chils-cart-guest';
  }, [user, isAuthenticated]);

  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Initial load from local caches/session
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem('chils-cart-guest');
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else if (user) {
      setCart(user.cart || []);
    }
  }, [isAuthenticated, user?.email]);

  // 2. Merge guest cart into user cart on login
  useEffect(() => {
    if (isAuthenticated && user && token) {
      const guestCartStr = localStorage.getItem('chils-cart-guest');
      if (guestCartStr) {
        try {
          const guestCart: CartItem[] = JSON.parse(guestCartStr);
          if (guestCart.length > 0) {
            const backendCart = user.cart || [];
            const mergedCart = [...backendCart];
            let hasChanges = false;

            for (const guestItem of guestCart) {
              const existing = mergedCart.find(
                item => item.id === guestItem.id && 
                        item.selectedSize === guestItem.selectedSize &&
                        item.selectedColor === guestItem.selectedColor
              );
              if (existing) {
                existing.quantity += guestItem.quantity;
                hasChanges = true;
              } else {
                mergedCart.push(guestItem);
                hasChanges = true;
              }
            }

            // Clear guest cart from localStorage
            localStorage.removeItem('chils-cart-guest');

            if (hasChanges) {
              // Update local state and auth
              setCart(mergedCart);
              updateUser({ cart: mergedCart });
              
              // Sync to server
              fetch('/api/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cart: mergedCart })
              }).catch(err => console.error('[CHILS] Failed to sync merged cart:', err));
            }
          }
        } catch (e) {
          console.error("[CHILS] Failed to parse guest cart on login:", e);
        }
      }
    }
  }, [isAuthenticated, token]);

  // 3. Keep local state in sync with AuthContext user.cart
  useEffect(() => {
    if (isAuthenticated && user?.cart) {
      if (JSON.stringify(cart) !== JSON.stringify(user.cart)) {
        setCart(user.cart);
      }
    }
  }, [user?.cart, isAuthenticated]);

  // Helper to update state and sync to server
  const updateCartAndSync = (newCart: CartItem[]) => {
    setCart(newCart);

    if (isAuthenticated && user) {
      updateUser({ cart: newCart });
      localStorage.setItem(`chils-cart-${user.email}`, JSON.stringify(newCart));

      if (token) {
        fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart: newCart })
        }).catch(err => console.error('[CHILS] Failed to sync cart:', err));
      }
    } else {
      localStorage.setItem('chils-cart-guest', JSON.stringify(newCart));
    }
  };

  const addToCart = (product: Product, size?: string, color?: string) => {
    const resolvedColor = color || (product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : undefined);
    
    const existingIndex = cart.findIndex(item => 
      item.id === product.id && 
      item.selectedSize === size && 
      (item.selectedColor || undefined) === (resolvedColor || undefined)
    );

    let newCart: CartItem[];
    if (existingIndex > -1) {
      newCart = cart.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1, selectedSize: size, selectedColor: resolvedColor }];
    }
    
    updateCartAndSync(newCart);
  };

  const addComboToCart = (comboProduct: Product, items: ComboSubItem[]) => {
    const comboKey = `${comboProduct.id}-${items.map(i => `${i.id}_${i.selectedSize}`).join('-')}`;
    const existingIndex = cart.findIndex(item => item.id === comboKey);
    let newCart: CartItem[];

    if (existingIndex > -1) {
      newCart = cart.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [
        ...cart,
        {
          ...comboProduct,
          id: comboKey,
          name: comboProduct.name,
          price: comboProduct.price,
          quantity: 1,
          isCombo: true,
          comboItems: items,
          images: comboProduct.images
        }
      ];
    }
    
    updateCartAndSync(newCart);
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    const newCart = cart.filter(item => !(
      item.id === productId && 
      item.selectedSize === size && 
      (item.selectedColor || undefined) === (color || undefined)
    ));
    updateCartAndSync(newCart);
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    const newCart = cart.map(item => (
      item.id === productId && 
      item.selectedSize === size && 
      (item.selectedColor || undefined) === (color || undefined) 
        ? { ...item, quantity } 
        : item
    ));
    updateCartAndSync(newCart);
  };

  const clearCart = () => {
    updateCartAndSync([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    return sum + (item.comboId ? itemTotal * 0.9 : itemTotal);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, addComboToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
