// src/lib/auth.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PlacetaUser {
  dni?: string;
  email?: string;
  nombre?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: PlacetaUser | null;
  token: string | null;
  login: () => void;
  loginWithPlaceta: () => void;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, n: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  loginWithPlaceta: () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: () => {},
  loading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PlacetaUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');

    if (urlToken && urlUser) {
      localStorage.setItem('placetaidToken', urlToken);
      localStorage.setItem('placetaidUser', urlUser);
      
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        setUser(parsedUser);
        setToken(urlToken);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
      
      // Clean up URL
      params.delete('token');
      params.delete('user');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    } else {
      const storedToken = localStorage.getItem('placetaidToken');
      const storedUser = localStorage.getItem('placetaidUser');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(decodeURIComponent(storedUser)));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('placetaidToken');
          localStorage.removeItem('placetaidUser');
        }
      }
    }
    setLoading(false);
  }, []);

  const loginWithPlaceta = () => {
    window.location.href = '/login'; // Temporalmente redirigir al login local
  };
  
  const login = loginWithPlaceta; // keep for compabibility with Navbar

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || 'Error en login');
      }
      throw new Error('Error en login, servidor no disponible.');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('placetaidToken', data.token);
    localStorage.setItem('placetaidUser', encodeURIComponent(JSON.stringify(data.user)));
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name })
    });
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || 'Error en registro');
      }
      throw new Error('Error en registro, servidor no disponible.');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('placetaidToken', data.token);
    localStorage.setItem('placetaidUser', encodeURIComponent(JSON.stringify(data.user)));
  };

  const logout = () => {
    localStorage.removeItem('placetaidToken');
    localStorage.removeItem('placetaidUser');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithPlaceta, loginWithEmail, registerWithEmail, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
