import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000

if (!API_URL) {
  throw new Error('Missing VITE_API_URL in environment')
}

class APIClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      // Get current session and JWT token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return { error: 'No active session' }
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}`
        return { error: errorMessage }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Request timeout' }
        }
        return { error: error.message }
      }
      return { error: 'Unknown error occurred' }
    }
  }

  async get<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const apiClient = new APIClient(API_URL, API_TIMEOUT)

// User Profile API
export const userAPI = {
  getProfile: () => apiClient.get('/api/users/profile/'),
  updateProfile: (data: { nombre?: string }) =>
    apiClient.put('/api/users/profile/update/', data),
  listUsers: () => apiClient.get('/api/users/list/'),
}

export default apiClient
