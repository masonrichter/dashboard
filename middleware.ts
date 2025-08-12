// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER = process.env.BASIC_AUTH_USER || ''
const PASS = process.env.BASIC_AUTH_PASS || ''

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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

  // read auth header
  const auth = req.headers.get('authorization') || ''
  const [scheme, encoded] = auth.split(' ')

  if (scheme === 'Basic' && encoded) {
    // Edge runtime: use atob instead of Buffer
    const [user, pass] = atob(encoded).split(':')
    if (user === USER && pass === PASS) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
  })
}

// Protect everything by default. Add exceptions here (e.g., health check).
export const config = {
  matcher: ['/((?!api/health).*)'], // remove or edit if you want to protect API too
}