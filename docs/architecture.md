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
- Colunas de credencial (`accounts.access_token`, `refresh_token`, `id_token`, `sessions.session_token`, `verification_tokens.token`) nunca são consultadas: ver "Uso do MCP do Neon" na seção 3 do `rules.md`.

## Autenticação
- NextAuth v4, provider Google, `PrismaAdapter`: a sessão fica no banco (tabela `sessions`, cookie `next-auth.session-token`). Config em `app/_lib/auth.ts`.
- O callback `session` acrescenta `user.id` à sessão.
- O servidor lê a sessão com `getServerSession(authOptions)`; o cliente com `useSession`.
- O login é feito pelo `SignInDialog` (`signIn("google")`).
- As sessões de teste são criadas por `npm run -s qa:session`: ver [`testing.md`](testing.md).

## Fluxo de reserva
`app/barbershops/[id]/page.tsx` (Server Component) → `ServiceItem` (cliente) → `getBookings` (server action de leitura chamada do cliente) → `createBooking` → `revalidatePath`. As regras estão em [`business-rules/booking.md`](business-rules/booking.md) e [`business-rules/availability.md`](business-rules/availability.md).

## Fluxo de cancelamento
`/bookings` (Server Component, dados de `app/_data/`) → `BookingItem` (cliente) → `deleteBooking`. Regras em [`business-rules/cancellation.md`](business-rules/cancellation.md).

## Camadas
- `app/_actions/`: server actions chamadas do cliente (escritas **e** leituras que o cliente precisa, como `getBookings`).
- `app/_data/`: leituras usadas por Server Components.
- `app/_components/`: UI de domínio; `app/_components/ui/` é o shadcn.
- `app/_lib/`: `auth` (`authOptions`), `prisma` (`db`) e `utils` (`cn`).
