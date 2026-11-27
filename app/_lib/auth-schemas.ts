import { z } from "zod"
import { PASSWORD_MAX_LENGTH_MESSAGE } from "../_constants/auth"

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Informe um e-mail válido"))

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(72, PASSWORD_MAX_LENGTH_MESSAGE)
  .regex(/[A-Za-z]/, "A senha deve ter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve ter pelo menos um número")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    PASSWORD_MAX_LENGTH_MESSAGE,
  )

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha").max(256),
})

export type SignInInput = z.input<typeof signInSchema>
