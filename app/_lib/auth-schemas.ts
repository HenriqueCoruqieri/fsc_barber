import { z } from "zod"
import { AUTH_MESSAGES, PASSWORD_MAX_LENGTH_MESSAGE } from "../_constants/auth"

const invalidData = { error: AUTH_MESSAGES.INVALID_DATA }

export const emailSchema = z
  .string(invalidData)
  .trim()
  .toLowerCase()
  .pipe(z.email("Informe um e-mail válido"))

export const passwordSchema = z
  .string(invalidData)
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(72, PASSWORD_MAX_LENGTH_MESSAGE)
  .regex(/[A-Za-z]/, "A senha deve ter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve ter pelo menos um número")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    PASSWORD_MAX_LENGTH_MESSAGE,
  )

export const signInSchema = z.object(
  {
    email: emailSchema,
    password: z
      .string(invalidData)
      .min(1, "Informe sua senha")
      .max(256, AUTH_MESSAGES.INVALID_CREDENTIALS),
  },
  invalidData,
)

export type SignInInput = z.input<typeof signInSchema>

export const signUpSchema = z
  .object(
    {
      name: z
        .string(invalidData)
        .trim()
        .min(2, "O nome deve ter pelo menos 2 caracteres")
        .max(50, "O nome deve ter no máximo 50 caracteres"),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string(invalidData).min(1, "Confirme sua senha"),
    },
    invalidData,
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
    when: ({ value }) => {
      if (typeof value !== "object" || value === null) return false
      const data = value as { password?: unknown; confirmPassword?: unknown }
      return (
        typeof data.password === "string" &&
        typeof data.confirmPassword === "string" &&
        data.confirmPassword.length > 0
      )
    },
  })

export type SignUpInput = z.input<typeof signUpSchema>
