import { AuthOptions } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { PrismaClient, User } from "@prisma/client"
import { signInSchema } from "./auth-schemas"
import { AUTH_ERROR_CODES } from "../_constants/auth"

const TIMING_DUMMY_HASH =
  "$2b$10$su6mDOgwWD7mVqjw8ITj7uBLO6gkEIISVGw0SU56GHe81dZWMp3Pa"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db as unknown as PrismaClient) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email },
          omit: { password: false },
          include: { accounts: { select: { provider: true } } },
        })
        if (!user) {
          await compare(password, TIMING_DUMMY_HASH)
          return null
        }

        if (!user.password) {
          if (user.accounts.some((account) => account.provider === "google")) {
            throw new Error(AUTH_ERROR_CODES.GOOGLE_ACCOUNT)
          }
          await compare(password, TIMING_DUMMY_HASH)
          return null
        }

        const passwordMatches = await compare(password, user.password)
        if (!passwordMatches) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google") return true

      const email = user.email?.trim().toLowerCase()
      if (!email) return true

      const existing = await db.user.findUnique({
        where: { email },
        select: {
          password: true,
          accounts: { select: { provider: true } },
        },
      })

      if (
        existing?.password &&
        !existing.accounts.some((item) => item.provider === "google")
      ) {
        return `/?authError=${AUTH_ERROR_CODES.GOOGLE_CONFLICT}`
      }

      return true
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
      } as User
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
