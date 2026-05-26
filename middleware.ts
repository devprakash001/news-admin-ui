import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminTokenEdge } from '@/lib/auth-edge'

const PUBLIC = ['/login', '/api/auth/login', '/api/auth/logout']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('adminToken')?.value
  const payload = token ? await verifyAdminTokenEdge(token) : null

  if (!payload?.sub) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const login = new URL('/login', req.url)
    login.searchParams.set('from', pathname)
    return NextResponse.redirect(login)
  }

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
