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
    console.log("[AuthContext] Initializing from localStorage");
    const token = localStorage.getItem("creditline_token");
    const storedUser = localStorage.getItem("creditline_user");

    console.log("[AuthContext] Has token:", !!token);
    console.log("[AuthContext] Has user:", !!storedUser);

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log(
          "[AuthContext] User restored:",
          parsed.email,
          "role:",
          parsed.rol,
        );
        setUser(parsed);
      } catch (e) {
        console.log("[AuthContext] Error parsing user, clearing storage");
        localStorage.removeItem("creditline_token");
        localStorage.removeItem("creditline_user");
      }
    } else {
      console.log("[AuthContext] No auth data found, user is null");
    }

    setLoading(false);

    // Listen for logout events from API
    const handleLogout = () => {
      console.log("[AuthContext] Logout event received");
      setUser(null);
    };

    // Listen for user updates (e.g., profile changes)
    const handleUserUpdate = () => {
      console.log("[AuthContext] User update event received");
      const storedUser = localStorage.getItem("creditline_user");
      if (storedUser) {
        try {
          const updated = JSON.parse(storedUser);
          console.log("[AuthContext] User updated:", updated.nombre);
          setUser(updated);
        } catch (e) {
          console.error("[AuthContext] Error parsing updated user");
        }
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("user:updated", handleUserUpdate);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("user:updated", handleUserUpdate);
    };
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      console.log("[AuthContext] Login attempt for:", email);
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
        console.log("[AuthContext] Login failed:", error.error);
        return {
          success: false,
          error: error.error || "Login failed",
        };
      }

      const data = await response.json();

      if (!data.token || !data.user) {
        console.log("[AuthContext] Invalid server response");
        return {
          success: false,
          error: "Invalid server response",
        };
      }

      console.log(
        "[AuthContext] Login successful for:",
        data.user.email,
        "role:",
        data.user.rol,
      );

      // STORE AUTH
      localStorage.setItem("creditline_token", data.token);
      localStorage.setItem("creditline_user", JSON.stringify(data.user));

      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
