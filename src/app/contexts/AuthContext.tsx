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
    // Check for any logged-in user in localStorage (demo, staff, admin, etc.)
    const loggedIn = localStorage.getItem('sqms_logged_in') === 'true' ||
                     localStorage.getItem('sqms_demo_logged_in') === 'true';
    const userEmail = localStorage.getItem('sqms_user_email');
    const userRole = localStorage.getItem('sqms_user_role');
    const userName = localStorage.getItem('sqms_user_name');

    if (loggedIn && userEmail && userRole && userName) {
      // Restore user from localStorage
      setUser({
        id: userEmail === 'demo@customer.com' ? 'demo-user-id' : `user-${userEmail}`,
        email: userEmail,
        full_name: userName,
        role: userRole as 'customer' | 'staff' | 'admin' | 'superadmin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip if user is logged in via localStorage
      if (localStorage.getItem('sqms_logged_in') === 'true' ||
          localStorage.getItem('sqms_demo_logged_in') === 'true') {
        return;
      }

      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);

      // Save user data to localStorage for persistence
      localStorage.setItem('sqms_logged_in', 'true');
      localStorage.setItem('sqms_user_email', data.email);
      localStorage.setItem('sqms_user_role', data.role);
      localStorage.setItem('sqms_user_name', data.full_name);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Support demo account
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
        // Save demo credentials to local storage for persistence across reloads
        localStorage.setItem('sqms_demo_logged_in', 'true');
        localStorage.setItem('sqms_user_email', 'demo@customer.com');
        localStorage.setItem('sqms_user_role', 'customer');
        localStorage.setItem('sqms_user_name', 'Demo Customer');
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        // Set logged in flag for Supabase users too
        localStorage.setItem('sqms_logged_in', 'true');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
        });

      if (profileError) throw profileError;

      await loadUserProfile(authData.user.id);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear all localStorage auth flags
    localStorage.removeItem('sqms_demo_logged_in');
    localStorage.removeItem('sqms_logged_in');
    localStorage.removeItem('sqms_user_email');
    localStorage.removeItem('sqms_user_role');
    localStorage.removeItem('sqms_user_name');

    // Clear Supabase session
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
