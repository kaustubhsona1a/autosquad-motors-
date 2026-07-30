import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginAsDealer: () => void; // Keep for interface compatibility, but implement via Supabase
  loginWithGoogle?: () => Promise<void>; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  loginAsDealer: () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('autosquad_dealer_auth') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted) {
            setUser(session.user);
            setIsAdmin(true);
            localStorage.setItem('autosquad_dealer_auth', 'true');
          }
        } else {
          const storedAuth = localStorage.getItem('autosquad_dealer_auth') === 'true';
          if (isMounted) {
            setIsAdmin(storedAuth);
          }
        }
      } catch (e) {
        const storedAuth = localStorage.getItem('autosquad_dealer_auth') === 'true';
        if (isMounted) {
          setIsAdmin(storedAuth);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(true);
        localStorage.setItem('autosquad_dealer_auth', 'true');
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('autosquad_dealer_auth');
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsDealer = () => {
    setIsAdmin(true);
    localStorage.setItem('autosquad_dealer_auth', 'true');
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('autosquad_dealer_auth');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      loginAsDealer, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

