import { createBrowserClient } from '@supabase/ssr'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate Supabase URL
function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Client-side Supabase client (for use in client components)
export function createClientSupabase() {
  // Only create client if credentials are valid
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
    // Return a mock client that will fail auth operations gracefully
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.' } }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null })
      }
    } as any
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

