
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const authOptions = {
  adapter: PrismaAdapter(prisma),
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
          gameCoins: user.gameCoins,
          gameLevel: user.gameLevel,
          gameExp: user.gameExp,
          isAdmin: user.isAdmin
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.username = user.username
        token.profileImage = user.profileImage
        token.gameCoins = user.gameCoins
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
        session.user.gameCoins = token.gameCoins as number
        session.user.gameLevel = token.gameLevel as number
        session.user.gameExp = token.gameExp as number
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
