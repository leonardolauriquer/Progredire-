# ⚡ Guia de Implementação no Replit - Progredire+

Este guia descreve como configurar e rodar o **Backend do Progredire+** utilizando a plataforma Replit. O Replit é ideal para este projeto pois oferece um ambiente Node.js pronto e um banco de dados PostgreSQL integrado sem a complexidade de configurar Docker.

---

## 1. Criando o Projeto (O Backend)

1.  Faça login no [Replit](https://replit.com).
2.  Clique em **"+ Create Repl"**.
3.  Procure pelo template **"Node.js"** (ou "NestJS" se disponível, mas Node.js puro nos dá mais controle inicial).
4.  Dê o título: `progredire-backend`.
5.  Clique em **"Create Repl"**.

---

## 2. Configurando as Dependências

Assim que o Repl abrir, você precisará definir o `package.json`.

1.  No painel de arquivos (à esquerda), abra o `package.json`.
2.  Substitua o conteúdo pelo seguinte (contendo as dependências da nossa stack):

```json
{
  "name": "progredire-backend",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.10.2",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^4.0.1",
    "@types/supertest": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "prisma": "^5.10.2",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

3.  No **Shell** (aba "Shell" na parte inferior ou direita), rode o comando para instalar tudo:
    ```bash
    npm install
    ```

---

## 3. Configurando o Banco de Dados (PostgreSQL)

O Replit tem um PostgreSQL integrado muito fácil de usar.

1.  No painel lateral esquerdo, procure pela ferramenta **PostgreSQL** (ícone de banco de dados). Se não estiver visível, clique em "Tools" e procure lá.
2.  Clique em **"Setup a database"** (ou similar).
3.  O Replit irá criar o banco e gerar automaticamente a variável de ambiente `DATABASE_URL`.
4.  **Verificação:** Vá na ferramenta **Secrets** (cadeado no menu lateral esquerdo). Você deverá ver uma chave `DATABASE_URL` já preenchida. Se não estiver lá, copie a "Connection URL" do painel do PostgreSQL e crie a secret manualmente.

---

## 4. Configurando Variáveis de Ambiente (Secrets)

Além do banco, precisamos das chaves da IA e do JWT.

1.  Abra a ferramenta **Secrets** (ícone de cadeado).
2.  Adicione as seguintes chaves:
    *   `API_KEY`: Sua chave da API do Google Gemini.
    *   `JWT_SECRET`: Uma string longa e aleatória (ex: `minha_senha_super_secreta_backend_replit`).
    *   `PORT`: Defina como `3000`.

---

## 5. Inicializando o Prisma

Agora precisamos criar a estrutura do banco de dados.

1.  No **Shell**, execute:
    ```bash
    npx prisma init
    ```
2.  Isso criará uma pasta `prisma/` com um arquivo `schema.prisma`.
3.  Abra `prisma/schema.prisma` e substitua todo o conteúdo pelo schema completo que está definido no arquivo `docs/BACKEND_IMPLEMENTATION_GUIDE.md` do nosso projeto (seção 2.2).
4.  Após colar o schema, volte ao **Shell** e execute a migração para criar as tabelas no banco do Replit:
    ```bash
    npx prisma migrate dev --name init
    ```
    *(Se der erro de conexão, verifique se a Secret `DATABASE_URL` está correta).*

---

## 6. Configurando a Inicialização do Replit

Para que o botão "Run" verde funcione corretamente, precisamos configurar o arquivo `.replit`.

1.  Abra (ou crie) o arquivo `.replit` na raiz.
2.  Certifique-se de que ele tenha o seguinte conteúdo:

```toml
run = "npm run start:dev"

[nix]
channel = "stable-23_05"
```

---

## 7. Desenvolvendo o Código

Agora o ambiente está pronto. Você deve criar a estrutura de pastas do NestJS dentro de `src/`:

*   `src/main.ts` (Ponto de entrada)
*   `src/app.module.ts`
*   `src/prisma/` (Módulo do Prisma)
*   `src/auth/` (Módulo de Autenticação)
*   Etc.

Siga o `BACKEND_IMPLEMENTATION_GUIDE.md` para criar os arquivos e a lógica.

**Dica:** Você pode criar os arquivos manualmente ou usar o Nest CLI no Shell:
```bash
npx nest generate module auth
npx nest generate controller auth
npx nest generate service auth
```

## 8. Rodando o Projeto

1.  Clique no botão **"Run"** (verde) no topo.
2.  O console deve mostrar o NestJS inicializando.
3.  O Replit abrirá uma aba "Webview" mostrando a aplicação rodando. A URL dessa aba (ex: `https://progredire-backend.seu-usuario.repl.co`) é a **Base URL** da sua API.
4.  Você usará essa URL para configurar o Frontend posteriormente.

---

## Resumo de Comandos Úteis no Shell do Replit

*   **Instalar pacotes:** `npm install <nome-pacote>`
*   **Rodar migração do banco:** `npx prisma migrate dev`
*   **Visualizar banco de dados (Prisma Studio):**
    *   No Replit, o Prisma Studio pode ser chato de abrir. É mais fácil usar a própria aba "PostgreSQL" do Replit para rodar queries SQL simples se precisar ver os dados.
