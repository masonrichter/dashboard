// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER = process.env.BASIC_AUTH_USER || ''
const PASS = process.env.BASIC_AUTH_PASS || ''

function isFromCopperCRM(req: NextRequest): boolean {
  const referer = req.headers.get('referer') || ''
  const origin = req.headers.get('origin') || ''
  
  // Check if request is coming from Copper CRM
  // Copper CRM typically embeds apps in iframes, so we check referer/origin
  const copperDomains = ['copper.com', 'coppercrm.com', 'app.copper.com']
  
  const isCopperReferer = copperDomains.some(domain => 
    referer.toLowerCase().includes(domain)
  )
  
  const isCopperOrigin = copperDomains.some(domain => 
    origin.toLowerCase().includes(domain)
  )
  
  // Also check for query parameter that might be passed by Copper
  const copperParam = req.nextUrl.searchParams.get('copper') || req.nextUrl.searchParams.get('source')
  const isCopperParam = copperParam === 'true' || copperParam === 'copper'
  
  return isCopperReferer || isCopperOrigin || isCopperParam
}

function isAuthenticated(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false
  }
  
  try {
    const base64Credentials = authHeader.split(' ')[1]
    // Use atob for Edge Runtime compatibility (Buffer not available in Edge)
    const credentials = atob(base64Credentials)
    const [username, password] = credentials.split(':')
    
    return username === USER && password === PASS
  } catch (error) {
    return false
  }
}

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

  // Check if request is from Copper CRM - if so, bypass authentication
  if (isFromCopperCRM(req)) {
    return NextResponse.next()
  }

  // If not from Copper CRM, require basic authentication
  // Only enforce if credentials are configured
  if (USER && PASS) {
    if (!isAuthenticated(req)) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  return NextResponse.next()
}

// Protect everything by default. Add exceptions here (e.g., health check).
export const config = {
  matcher: ['/((?!api/).*)'], // exclude all API routes from basic auth
}