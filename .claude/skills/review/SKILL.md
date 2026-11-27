---
name: review
description: Chama o reviewer sob demanda, sem precisar de um plano - revisa as mudanças não commitadas, um arquivo, uma pasta ou um intervalo de commits contra o rules.md. Use quando o usuário rodar /review, opcionalmente seguido do alvo.
argument-hint: [arquivo | pasta | commit | intervalo de commits]
disable-model-invocation: true
---

# /review — Revisão de código avulsa

Alvo: $ARGUMENTS

Você (sessão principal) é o **orquestrador** (seção 5 do `rules.md`). Quem revisa é o agente `reviewer`. Você não corrige nada sem o usuário pedir.

## 1. Definir o alvo
- **Vazio** → mudanças não commitadas (staged, unstaged e arquivos novos). Se não houver nenhuma, pergunte com AskUserQuestion qual alvo revisar.
- **Arquivo ou pasta** existente → revisão do conteúdo completo desses arquivos (não só diff).
- **Hash de commit** (ex.: `a1b2c3d`) → diff daquele commit (`git show`).
- **Intervalo** (ex.: `HEAD~3..HEAD`, `main..minha-branch`) → diff do intervalo.

Gere um slug `review-<resumo>` e crie `.claude/flow/<slug>/`.

## 2. Revisar
Avise "🔍 Reviewer analisando <alvo>…" e chame o `reviewer` em **modo avulso** com o alvo, o tipo (mudanças | arquivos | commit | intervalo) e o slug.

## 3. Resultado
Mostre ao usuário de forma resumida:
- Status: aprovado ou com bloqueantes
- **Bloqueantes**: arquivo:linha, categoria, problema e correção sugerida
- **Sugestões** (não bloqueiam)
- Pontos de atenção para testes
- **Propostas de issue** (fora do escopo do diff), tratadas no passo 3b

Se o reviewer trouxe propostas de issue, execute o passo 3b **antes** de perguntar e de encerrar em qualquer das opções abaixo.

Se houver bloqueantes ou sugestões, pergunte com AskUserQuestion:
- **Corrigir com os agentes** → passo 4.
- **Vou corrigir eu mesmo** → encerre; lembre que pode rodar `/review` de novo depois.
- **Só o relatório** → encerre, informando o caminho `.claude/flow/<slug>/review.md`.

## 3b. Propostas de issue
Se o reviewer trouxer `PROPOSTAS DE ISSUE`, o **orquestrador** monta título + corpo de cada proposta a partir dos campos recebidos (título, onde, descrição, segurança), no formato da seção "Issues no GitHub" do `docs.md` (descrição, onde acontece, como reproduzir, origem, regra `RN-*` afetada), sem tokens, dados de usuários nem valores de `.env` nem saída de SQL com dados pessoais, e mostra ao usuário antes de perguntar. Para cada uma, pergunte com AskUserQuestion: **Criar issue** / **Não criar**. Para as de segurança, peça antes uma confirmação separada, avisando que a issue ficará pública. Só então chame o `docs` com a lista aprovada, dizendo no prompt que o usuário aprovou (e, nas de segurança, que confirmou a publicação). Sem aprovação, nada é criado.

## 4. Correção (se o usuário pedir)
1. Pergunte se deve corrigir só os bloqueantes ou também as sugestões.
2. Envie os itens ao(s) executor(es) indicado(s) em cada apontamento (`frontend` | `backend` | `docs`), com o caminho do relatório e a instrução: "Corrija apenas os itens listados, sem refatorações fora do escopo."
3. Chame o `reviewer` de novo, apenas sobre o diff das correções. Máximo 2 rodadas; depois mostre o que restou ao usuário.
4. Ao final, sugira validar com `/test` antes de commitar. Esta skill não faz commit.
