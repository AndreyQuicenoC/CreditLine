const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT as string) || 10000;
const TOKEN_EXPIRATION_MS = 3600000; // 1 hour in milliseconds

if (!API_URL) {
  throw new Error("Missing VITE_API_URL in environment");
}

interface TokenData {
  token: string;
  timestamp: number;
}

const getToken = () => {
  const tokenData = localStorage.getItem("creditline_token");
  if (!tokenData) return null;

  try {
    // If token is stored as a plain string (legacy), return it
    if (!tokenData.includes("{")) {
      return tokenData;
    }

    // If stored as JSON with expiration info
    const { token, timestamp } = JSON.parse(tokenData);
    const now = Date.now();
    const elapsed = now - timestamp;

    // Check if token has expired
    if (elapsed > TOKEN_EXPIRATION_MS) {
      localStorage.removeItem("creditline_token");
      localStorage.removeItem("creditline_user");
      window.location.href = "/login";
      return null;
    }

    return token;
  } catch {
    // If parsing fails, assume it's a plain token string
    return tokenData;
  }
};

const setToken = (token: string) => {
  const tokenData: TokenData = {
    token,
    timestamp: Date.now(),
  };
  localStorage.setItem("creditline_token", JSON.stringify(tokenData));
};

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data?: T; error?: string }> {
    try {
      const token = getToken();

      // No bloquear login
      const isAuthEndpoint = endpoint.includes("/login/");

      if (!token && !isAuthEndpoint) {
        return { error: "Missing auth token" };
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Auto logout si token inválido
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return { error: "Unauthorized" };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { error: "Request timeout" };
      }

      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body: Record<string, unknown>) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: Record<string, unknown>) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const apiClient = new APIClient(API_URL, API_TIMEOUT);

export default apiClient;