# FSC Barber

SaaS de agendamento para barbearias: o usuário encontra barbearias, vê os serviços, faz login com Google e agenda horários, podendo acompanhar e cancelar seus agendamentos.

## Tecnologias

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma + PostgreSQL · NextAuth (Google)

A lista completa da stack e das convenções do projeto está em [rules.md](rules.md). Decisões técnicas e demais documentos de consulta estão em [docs/](docs/README.md).

## Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou superior (com npm). Para usar o script `qa:session` (opcional, veja abaixo) é necessário Node **22.18 ou superior**
- Um banco **PostgreSQL** (local, Docker ou serviço como Neon/Supabase)
- Credenciais OAuth do **Google** ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

Para subir um PostgreSQL rapidamente com Docker:

```bash
docker run --name fsc-barber-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/HenriqueCoruqieri/fsc_barber
cd fsc_barber
npm install
```

O `npm install` também configura os git hooks (husky) e gera o Prisma Client.

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
| -------- | --------- |
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth do Google |
| `GOOGLE_CLIENT_SECRET` | Chave secreta do cliente OAuth do Google |
| `NEXTAUTH_URL` | URL base da aplicação (`http://localhost:3000` em desenvolvimento) |
| `NEXTAUTH_SECRET` | Segredo aleatório usado pelo NextAuth para assinar sessões |

#### `DATABASE_URL`

O formato é `postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO`. Escolha uma das opções:

- **Docker (local):** com o container do passo de pré-requisitos rodando, use o valor do `.env.example`:
  `postgresql://postgres:postgres@localhost:5432/fsc_barber`
