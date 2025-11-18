# Guia de Implementação do Backend - Progredire+

## 1. Visão Geral e Arquitetura

Este documento descreve a implementação completa do servidor backend para a aplicação Progredire+. O backend é a espinha dorsal do sistema, com quatro responsabilidades críticas:

1.  **Persistência de Dados:** Salvar e recuperar de forma segura todos os dados da aplicação, como usuários, empresas, respostas de questionários, planos de ação, etc.
2.  **Lógica de Negócio Centralizada:** Realizar todos os cálculos, agregações e análises de dados. **Toda a lógica de cálculo atualmente simulada no frontend deve ser movida para o backend**. Isso garante consistência, performance e segurança.
3.  **Proxy Seguro para a API Gemini:** Servir como o único ponto de contato entre a aplicação e a API do Google Gemini, protegendo a chave de API e gerenciando todas as chamadas. O frontend **nunca** deve se comunicar diretamente com a API da IA.
4.  **Multi-Tenancy e Autorização:** Gerenciar múltiplos clientes (empresas) de forma isolada e segura. O sistema deve garantir que os dados de uma empresa só possam ser acessados por seus próprios usuários ou por administradores da equipe Staff.

### 1.1. Conceitos Fundamentais

-   **Multi-Tenancy:** O sistema é projetado para servir múltiplas empresas. Cada recurso principal (usuário, resposta de pesquisa, plano de ação) deve estar estritamente associado a uma `Company`.
-   **Autorização por Papel (Role-Based Access Control - RBAC):**
    -   **STAFF:** Superusuários. Podem gerenciar empresas, usuários e aprovar campanhas. Através do "acesso delegado", podem visualizar a plataforma como se fossem um usuário de uma empresa específica.
    -   **COMPANY:** Usuários de gestão (RH/líderes). Acessam apenas os dados agregados e as ferramentas de gestão da **sua própria empresa**.
    -   **COLLABORATOR:** Usuários finais. Acessam apenas suas próprias ferramentas individuais (reflexão, diário, respostas) e não têm acesso a dados de outros usuários.
-   **Escala Likert e Normalização:** As respostas do questionário (1-5) devem ser normalizadas para uma escala consistente de 0-100 para análise, usando a fórmula: `PontuaçãoNormalizada = ((PontuaçãoMédia - 1) / 4) * 100`.
-   **IRP (Índice de Risco Psicossocial):** Métrica global de saúde (1-5), calculada a partir da média das pontuações normalizadas e convertida de volta para a escala de 1-5: `IRP = (MédiaDasPontuaçõesNormalizadas / 100) * 4 + 1`.

### 1.2. Stack Tecnológica e Componentes (NestJS)

Para garantir robustez, escalabilidade e tipagem estática em todo o projeto, a stack definida é **Node.js com NestJS**.

-   **Linguagem:** **TypeScript**.
-   **Framework:** **NestJS**.
-   **Banco de Dados:** **PostgreSQL**.
-   **ORM:** **Prisma**.

**Componentes e Bibliotecas Essenciais (Pacotes NPM):**

Ao inicializar o projeto, os seguintes pacotes devem ser instalados para cobrir os requisitos funcionais:

1.  **Core e Banco de Dados:**
    *   `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config` (Base do framework)
    *   `prisma`, `@prisma/client` (ORM e Client do DB)

2.  **Autenticação e Segurança:**
    *   `@nestjs/passport`, `passport`, `passport-jwt` (Estratégias de Auth)
    *   `@nestjs/jwt` (Geração e validação de tokens)
    *   `bcrypt` (Hash seguro de senhas)
    *   `helmet` (Headers de segurança HTTP)

3.  **Validação e Transformação de Dados:**
    *   `class-validator` (Validação baseada em decorators para DTOs)
    *   `class-transformer` (Transformação de objetos/JSON)

4.  **Inteligência Artificial:**
    *   `@google/genai` (SDK oficial do Google Gemini para Node.js)

---

## 2. Estrutura do Banco de Dados

Esta seção detalha a arquitetura completa do nosso banco de dados PostgreSQL. A definição do schema é feita usando a sintaxe do **Prisma**, que servirá como a "fonte da verdade" para a estrutura das tabelas. O Prisma usará este schema para gerar automaticamente as migrações do banco de dados e criar um cliente type-safe para interagir com os dados.

### 2.1. Principais Relações e Design

A arquitetura do banco de dados é projetada em torno de alguns conceitos-chave para garantir segurança, isolamento de dados e escalabilidade:

-   **Multi-Tenancy (Multi-Cliente):** O pilar do nosso design. O modelo `Company` é a entidade central. Praticamente todos os outros modelos de dados (como `User`, `SurveyResponse`, `Campaign`, `ActionPlan`, etc.) possuem uma relação obrigatória com a `Company` através de um campo `companyId`. Isso garante que os dados de cada cliente fiquem estritamente isolados no nível do banco de dados. Qualquer consulta para um usuário que não seja `STAFF` **deve** ser filtrada por este `companyId`.

