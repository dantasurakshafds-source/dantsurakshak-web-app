import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const secret = process.env.NEXTAUTH_SECRET!

// Public API routes
const publicApi = [
  '/api/otpless',
  '/api/lesion/verify',
  '/api/questionnaire/verify',
  '/api/auth',
  '/api/account-deletion/verify',
  '/api/account-deletion/request',
  '/api/privacy-policy/get',
  '/api/terms/get',
]

const publicPages = [
  '/auth/login',
  '/auth/error',
  '/api/auth',
  '/privacy-policy',
  '/terms-conditions',
  '/terms-and-conditions',
  '/term-and-conditions',
  '/delete-account',
  '/delete-user',
]

// Feedback path pattern
const feedbackPath = /^\/api\/(?:lesion|questionnaire)\/[^\/]+\/feedback$/

async function resolveToken(req: NextRequest, raw = false) {
  const tokenVal =
    req.cookies.get('next-auth.session-token')?.value?.trim() ||
    req.cookies.get('__Secure-next-auth.session-token')?.value?.trim()

  if (!tokenVal) {
    return null
  }

  try {
    let token = await getToken({ req, secret, secureCookie: false, raw } as Parameters<typeof getToken>[0])
    if (!token) {
      token = await getToken({ req, secret, secureCookie: true, raw } as Parameters<typeof getToken>[0])
    }
    return token
  } catch (err) {
    console.error('Error resolving token:', err)
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api')) {
    // Allow all public API routes
    if (
      publicApi.some(p => pathname.startsWith(p)) ||
      feedbackPath.test(pathname) ||
      pathname.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }

    // Protected API — require token
    const token = await resolveToken(req, true)
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
    const session = await resolveToken(req)

    if (session) {
      // Already logged in — redirect away from login / root / super-admin root to dashboard
      if (pathname === '/auth/login') {
        console.log('Redirecting logged-in user from login page to dashboard')
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.url))
      }
      if (pathname === '/' || pathname === '/dashboard' || pathname === '/super-admin') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.url))
      }
      return NextResponse.next()
    } else {
      // Not logged in
      // If user accesses root or /dashboard, redirect to /auth/login
      if (pathname === '/' || pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      if (publicPages.some(p => pathname.startsWith(p))) {
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
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}