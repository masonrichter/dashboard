'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  readClientData, 
  updateClientData, 
  addClientToSheet, 
  getAllClientsFromSheet,
  initializeClientSheet,
  ClientData 
} from '@/lib/google'

interface UseGoogleSheetsOptions {
  spreadsheetId?: string
  accessToken?: string
}

export function useGoogleSheets(options: UseGoogleSheetsOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const { spreadsheetId, accessToken } = options

  // Check if we have the required credentials
  useEffect(() => {
    const hasCredentials = !!(spreadsheetId && accessToken)
    setIsAuthenticated(hasCredentials)
  }, [spreadsheetId, accessToken])

  // Read client data from Google Sheets
  const readClient = useCallback(async (clientId: string): Promise<ClientData | null> => {
    if (!isAuthenticated || !spreadsheetId || !accessToken) {
      setError('Google Sheets not authenticated')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const clientData = await readClientData(accessToken, spreadsheetId, clientId)
      return clientData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read client data'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, spreadsheetId, accessToken])

  // Update client data in Google Sheets
  const updateClient = useCallback(async (clientData: Partial<ClientData>): Promise<boolean> => {
    if (!isAuthenticated || !spreadsheetId || !accessToken) {
      setError('Google Sheets not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await updateClientData(accessToken, spreadsheetId, clientData)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update client data'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, spreadsheetId, accessToken])

  // Add new client to Google Sheets
  const addClient = useCallback(async (clientData: Omit<ClientData, 'lastUpdated'>): Promise<boolean> => {
    if (!isAuthenticated || !spreadsheetId || !accessToken) {
      setError('Google Sheets not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await addClientToSheet(accessToken, spreadsheetId, clientData)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add client'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, spreadsheetId, accessToken])

  // Get all clients from Google Sheets
  const getAllClients = useCallback(async (): Promise<ClientData[]> => {
    if (!isAuthenticated || !spreadsheetId || !accessToken) {
      setError('Google Sheets not authenticated')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const clients = await getAllClientsFromSheet(accessToken, spreadsheetId)
      return clients
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get clients'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, spreadsheetId, accessToken])

  // Initialize the client sheet with headers
  const initializeSheet = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !spreadsheetId || !accessToken) {
      setError('Google Sheets not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await initializeClientSheet(accessToken, spreadsheetId)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize sheet'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, spreadsheetId, accessToken])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    isAuthenticated,
    readClient,
    updateClient,
    addClient,
    getAllClients,
    initializeSheet,
    clearError
  }
} 