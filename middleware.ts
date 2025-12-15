// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER = process.env.BASIC_AUTH_USER || ''
const PASS = process.env.BASIC_AUTH_PASS || ''

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect old clients route to new clients-overview to avoid UI flash
  if (pathname === '/clients') {
    const url = req.nextUrl.clone()
    url.pathname = '/clients-overview'
    return NextResponse.redirect(url)
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

  // Authentication disabled - allow all requests
  return NextResponse.next()
}

// Protect everything by default. Add exceptions here (e.g., health check).
export const config = {
  matcher: ['/((?!api/).*)'], // exclude all API routes from basic auth
}