"use server"

import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { db } from "../_lib/prisma"
import { signUpSchema } from "../_lib/auth-schemas"
import { AUTH_MESSAGES } from "../_constants/auth"

type CreateUserResult = { error: string } | { success: true }

export const createUser = async (input: unknown): Promise<CreateUserResult> => {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? AUTH_MESSAGES.SIGN_UP_FAILED,
    }
  }

  const { name, email, password } = parsed.data

  try {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true, accounts: { select: { provider: true } } },
    })

    if (existing) {
      const hasGoogle = existing.accounts.some(
        (account) => account.provider === "google",
      )
      return {
        error: hasGoogle
          ? AUTH_MESSAGES.EMAIL_LINKED_TO_GOOGLE
          : AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED,
      }
    }

    const hash = await bcrypt.hash(password, 10)
    await db.user.create({
      data: { name, email, password: hash },
      select: { id: true },
    })

    return { success: true }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED }
    }
    return { error: AUTH_MESSAGES.SIGN_UP_FAILED }
  }
}
