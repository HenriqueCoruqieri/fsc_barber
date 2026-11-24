# Regras do projeto — fsc_barber

Fonte única de verdade sobre stack, convenções e fluxo de desenvolvimento. **Todo agente deve ler este arquivo antes de trabalhar.**

Este arquivo é mantido pelo agente `docs`. Ao adotar uma nova biblioteca, padrão ou ferramenta, ele é atualizado no mesmo ciclo da tarefa que causou a mudança.

---

## 1. Stack

| Camada | Tecnologia | Observações |
|---|---|---|
| Framework | Next.js 16 (App Router) | Tem breaking changes em relação a versões anteriores. Consulte `node_modules/next/dist/docs/` antes de usar APIs do framework. `dev` roda com `--webpack`. |
| UI | React 19 | Server Components por padrão; `"use client"` só quando necessário. |
| Estilo | Tailwind CSS v4 + `tw-animate-css` | Tokens/tema em `app/globals.css`. Não usar cores fora do tema. |
| Componentes | shadcn/ui (style `radix-nova`, `radix-ui`) | Ficam em `app/_components/ui/`. Adicionar com `npx shadcn add <nome>`. |
| Ícones | lucide-react | |
| Formulários | react-hook-form + zod + `@hookform/resolvers` | |
| Notificações | sonner | |
| Datas | date-fns, react-day-picker | |
| Tema | next-themes | |
| Banco | PostgreSQL + Prisma 6 (`engine: classic`) | Config em `prisma.config.ts`, schema em `prisma/schema.prisma`. |
| Autenticação | NextAuth v4 + `@next-auth/prisma-adapter` | Provider Google. Config em `app/_lib/auth.ts`. |
| Qualidade | ESLint 9 (`eslint-config-next`), Prettier + `prettier-plugin-tailwindcss` | |
| MCPs (agentes) | playwright, context7, neon (remoto), next-devtools, shadcn | Configurados em `.mcp.json` (versionado). Servidores locais via `cmd /c npx -y`; Neon via `https://mcp.neon.tech/mcp` com `Authorization: Bearer ${NEON_API_KEY}` e em modo só leitura (`x-read-only: "true"`). `playwright` roda com `--isolated --headless`; saída em `.playwright-mcp/` (ignorada pelo git). Setup no README. |
| Testes | Sem runner de testes; checks estáticos (`tsc`, `lint`, `build`) + validação E2E via MCP | Ver seção 6. |
| Git hooks | husky + lint-staged + git-commit-msg-linter | `pre-commit` roda eslint --fix e prettier nos `.ts/.tsx`; `commit-msg` valida Conventional Commits. |

## 2. Estrutura de pastas

```
app/
  _actions/     server actions ("use server") — escrita e operações do usuário
  _data/        funções de leitura de dados no servidor
  _components/  componentes de domínio
    ui/         componentes shadcn
  _constants/   constantes
  _lib/         auth.ts, prisma.ts (exporta `db`), utils.ts (`cn`)
  _providers/   providers React
  api/          route handlers (ex.: api/auth)
  <rota>/       páginas (barbershops, bookings, ...)
prisma/         schema, migrations, seed.ts, qa-session.ts (sessões de teste do QA)
```

Pastas com `_` são privadas (não viram rotas).

## 3. Convenções de código

- TypeScript em tudo; evitar `any`.
- Sem ponto e vírgula, 2 espaços, aspas duplas (padrão do código atual).
- Imports relativos (padrão atual); o alias `@/` existe e é usado pelo shadcn.
- Nomes de arquivos em kebab-case (`booking-item.tsx`); componentes em PascalCase.
- Textos da interface e mensagens de erro em **português**. Código, nomes e commits em **inglês**.
- Acesso ao banco só pelo `db` de `app/_lib/prisma.ts`, e só no servidor.
- Operações do usuário verificam a sessão com `getServerSession(authOptions)` e garantem que o usuário só acessa os próprios dados.
- Validar com zod toda entrada vinda do cliente.
- Após mutações, chamar `revalidatePath` nas rotas afetadas.
- **Credenciais só por `${VAR}`**, nunca literais, em arquivos versionados (`.mcp.json`, configs, docs). Valores ficam em `.env` ou no ambiente do sistema (ex.: `NEON_API_KEY` via `setx`).
- Não adicionar dependência sem registrar o motivo no relatório da etapa (o agente `docs` atualiza este arquivo).

### Componentes React

- **Props tipadas com `interface`**, nomeada `<NomeDoComponente>Props` e declarada logo acima do componente. Não usar `type` nem tipagem inline para props.
  ```tsx
  interface BookingItemProps {
    booking: Booking
  }

  const BookingItem = ({ booking }: BookingItemProps) => { ... }
  ```
