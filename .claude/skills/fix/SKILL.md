---
name: fix
description: Fluxo enxuto para correção de bugs - o QA reproduz o bug com um teste, o executor corrige, o reviewer revisa, o QA valida e o commit-manager sugere um commit fix. Use quando o usuário rodar /fix seguido da descrição do bug.
argument-hint: <descrição do bug>
disable-model-invocation: true
---

# /fix — Correção de bug

Bug relatado:

$ARGUMENTS

Você (sessão principal) é o **orquestrador** (seção 5 do `rules.md`). Não corrija nada você mesmo: delegue aos agentes e leve decisões ao usuário. Informe cada troca de agente com uma linha curta (ex.: "🧪 QA reproduzindo o bug…", "⚙️ Backend corrigindo…").

## 1. Preparação
1. Se a descrição estiver vazia ou vaga demais para reproduzir (sem tela, ação ou comportamento), pergunte ao usuário com AskUserQuestion: onde acontece, passos, o que esperava e o que aconteceu.
2. Gere um slug `fix-<resumo>` (ex.: `fix-horario-passado`) e crie `.claude/flow/<slug>/`.
3. Rode `git status`. Se houver mudanças não commitadas, avise e pergunte se deve continuar.

## 2. Reprodução (qa)
Chame o `qa` em **modo reprodução** com a descrição do bug e o slug.
- `REPRODUCED` → ele terá criado um teste que **falha** demonstrando o bug e o `bug-report.md` com causa provável, arquivos suspeitos e responsável (`frontend` ou `backend`). Vá para o passo 3.
- `NOT_REPRODUCED` → mostre ao usuário o que foi tentado e peça mais detalhes; envie ao mesmo QA via SendMessage. Após 2 tentativas sem sucesso, pergunte se o usuário quer seguir só com a análise de código do QA (sem teste) ou encerrar.
- `BLOCKED` (sem test runner) → pergunte se pode configurar Vitest + Testing Library antes (commit próprio `chore: setup vitest and testing library`) ou seguir só com análise de código.

**Escopo:** se o `bug-report.md` indicar que a correção exige mudança de schema/migration, envolve várias áreas ou muda regra de negócio, pare e sugira ao usuário tratar com `/consult` (mostre o diagnóstico do QA). Bug simples segue aqui.

## 3. Correção
Chame o responsável indicado (`frontend` ou `backend`) com o slug e a instrução: "O plano desta tarefa é `.claude/flow/<slug>/bug-report.md`. Corrija a causa raiz do bug — não altere o teste de reprodução para fazê-lo passar. Mudança mínima, sem refatorações fora do escopo."
- `BLOCKED` → leve a decisão ao usuário e devolva via SendMessage.

## 4. Review
Chame o `reviewer` informando que o plano é o `bug-report.md` e que deve verificar também se a correção ataca a causa raiz (e não só o sintoma) e se o teste de reprodução não foi enfraquecido.
- `CHANGES_REQUESTED` → bloqueantes ao executor via SendMessage → reviewer de novo. Máximo 2 rodadas, depois escale ao usuário.

## 5. Validação (qa)
Chame o `qa` em **modo validação** com o slug, informando que o plano é o `bug-report.md`. O teste de reprodução precisa passar e a regressão completa também.
- `REJECTED` → inconformidades ao executor → reviewer só sobre o diff da correção → qa. Máximo 3 rodadas, depois escale ao usuário.

## 6. Docs (se necessário)
Chame o `docs` apenas se algum relatório trouxer algo em `MUDANÇAS DE STACK`.

## 7. Commit
1. Chame o `commit-manager` com o slug, informando que o relatório do QA é `.claude/flow/<slug>/qa-report.md` e que o commit deve ser do tipo `fix`.
2. Pause e mostre: bug corrigido, causa raiz (1 linha do `bug-report.md`), arquivos e mensagem sugerida.
3. Pergunte com AskUserQuestion: **Commitar agora** / **Eu mesmo vou commitar** / **Ajustar mensagem**.
   - Commitar agora → `git add <arquivos listados>` (nunca `git add -A`) e `git commit -m "<mensagem>"` só com a linha de assunto. Nunca `--no-verify`; se o hook falhar, encaminhe a correção ao agente responsável.
   - Eu mesmo vou commitar → aguarde e confirme com `git log -1`.
4. Nunca rode `git push` sem pedido explícito.

## 8. Encerramento
Mostre: o bug, a causa raiz, o commit e o teste de reprodução criado (que agora protege contra a volta do bug).
