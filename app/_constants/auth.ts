export const AUTH_ERROR_CODES = {
  GOOGLE_ACCOUNT: "GOOGLE_ACCOUNT",
  GOOGLE_CONFLICT: "google-conflict",
} as const

export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: "E-mail ou senha inválidos",
  GOOGLE_ACCOUNT: "Esta conta usa o login com Google. Entre com o Google.",
  EMAIL_LINKED_TO_GOOGLE:
    "Este e-mail já está vinculado a uma conta Google. Entre com o Google.",
  EMAIL_ALREADY_REGISTERED: "Este e-mail já está cadastrado.",
  GOOGLE_CONFLICT:
    "Este e-mail já tem cadastro com senha. Entre pela aba Entrar com seu e-mail e senha.",
  SIGN_UP_FAILED: "Não foi possível criar sua conta. Tente novamente.",
} as const

export const PASSWORD_MAX_LENGTH_MESSAGE =
  "A senha deve ter no máximo 72 caracteres"
