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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import PasswordInput from "./password-input"
import { signUpSchema, type SignUpInput } from "../_lib/auth-schemas"
import { AUTH_MESSAGES } from "../_constants/auth"
import { createUser } from "../_actions/create-user"

interface SignUpFormProps {
  onSuccess?: () => void
  onGoToSignIn?: () => void
}

const SignUpForm = ({ onSuccess, onGoToSignIn }: SignUpFormProps) => {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const { isSubmitting } = form.formState

  const handleSubmit = async (values: SignUpInput) => {
    setFormError(null)

    try {
      const result = await createUser(values)

      if ("error" in result) {
        if (
          result.error === AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED ||
          result.error === AUTH_MESSAGES.EMAIL_LINKED_TO_GOOGLE
        ) {
          form.setError("email", { message: result.error })
        } else {
          setFormError(result.error)
        }
        return
      }

      const login = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      }).catch(() => null)

      if (!login || login.error) {
        toast.error("Conta criada, mas não foi possível entrar. Faça login.")
        onGoToSignIn?.()
        return
      }

      toast.success("Conta criada com sucesso!")
      onSuccess?.()
      router.refresh()
    } catch {
      setFormError(AUTH_MESSAGES.SIGN_UP_FAILED)
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    className="h-10 text-base md:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    autoComplete="new-password"
                    placeholder="Crie uma senha"
                    className="h-10 text-base md:text-sm"
                    onChange={(event) => {
                      field.onChange(event)
                      if (form.formState.touchedFields.confirmPassword) {
                        void form.trigger("confirmPassword")
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  De 8 a 72 caracteres, com pelo menos uma letra e um número.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
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
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  )
}

export default SignUpForm
