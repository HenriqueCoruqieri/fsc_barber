# Agendamento

| ID | Regra | Fonte |
|---|---|---|
| RN-AG-01 | Só usuário autenticado reserva. Sem sessão, "Reservar" abre o diálogo de login. | `app/_components/service-item.tsx:124-129` |
| RN-AG-02 | No servidor, `createBooking` lança "Usuário não autenticado" quando não há sessão. | `app/_actions/create-booking.ts:15-18` |
| RN-AG-03 | A reserva grava só `userId` (da sessão), `serviceId` e `date`. Não há barbeiro, duração, status nem preço gravados. | `app/_actions/create-booking.ts:19-21`; modelo `Booking` em `prisma/schema.prisma:85-94` |
| RN-AG-04 | "Confirmar" fica desabilitado sem dia e horário selecionados. | `app/_components/service-item.tsx:270` |
| RN-AG-05 | Sucesso: toast "Reserva concluída!" com ação "Ver agendamentos" que leva a `/bookings`. Erro: toast "Erro ao criar reserva". | `app/_components/service-item.tsx:146-165` |
| RN-AG-06 | O servidor **não** valida conflito de horário, data passada, horário fora da grade nem a entrada com zod; conflito, data passada e horário fora da grade são evitados só pela UI (RN-DI-01..04); não há validação zod em nenhum lado. | `app/_actions/create-booking.ts:14-22` (ver GitHub Issues) |
| RN-AG-07 | O status é derivado da data, sem campo no banco: "Confirmado" se `isFuture(date)`, senão "Concluído". | `app/_components/booking-item.tsx:55` |
| RN-AG-08 | `/bookings` exige login: sem sessão, redireciona para `/`. | `app/bookings/page.tsx:10-13` |
| RN-AG-09 | "Confirmados" = reservas do próprio usuário com `date >= agora`, em ordem crescente. | `app/_data/get-confirmed-bookings.ts:15-21,29-31` |
| RN-AG-10 | "Finalizados" = reservas do próprio usuário com `date < agora`, em ordem crescente. | `app/_data/get-concluded-bookings.ts:12-18,26-28` |
| RN-AG-11 | A home também lista as reservas confirmadas do usuário (vazio sem sessão). | `app/page.tsx:26`; `app/_data/get-confirmed-bookings.ts:11-13` |

## Não definido
- Limite de reservas por usuário.
- Antecedência máxima para reservar.
- Reagendamento.
- Horário de funcionamento por barbearia (a grade é fixa, ver [`availability.md`](availability.md)).
- Duração do serviço.
- Notificações ao usuário ou à barbearia.
