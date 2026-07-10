import {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface User {
  userId: string;
  userName: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

async function postRefresh(refreshToken: string) {
  const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });
  return res.data.accessToken as string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      if (!storedRefreshToken || !storedUser) {
        setLoading(false);
        return;
      }
      try {
        await postRefresh(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(
      async () => {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) return;
        try {
          await postRefresh(storedRefreshToken);
        } catch {
          setUser(null);
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      },
      4 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          user_id: email,
          password,
        },
        { timeout: 10000 },
      );
      const data = response.data;
      localStorage.setItem('refreshToken', data.refreshToken);
      const loggedInUser: User = {
        userId: data.user.userId,
        userName: data.user.userName,
        email,
      };
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return true;
    } catch (err: unknown) {
      const msg =
        err != null && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? '서버 오류')
          : err instanceof Error
            ? err.message
            : '인증 처리에 실패했습니다.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.userId) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          user_id: user.userId,
        });
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setLoading(false);
    }
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, error, login, logout }),
    [user, loading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
