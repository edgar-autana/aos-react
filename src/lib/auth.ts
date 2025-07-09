import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

// Auth user interface
export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Auth session interface
export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Helper function to convert Supabase User to AuthUser
const convertSupabaseUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email || '',
  firstName: user.user_metadata?.firstName || user.user_metadata?.first_name,
  lastName: user.user_metadata?.lastName || user.user_metadata?.last_name,
  avatar: user.user_metadata?.avatar_url || user.user_metadata?.avatar,
  createdAt: user.created_at,
  updatedAt: user.updated_at || user.created_at
})

// Helper function to convert Supabase Session to AuthSession
const convertSupabaseSession = (session: Session): AuthSession => ({
  user: convertSupabaseUser(session.user),
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at || 0
})

// Auth error interface
export interface AuthError {
  code: string
  message: string
}

// Auth state interface
export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: AuthError | null
}

// Supabase auth functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData?: Partial<AuthUser>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      return {
        user: data.user ? convertSupabaseUser(data.user) : null,
        session: data.session ? convertSupabaseSession(data.session) : null,
        error: null
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: {
          code: error.code || 'SIGNUP_ERROR',
          message: error.message || 'Failed to sign up'
        }
      }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return {
        user: data.user ? convertSupabaseUser(data.user) : null,
        session: data.session ? convertSupabaseSession(data.session) : null,
        error: null
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: {
          code: error.code || 'SIGNIN_ERROR',
          message: error.message || 'Failed to sign in'
        }
      }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'SIGNOUT_ERROR',
          message: error.message || 'Failed to sign out'
        }
      }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error

      return {
        session: session ? convertSupabaseSession(session) : null,
        error: null
      }
    } catch (error: any) {
      return {
        session: null,
        error: {
          code: error.code || 'SESSION_ERROR',
          message: error.message || 'Failed to get session'
        }
      }
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error

      return {
        user: user ? convertSupabaseUser(user) : null,
        error: null
      }
    } catch (error: any) {
      return {
        user: null,
        error: {
          code: error.code || 'USER_ERROR',
          message: error.message || 'Failed to get user'
        }
      }
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'RESET_PASSWORD_ERROR',
          message: error.message || 'Failed to reset password'
        }
      }
    }
  },

  // Update password
  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'UPDATE_PASSWORD_ERROR',
          message: error.message || 'Failed to update password'
        }
      }
    }
  }
} 