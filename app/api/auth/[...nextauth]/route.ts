import { db } from "@/app/_lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { User } from "@prisma/client"

const handler = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user = {
        ...session.user,
        id: user.id,
      } as User
      return session
    },
  },
})

export { handler as GET, handler as POST }
