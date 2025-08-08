'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getGmailMessagesWithDetails,
  markMessageAsRead,
  markMessageAsUnread,
  deleteGmailMessage,
  EmailSummary 
} from '@/lib/google'

interface UseGmailOptions {
  accessToken?: string
  maxResults?: number
  query?: string
}

export function useGmail(options: UseGmailOptions = {}) {
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const { accessToken, maxResults = 10, query = 'in:inbox' } = options

  // Check if we have the required credentials
  useEffect(() => {
    const hasCredentials = !!accessToken
    setIsAuthenticated(hasCredentials)
  }, [accessToken])

  // Fetch emails from Gmail
  const fetchEmails = useCallback(async (): Promise<EmailSummary[]> => {
    if (!isAuthenticated || !accessToken) {
      setError('Gmail not authenticated')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const emailList = await getGmailMessagesWithDetails(accessToken, maxResults, query)
      setEmails(emailList)
      return emailList
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, accessToken, maxResults, query])

  // Mark email as read
  const markAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    if (!isAuthenticated || !accessToken) {
      setError('Gmail not authenticated')
      return false
    }

    try {
      await markMessageAsRead(accessToken, messageId)
      
      // Update local state
      setEmails(prev => prev.map(email => 
        email.id === messageId ? { ...email, isRead: true } : email
      ))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read'
      setError(errorMessage)
      return false
    }
  }, [isAuthenticated, accessToken])

  // Mark email as unread
  const markAsUnread = useCallback(async (messageId: string): Promise<boolean> => {
    if (!isAuthenticated || !accessToken) {
      setError('Gmail not authenticated')
      return false
    }

    try {
      await markMessageAsUnread(accessToken, messageId)
      
      // Update local state
      setEmails(prev => prev.map(email => 
        email.id === messageId ? { ...email, isRead: false } : email
      ))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as unread'
      setError(errorMessage)
      return false
    }
  }, [isAuthenticated, accessToken])

  // Delete email
  const deleteEmail = useCallback(async (messageId: string): Promise<boolean> => {
    if (!isAuthenticated || !accessToken) {
      setError('Gmail not authenticated')
      return false
    }

    try {
      await deleteGmailMessage(accessToken, messageId)
      
      // Remove from local state
      setEmails(prev => prev.filter(email => email.id !== messageId))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete email'
      setError(errorMessage)
      return false
    }
  }, [isAuthenticated, accessToken])

  // Refresh emails
  const refreshEmails = useCallback(async (): Promise<void> => {
    await fetchEmails()
  }, [fetchEmails])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-fetch emails when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails()
    }
  }, [isAuthenticated, fetchEmails])

  return {
    emails,
    loading,
    error,
    isAuthenticated,
    fetchEmails,
    markAsRead,
    markAsUnread,
    deleteEmail,
    refreshEmails,
    clearError
  }
} 