- **Evitar `useEffect`.** Antes de usá-lo, prefira:
  - **Buscar dados no servidor** (Server Component ou função de `app/_data/`) em vez de buscar no cliente dentro de um efeito.
  - **Calcular durante a renderização** valores derivados de props/estado (com `useMemo` só se o cálculo for caro), em vez de sincronizar com outro estado.
  - **Tratar no event handler** a lógica disparada por uma ação do usuário (clique, submit, seleção), chamando a server action ali.
  - **Usar `key`** para reiniciar o estado de um componente quando uma prop muda.
- `useEffect` só é aceitável para sincronizar com sistemas externos ao React (APIs do navegador, eventos de `window`, bibliotecas não-React). Não comentar no código: a justificativa fica registrada no fluxo:
  - no **plano**, quando o arquiteto já prevê a necessidade;
  - no campo `JUSTIFICATIVAS` do relatório do executor, para todo `useEffect` adicionado;
  - o **reviewer** valida a justificativa — sem justificativa válida, é bloqueante.

### Uso do MCP do Neon

O MCP do Neon acessa o banco real do projeto. As regras de uso (só leitura, ferramentas permitidas, colunas de credenciais, `project_id`) estão na seção 6.

## 4. Git e commits

- Conventional Commits, em inglês, minúsculo, imperativo, sem ponto final. Ex.: `feat: add BookingSummary component`.
- Mensagem só com a linha de assunto, curta e resumida. Sem corpo nem rodapé.
- Tipos: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `perf`, `build`, `ci`.
- Um commit por etapa validada pelo QA. O QA não cria arquivos de teste; vão no commit as mudanças da etapa e as de docs feitas por causa dela.
- Nunca usar `--no-verify`. Nunca fazer `git push` sem pedido explícito do usuário.
- Nunca versionar: `.env`, `.next/`, `node_modules/`, `*.tsbuildinfo`, `.claude/flow/`.

## 5. Fluxo de desenvolvimento com agentes

Os agentes ficam em `.claude/agents/`. A sessão principal atua como **orquestrador**: chama cada agente, repassa perguntas ao usuário e controla as pausas de commit. Subagentes não falam com o usuário nem chamam outros agentes.

### Como usar

| Comando | O que faz |
|---|---|
| `/consult <pedido>` | Conversa com o arquiteto: ele questiona, tira dúvidas e monta o plano em `.claude/flow/<slug>/plan.md`. Não implementa. |
| `/implement <slug>` | Executa o plano etapa por etapa, com review, QA, docs e pausa para commit. Retoma de onde parou se interrompido. |
| `/implement <pedido>` | Para tarefas pequenas: o arquiteto gera um plano rápido (só pergunta o essencial), o usuário aprova e a execução começa. |
| `/fix <bug>` | O QA reproduz o bug com um roteiro E2E no navegador (MCP), o executor corrige a causa raiz, reviewer e QA validam e o commit `fix:` é sugerido. Bugs que exigem migration ou mudam regra de negócio são redirecionados ao `/consult`. |
| `/review [alvo]` | O reviewer revisa as mudanças não commitadas, um arquivo, pasta, commit ou intervalo de commits contra este arquivo. Se o usuário pedir, os executores corrigem os apontamentos. Não faz commit. |
| `/test [alvo]` | O QA testa (checks estáticos + roteiros E2E via MCP) as mudanças não commitadas, os fluxos afetados por um arquivo ou pasta, uma funcionalidade ou `all` (checks + checklist de regressão completo). Não corrige nada: problemas encontrados viram sugestões de `/fix`. |

As skills ficam em `.claude/skills/`.

| Agente | Responsabilidade | Escreve código de produção? |
|---|---|---|
| `architect` | Planeja, levanta dúvidas, divide em etapas commitáveis com critérios de aceite | Não |
| `ui-designer` | Especifica layout, componentes, estados visuais, responsividade e acessibilidade | Não |
| `frontend` | Páginas, componentes, estado e formulários | Sim |
| `backend` | Server actions, dados, API, Prisma, auth, validação; integra com a UI | Sim |
| `reviewer` | Revisa o diff da etapa (bugs, segurança, aderência ao `rules.md`, reuso) antes do QA; aprova ou pede mudanças | Não (só o próprio relatório) |
| `qa` | Checks estáticos + roteiros E2E no navegador via MCP (Playwright, Next DevTools, Neon só leitura) + regressão do sistema; aprova ou rejeita | Não (só relatórios) |
| `docs` | Mantém `rules.md`, `README.md` e os arquivos do fluxo (`.claude/agents`, `.claude/skills`) atualizados | Só documentação |
| `commit-manager` | Identifica o ponto de commit e sugere a mensagem | Não (só leitura do git) |

### Ordem

