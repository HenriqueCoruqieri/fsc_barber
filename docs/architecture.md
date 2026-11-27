# Arquitetura

Visão curta de como as peças se encaixam. Convenções de código ficam no [`rules.md`](../rules.md); comportamento de negócio em [`business-rules/`](business-rules/README.md).

## Modelo de dados
Fonte: `prisma/schema.prisma` (7 entidades).

- `User` 1-N `Booking`.
- `Barbershop` 1-N `BarbershopService`.
- `BarbershopService` 1-N `Booking`.
- `Account`, `Session` e `VerificationToken` são as tabelas do NextAuth; `Account` e `Session` pertencem a `User` com `onDelete: Cascade`.

Observações:
- Ids `cuid` nas tabelas do NextAuth e em `User`; `uuid` em `Barbershop`, `BarbershopService` e `Booking`.
- `BarbershopService.price` é `Decimal(10,2)` e é convertido para `number` antes de ir ao cliente (componentes cliente não recebem `Decimal`).
- `Account`, `Session` e `VerificationToken` são mapeadas para nomes minúsculos (`accounts`, `sessions`, `verification_tokens`); as de domínio e `User` não (`"Booking"` e `"User"` entre aspas no SQL).
- `User.password` (`String?`, hash bcrypt; nula em contas Google) é omitida em toda query pelo `db` (`omit` global em `app/_lib/prisma.ts:3-4`); só o `authorize` a lê.
- Colunas de credencial (`accounts.access_token`, `refresh_token`, `id_token`, `sessions.session_token`, `verification_tokens.token`, `"User".password`) nunca são consultadas: ver "Uso do MCP do Neon" na seção 3 do `rules.md`.

## Autenticação
- NextAuth v4 com providers Google e Credentials (e-mail e senha, hash bcryptjs), `PrismaAdapter` e **sessão JWT** (cookie `next-auth.session-token`; a tabela `sessions` não recebe mais linhas). Config em `app/_lib/auth.ts`. ADRs [0008](decisions/0008-credentials-login-with-bcryptjs.md) e [0009](decisions/0009-jwt-sessions.md).
- `secret` vem de `NEXTAUTH_SECRET`, obrigatória para o app e para o `qa:session`.
- O `authorize` valida com `signInSchema` (`app/_lib/auth-schemas.ts`; mensagens e códigos em `app/_constants/auth.ts`). Conta Google sem senha lança `GOOGLE_ACCOUNT`; os demais erros retornam `null`.
- O callback `signIn` bloqueia o login Google quando o e-mail já tem cadastro com senha (redireciona para `/?authError=google-conflict`). Não há vínculo de contas.
- O callback `session` preenche `user.id` com `token.sub`.
- Regras: [`business-rules/auth.md`](business-rules/auth.md).
- O servidor lê a sessão com `getServerSession(authOptions)`; o cliente com `useSession`.
- O `SignInDialog` (`app/_components/sign-in-dialog.tsx`) tem as abas "Entrar" (`SignInForm`, `signIn("credentials", { redirect: false })`) e "Cadastrar" (`SignUpForm`), com o botão Google nas duas; é aberto pelo `SidebarSheet` e pelo `ServiceItem`. O cadastro valida no cliente e chama a action `createUser`; em sucesso faz `signIn("credentials", { redirect: false })` com os mesmos dados (login automático), mostra o toast, fecha o dialog e dá `router.refresh()`. `/api/auth/signin` continua disponível.
- `createUser` (`app/_actions/create-user.ts`) é uma action pública (cria a conta, ainda não há sessão): revalida a entrada (`input: unknown`) com `signUpSchema`, bloqueia e-mail já existente (mensagem própria para conta Google), trata `P2002` como e-mail já cadastrado, grava a senha com bcrypt custo 10 e devolve `{ error } | { success: true }`, sem lançar erro nem devolver a senha.
- A home (`app/page.tsx`) lê `?authError=` e mostra o `AuthErrorAlert` no servidor (conflito Google × conta com senha).
- As sessões de teste são criadas por `npm run -s qa:session`: ver [`testing.md`](testing.md).

## Fluxo de reserva
`app/barbershops/[id]/page.tsx` (Server Component) → `ServiceItem` (cliente) → `getBookings` (server action de leitura chamada do cliente) → `createBooking` → `revalidatePath`. As regras estão em [`business-rules/booking.md`](business-rules/booking.md) e [`business-rules/availability.md`](business-rules/availability.md).

## Fluxo de cancelamento
`/bookings` (Server Component, dados de `app/_data/`) → `BookingItem` (cliente) → `deleteBooking`. Regras em [`business-rules/cancellation.md`](business-rules/cancellation.md).

## Camadas
- `app/_actions/`: server actions chamadas do cliente (escritas **e** leituras que o cliente precisa, como `getBookings`).
- `app/_data/`: leituras usadas por Server Components.
- `app/_components/`: UI de domínio; `app/_components/ui/` é o shadcn.
- `app/_lib/`: `auth` (`authOptions`), `auth-schemas` (schemas zod compartilhados, sem imports de servidor), `prisma` (`db`, com `omit` de `User.password`) e `utils` (`cn`). `app/_constants/auth.ts` guarda códigos e mensagens de autenticação.
