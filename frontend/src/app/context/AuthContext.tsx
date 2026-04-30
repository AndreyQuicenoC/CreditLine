import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { userAPI } from '../services/api'

export type UserRole = 'ADMIN' | 'OPERARIO'

export interface AuthUser {
  id: string
  auth_id: string
  nombre: string
  email: string
  rol: UserRole
  is_active: boolean
  ultimo_acceso: string | null
}

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isOperario: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSupabaseUser(session.user)
          // Fetch user profile from backend
          const { data, error } = await userAPI.getProfile()
          if (data) {
            setUser(data as AuthUser)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          // Fetch profile when user logs in
          if (event === 'SIGNED_IN') {
            const { data } = await userAPI.getProfile()
            if (data) {
              setUser(data as AuthUser)
            }
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return {
          success: false,
          error: authError.message || 'Authentication failed',
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'No user returned from authentication',
        }
      }

      setSupabaseUser(data.user)

      // Fetch user profile from backend
      const { data: profileData, error: profileError } = await userAPI.getProfile()

      if (profileError) {
        // User authenticated but profile not found
        await logout()
        return {
          success: false,
          error: 'User profile not found',
        }
      }

      if (profileData) {
        setUser(profileData as AuthUser)
        return { success: true }
      }

      return {
        success: false,
        error: 'Failed to fetch user profile',
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!supabaseUser,
    isAdmin: user?.rol === 'ADMIN',
    isOperario: user?.rol === 'OPERARIO',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
