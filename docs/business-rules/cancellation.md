# Cancelamento

| ID | Regra | Fonte |
|---|---|---|
| RN-CA-01 | Só reservas confirmadas (futuras) mostram o botão "Cancelar reserva". | `app/_components/booking-item.tsx:55,172` |
| RN-CA-02 | O cancelamento pede confirmação: "Confirmar cancelamento de reserva?" / "Após essa ação ser executada não poderá ser revertida". | `app/_components/booking-item.tsx:173-201` |
| RN-CA-03 | O servidor exige sessão: sem usuário, lança "Usuário não autenticado". | `app/_actions/delete-booking.ts:12-16` |
| RN-CA-04 | O id da reserva é validado como uuid; inválido lança "Reserva inválida". | `app/_actions/delete-booking.ts:9,18-21` |
| RN-CA-05 | A exclusão é filtrada por `id` **e** `userId`: só o dono cancela. Reserva de outro usuário ou inexistente lança "Reserva não encontrada". | `app/_actions/delete-booking.ts:23-31` |
| RN-CA-06 | Cancelar é exclusão física (`deleteMany`): não há histórico nem status "cancelada". | `app/_actions/delete-booking.ts:23` |
| RN-CA-07 | Sucesso: fecha o sheet, mostra "Reserva cancelada com sucesso!" e o servidor chama `revalidatePath("/bookings")`. | `app/_components/booking-item.tsx:56-60`; `app/_actions/delete-booking.ts:33` |
| RN-CA-08 | Erro: toast "Erro ao cancelar reserva. Tente novamente", sem fechar o sheet nem atualizar a lista (ver [#5](https://github.com/HenriqueCoruqieri/fsc_barber/issues/5)). | `app/_components/booking-item.tsx:61-64` |

## Observações
- O servidor não impede cancelar reserva passada (só a UI esconde o botão, RN-CA-01). Regra desejada: **Não definido**.

## Não definido
- Prazo mínimo de antecedência para cancelar.
- Cancelar reserva já concluída.
- Registro histórico de cancelamentos e notificação à barbearia.
