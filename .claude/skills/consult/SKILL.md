---
name: consult
description: Consulta com o arquiteto - discute uma implementação com o usuário, tira dúvidas, questiona o pedido e monta o plano em etapas. Use quando o usuário rodar /consult seguido da descrição do que quer construir.
argument-hint: <descrição da implementação>
disable-model-invocation: true
---

# /consult — Planejamento com o arquiteto

Pedido do usuário:

$ARGUMENTS

Você (sessão principal) é o **ponte** entre o usuário e o agente `architect`. O arquiteto não fala com o usuário diretamente: você leva as perguntas dele ao usuário e devolve as respostas. Você **não** planeja nem implementa nada por conta própria. Siga as regras do `rules.md`.

## 1. Preparação
1. Se o pedido estiver vazio, pergunte ao usuário o que ele quer construir e pare até ele responder.
2. Gere um `<slug>` curto em kebab-case que descreva a tarefa (ex.: `tela-login`). Se `.claude/flow/<slug>/` já existir, pergunte se é para continuar aquele plano ou criar um novo (com outro slug).
3. Crie a pasta `.claude/flow/<slug>/`.

## 2. Conversa
1. Avise: "🏗️ Arquiteto analisando o pedido…" e chame o agente `architect` com:
   - o pedido completo do usuário;
   - o slug;
   - a instrução: "Modo consulta: questione o pedido, aponte riscos e alternativas, e pergunte tudo que for necessário antes de planejar."
2. Enquanto ele retornar `STATUS: NEEDS_INPUT`:
   - Apresente as perguntas ao usuário com **AskUserQuestion** (até 4 por vez, usando as opções que o arquiteto sugeriu, a recomendada primeiro com "(Recomendado)"). Se o arquiteto trouxer questionamentos ou riscos que não são perguntas de múltipla escolha, mostre-os em texto antes.
   - Envie as respostas ao **mesmo** arquiteto via **SendMessage** (para ele manter o contexto). Não inicie um arquiteto novo.
3. Quando retornar `STATUS: PLAN_READY`, leia o `plan.md` gerado.

## 3. Aprovação
1. Mostre ao usuário um resumo do plano: objetivo, premissas assumidas, etapas (responsável e commit sugerido de cada uma) e mudanças de stack.
2. Pergunte com AskUserQuestion: **Aprovar plano** / **Ajustar**.
   - Ajustar → colete o que o usuário quer mudar, envie ao arquiteto via SendMessage e volte ao passo 3.1.
3. Ao aprovar, finalize **sempre** com:

```
✅ Plano salvo em .claude/flow/<slug>/plan.md

Para executar, rode:
/implement <slug>
```

Não comece a implementação nesta skill.
