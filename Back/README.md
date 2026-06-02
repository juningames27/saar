# SAAR — Backend

API em Node.js + Express + PostgreSQL. Login por **CPF + senha**, com 3 níveis:
`master` (ADM Master), `adm` (Administrador) e `aluno`.

Senhas são criptografadas (bcrypt) e o acesso usa token JWT.

---

## 1. Rodar localmente (teste antes do deploy)

Pré-requisito: ter o **Node.js 18+** instalado e um **PostgreSQL** (local ou na nuvem).

```bash
cd Back
npm install
cp .env.example .env      # no Windows: copy .env.example .env
```

Edite o `.env` com a sua `DATABASE_URL` e os dados do master. Depois:

```bash
npm run dev
```

Se aparecer `✓ Servidor rodando na porta 3000` e `✓ ADM Master criado`, está funcionando.
Teste em: http://localhost:3000 (deve responder `{"ok":true,...}`).

---

## 2. Criar o banco de dados (grátis)

Você precisa de uma `DATABASE_URL`. Duas opções gratuitas:

### Opção A — Neon (recomendado, não expira)
1. Acesse https://neon.tech e crie conta.
2. Crie um projeto → ele te dá uma **Connection String** parecida com:
   `postgresql://user:senha@ep-xxx.neon.tech/neondb?sslmode=require`
3. Guarde essa string — é a sua `DATABASE_URL`.

### Opção B — PostgreSQL do próprio Render
1. No Render → **New** → **PostgreSQL** → plano Free.
2. Copie a **Internal Database URL** (se o backend ficar no mesmo Render) ou a **External**.

---

## 3. Subir o backend no Render

1. Suba o projeto pro **GitHub** (a pasta inteira do SAAR serve).
2. No Render → **New** → **Web Service** → conecte o repositório.
3. Configure:
   - **Root Directory:** `Back`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Em **Environment** → adicione as variáveis (aba Environment Variables):

   | Chave          | Valor                                              |
   |----------------|----------------------------------------------------|
   | `DATABASE_URL` | a string do passo 2                                |
   | `JWT_SECRET`   | uma frase longa e aleatória sua                    |
   | `CORS_ORIGIN`  | a URL do seu site na Vercel (ex: `https://saar.vercel.app`) |
   | `MASTER_NOME`  | Seu nome                                            |
   | `MASTER_CPF`   | seu CPF (só números)                               |
   | `MASTER_SENHA` | a senha que você vai usar pra entrar               |

5. **Create Web Service**. Quando terminar, você terá uma URL tipo
   `https://saar-api.onrender.com`. Essa é a URL da sua API.

> ⚠️ No plano Free o serviço "dorme" após 15 min sem uso e demora ~30s pra acordar na primeira chamada. Normal.

---

## 4. Subir o frontend na Vercel

1. No arquivo `Front/config.js`, troque a URL pela do seu backend no Render:
   ```js
   window.SAAR_API = "https://saar-api.onrender.com";
   ```
2. Faça commit/push dessa mudança.
3. Na Vercel → **Add New Project** → importe o repositório.
   - **Root Directory:** `Front`
   - Framework Preset: **Other** (é site estático, sem build).
4. **Deploy**. Você recebe uma URL tipo `https://saar.vercel.app`.
5. Volte no Render e confirme que `CORS_ORIGIN` é exatamente essa URL.

---

## 5. Primeiro acesso

Abra o site da Vercel → entre com o **CPF e a senha do MASTER** que você definiu nas variáveis.

A partir daí, dentro do painel:
- **Administradores** → cadastra novos admins (só o master pode).
- **Cadastrar aluno** → cada aluno entra depois com o **CPF** e senha = **data de nascimento** (formato DDMMAAAA). Ex: nascido em 05/09/2008 → senha `05092008`.

---

## Endpoints (referência)

| Método | Rota                         | Quem pode        |
|--------|------------------------------|------------------|
| POST   | `/api/login`                 | todos            |
| GET    | `/api/me`                    | logados          |
| GET    | `/api/admins`                | master, adm      |
| POST   | `/api/admins`                | master           |
| PUT    | `/api/admins/:id`            | master           |
| DELETE | `/api/admins/:id`            | master           |
| GET    | `/api/alunos`                | logados          |
| POST   | `/api/alunos`                | master, adm      |
| PUT    | `/api/alunos/:id`            | master, adm      |
| DELETE | `/api/alunos/:id`            | master, adm      |
| GET    | `/api/chamadas`              | logados          |
| POST   | `/api/chamadas`              | master, adm      |
| GET/PUT/DELETE | `/api/horarios/:chave` | leitura: logados / escrita: master, adm |
| GET/POST/DELETE | `/api/materiais`     | leitura: logados / escrita: master, adm |
