// OAuth utility functions for secure Google authentication

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`

export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export interface OAuthError {
  error: string
  error_description?: string
}

// Generate OAuth URL for Google authentication
export function generateGoogleOAuthUrl(scopes: string[] = ['https://www.googleapis.com/auth/gmail.readonly']): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: generateRandomState()
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const errorData: OAuthError = await response.json()
      throw new Error(errorData.error_description || errorData.error || 'OAuth exchange failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorData: OAuthError = await response.json()
      throw new Error(errorData.error_description || errorData.error || 'Token refresh failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw error
  }
}

// Secure token storage utilities
export class SecureTokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'google_access_token'
  private static readonly REFRESH_TOKEN_KEY = 'google_refresh_token'
  private static readonly EXPIRES_AT_KEY = 'google_expires_at'

  // Store tokens securely
  static storeTokens(tokens: OAuthTokens): void {
    try {
      const expiresAt = Date.now() + (tokens.expires_in * 1000)
      
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token)
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString())
      
      if (tokens.refresh_token) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token)
      }
    } catch (error) {
      console.error('Error storing tokens:', error)
      throw error
    }
  }

  // Get access token
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting refresh token:', error)
      return null
    }
  }

  // Check if token is expired
  static isTokenExpired(): boolean {
    try {
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY)
      if (!expiresAt) return true
      
      return Date.now() > parseInt(expiresAt)
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true
    }
  }

  // Clear all tokens
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      localStorage.removeItem(this.EXPIRES_AT_KEY)
    } catch (error) {
      console.error('Error clearing tokens:', error)
    }
  }

  // Get valid access token (refresh if needed)
  static async getValidAccessToken(): Promise<string | null> {
    try {
      // Check if token is expired
      if (this.isTokenExpired()) {
        const refreshToken = this.getRefreshToken()
        if (!refreshToken) {
          this.clearTokens()
          return null
        }

        // Try to refresh the token
        try {
          const newTokens = await refreshAccessToken(refreshToken)
          this.storeTokens(newTokens)
          return newTokens.access_token
        } catch (error) {
          console.error('Error refreshing token:', error)
          this.clearTokens()
          return null
        }
      }

      return this.getAccessToken()
    } catch (error) {
      console.error('Error getting valid access token:', error)
      return null
    }
  }
}

// Generate random state for OAuth security
function generateRandomState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Parse OAuth callback URL parameters
export function parseOAuthCallback(url: string): { code?: string; error?: string; state?: string } {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    
    return {
      code: params.get('code') || undefined,
      error: params.get('error') || undefined,
      state: params.get('state') || undefined
    }
  } catch (error) {
    console.error('Error parsing OAuth callback:', error)
    return {}
  }
}

// Validate OAuth state (for security)
export function validateOAuthState(state: string, storedState: string): boolean {
  return state === storedState
}

// OAuth scopes for different Google services
export const OAUTH_SCOPES = {
  GMAIL_READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
  GMAIL_MODIFY: 'https://www.googleapis.com/auth/gmail.modify',
  GMAIL_SEND: 'https://www.googleapis.com/auth/gmail.send',
  GMAIL_FULL: 'https://www.googleapis.com/auth/gmail',
  CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
  CALENDAR_EVENTS: 'https://www.googleapis.com/auth/calendar.events',
  SHEETS_READONLY: 'https://www.googleapis.com/auth/spreadsheets.readonly',
  SHEETS: 'https://www.googleapis.com/auth/spreadsheets'
} as const 