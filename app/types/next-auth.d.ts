
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      profileImage?: string
      xHandle?: string
      gameMoney: number
      gameLevel: number
      gameExp: number
      isAdmin: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    username: string
    profileImage?: string
    xHandle?: string
    gameMoney: number
    gameLevel: number
    gameExp: number
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
    profileImage?: string
    xHandle?: string
    gameMoney: number
    gameLevel: number
    gameExp: number
    isAdmin: boolean
  }
}
