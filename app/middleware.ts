// Authentication middleware disabled - site is now publicly accessible
// No login required to access any pages

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all requests through without authentication check
  return NextResponse.next()
}

// Apply to all routes (but does nothing - just passes through)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
