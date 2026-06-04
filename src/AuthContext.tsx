import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from './types';

interface AuthContextType {
  user: Customer | null;
  token: string | null;
  login: (token: string, user: Customer) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<Customer>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem('chils_auth_token');
    const storedUser = localStorage.getItem('chils_auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Background verify — inline clear to avoid stale closure on logout ref
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        }).then(res => {
          if (res.ok) {
            return res.json();
          } else {
            // Token invalid — clear session inline (no stale closure)
            if (isMounted) {
              setToken(null);
              setUser(null);
              localStorage.removeItem('chils_auth_token');
              localStorage.removeItem('chils_auth_user');
            }
            return null;
          }
        }).then(data => {
          if (!isMounted) return;
          if (data) {
            setUser(data);
            localStorage.setItem('chils_auth_user', JSON.stringify(data));
          }
          setIsLoading(false);
        }).catch(() => {
          if (isMounted) setIsLoading(false);
        });
        return () => { isMounted = false; };
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
    return () => { isMounted = false; };
  }, []);

  const login = (newToken: string, newUser: Customer) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('chils_auth_token', newToken);
    localStorage.setItem('chils_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('chils_auth_token');
    localStorage.removeItem('chils_auth_user');
  };

  const updateUser = (data: Partial<Customer>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('chils_auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('chils_auth_token');
    if (!currentToken) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('chils_auth_user', JSON.stringify(data));
      }
    } catch (error) {
      console.error("[CHILS & CO.] Profile refresh failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      refreshUser,
      updateUser,
      isAuthenticated: !!token, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
