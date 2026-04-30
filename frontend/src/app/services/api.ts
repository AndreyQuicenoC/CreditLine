const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT as string) || 10000;

if (!API_URL) {
  throw new Error("Missing VITE_API_URL in environment");
}

const getToken = () => {
  const tokenData = localStorage.getItem("creditline_token");
  if (!tokenData) return null;

  try {
    // If token is stored as a plain string (legacy)
    if (!tokenData.includes("{")) {
      return tokenData;
    }

    // If stored as JSON, extract the token
    const parsed = JSON.parse(tokenData);
    if (typeof parsed === "object" && parsed.token) {
      return parsed.token;
    }
    return tokenData;
  } catch {
    return tokenData;
  }
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

      // 401 means token is invalid - let consumer handle logout
      if (response.status === 401) {
        console.log("[API] 401 Unauthorized - clearing auth");
        localStorage.removeItem("creditline_token");
        localStorage.removeItem("creditline_user");
        // Dispatch custom event that AuthContext listens for
        window.dispatchEvent(new Event("auth:logout"));
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