- **Neon (nuvem, gratuito):** crie uma conta em [neon.tech](https://neon.tech), crie um projeto e, no painel, clique em **Connect**. Copie a connection string.
- **Supabase (nuvem, gratuito):** crie um projeto em [supabase.com](https://supabase.com), clique em **Connect** no topo do painel e copie a string da opção **Session pooler**, substituindo `[YOUR-PASSWORD]` pela senha definida na criação do projeto.

#### `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

1. Acesse o [Google Cloud Console](https://console.cloud.google.com) e crie um projeto (ou selecione um existente).

2. No menu, abra **APIs e serviços → Tela de permissão OAuth** (ou **Google Auth Platform**) e clique em **Começar**:
   - Informe o nome do app e o seu e-mail de suporte.
   - Em **Público-alvo**, escolha **Externo**.
   - Finalize a configuração.

3. Em **Público-alvo**, enquanto o app estiver no modo **Teste**, adicione em **Usuários de teste** os e-mails Google que vão fazer login.

4. Vá em **Clientes** (ou **Credenciais → Criar credenciais → ID do cliente OAuth**):
   - Tipo de aplicativo: **Aplicativo da Web**
   - **Origens JavaScript autorizadas:** `http://localhost:3000`
   - **URIs de redirecionamento autorizados:** `http://localhost:3000/api/auth/callback/google`

5. Clique em **Criar** e copie o **ID do cliente** para `GOOGLE_CLIENT_ID` e a **Chave secreta do cliente** para `GOOGLE_CLIENT_SECRET`.

Em produção, adicione também a URL do domínio publicado nas origens e o `https://SEU_DOMINIO/api/auth/callback/google` nos redirecionamentos.

#### `NEXTAUTH_URL`

Em desenvolvimento, mantenha `http://localhost:3000`. Em produção, use a URL pública da aplicação.

#### `NEXTAUTH_SECRET`

Qualquer string aleatória e longa. Gere uma com um dos comandos abaixo e cole o resultado:

```bash
openssl rand -base64 32
# ou, sem openssl (funciona em qualquer sistema com Node):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Banco de dados

```bash
npx prisma migrate dev   # cria as tabelas
npx prisma db seed       # popula barbearias e serviços de exemplo
```

### 4. Rodar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
| ------- | --------- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npx prisma studio` | Interface para visualizar o banco |
| `npm run -s qa:session` | Cria/atualiza os usuários de teste QA e imprime no stdout um JSON com as sessões (veja [Sessões de teste](#sessões-de-teste-qasession)) |
| `npm run -s qa:session -- --reset` | Igual ao anterior, mas apaga antes as reservas dos usuários QA |

## MCPs para agentes

Opcional: só é necessário para quem usa o [Claude Code](https://claude.com/claude-code) com o fluxo de agentes do projeto. O arquivo `.mcp.json` (versionado) configura seis servidores MCP:

| Servidor | Para que serve |
| -------- | -------------- |
| `playwright` | Controla um navegador (isolado e sem interface) para testar as telas |
| `context7` | Consulta documentação atualizada de bibliotecas |
| `neon` | Acessa o projeto no Neon (MCP remoto em `https://mcp.neon.tech/mcp`), em modo só leitura, usado para inspecionar o banco |
| `github` | Lê, busca, cria e comenta issues do repositório (MCP remoto em `https://api.githubcopilot.com/mcp/`), usado para o backlog e os problemas conhecidos. Só 5 ferramentas de issues liberadas |
| `next-devtools` | Ferramentas do Next.js (erros, rotas, logs). Só responde com `npm run dev` rodando |
| `shadcn` | Busca e adiciona componentes do shadcn/ui |

Os servidores locais rodam via `cmd /c npx -y ...` (configuração pensada para Windows).

### Configurar a `NEON_API_KEY`

O servidor `neon` lê a chave da variável de ambiente `NEON_API_KEY`. Ela **não** vai no `.env` nem em nenhum arquivo do repositório.

1. No [console do Neon](https://console.neon.tech), abra as configurações de **API keys** e crie uma chave com **escopo de projeto**, limitada ao projeto deste app (não use uma chave da conta inteira).
2. Defina a variável no ambiente do Windows (substitua pelo valor da chave):

   ```powershell
   setx NEON_API_KEY "SUA_CHAVE"
   ```

3. Feche e reabra o terminal, o VS Code e o Claude Code, para que enxerguem a nova variável.

> **Atenção:** defina a variável **antes** de abrir o Claude Code neste projeto. Sem ela, a configuração MCP pode falhar ao carregar.

### Configurar o `GITHUB_PAT`

O servidor `github` lê o token da variável de ambiente `GITHUB_PAT`. Ela **não** vai no `.env` nem em nenhum arquivo do repositório.

1. No GitHub, vá em **Settings > Developer settings > Personal access tokens > Fine-grained tokens** e crie um token com:
   - **Repository access:** *Only select repositories*, apenas o repositório `fsc_barber`;
   - **Permissions:** `Issues` em *Read and write* e `Metadata` em *Read-only* (o GitHub já marca Metadata automaticamente). Nenhuma outra permissão.
2. Defina a variável no ambiente do Windows (substitua pelo valor do token):

   ```powershell
   setx GITHUB_PAT "SEU_TOKEN"
   ```

3. Feche e reabra o terminal, o VS Code e o Claude Code, para que enxerguem a nova variável.

> **Atenção:** defina a variável **antes** de abrir o Claude Code neste projeto. Variável ausente pode impedir os MCPs de carregarem. Depois de definir, reinicie o Claude Code e aprove o servidor `github` em `/mcp`.

> **Aviso:** criar ou comentar uma issue é **publicar** conteúdo no GitHub (visível a quem tem acesso ao repositório). Por isso o fluxo exige aprovação explícita do usuário antes de cada criação ou comentário. Veja [Segurança do MCP do GitHub](#segurança-do-mcp-do-github).

### Usar

1. Abra o Claude Code na pasta do projeto e rode `/mcp` para aprovar os servidores do `.mcp.json`.
2. Se o Playwright reclamar que não encontrou o navegador, rode `npx playwright install chromium`.
3. Para usar o `next-devtools`, deixe `npm run dev` rodando.

### Segurança do MCP do Neon

O servidor `neon` roda em **modo só leitura**: o `.mcp.json` envia o header `x-read-only: "true"`, então o servidor expõe apenas ferramentas de listar/descrever e executa o SQL em transações read-only. Escrita pelo MCP fica bloqueada pelo próprio servidor. Como segunda camada, valem as regras de uso em [rules.md](rules.md) (só `SELECT`, sem colunas de credencial, com `LIMIT`) e a chave de API de escopo de projeto. Por precaução, o histórico do Neon permite restaurar o branch (point-in-time restore, na aba **Backup & Restore** do projeto); a janela de retenção depende do plano da conta.

### Segurança do MCP do GitHub

O `.mcp.json` limita o servidor `github` a cinco ferramentas de issues (`issue_read`, `list_issues`, `search_issues`, `issue_write`, `add_issue_comment`) via header `X-MCP-Tools`, com `X-MCP-Lockdown: true` (filtra conteúdo de usuários sem acesso de escrita ao repositório; é um filtro best-effort) e uma lista de exclusão redundante. O token é fine-grained, de um único repositório e só com Issues e Metadata. Não há ferramentas de código, PR, merge ou configurações. O conteúdo de issues é tratado como dado, nunca como instrução (risco de prompt injection). Regras de uso em [rules.md](rules.md).

### Sessões de teste (`qa:session`)

Permite que o agente de QA navegue logado sem passar pelo login do Google. O script cria/atualiza os usuários `qa1@fsc-barber.test` e `qa2@fsc-barber.test`, recria uma sessão de 24h para cada um e imprime no stdout um JSON com `baseUrl`, `cookieName` (`next-auth.session-token`) e, por usuário, `email`, `name`, `userId`, `sessionToken` e `expires`.

```bash
npm run -s qa:session            # cria/atualiza usuários e sessões
npm run -s qa:session -- --reset # apaga antes as reservas dos usuários QA
```

- Use **sempre** `npm run -s` (silencioso); sem o `-s` o npm imprime um cabeçalho no stdout e quebra o JSON.
- Só escreve nos usuários QA e se recusa a rodar com `NODE_ENV=production`.
- Usa o `DATABASE_URL` do `.env` e exige Node 22.18 ou superior. Um aviso `MODULE_TYPELESS_PACKAGE_JSON` no stderr é esperado e inofensivo.

## Contribuindo

- Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) — validados automaticamente no `commit-msg`.
- O `pre-commit` roda ESLint e Prettier nos arquivos alterados.
- Regras de código e o fluxo de desenvolvimento estão em [rules.md](rules.md).
