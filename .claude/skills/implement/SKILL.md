---
name: implement
description: Executa um plano do arquiteto etapa por etapa (UI designer, frontend/backend, reviewer, QA, docs e commit) ou implementa um pedido direto gerando um plano rápido antes. Use quando o usuário rodar /implement <slug> ou /implement <descrição>.
argument-hint: <slug do plano> | <descrição da tarefa>
disable-model-invocation: true
---

# /implement — Execução do fluxo de desenvolvimento

Argumento: $ARGUMENTS

Você (sessão principal) é o **orquestrador** descrito na seção 5 do `rules.md`. Você não escreve código: delega cada responsabilidade ao agente certo, leva decisões ao usuário e controla as pausas de commit. Os subagentes não falam com o usuário nem chamam uns aos outros.

Informe cada troca de agente com uma linha curta (ex.: "🎨 UI Designer — etapa 1", "⚙️ Backend — etapa 2", "🔍 Reviewer — rodada 1", "🧪 QA — rodada 2").

---

## 1. Identificar o plano

- **Argumento é um slug** com `.claude/flow/<slug>/plan.md` existente → use esse plano.
- **Argumento vazio** → liste os planos em `.claude/flow/*/plan.md` que ainda têm etapas `pendente` e pergunte qual executar (AskUserQuestion). Se não houver nenhum, peça a descrição da tarefa.
- **Argumento é uma descrição de tarefa** (não corresponde a um slug) → **modo rápido**:
  1. Gere um slug e crie `.claude/flow/<slug>/`.
  2. Chame o `architect` com a descrição, o slug e a instrução: "Modo rápido: só pergunte o que for realmente bloqueante; para o resto, assuma padrões razoáveis e registre em Premissas."
  3. Se ele retornar `NEEDS_INPUT`, leve as perguntas ao usuário (AskUserQuestion) e devolva as respostas via SendMessage.
  4. Mostre o resumo do plano e peça aprovação (Aprovar / Ajustar / Cancelar). Tarefas complexas ou ambíguas: sugira ao usuário usar `/consult` antes.

Nunca implemente sem plano — reviewer e QA dependem dos critérios de aceite dele.

## 2. Preparação
1. Rode `git status`. Se houver mudanças não commitadas que não são deste plano, avise e pergunte se deve continuar (elas se misturariam aos commits).
2. Se o `rules.md` indicar que não há test runner configurado e o plano não tiver uma etapa para isso, pergunte ao usuário se pode configurar Vitest + Testing Library como **Etapa 0** (`chore: setup vitest and testing library`), executada pelo `qa`, com review, docs e commit próprios.
3. Leia o plano e identifique a primeira etapa com `Status: pendente`. Se o plano estiver sendo retomado, avise de qual etapa vai continuar.

## 3. Para cada etapa pendente, em ordem

Passe sempre ao agente: o slug, o número da etapa e os caminhos dos artefatos relevantes.

### 3.1 UI Designer
Se a etapa tiver `Precisa de UI Designer: sim` → chame `ui-designer`.

### 3.2 Implementação
Chame o responsável (`frontend` ou `backend`).
- `BLOCKED` (migration, lib nova não prevista, dúvida) → leve a decisão ao usuário com AskUserQuestion e devolva a resposta ao **mesmo** agente via SendMessage.

### 3.3 Review
Se `Precisa de review: sim` → chame `reviewer` (rodada 1).
- `CHANGES_REQUESTED` → envie os bloqueantes ao(s) executor(es) indicado(s) via SendMessage e chame o reviewer de novo.
- Máximo **2 rodadas**. Depois disso, mostre os bloqueantes restantes ao usuário e pergunte como seguir.

### 3.4 QA
Chame `qa` com o relatório do executor e, se houver, o do reviewer.
- `BLOCKED` (sem test runner) → volte ao passo 2.2.
- `REJECTED` → envie as inconformidades ao(s) executor(es) indicado(s) via SendMessage → se a etapa tem review, chame o `reviewer` apenas sobre o diff da correção → chame o `qa` novamente.
- Máximo **3 rodadas**. Depois disso, mostre as inconformidades ao usuário e pergunte como seguir.

### 3.5 Docs
Chame `docs` se `Precisa de docs: sim` **ou** se algum relatório trouxer algo em `MUDANÇAS DE STACK`.

### 3.6 Commit
1. Chame `commit-manager`. Se retornar `NOT_READY`, resolva o motivo (ex.: acionar o `docs`) e chame de novo.
2. **Pause** e mostre ao usuário:
   - ✅ Etapa <n> — <nome> validada (resumo: review ok, QA ok com checks)
   - Arquivos que entram no commit
   - Mensagem sugerida
3. Pergunte com AskUserQuestion:
   - **Commitar agora** → `git add <arquivos listados>` (nunca `git add -A`) e `git commit -m "<mensagem>"` — **somente a linha de assunto**, sem corpo nem rodapé, conforme o `rules.md`. Se o hook do husky falhar, mostre o erro e encaminhe a correção ao agente responsável; nunca use `--no-verify`.
   - **Eu mesmo vou commitar** → aguarde o usuário avisar e confirme com `git log -1`.
   - **Ajustar mensagem** → aplique e pergunte de novo.
4. Após o commit confirmado, atualize no `plan.md` a etapa para `Status: concluída (<hash curto>)`.
5. Nunca rode `git push` sem pedido explícito.

Só então avance para a próxima etapa.

## 4. Encerramento
Quando todas as etapas estiverem concluídas, mostre:
- Etapas com os commits (`git log --oneline -<n>`)
- Testes criados
- Premissas assumidas pelo arquiteto
- **Sugestões do reviewer não aplicadas** — pergunte se o usuário quer transformá-las em um novo plano de `refactor:` (via `/consult`).

Se o usuário interromper no meio, o progresso fica no `plan.md`; basta rodar `/implement <slug>` de novo para retomar.
