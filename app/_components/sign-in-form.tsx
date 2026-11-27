"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CircleAlertIcon, Loader2Icon } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { Button } from "./ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import PasswordInput from "./password-input"
import { signInSchema, type SignInInput } from "../_lib/auth-schemas"
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "../_constants/auth"

interface SignInFormProps {
  onSuccess?: () => void
}

const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const { isSubmitting } = form.formState

  const handleSubmit = async (values: SignInInput) => {
    setFormError(null)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (!result || result.error) {
        setFormError(
          result?.error === AUTH_ERROR_CODES.GOOGLE_ACCOUNT
            ? AUTH_MESSAGES.GOOGLE_ACCOUNT
            : AUTH_MESSAGES.INVALID_CREDENTIALS,
        )
        setTimeout(() => form.setFocus("password"), 0)
        return
      }

      toast.success("Login realizado com sucesso!")
      onSuccess?.()
      router.refresh()
    } catch {
      setFormError(AUTH_MESSAGES.INVALID_CREDENTIALS)
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="seu@email.com"
                    className="h-10 text-base md:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    className="h-10 text-base md:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" aria-hidden />}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  )
}

export default SignInForm
