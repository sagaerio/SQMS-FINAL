/**
 * AuthContext — backed by the Django REST API (JWT auth).
 * Replaces the previous Supabase-based implementation.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, storeTokens, clearTokens, getAccessToken, DjangoUser, AuthResponse } from '../../lib/api';

// User type compatible with existing code structure but powered by Django
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'staff' | 'admin' | 'superadmin';
  industry_id?: string;
  counter_id?: string;
  business_id?: string;
  branch_id?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
  counter_number?: number | null;
  assigned_branch_name?: string | null;
  assigned_services_names?: string[];
}

interface AuthContextType {
  user: User | null;
  session: null; // Keep for compatibility with existing code
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Django user → our User type
function toUser(d: DjangoUser): User {
  return {
    id: String(d.id),
    email: d.email,
    full_name: d.full_name,
    role: (d.role === 'super_admin' ? 'superadmin' : d.role) as User['role'],
    business_id: d.business ? String(d.business) : undefined,
    email_verified: d.email_verified,
    created_at: d.created_at,
    updated_at: d.created_at,
    counter_number: d.counter_number ?? null,
    assigned_branch_name: d.assigned_branch_name ?? null,
    assigned_services_names: d.assigned_services_names ?? [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Load user profile from Django backend
        const { data, error } = await api.get<DjangoUser>('/accounts/me/');
        if (!error && data) {
          const currentUser = toUser(data);
          setUser(currentUser);

          // Persist to localStorage for compatibility
          localStorage.setItem('sqms_logged_in', 'true');
          localStorage.setItem('sqms_user_email', currentUser.email);
          localStorage.setItem('sqms_user_role', currentUser.role);
          localStorage.setItem('sqms_user_name', currentUser.full_name);
        } else {
          // Token invalid / expired and refresh also failed
          await clearTokens();
        }
      } catch {
        await clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await api.post<AuthResponse>(
        '/accounts/login/',
        { email, password },
        false, // No auth required for login
      );

      if (error || !data || !data.tokens?.access) {
        return { error: new Error(error || 'Login failed. Check your credentials.') };
      }

      await storeTokens(data.tokens.access, data.tokens.refresh);
      const currentUser = toUser(data.user);
      setUser(currentUser);

      // Persist to localStorage
      localStorage.setItem('sqms_logged_in', 'true');
      localStorage.setItem('sqms_user_email', currentUser.email);
      localStorage.setItem('sqms_user_role', currentUser.role);
      localStorage.setItem('sqms_user_name', currentUser.full_name);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
  ) => {
    try {
      const body = {
        email,
        password,
        password2: password, // Django expects password confirmation
        full_name: fullName,
        phone: '0000000000', // Default placeholder phone
      };

      const { data, error } = await api.post<AuthResponse>('/accounts/register/', body, false);

      if (error || !data) {
        return { error: new Error(error || 'Registration failed') };
      }

      await storeTokens(data.tokens.access, data.tokens.refresh);
      const currentUser = toUser(data.user);
      setUser(currentUser);

      // Persist to localStorage
      localStorage.setItem('sqms_logged_in', 'true');
      localStorage.setItem('sqms_user_email', currentUser.email);
      localStorage.setItem('sqms_user_role', currentUser.role);
      localStorage.setItem('sqms_user_name', currentUser.full_name);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    const refreshToken = localStorage.getItem('sqms_refresh');
    if (refreshToken) {
      // Fire-and-forget: never let a network failure block local sign-out
      api.post('/accounts/logout/', { refresh: refreshToken }).catch(() => {});
    }

    await clearTokens();
    setUser(null);

    // Clear all localStorage auth flags
    localStorage.removeItem('sqms_logged_in');
    localStorage.removeItem('sqms_user_email');
    localStorage.removeItem('sqms_user_role');
    localStorage.removeItem('sqms_user_name');
    localStorage.removeItem('sqms_admin_industry');
    localStorage.removeItem('sqms_staff_industry');
    localStorage.removeItem('sqms_staff_counter');
    localStorage.removeItem('sqms_admin_business');
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const body: Record<string, unknown> = {};
      if (updates.full_name !== undefined) body.full_name = updates.full_name;
      if (updates.email !== undefined) body.email = updates.email;

      const { data, error } = await api.patch<DjangoUser>('/accounts/me/', body);

      if (error || !data) {
        return { error: new Error(error || 'Update failed') };
      }

      const updatedUser = toUser(data);
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem('sqms_user_email', updatedUser.email);
      localStorage.setItem('sqms_user_name', updatedUser.full_name);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
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
