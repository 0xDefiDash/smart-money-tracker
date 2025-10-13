

'use client'

import { useState } from 'react'
import { signIn, useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthTestPage() {
  const { data: session, status } = useSession() || {}
  const [username, setUsername] = useState('testuser2')
  const [password, setPassword] = useState('testpass123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupData, setSignupData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  })
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else if (result?.ok) {
        setError('')
        router.push('/block-wars')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError('')
    setSignupSuccess('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
      })

      const data = await response.json()

      if (response.ok) {
        setSignupSuccess('Account created successfully! You can now log in.')
        setSignupData({ username: '', password: '', email: '', name: '' })
      } else {
        setSignupError(data.error || 'An error occurred during signup')
      }
    } catch (error) {
      setSignupError('An error occurred. Please try again.')
    } finally {
      setSignupLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Authentication Success!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-sm">
                  ✅ Successfully logged in as: <strong>{session.user?.username || session.user?.name}</strong>
                </p>
                <p className="text-green-400 text-sm">
                  Email: {session.user?.email || 'Not provided'}
                </p>
                <p className="text-green-400 text-sm">
                  User ID: {session.user?.id}
                </p>
                <p className="text-green-400 text-sm">
                  Game Money: ${session.user?.gameMoney || 0}
                </p>
                <p className="text-green-400 text-sm">
                  Game Level: {session.user?.gameLevel || 1}
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/block-wars')}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2"
                >
                  Enter Dash Wars
                </Button>
                
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Test Login
            </CardTitle>
            <p className="text-slate-400 text-sm">Test existing user authentication</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 p-3 rounded bg-slate-700/30 text-xs text-slate-400">
              Pre-filled with test user credentials (testuser2 / testpass123)
            </div>
          </CardContent>
        </Card>

        {/* Signup Form */}
        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Test Signup
            </CardTitle>
            <p className="text-slate-400 text-sm">Create a new test account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {signupError && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertDescription className="text-red-400">{signupError}</AlertDescription>
                </Alert>
              )}
              
              {signupSuccess && (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <AlertDescription className="text-green-400">{signupSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-username" className="text-slate-300">Username *</Label>
                <Input
                  id="signup-username"
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  placeholder="Choose a unique username"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-300">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  placeholder="At least 6 characters"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  placeholder="your@email.com (optional)"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-300">Display Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  placeholder="Your display name (optional)"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold py-2"
                disabled={signupLoading}
              >
                {signupLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
