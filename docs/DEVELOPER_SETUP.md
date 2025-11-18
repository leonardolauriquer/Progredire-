# 🚀 Guia de Configuração para Desenvolvedores - Progredire+

Este guia detalha os passos para configurar o ambiente de desenvolvimento local e rodar a aplicação Progredire+ (frontend e backend).

---

## 1. Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados na sua máquina:

-   **Node.js:** Versão 18 ou superior.
-   **Docker** e **Docker Compose:** Para rodar o banco de dados PostgreSQL de forma isolada.
-   **Git:** Para controle de versão.
-   **NPM** ou **Yarn:** Gerenciador de pacotes do Node.js.
-   **NestJS CLI:** Opcional, mas recomendado (`npm install -g @nestjs/cli`).

---

## 2. Configuração do Backend

O backend é uma aplicação NestJS que centraliza a lógica de negócio e a comunicação com o banco de dados.

### Passo 1: Instalar Dependências

Navegue até o diretório do backend (ex: `progredire-backend/`). Se você estiver iniciando o projeto do zero com o CLI do NestJS, use o comando abaixo para instalar todas os componentes adicionais necessários:

```bash
# Instalação dos pacotes fundamentais para a stack do Progredire+
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config @nestjs/passport @nestjs/jwt prisma @prisma/client passport passport-jwt bcrypt class-validator class-transformer @google/genai
```

Se você estiver clonando um repositório existente com `package.json`, basta rodar:
```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório do backend, copiando o exemplo de `.env.example`. Preencha as variáveis necessárias:

```dotenv
# .env

# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/progredire?schema=public"

# Autenticação
JWT_SECRET="seu-segredo-super-secreto-para-jwt"

# API do Google Gemini
API_KEY="sua-chave-de-api-do-google-gemini"
```

**Importante:** A `DATABASE_URL` deve corresponder às credenciais definidas no `docker-compose.yml`.

### Passo 3: Iniciar o Banco de Dados

Com o Docker em execução, inicie o contêiner do PostgreSQL:

```bash
docker-compose up -d
```

### Passo 4: Rodar as Migrações do Banco de Dados

Com o banco de dados em execução, aplique o schema do Prisma para criar as tabelas:

```bash
npx prisma migrate dev
```

### Passo 5: Iniciar o Servidor de Desenvolvimento

Inicie o servidor do backend em modo de observação (`watch mode`):

```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`.

---

## 3. Configuração do Frontend

O frontend é uma aplicação React que consome a API do backend.

### Passo 1: Instalar Dependências

Navegue até o diretório do frontend (a raiz do projeto atual) e instale as dependências:

```bash
npm install
```
*(Nota: No protótipo atual, as dependências são carregadas via CDN, mas para um desenvolvimento full-stack, teríamos um `package.json`)*

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório do frontend com a URL da API do backend:

```dotenv
# .env

REACT_APP_API_URL=http://localhost:3000/api
```

### Passo 3: Iniciar o Servidor de Desenvolvimento

Inicie o servidor de desenvolvimento do React:

```bash
npm run dev
```
*(Nota: O protótipo atual não tem um `npm run dev`, ele roda diretamente. Em uma migração, este comando seria adicionado com uma ferramenta como Vite ou Create React App.)*

A aplicação frontend estará acessível em `http://localhost:5173` (ou outra porta definida pelo servidor de desenvolvimento).

---

## 4. Rodando os Testes

Para garantir a qualidade do código, execute os testes para ambas as partes da aplicação.

### Testes de Backend

```bash
# Rodar todos os testes unitários e de integração
npm run test

# Rodar testes em watch mode
npm run test:watch
```

### Testes de Frontend

```bash
# Rodar testes unitários e de componentes
npm run test

# Rodar testes de ponta a ponta (E2E) com Cypress
npm run cypress:open
```

---

## 5. Fluxo de Contribuição

Para contribuir com o projeto, siga este fluxo simples:

1.  **Crie uma Branch:** A partir da branch `develop`, crie uma nova branch para sua feature ou correção (ex: `feature/login-jwt` ou `fix/dashboard-bug`).
2.  **Desenvolva:** Implemente suas alterações e adicione os testes necessários.
3.  **Commit:** Faça commits atômicos e com mensagens claras.
4.  **Abra um Pull Request (PR):** Envie seu PR para a branch `develop`.
5.  **Revisão de Código:** Aguarde a revisão de pelo menos um outro membro da equipe.
6.  **Merge:** Após a aprovação e a passagem de todos os testes de CI, seu PR será mesclado.
