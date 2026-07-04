import { createContext, startTransition, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AUTH_TOKEN_KEY, UNAUTHORIZED_EVENT } from '../config';
import { getMyProfile, login, register } from '../lib/api';
import type { LoginPayload, RegisterPayload, User } from '../types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (payload: LoginPayload) => Promise<User>;
  signUp: (payload: RegisterPayload) => Promise<User>;
  refreshUser: () => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  function clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    startTransition(() => setUser(null));
  }

  async function loadProfile() {
    const storedToken = readStoredToken();

    if (!storedToken) {
      setLoading(false);
      startTransition(() => setUser(null));
      return null;
    }

    try {
      const profile = await getMyProfile();
      setToken(storedToken);
      startTransition(() => setUser(profile));
      return profile;
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!readStoredToken()) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await getMyProfile();

        if (isMounted) {
          startTransition(() => setUser(profile));
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  async function signIn(payload: LoginPayload) {
    const response = await login(payload);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setLoading(true);
    const profile = await loadProfile();
    return profile as User;
  }

  async function signUp(payload: RegisterPayload) {
    const response = await register(payload);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setLoading(true);
    const profile = await loadProfile();
    return profile as User;
  }

  function logout() {
    clearSession();
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        signIn,
        signUp,
        refreshUser: loadProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
