import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      name: string
      role: string
      student_id?: string | null
      error?: string
      originalUserId?: string | null
      isSwitched?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username: string
    name: string
    role: string
    student_id?: string | null
    error?: string
    originalUserId?: string | null
    isSwitched?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: string
    student_id?: string | null
    expiresAt: number
    error?: string
    originalUserId?: string | null
    isSwitched?: boolean
  }
}