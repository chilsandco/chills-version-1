import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product } from './types';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token, updateUser } = useAuth();
  
  const storageKey = useMemo(() => {
    return isAuthenticated && user ? `chils-wishlist-${user.email}` : 'chils-wishlist-guest';
  }, [user, isAuthenticated]);

  const [wishlist, setWishlist] = useState<Product[]>([]);

  // 1. Initial load for guest or authenticated cache
  useEffect(() => {
    if (!isAuthenticated) {
      const savedWishlist = localStorage.getItem('chils-wishlist-guest');
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    } else if (user) {
      setWishlist(user.wishlist || []);
    }
  }, [isAuthenticated, user?.email]);

  // 2. Merge guest wishlist into user wishlist on login
  useEffect(() => {
    if (isAuthenticated && user && token) {
      const guestWishlistStr = localStorage.getItem('chils-wishlist-guest');
      if (guestWishlistStr) {
        try {
          const guestWishlist: Product[] = JSON.parse(guestWishlistStr);
          if (guestWishlist.length > 0) {
            const backendWishlist = user.wishlist || [];
            const mergedWishlist = [...backendWishlist];
            let hasChanges = false;

            guestWishlist.forEach(guestItem => {
              if (!mergedWishlist.some(item => item.id === guestItem.id)) {
                mergedWishlist.push(guestItem);
                hasChanges = true;
              }
            });

            // Clear guest wishlist from localStorage
            localStorage.removeItem('chils-wishlist-guest');

            if (hasChanges) {
              // Update local states
              setWishlist(mergedWishlist);
              updateUser({ wishlist: mergedWishlist });
              
              // Sync merged wishlist to backend
              fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ wishlist: mergedWishlist })
              }).catch(err => console.error('[CHILS] Failed to sync merged wishlist:', err));
            }
          }
        } catch (e) {
          console.error("[CHILS] Failed to parse guest wishlist on login:", e);
        }
      }
    }
  }, [isAuthenticated, token]);

  // 3. Keep local state in sync with AuthContext user.wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.wishlist) {
      if (JSON.stringify(wishlist) !== JSON.stringify(user.wishlist)) {
        setWishlist(user.wishlist);
      }
    }
  }, [user?.wishlist, isAuthenticated]);

  // Helper to update state and sync to server
  const updateWishlistAndSync = (newWishlist: Product[]) => {
    setWishlist(newWishlist);

    if (isAuthenticated && user) {
      updateUser({ wishlist: newWishlist });
      localStorage.setItem(`chils-wishlist-${user.email}`, JSON.stringify(newWishlist));

      if (token) {
        fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ wishlist: newWishlist })
        }).catch(err => console.error('[CHILS] Failed to sync wishlist:', err));
      }
    } else {
      localStorage.setItem('chils-wishlist-guest', JSON.stringify(newWishlist));
    }
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.find(item => item.id === product.id);
    let newWishlist: Product[];
    if (exists) {
      newWishlist = wishlist.filter(item => item.id !== product.id);
    } else {
      newWishlist = [...wishlist, product];
    }
    updateWishlistAndSync(newWishlist);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    updateWishlistAndSync([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
