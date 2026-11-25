# Regras de negócio

Regras extraídas do código atual, cada uma com `arquivo:linha` para o reviewer e o QA citarem.

| Arquivo | Área | Prefixo dos IDs |
|---|---|---|
| [`booking.md`](booking.md) | Agendamento (criar, listar, status) | `RN-AG-xx` |
| [`availability.md`](availability.md) | Disponibilidade de horários | `RN-DI-xx` |
| [`cancellation.md`](cancellation.md) | Cancelamento de reserva | `RN-CA-xx` |

## Convenções
- **O comportamento documentado é o do código.** Divergência entre o código e a regra desejada vira uma issue no GitHub (https://github.com/HenriqueCoruqieri/fsc_barber/issues) ou uma decisão nova (ADR em [`../decisions/`](../decisions/README.md)); não se reescreve a regra para "esconder" a divergência.
- Onde o código não define o comportamento, está escrito **Não definido**. Nenhuma regra é inventada.
- Os números de linha são do estado do código na data da escrita; se divergirem, vale o código e o `docs` atualiza a referência.
- Ao planejar uma mudança de regra, o plano cita o ID existente (ou "nova") na seção "Regras de negócio afetadas".
