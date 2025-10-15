import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@shared/schema';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  isRegistering: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string, userType: 'vestibulano' | 'concurseiro') => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data as User);
      } else {
        // 401 é esperado para usuários não autenticados - não logar erro
        setUser(null);
      }
    } catch (error) {
      // Erro de rede - não logar para não poluir console
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }

      const data = await response.json();
      setUser(data as User);
      
      await checkAuth();
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Tente novamente.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string, userType: 'vestibulano' | 'concurseiro'): Promise<boolean> => {
    setIsRegistering(true);
    try {
      console.log('🔵 Iniciando registro com dados:', { name, email, phone: phone.replace(/\d/g, '*'), userType });
      
      const requestBody = { name, email, phone, password, userType };
      console.log('📤 Enviando requisição para /api/auth/register');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Resposta recebida - Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.message || 'Erro ao criar conta. Verifique os dados informados.');
      }

      const data = await response.json();
      console.log('✅ Registro bem-sucedido');
      setUser(data as User);
      
      await checkAuth();
      
      return true;
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer logout.');
      }

      setUser(null);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão ao fazer logout.');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticating, 
      isRegistering, 
      login, 
      logout, 
      register, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
