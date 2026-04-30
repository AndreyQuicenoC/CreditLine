import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { logger } from "../../utils/logger";

export type UserRole = "ADMIN" | "OPERARIO";

export interface AuthUser {
  id: string;
  auth_id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  is_active: boolean;
  ultimo_acceso: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperario: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // INIT AUTH FROM LOCALSTORAGE
  useEffect(() => {
    const token = localStorage.getItem("creditline_token");
    const storedUser = localStorage.getItem("creditline_user");

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("creditline_token");
        localStorage.removeItem("creditline_user");
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: error.error || "Login failed",
        };
      }

      const data = await response.json();

      if (!data.token || !data.user) {
        return {
          success: false,
          error: "Invalid server response",
        };
      }

      // STORE AUTH
      localStorage.setItem("creditline_token", data.token);
      localStorage.setItem("creditline_user", JSON.stringify(data.user));

      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login error",
      };
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("creditline_token");
    localStorage.removeItem("creditline_user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.rol === "ADMIN",
    isOperario: user?.rol === "OPERARIO",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}