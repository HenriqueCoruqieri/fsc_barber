# Disponibilidade de horários

| ID | Regra | Fonte |
|---|---|---|
| RN-DI-01 | Grade fixa de 08:00 a 18:00, a cada 30 minutos (21 horários), igual para todas as barbearias e serviços. | `app/_components/service-item.tsx:46-68` |
| RN-DI-02 | No calendário, dias anteriores a hoje ficam desabilitados. | `app/_components/ui/calendar.tsx:49` (`disabled={{ before: new Date() }}`) |
| RN-DI-03 | No dia de hoje, horários já passados não aparecem. A comparação usa o relógio do cliente. | `app/_components/service-item.tsx:75-78` |
| RN-DI-04 | Horário ocupado = existe reserva do **mesmo serviço** no mesmo dia com a mesma hora e minuto. O horário ocupado não aparece na lista. | `app/_actions/get-bookings.ts:32-41`; `app/_components/service-item.tsx:80-87` |
| RN-DI-05 | A ocupação vale para **todos os usuários**: `getBookings` não filtra por usuário. | `app/_actions/get-bookings.ts:32-39` |
| RN-DI-06 | A ocupação é **por serviço, não por barbearia**: dois serviços diferentes da mesma barbearia podem ser reservados no mesmo horário. Se isso é intencional: **Não definido**. | `app/_actions/get-bookings.ts:38` (`serviceId` no `where`) |
| RN-DI-07 | Só usuário logado vê horários ocupados: `getBookings` retorna `[]` sem sessão (e o sheet de reserva só abre logado, ver RN-AG-01). | `app/_actions/get-bookings.ts:20-24` |
| RN-DI-08 | `getBookings` devolve apenas `date` (nenhum dado de outros usuários) e valida a entrada com zod (`serviceId` uuid e `date` data), lançando "Dados inválidos" se inválida. | `app/_actions/get-bookings.ts:9-12,26-29,40` |
| RN-DI-09 | Dia sem horários livres mostra "Não há horários disponíveis para este dia". | `app/_components/service-item.tsx:247-251` |
| RN-DI-10 | Os horários são buscados quando o dia ou o serviço mudam. | `app/_components/service-item.tsx:104-114` (ver [#10](https://github.com/HenriqueCoruqieri/fsc_barber/issues/10)) |

## Observações
- **Primeiro dia selecionável:** `fromDate={addDays(new Date(), 1)}` em `app/_components/service-item.tsx:228` é uma prop marcada como removida no react-day-picker v9 (`node_modules/react-day-picker/dist/esm/types/props.d.ts`, `@deprecated This prop has been removed`). Provavelmente a intenção (começar a partir de amanhã) não tem efeito: só o `disabled` de RN-DI-02 bloqueia, então o dia de hoje fica selecionável. Ver [#8](https://github.com/HenriqueCoruqieri/fsc_barber/issues/8).
- **Fuso:** os limites do dia (`startOfDay`/`endOfDay`) são calculados no fuso do servidor, e as horas são comparadas no fuso do cliente (`app/_actions/get-bookings.ts:34-37`; `service-item.tsx:80-83`). Ver [#2](https://github.com/HenriqueCoruqieri/fsc_barber/issues/2).

## Não definido
- Horário de funcionamento diferente por barbearia, dia da semana ou feriado.
- Se a ocupação deveria ser por barbearia (ver RN-DI-06).
- Intervalo mínimo entre reservas ou duração do serviço bloqueando horários seguintes.
