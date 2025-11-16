
'use client'

import { SessionProvider } from 'next-auth/react'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes to keep it alive
      refetchInterval={5 * 60}
      // Refetch session when window is focused
      refetchOnWindowFocus={true}
      // Refetch session on page mount
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}
