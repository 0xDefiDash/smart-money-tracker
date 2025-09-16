
'use client'

import { useSession } from 'next-auth/react'
import { UserBoard } from '@/components/game/user-board'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSettingsPage() {
  const { data: session, status } = useSession() || {}

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <p>Loading session...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to test the settings feature.</p>
            <p className="mt-2">Please visit /auth/signin to log in first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-md mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-white">Settings Test Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              This page tests the UserBoard component and its settings functionality.
            </p>
            <p className="text-slate-300 mt-2">
              Session status: {status}
            </p>
            {session?.user && (
              <p className="text-slate-300 mt-2">
                User: {session.user.name || session.user.username}
              </p>
            )}
          </CardContent>
        </Card>

        {session?.user && (
          <UserBoard 
            gameMoney={session.user.gameMoney || 1000}
            gameLevel={session.user.gameLevel || 1}
            gameExp={session.user.gameExp || 0}
          />
        )}
      </div>
    </div>
  )
}
