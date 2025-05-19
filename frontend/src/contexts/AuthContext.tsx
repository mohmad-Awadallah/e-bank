// src/contexts/AuthContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useState,
} from 'react';
import { AuthService } from '@/services/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { UserData, AuthState, AuthContextValue } from '@/types/auth';
import { useRouter } from 'next/navigation';

// Actions for auth reducer
type AuthAction =
  | { type: 'SET_USER'; user: UserData }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_USER' };

const AuthContext = createContext<AuthContextValue>({} as any);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'CLEAR_USER':
      return { ...state, user: null, loading: false, error: null };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
  });
  const [mounted, setMounted] = useState(false);

  const loadUser = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const user = await AuthService.getCurrentUser();
      dispatch({ type: 'SET_USER', user });
    } catch {
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (credentials: { username: string; password: string }): Promise<UserData> => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        await AuthService.login(credentials);
        const user = await AuthService.getCurrentUser();
        dispatch({ type: 'SET_USER', user });
        return user;
      } catch (err: any) {
        const message = err?.message || 'Login failed. Please check your credentials.';
        dispatch({ type: 'SET_ERROR', error: message });
        throw new Error(message);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      await AuthService.logout();
      dispatch({ type: 'CLEAR_USER' });
      router.replace('/');
    } catch (err: any) {
      const message = err?.message || 'Logout failed. Please try again later.';
      dispatch({ type: 'SET_ERROR', error: message });
      throw new Error(message);
    }
  }, []);

  const register = useCallback(
    async (userData: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
      role: string;
    }) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        await AuthService.registerUser(userData);
        dispatch({ type: 'SET_LOADING', loading: false });
      } catch (err: any) {
        const message = err?.message || 'Registration failed. Please try again.';
        dispatch({ type: 'SET_ERROR', error: message });
        throw new Error(message);
      }
    },
    []
  );

  if (!mounted || state.loading) {
    return <LoadingScreen />;
  }

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'ROLE_ADMIN',
    isUser: state.user?.role === 'ROLE_USER',
    isAuditor: state.user?.role === 'ROLE_AUDITOR',
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
