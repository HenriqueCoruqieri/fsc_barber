# Documentação do projeto

Conhecimento de consulta sob demanda. As regras curtas e vigentes que todo agente precisa em toda tarefa ficam em [`../rules.md`](../rules.md).

| Item | O que é | Quando consultar |
|---|---|---|
| [`decisions/`](decisions/README.md) | ADRs: uma decisão técnica por arquivo, com índice | Antes de planejar ou alterar algo que já foi decidido; ao registrar uma nova decisão |
| [`business-rules/`](business-rules/README.md) | Regras de negócio (agendamento, disponibilidade, cancelamento) com IDs `RN-*` e `arquivo:linha` | Antes de planejar, implementar, revisar ou testar algo que mexe nesses fluxos |
| [`architecture.md`](architecture.md) | Modelo de dados, autenticação, fluxos de reserva e cancelamento, camadas | Para entender como as peças se encaixam |
| [`testing.md`](testing.md) | Estratégia de testes, `qa:session`, checklist de regressão, validação documental | Ao testar (QA) ou mudar a estratégia de testes |
| Problemas conhecidos e backlog | GitHub Issues do repositório: https://github.com/HenriqueCoruqieri/fsc_barber/issues | Antes de planejar sobre código afetado; ao reportar um problema fora do escopo |
