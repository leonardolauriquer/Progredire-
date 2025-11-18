# Guia de Implementação do Backend - Progredire+

## 1. Visão Geral e Arquitetura

Este documento descreve a implementação completa do servidor backend para a aplicação Progredire+. O backend é a espinha dorsal do sistema, responsável por persistência, lógica, segurança e integração com IA.

**Nota sobre Infraestrutura:** Este guia assume o uso da stack Node.js + NestJS + Prisma + PostgreSQL. Embora possa ser implementado em qualquer servidor, estamos priorizando o **Replit** como ambiente de execução.

### 1.1. Conceitos Fundamentais

-   **Multi-Tenancy:** Isolamento de dados por `companyId` em todas as tabelas relevantes.
-   **RBAC (Role-Based Access Control):** Papéis `STAFF`, `COMPANY`, `COLLABORATOR`.
-   **Proxy de IA:** O backend protege a `API_KEY` do Gemini.

### 1.2. Stack Tecnológica (NestJS)

-   **Linguagem:** TypeScript
-   **Framework:** NestJS
-   **ORM:** Prisma
-   **Banco:** PostgreSQL (Fornecido pelo Replit ou Docker local)

**Componentes e Bibliotecas Essenciais:**

```bash
# Comandos de instalação (já inclusos no REPLIT_GUIDE.md)
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config @nestjs/passport @nestjs/jwt prisma @prisma/client passport passport-jwt bcrypt class-validator class-transformer @google/genai
```

---

## 2. Configuração de Ambiente e Banco de Dados

### 2.1. Variáveis de Ambiente

No **Replit**, estas variáveis devem ser configuradas na aba **Secrets** (cadeado). Em ambiente local, use um arquivo `.env`.

-   `DATABASE_URL`: String de conexão com o PostgreSQL. (No Replit, é gerada automaticamente ao adicionar o Postgres).
-   `JWT_SECRET`: Segredo para assinar tokens.
-   `API_KEY`: Chave da API do Google Gemini.

### 2.2. Schema do Banco de Dados (Prisma)

Este schema é a fonte da verdade. Copie este conteúdo para `prisma/schema.prisma` no seu projeto backend.

```prisma
// file: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STAFF
  COMPANY
  COLLABORATOR
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String
  passwordHash      String?   // Obrigatório para STAFF e COMPANY.
  role              Role
  cpf               String?   @unique // Obrigatório para COLLABORATOR
  
  company           Company?  @relation(fields: [companyId], references: [id])
  companyId         String?   // Nulo para STAFF

  surveyResponses   SurveyResponse[]
  journalEntries    JournalEntry[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Company {
  id                  String    @id @default(cuid())
  name                String    // Nome Fantasia
  razaoSocial         String
  cnpj                String    @unique
  setor               String
  numColaboradores    Int
  
  contatoPrincipalNome  String
  contatoPrincipalEmail String

  users               User[]
  branches            Branch[]
  documents           Document[]
  campaigns           Campaign[]
  surveyResponses     SurveyResponse[]
  actionPlans         ActionPlan[]
  initiatives         Initiative[]

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model Branch {
  id            String      @id @default(cuid())
  name          String
  
  addressLogradouro String
  addressNumero     String
  addressBairro     String
  addressCidade     String
  addressEstado     String
  addressCep        String

  company       Company     @relation(fields: [companyId], references: [id])
  companyId     String

  documents     Document[]
}

model SurveyResponse {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  answers         Json     // Ex: { "q1": "Concordo totalmente" }
  segmentation    Json     // Ex: { "setor": "Engenharia" }
  
  user            User     @relation(fields: [userId], references: [id])
  userId          String

  company         Company  @relation(fields: [companyId], references: [id])
  companyId       String

  campaign        Campaign @relation(fields: [campaignId], references: [id])
  campaignId      String
}

model Campaign {
  id              String   @id @default(cuid())
  name            String
  description     String
  status          String   // "Pendente", "Agendada", "Em Andamento", "Concluída"
  targetAudience  String
  adherence       Float    @default(0)
  startDate       DateTime
  endDate         DateTime
  emailMessage    String
  filters         Json     // Filtros de segmentação

  company         Company  @relation(fields: [companyId], references: [id])
  companyId       String

  surveyResponses SurveyResponse[]

  createdAt       DateTime @default(now())
}

model CollaboratorEvolutionEntry {
  id            String   @id @default(cuid())
  timestamp     DateTime @default(now())
  scores        Json
  generalScore  Float
  userId        String
}

model ActionPlan {
  id          String      @id @default(cuid())
  createdAt   DateTime    @default(now())
  factor      String
  segment     String
  progress    Float
  planData    Json

  company     Company     @relation(fields: [companyId], references: [id])
  companyId   String

  actions     ActionItem[]
}

model ActionItem {
  id            String      @id @default(cuid())
  title         String
  description   String?
  responsible   String?
  dueDate       DateTime?
  status        String
  
  plan          ActionPlan  @relation(fields: [planId], references: [id])
  planId        String
}

model Initiative {
  id             String    @id @default(cuid())
  publishedDate  DateTime  @default(now())
  factor         String
  segment        String
  objective      String
  announcement   String
  actions        Json
  status         String
  supportCount   Int       @default(0)

  company        Company   @relation(fields: [companyId], references: [id])
  companyId      String
}

model JournalEntry {
  id        String   @id @default(cuid())
  date      DateTime @default(now())
  feeling   String
  emoji     String
  note      String?

  user      User     @relation(fields: [userId], references: [id])
  userId    String
}

model Document {
  id           String   @id @default(cuid())
  name         String
  category     String
  uploadDate   DateTime @default(now())
  expiryDate   DateTime
  filePath     String   // Caminho no storage

  company      Company  @relation(fields: [companyId], references: [id])
  companyId    String
  
  branch       Branch   @relation(fields: [branchId], references: [id])
  branchId     String
}
```

---

## 3. Contrato da API (Endpoints)

Os endpoints devem ser prefixados com `/api`.

### 3.1. Autenticação (`/auth`)
*   `POST /auth/login`: Retorna JWT baseado em Role.
*   `POST /auth/impersonate`: (Staff Only) Retorna token de personificação.

### 3.2. Endpoints Principais
*   **Empresa:** `GET /dashboard`, `GET /campaigns`, `POST /campaigns`, `GET /action-plans`. (Sempre filtrados por `req.user.companyId`).
*   **Colaborador:** `POST /surveys/responses`, `GET /evolution`, `POST /journal`.
*   **Staff:** `GET/POST/DELETE` para `/staff/companies`, `/staff/users`, `/staff/campaigns/approve`.

### 3.3. IA (`/ai`)
*   `POST /ai/dashboard-insight`: Recebe dados JSON, injeta `API_KEY` no backend, chama Gemini, retorna análise.
*   `POST /ai/assistant`: Chat com tool-calling para consultar o banco de dados.

---

## 4. Segurança

*   Use `bcrypt` para hashear senhas antes de salvar.
*   Valide todos os DTOs de entrada com `class-validator`.
*   **CRÍTICO:** Em endpoints de Empresa e Colaborador, use o `companyId` do token JWT na cláusula `where` do Prisma para garantir isolamento de dados.