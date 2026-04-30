import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../services/supabase";
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
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperario: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem("creditline_token");
    const storedUser = localStorage.getItem("creditline_user");

    logger.debug("AuthContext", "Initializing authentication from localStorage", {
      hasToken: !!token,
      hasUser: !!storedUser,
    });

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        logger.info("AuthContext", "User restored from localStorage", { email: parsedUser.email });
      } catch (error) {
        logger.error("AuthContext", "Error parsing stored user", error as Error);
        localStorage.removeItem("creditline_token");
        localStorage.removeItem("creditline_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      logger.info("AuthContext", "Login attempt", { email });

      const response = await fetch(`${API_URL}/api/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.warn("AuthContext", "Login failed", { status: response.status, email });
        return {
          success: false,
          error: errorData.error || "Login failed",
        };
      }

      const data = await response.json();

      if (data.token && data.user) {
        // Store token and user
        localStorage.setItem("creditline_token", data.token);
        localStorage.setItem("creditline_user", JSON.stringify(data.user));
        setUser(data.user);

        logger.info("AuthContext", "Login successful", {
          email: data.user.email,
          rol: data.user.rol
        });

        return { success: true };
      }

      logger.warn("AuthContext", "Invalid login response from server");
      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error) {
      logger.error("AuthContext", "Login error", error as Error, { email });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      logger.info("AuthContext", "Logout initiated", { email: user?.email });
      localStorage.removeItem("creditline_token");
      localStorage.removeItem("creditline_user");
      setUser(null);
      logger.info("AuthContext", "Logout completed");
    } catch (error) {
      logger.error("AuthContext", "Logout error", error as Error);
    } finally {
      setLoading(false);
    }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
