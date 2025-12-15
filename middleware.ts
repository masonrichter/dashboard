// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabase } from '@/lib/supabase-middleware'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect old clients route to new clients-overview to avoid UI flash
  if (pathname === '/clients') {
    const url = req.nextUrl.clone()
    url.pathname = '/clients-overview'
    return NextResponse.redirect(url)
  }

  // Allow login page, password reset, and API routes
  if (
    pathname === '/login' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // allow framework internals & static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return NextResponse.next()
  }

  // Check Supabase authentication
  const { supabase, response } = createMiddlewareSupabase(req)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login with current path as redirect parameter
  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    // Preserve the original path so we can redirect back after login
    if (pathname !== '/login' && pathname !== '/') {
      url.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(url)
  }

  // User is authenticated, allow access
  return response
}

// Protect everything by default. Add exceptions here (e.g., health check).
export const config = {
  matcher: ['/((?!api/).*)'], // exclude all API routes from auth check
}