-   **Modelo de Usuário Unificado:** O modelo `User` gerencia todos os tipos de usuários (`STAFF`, `COMPANY`, `COLLABORATOR`) através de um campo `enum Role`. Isso simplifica a autenticação. O `companyId` é nulo para usuários `STAFF`, que têm acesso global, e obrigatório para os outros, vinculando-os a um cliente específico.

-   **Respostas e Campanhas:** Cada `SurveyResponse` (resposta individual a um questionário) está ligada a um `User` (quem respondeu), a uma `Company` (a qual empresa pertence) e a uma `Campaign` (qual pesquisa foi respondida). Isso permite uma rastreabilidade completa para fins de agregação de dados.

-   **Flexibilidade com JSON:** Campos como `answers` em `SurveyResponse` e `planData` em `ActionPlan` são do tipo `Json`. Isso nos dá flexibilidade para armazenar estruturas de dados complexas e variáveis sem precisar alterar o schema do banco de dados, o que é ideal para os resultados gerados pela IA ou para os diferentes formatos de questionário.

### 2.2. Schema Prisma Completo

O schema a seguir define a estrutura detalhada de cada tabela, seus campos, tipos de dados e relacionamentos.

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
  passwordHash      String?   // Obrigatório para STAFF e COMPANY. Para COLLABORATOR, pode ser derivado (ex: CPF).
  role              Role
  cpf               String?   @unique // Obrigatório para COLLABORATOR
  
  company           Company?  @relation(fields: [companyId], references: [id])
  companyId         String?   // Nulo para STAFF, obrigatório para COMPANY e COLLABORATOR

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


// Armazena a resposta bruta de um colaborador a um questionário
model SurveyResponse {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  answers         Json     // Ex: { "q1": "Concordo totalmente", ... }
  segmentation    Json     // Ex: { "setor": "Engenharia", "cargo": "Desenvolvedor" }
  
  user            User     @relation(fields: [userId], references: [id])
  userId          String

  company         Company  @relation(fields: [companyId], references: [id])
  companyId       String

  campaign        Campaign @relation(fields: [campaignId], references: [id])
  campaignId      String
}

// Armazena uma campanha de pesquisa
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
  filters         Json     // Filtros de segmentação para o público

  company         Company  @relation(fields: [companyId], references: [id])
  companyId       String

  surveyResponses SurveyResponse[]

  createdAt       DateTime @default(now())
}

// Armazena o histórico de evolução de um colaborador
model CollaboratorEvolutionEntry {
  id            String   @id @default(cuid())
  timestamp     DateTime @default(now())
  scores        Json     // Ex: { "d1_carga": 75, "d2_demandas": 60, ... }
  generalScore  Float
  
  userId        String
}

// Armazena um plano de ação criado pela empresa
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
  status        String      // "A Fazer", "Em Andamento", "Concluído"
  
  plan          ActionPlan  @relation(fields: [planId], references: [id])
  planId        String
}

// Armazena uma iniciativa publicada
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

// Armazena entradas do diário de um colaborador
model JournalEntry {
  id        String   @id @default(cuid())
  date      DateTime @default(now())
  feeling   String
  emoji     String
  note      String?

  user      User     @relation(fields: [userId], references: [id])
  userId    String
}

