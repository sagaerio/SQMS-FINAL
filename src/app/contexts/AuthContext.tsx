import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, User } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('sqms_logged_in') === 'true' ||
                     localStorage.getItem('sqms_demo_logged_in') === 'true';
    const userEmail = localStorage.getItem('sqms_user_email');
    const userRole = localStorage.getItem('sqms_user_role');
    const userName = localStorage.getItem('sqms_user_name');

    if (loggedIn && userEmail && userRole && userName) {
      setUser({
        id: userEmail === 'demo@customer.com' ? 'demo-user-id' : 'user-' + userEmail,
        email: userEmail,
        full_name: userName,
        role: userRole as 'customer' | 'staff' | 'admin' | 'superadmin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (email.trim().toLowerCase() === 'demo@customer.com' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo-user-id',
          email: 'demo@customer.com',
          full_name: 'Demo Customer',
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(demoUser);
        localStorage.setItem('sqms_demo_logged_in', 'true');
        localStorage.setItem('sqms_user_email', 'demo@customer.com');
        localStorage.setItem('sqms_user_role', 'customer');
        localStorage.setItem('sqms_user_name', 'Demo Customer');
        return { error: null };
      }

      const res = await fetch(import.meta.env.VITE_API_URL + '/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.non_field_errors?.[0] || data.detail || 'Invalid email or password');
      }

      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);

      const djangoUser = {
  ...data.user,
  id: String(data.user.id),
  email: data.user.email,
  full_name: data.user.full_name || email,
  role: data.user.role || 'customer',
  created_at: data.user.date_joined || new Date().toISOString(),
  updated_at: new Date().toISOString()
} as User;
      
      setUser(djangoUser);
      localStorage.setItem('sqms_logged_in', 'true');
      localStorage.setItem('sqms_user_email', djangoUser.email);
      localStorage.setItem('sqms_user_role', djangoUser.role);
      localStorage.setItem('sqms_user_name', djangoUser.full_name);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
        });

      if (profileError) throw profileError;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('sqms_demo_logged_in');
    localStorage.removeItem('sqms_logged_in');
    localStorage.removeItem('sqms_user_email');
    localStorage.removeItem('sqms_user_role');
    localStorage.removeItem('sqms_user_name');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      if (localStorage.getItem('sqms_demo_logged_in') === 'true') {
        setUser({ ...user, ...updates } as User);
        return { error: null };
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates } as User);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
