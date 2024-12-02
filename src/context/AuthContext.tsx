import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('token') ? true : false;
  });

  const [userId, setUserId] = useState<string | null>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.userId || null;
      } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
      }
    }
    return null;
  });

  const login = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserId(null);
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsAuthenticated(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          setUserId(decodedToken.userId);
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
