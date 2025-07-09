import { useState, useEffect, useCallback } from 'react'
import { authService, AuthState, AuthUser, AuthSession, AuthError } from '../lib/auth'

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { session, error } = await authService.getSession()
        
        if (error) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error
          }))
          return
        }

        if (session?.user) {
          const { user, error: userError } = await authService.getUser()
          
          if (userError) {
            setAuthState(prev => ({
              ...prev,
              loading: false,
              error: userError
            }))
            return
          }

          setAuthState({
            user: user as AuthUser,
            session: session as AuthSession,
            loading: false,
            error: null
          })
        } else {
          setAuthState(prev => ({
            ...prev,
            loading: false
          }))
        }
      } catch (error: any) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: {
            code: 'INIT_ERROR',
            message: error.message || 'Failed to initialize auth'
          }
        })
      }
    }

    initializeAuth()
  }, [])

  // Sign up function
  const signUp = useCallback(async (email: string, password: string, userData?: Partial<AuthUser>) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.signUp(email, password, userData)
    
    if (result.error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: result.error
      }))
      return result
    }

    setAuthState({
      user: result.user as AuthUser,
      session: result.session as AuthSession,
      loading: false,
      error: null
    })

    return result
  }, [])

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.signIn(email, password)
    
    if (result.error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: result.error
      }))
      return result
    }

    setAuthState({
      user: result.user as AuthUser,
      session: result.session as AuthSession,
      loading: false,
      error: null
    })

    return result
  }, [])

  // Sign out function
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.signOut()
    
    if (result.error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: result.error
      }))
      return result
    }

    setAuthState({
      user: null,
      session: null,
      loading: false,
      error: null
    })

    return result
  }, [])

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.resetPassword(email)
    
    setAuthState(prev => ({
      ...prev,
      loading: false,
      error: result.error
    }))

    return result
  }, [])

  // Update password function
  const updatePassword = useCallback(async (password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.updatePassword(password)
    
    setAuthState(prev => ({
      ...prev,
      loading: false,
      error: result.error
    }))

    return result
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearError
  }
} 