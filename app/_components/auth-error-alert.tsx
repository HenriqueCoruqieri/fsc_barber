import { TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "../_constants/auth"

interface AuthErrorAlertProps {
  code?: string
}

const AUTH_ERROR_ALERTS: Record<string, { title: string; message: string }> = {
  [AUTH_ERROR_CODES.GOOGLE_CONFLICT]: {
    title: "Não foi possível entrar com o Google",
    message: AUTH_MESSAGES.GOOGLE_CONFLICT,
  },
}

const AuthErrorAlert = ({ code }: AuthErrorAlertProps) => {
  const alert =
    code && Object.hasOwn(AUTH_ERROR_ALERTS, code)
      ? AUTH_ERROR_ALERTS[code]
      : undefined

  if (!alert) return null

  return (
    <Alert className="border-destructive/50 [&>svg]:text-destructive mb-4">
      <TriangleAlertIcon />
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription>{alert.message}</AlertDescription>
    </Alert>
  )
}

export default AuthErrorAlert
