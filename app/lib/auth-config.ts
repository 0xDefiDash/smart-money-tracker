
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug to prevent verbose logging
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.error('[Auth] Missing credentials')
            return null
          }

          const user = await prisma.user.findFirst({
            where: {
              username: credentials.username,
              password: { not: null }
            }
          })

          if (!user || !user.password || !user.username) {
            console.error('[Auth] User not found or invalid data')
            return null
          }

          // Compare hashed password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            console.error('[Auth] Invalid password')
            return null
          }

          console.log('[Auth] Login successful for user:', user.username)
          return {
            id: user.id,
            username: user.username,
            name: user.name || user.username,
            email: user.email || '',
            profileImage: user.profileImage || undefined,
            xHandle: user.xHandle || undefined,
            gameMoney: user.gameMoney || 0,
            gameLevel: user.gameLevel || 1,
            gameExp: user.gameExp || 0,
            isAdmin: user.isAdmin || false
          }
        } catch (error) {
          console.error('[Auth] Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  callbacks: {
    async jwt({ token, user }: any) {
      try {
        if (user) {
          token.username = user.username
          token.profileImage = user.profileImage
          token.xHandle = user.xHandle
          token.gameMoney = user.gameMoney || 0
          token.gameLevel = user.gameLevel || 1
          token.gameExp = user.gameExp || 0
          token.isAdmin = user.isAdmin || false
        }
        return token
      } catch (error) {
        console.error('[Auth] JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }: any) {
      try {
        if (token && session?.user) {
          session.user.id = token.sub
          session.user.username = token.username || ''
          session.user.profileImage = token.profileImage || ''
          session.user.xHandle = token.xHandle || ''
          session.user.gameMoney = token.gameMoney || 0
          session.user.gameLevel = token.gameLevel || 1
          session.user.gameExp = token.gameExp || 0
          session.user.isAdmin = token.isAdmin || false
        }
        return session
      } catch (error) {
        console.error('[Auth] Session callback error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
    newUser: '/'
  }
}
