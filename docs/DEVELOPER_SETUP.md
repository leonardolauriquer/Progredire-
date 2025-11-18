# 🚀 Guia de Configuração para Desenvolvedores - Progredire+

Este guia detalha os passos para configurar o ambiente de desenvolvimento e rodar a aplicação Progredire+ (frontend e backend).

**Atenção:** Recomendamos fortemente o uso do **Replit** para o backend, pois ele simplifica drasticamente a configuração do banco de dados e do ambiente Node.js. O setup local com Docker é mantido aqui como uma alternativa para desenvolvimento offline ou específico.

---

## Opção A: Setup com Replit (Recomendado)

Para configurar o backend na nuvem usando Replit, que já inclui PostgreSQL e gerenciamento de segredos integrado, siga o guia dedicado:

👉 **[Clique aqui para ver o Guia do Replit (docs/REPLIT_GUIDE.md)](./REPLIT_GUIDE.md)**

---

## Opção B: Setup Local com Docker (Alternativa)

Siga os passos abaixo apenas se preferir rodar tudo na sua máquina local.

### 1. Pré-requisitos

-   **Node.js:** Versão 18 ou superior.
-   **Docker** e **Docker Compose:** Para rodar o banco de dados PostgreSQL.
-   **Git:** Para controle de versão.
-   **NPM:** Gerenciador de pacotes.
-   **NestJS CLI:** (`npm install -g @nestjs/cli`).

### 2. Configuração do Backend

O backend é uma aplicação NestJS.

#### Passo 1: Instalar Dependências

Navegue até o diretório do backend (ex: `progredire-backend/`) e instale os pacotes da stack:

```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config @nestjs/passport @nestjs/jwt prisma @prisma/client passport passport-jwt bcrypt class-validator class-transformer @google/genai
```

#### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório do backend:

```dotenv
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/progredire?schema=public"
JWT_SECRET="seu-segredo-super-secreto-para-jwt"
API_KEY="sua-chave-de-api-do-google-gemini"
```

#### Passo 3: Iniciar o Banco de Dados

```bash
docker-compose up -d
```

#### Passo 4: Rodar as Migrações

```bash
npx prisma migrate dev
```

#### Passo 5: Iniciar o Servidor

```bash
npm run start:dev
```
O backend estará em `http://localhost:3000`.

---

### 3. Configuração do Frontend

O frontend é uma aplicação React.

#### Passo 1: Instalar Dependências

Navegue até o diretório do frontend e instale:

```bash
npm install
```

#### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```dotenv
# .env
# Se estiver usando Replit para o backend, coloque a URL do Repl aqui.
# Se estiver usando local, use localhost.
REACT_APP_API_URL=http://localhost:3000/api
```

#### Passo 3: Iniciar o Servidor

```bash
npm run dev
```

A aplicação estará acessível em `http://localhost:5173` (ou porta similar).