```
1. architect ──(dúvidas)──► usuário ──► plano aprovado pelo usuário
2. Para cada etapa do plano:
   a. ui-designer (se a etapa tiver tela)
   b. frontend ou backend implementa
   c. reviewer revisa o diff (se a etapa não for trivial)
        ── CHANGES_REQUESTED ──► volta ao executor (até 2 rodadas, depois escala ao usuário)
        └─ APPROVED ─► d
   d. qa testa ── REJECTED ──► executor corrige ──► reviewer revisa só o diff da correção ──► qa
             (até 3 rodadas de QA, depois escala ao usuário)
             └─ APPROVED ─► e
   e. docs (se houve mudança de stack, dependência, variável de ambiente, script ou convenção)
   f. commit-manager sugere o commit ──► PAUSA: usuário commita ──► próxima etapa
3. Encerramento: resumo das etapas, commits e sugestões do reviewer não aplicadas
```

### Quando pular o `reviewer`

O arquiteto marca no plano `Precisa de review: não` apenas para etapas triviais: mudança de texto, cor/espaçamento, só documentação ou só configuração sem lógica. Na dúvida, revisa.

Apontamentos do reviewer:
- **Bloqueantes** (bug, segurança, Next.js usado errado, violação deste arquivo) voltam ao executor.
- **Sugestões** não bloqueiam; ficam no relatório e são listadas no encerramento. O usuário decide se viram uma etapa `refactor:`.

### Artefatos

Ficam em `.claude/flow/<slug>/` (ignorado pelo git):
- `plan.md` — plano do arquiteto
- `ui-spec-etapa-<n>.md` — spec do UI Designer
- `review-etapa-<n>.md` — relatório do reviewer
- `qa-report-etapa-<n>.md` — relatório do QA

### Quando acionar o `docs`

Sempre que a etapa:
- adicionar, remover ou trocar uma dependência;
- criar ou renomear variável de ambiente;
- criar ou alterar script do `package.json`, migration ou passo de setup;
- introduzir uma convenção ou padrão novo (ex.: nova pasta, nova forma de validar);
- ou quando o executor reportar algo em `MUDANÇAS DE STACK`.

## 6. Testes

### Estratégia
Não há runner de testes nem specs salvos. A validação de cada etapa é feita pelo agente `qa` em três camadas:
1. **Checks estáticos:** `npx tsc --noEmit`, `npm run lint`, `npm run build`.
2. **E2E exploratório no navegador** via MCP do Playwright (roteiros com navegação, interação, `browser_snapshot`/screenshot, estados de erro/vazio/loading e viewports 390x844 e 1440x900).
3. **Runtime e banco:** erros e logs do dev server pelo next-devtools (`nextjs_index` + `nextjs_call` com `get_errors`/`get_logs`) e conferência no Neon (`run_sql` só com `SELECT`) do que as mutações gravaram.

Ressalva honesta: o E2E via MCP não fica salvo e pode variar entre rodadas. O checklist abaixo e os roteiros registrados nos relatórios (`qa-report-*.md`, `bug-report.md`) compensam em parte.

### Usuários QA e `qa:session`
- `npm run -s qa:session` cria ou atualiza `qa1@fsc-barber.test` ("QA Tester 1") e `qa2@fsc-barber.test` ("QA Tester 2"), recria uma sessão de 24h para cada um e imprime um JSON no stdout (`baseUrl`, `cookieName`, e por usuário `email`, `name`, `userId`, `sessionToken`, `expires`). É a **única** escrita no banco do fluxo de QA.
- Use sempre `-s` (sem ele o npm quebra o JSON do stdout). O script recusa `NODE_ENV=production` e exige Node >= 22.18.
- `npm run -s qa:session -- --reset` apaga antes as reservas dos usuários QA (o QA o roda ao final de cada execução).
- O QA injeta o cookie (`next-auth.session-token`) no Playwright com `browser_run_code_unsafe` (`page.context().addCookies(...)`; único uso permitido dessa ferramenta) ou, se indisponível, `browser_evaluate` com `document.cookie`. O qa2 existe para testar a regra de dono do recurso.
- Para a regressão, o `build` pode rodar com o dev server ativo no Next 16 (o dev usa `.next/dev`); o QA nunca para um dev server que não subiu.
- Dev server: o QA verifica se `http://localhost:3000` responde; se não, sobe `npm run dev` em background e o encerra ao final só se foi ele que o subiu.
- Os tokens de sessão nunca vão para relatórios.