// Armazena documentos de segurança
model Document {
  id           String   @id @default(cuid())
  name         String
  category     String
  uploadDate   DateTime @default(now())
  expiryDate   DateTime
  filePath     String   // Caminho para o arquivo no storage (ex: S3)

  company      Company  @relation(fields: [companyId], references: [id])
  companyId    String
  
  branch       Branch   @relation(fields: [branchId], references: [id])
  branchId     String
}
```

---

## 3. Contrato da API (Endpoints)

Todos os endpoints são prefixados com `/api` e exigem um token JWT no header `Authorization: Bearer <token>`, exceto `/auth/login`.

### 3.1. Autenticação (`/auth`)

-   **`POST /auth/login`**
    -   **Descrição:** Autentica um usuário e retorna um token.
    -   **Body:**
        -   Para Staff: `{ "role": "staff", "email": "...", "password": "..." }`
        -   Para Empresa: `{ "role": "company", "email": "...", "password": "..." }`
        -   Para Colaborador: `{ "role": "collaborator", "cpf": "...", "password": "..." }`
    -   **Resposta (200 OK):** `{ "token": "jwt_token", "role": "..." }`
    -   **Lógica:**
        -   Valide as credenciais com base no `role`.
        -   Para `staff`, valide email/senha na tabela de `User`.
        -   Para `company`, valide email/senha na tabela de `User` com `role=COMPANY`.
        -   Para `collaborator`, valide cpf/senha na tabela de `User` com `role=COLLABORATOR`.
        -   Gere um JWT contendo `userId`, `role`, e `companyId` (se aplicável).

-   **`POST /auth/impersonate`**
    -   **Autorização:** `staff`
    -   **Descrição:** Gera um novo token para simular o acesso como um usuário de cliente.
    -   **Body:** `{ "role": "company" | "collaborator", "companyId": "..." }`
    -   **Resposta (200 OK):** `{ "token": "impersonation_jwt_token", "role": "..." }`
    -   **Lógica:** Crie um novo JWT com o `role` e `companyId` solicitados, mas inclua um claim `originalUserId` para rastrear a origem da personificação.

### 3.2. Dados do Colaborador (Escopo: `collaborator`)

-   **`POST /surveys/responses`**: Submete respostas de um questionário. O backend deve associar a `companyId` do usuário do token.
-   **`GET /evolution/collaborator`**: Retorna o histórico de evolução do `userId` do token.
-   **`GET /journal`**, **`POST /journal`**: Operações CRUD para o diário do `userId` do token.
-   **`GET /initiatives`**: Lista as iniciativas publicadas para a `companyId` do usuário.
-   **`POST /initiatives/:id/support`**: Registra apoio a uma iniciativa.

### 3.3. Dados da Empresa (Escopo: `company`)

Todos estes endpoints devem validar que o `companyId` no JWT do usuário corresponde ao `companyId` dos recursos que estão sendo acessados.

-   **`GET /dashboard`**: Idêntico ao guia anterior, mas a consulta deve ser **estritamente filtrada** pela `companyId` do usuário.
-   **`GET /evolution/company`**: Idem, a consulta deve ser limitada à `companyId` do usuário.
-   **`GET /campaigns`**, **`POST /campaigns`**: CRUD para campanhas da `companyId` do usuário. `POST` cria com status `Pendente`.
-   **`GET /action-plans/history`**, **`POST /action-plans`**, etc.: CRUD para planos de ação da `companyId` do usuário.
-   **`GET /documentation`**: Lista os documentos da `companyId` do usuário.

### 3.4. Gestão de Staff (Escopo: `staff`)

Estes endpoints são para o painel de Staff e exigem o role `STAFF`.

-   **`PATCH /staff/campaigns/:id/approve`**
    -   **Descrição:** Aprova uma campanha pendente.
    -   **Lógica:** Muda o status da campanha para "Agendada" ou "Em Andamento" com base na data de início.

-   **CRUD de Empresas:** `GET`, `POST`, `DELETE /staff/companies/:id`
-   **CRUD de Filiais:** `GET /staff/companies/:companyId/branches`, `POST`, `DELETE /staff/branches/:id`
-   **CRUD de Usuários da Empresa:** `GET /staff/company-users?page=1&limit=10&search=...`, `POST`, `DELETE /staff/company-users/:id`
-   **CRUD de Colaboradores:** `GET /staff/employees?page=1&limit=10&search=...`, `POST`, `DELETE /staff/employees/:id`
-   **CRUD de Documentos:** `GET /staff/documents?companyId=...`, `POST` (com upload de arquivo), `DELETE /staff/documents/:id`

-   **Importação de Dados em Massa:**
    -   **`POST /staff/import/companies`**: Importa empresas de um arquivo XLS.
    -   **`POST /staff/import/branches`**: Importa filiais para uma empresa de um XLS.
    -   **`POST /staff/import/company-users`**: Importa usuários da empresa de um XLS.
    -   **`POST /staff/import/employees`**: Importa colaboradores de um XLS.
    -   **`POST /staff/import/survey-responses`**: Importa respostas de diagnóstico de um XLS para uma empresa.
    -   **`POST /staff/import/historical-indicators`**: Importa dados históricos para uma empresa.
    -   **`POST /staff/import/leave-events`**: Importa eventos de afastamento para uma filial/empresa.
    -   **`POST /staff/import/leadership-data`**: Importa KPIs de liderança para uma empresa.
    -   **`POST /staff/import/financial-data`**: Importa dados demográficos/financeiros para uma empresa.

### 3.5. Proxy Seguro para API Gemini (`/ai`)

Estes endpoints continuam como antes, mas devem ser protegidos por autenticação (`company` ou `collaborator`, dependendo do caso de uso). A lógica permanece a mesma: o backend adiciona a `API_KEY` e chama o Gemini.

-   **`POST /ai/analysis`** (Reflexão Pessoal)
-   **`POST /ai/dashboard-insight`**
-   **`POST /ai/evolution-insight`**
-   **`POST /ai/action-plan-suggestion`**
-   **`POST /ai/assistant`** (Chat do Assistente)
    -   **Lógica de Tool Calling:** Quando a IA chama `queryRiskFactors`, o backend deve executar a consulta no banco de dados, **filtrando pela `companyId` do usuário que iniciou o chat**.

---
## 4. Considerações Finais

-   **Validação:** Valide rigorosamente os dados de entrada (DTOs) em todos os endpoints, especialmente nos de Staff.
-   **Tratamento de Erros:** Use códigos de status HTTP apropriados e retorne mensagens de erro claras.
-   **Segurança:**
    -   **Autorização:** A lógica de cada endpoint **deve** verificar o `role` do usuário e, para usuários `COMPANY` e `COLLABORATOR`, garantir que todas as consultas ao banco de dados incluam uma cláusula `WHERE companyId = ?`.
    -   **Gerenciamento de Segredos:** A `API_KEY` do Gemini, o segredo do JWT e a `DATABASE_URL` devem ser gerenciados como variáveis de ambiente.
