import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const secret = process.env.NEXTAUTH_SECRET!

// Public API routes
const publicApi = [
  '/api/otpless',
  '/api/lesion/verify',
  '/api/questionnaire/verify',
  '/api/auth', 
]

 
const publicPages = [
  '/auth/login',
  '/auth/error',
  '/api/auth', // NextAuth endpoints
]

// Feedback path pattern
const feedbackPath = /^\/api\/(?:lesion|questionnaire)\/[^\/]+\/feedback$/

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
 
  if (pathname.startsWith('/api')) {
 
    if (
      publicApi.some(p => pathname.startsWith(p)) ||
      feedbackPath.test(pathname) ||
      pathname.startsWith('/api/auth') 
    ) {
      console.log('Public API route, allowing access')
      return NextResponse.next()
    }

 
    const hasSecureToken = req.cookies.has('__Secure-next-auth.session-token')
    let token = await getToken({ 
      req, 
      secret,
      secureCookie: hasSecureToken,
      raw: true  
    })
    if (!token && !hasSecureToken) {
      token = await getToken({ req, secret, secureCookie: false, raw: true })
    }
    if (!token) {
      token = await getToken({ req, secret, raw: true })
    }
    if (!token) {
      console.log('API: Unauthorized access attempt')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 })
    }
    
    return NextResponse.next()
  }

  try {
 
    const hasSecureToken = req.cookies.has('__Secure-next-auth.session-token')
    let session = await getToken({ 
      req, 
      secret,
      secureCookie: hasSecureToken
    })

    if (!session && !hasSecureToken) {
      session = await getToken({ 
        req, 
        secret,
        secureCookie: false
      })
    }
    if (!session) {
      session = await getToken({ 
        req, 
        secret 
      })
    }

    if (session) {
      if (pathname === '/auth/login') {
        console.log('Redirecting logged-in user from login page to dashboard')
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.url))
      }
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.url))
      }
      if (pathname === '/super-admin') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.url))
      }
      return NextResponse.next()
    }
    else {
      if (
        publicPages.some(p => pathname.startsWith(p)) ||
        pathname === '/'
      ) {
        return NextResponse.next()
      }
      if (pathname.startsWith('/super-admin')) {
        console.log(`Unauthorized access to protected page: ${pathname}, redirecting to login`)
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      
      return NextResponse.next()
    }
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }

}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}