### Regras do Neon MCP
O servidor está em **modo só leitura** (`x-read-only: "true"` em `.mcp.json`): o SQL roda em transação read-only e ferramentas que criam, alteram ou apagam recursos não são expostas. As regras abaixo são camadas adicionais:
- Toda chamada ao `neon` passa `project_id: "delicate-heart-92192986"` (não é segredo; a conexão não é escopada a um projeto, só a API key é).
- O `tools:` dos agentes lista **explicitamente** só estas ferramentas (nunca o prefixo `mcp__neon` inteiro): `mcp__neon__run_sql`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__describe_project`, `mcp__neon__describe_branch`, `mcp__neon__get_default_branch`, `mcp__neon__explain_sql_statement`. Não listar `list_projects` (falha com chave de escopo de projeto).
- Nunca liberar ferramentas que criam, alteram ou apagam recursos (`create_*`, `delete_*`, `update_*`, `reset_*`, `restore_*`, `rotate_*`, `revoke_*`, `set_*`, `provision_*`, `prepare_*`/`complete_*`, `run_sql_transaction`, `recover_project`, `finalize_branch_restore`) nem as que expõem credenciais (`get_connection_string`, `list_credentials`, `get_realtime_secret`).
- Apenas `SELECT`. Nunca `INSERT`, `UPDATE`, `DELETE`, DDL ou `TRUNCATE`.
- Nunca selecionar colunas de credenciais (`accounts.access_token`, `refresh_token`, `id_token`, `sessions.session_token`, `verification_tokens.token`). Contagens e ids podem.
- Consultas filtradas e com `LIMIT`; `explain_sql_statement` nunca com `analyze: true`.
- Dados de teste só via `npm run -s qa:session`. Alterações de schema só por migration do Prisma, e somente quando autorizadas.
- O reviewer trata como **bloqueante** qualquer instrução de agente ou skill que libere ferramenta destrutiva do Neon ou escrita via MCP.
- Recuperação em caso de acidente: histórico e restauração de branch do Neon (point-in-time restore), descritos no README.

### Checklist de regressão
**Deslogado**
- `/` carrega as barbearias.
- A busca leva a `/barbershops?...` com resultados.
- `/barbershops/[id]` mostra os serviços.
- Tentar agendar pede login.
- `/bookings` deslogado se comporta como hoje.

**Logado (qa1)**
- Criar um agendamento e conferir no banco (`"Booking"`, SELECT).
- O horário ocupado não aparece de novo.
- `/bookings` lista o agendamento.
- Cancelar remove o agendamento da lista e o banco confirma.
- O qa2 não vê nem cancela o agendamento do qa1.

**Sempre**
- `get_errors` do next-devtools sem erros novos.

### Evoluções
- Specs `@playwright/test` versionados e, se desejado, um test runner (Vitest) para testes unitários.
- Branch Neon `qa` com dev server dedicado (`QA_DATABASE_URL`; o QA passaria sempre o `branchId` do branch `qa` nas chamadas ao `neon`).
- Injetar o cookie de sessão com `browser_cookie_set` do Playwright (se existir), no lugar de `browser_run_code_unsafe`.

## 7. Decisões registradas

Registro curto de decisões técnicas (mais recente primeiro). Formato: `AAAA-MM-DD — decisão — motivo`.

- 2026-11-24 — Testes via MCP (Playwright, Next DevTools, Neon) em vez de runner de testes, com sessões de teste por `npm run -s qa:session` e agentes com lista explícita de ferramentas MCP (Neon só as de leitura) — preferência do usuário por validação E2E no navegador; o E2E via MCP não fica salvo e varia entre rodadas, compensado por checklist de regressão e roteiros nos relatórios; a escrita no banco fica restrita aos usuários QA pelo script, e o reviewer bloqueia instruções que liberem escrita via MCP.

- 2026-11-24 — Adotados MCPs (playwright, context7, neon, next-devtools, shadcn) em `.mcp.json`, com o Neon remoto autenticado por API key de escopo de projeto (`NEON_API_KEY`, fora do repositório) — dar aos agentes navegador, documentação atualizada e inspeção do banco. Servidor em modo só leitura (`x-read-only: "true"`): o `run_sql` roda em transação read-only e a escrita pelo MCP fica bloqueada pelo servidor; as regras da seção "Uso do MCP do Neon" e a revisão são segunda camada, e o point-in-time restore do Neon é o recurso de recuperação.

- 2026-11-23 — Evitar `useEffect` e tipar props com `interface` — efeitos causam renderizações extras e bugs de sincronização quando usados para buscar dados ou derivar estado; `interface` padroniza a tipagem já usada nos componentes existentes.

- 2026-11-23 — Inclusão do agente `reviewer` antes do QA — pegar bugs, falhas de segurança e desvios das regras que testes não detectam, antes de gastar uma rodada de QA.

- 2026-11-23 — Adoção do fluxo multi-agente descrito na seção 5 — separar responsabilidades e garantir QA e commit a cada etapa.
