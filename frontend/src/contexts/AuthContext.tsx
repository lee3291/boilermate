import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('access_token'),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded: { sub: string; email: string; avatarURL?: string } =
          jwtDecode(token);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          avatarURL: decoded.avatarURL,
        });
        localStorage.setItem('access_token', token);
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUser(null);
        localStorage.removeItem('access_token');
      }
    } else {
      setUser(null);
      localStorage.removeItem('access_token');
    }
    setLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
