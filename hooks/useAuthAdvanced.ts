'use client'

import { useState } from 'react'

interface AuthSession {
  id: string
  ip_address: string
  user_agent: string
  created_at: string
  is_active: boolean
}

interface AuthLog {
  id: string
  action: string
  status: 'success' | 'failed' | 'blocked'
  ip_address: string
  user_agent: string
  error_message?: string
  created_at: string
}

export function useAuthAdvanced() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  const verifyEmail = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la vérification')
      }

      const data = await response.json()
      return { success: true, message: data.message }
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la vérification'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // PASSWORD RESET
  // ============================================================================

  const requestPasswordReset = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la demande')
      }

      const data = await response.json()
      return { success: true, message: data.message }
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la demande'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la réinitialisation')
      }

      const data = await response.json()
      return { success: true, message: data.message }
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la réinitialisation'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const getSessions = async (): Promise<{ success: boolean; sessions?: AuthSession[]; error?: string }> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la récupération')
      }

      const data = await response.json()
      return { success: true, sessions: data.sessions }
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la récupération'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logoutAllSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la déconnexion')
      }

      const data = await response.json()
      return { success: true, message: data.message }
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la déconnexion'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // AUTH LOGS
  // ============================================================================

  const getAuthLogs = async (
    limit: number = 50,
    offset: number = 0,
    status?: string
  ): Promise<{ success: boolean; logs?: AuthLog[]; total?: number; error?: string }> => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })
      if (status) {
        params.append('status', status)
      }

      const response = await fetch(`/api/auth/logs?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la récupération')
      }

      const data = await response.json()
      return { success: true, logs: data.logs, total: data.total }
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la récupération'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    getSessions,
    logoutAllSessions,
    getAuthLogs,
  }
}
