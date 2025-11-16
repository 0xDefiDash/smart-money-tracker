
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username,
            password: { not: null }
          }
        })

        if (!user || !user.password || !user.username) {
          return null
        }

        // Compare hashed password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password)
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          email: user.email || '',
          profileImage: user.profileImage || undefined,
          xHandle: user.xHandle || undefined,
          gameMoney: user.gameMoney,
          gameLevel: user.gameLevel,
          gameExp: user.gameExp,
          isAdmin: user.isAdmin
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.defidashtracker.com' : undefined
      }
    }
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.username = user.username
        token.profileImage = user.profileImage
        token.xHandle = user.xHandle
        token.gameMoney = user.gameMoney
        token.gameLevel = user.gameLevel
        token.gameExp = user.gameExp
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub
        session.user.username = token.username as string
        session.user.profileImage = token.profileImage as string
        session.user.xHandle = token.xHandle as string
        session.user.gameMoney = token.gameMoney as number
        session.user.gameLevel = token.gameLevel as number
        session.user.gameExp = token.gameExp as number
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
    newUser: '/'
  }
}
