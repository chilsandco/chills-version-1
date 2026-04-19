import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from './types';

interface AuthContextType {
  user: Customer | null;
  token: string | null;
  login: (token: string, user: Customer) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('chils_auth_token');
    const storedUser = localStorage.getItem('chils_auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Optional: Verify token with server
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        }).then(res => {
          if (!res.ok) logout(); // Token expired or invalid
        }).catch(() => {});
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
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
