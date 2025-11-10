# Guia de Implementação do Backend - Progredire+

## 1. Visão Geral e Arquitetura

Este documento descreve a implementação completa do servidor backend para a aplicação Progredire+. O backend é a espinha dorsal do sistema, com três responsabilidades críticas:

1.  **Persistência de Dados:** Salvar e recuperar de forma segura todos os dados da aplicação, como usuários, respostas de questionários, planos de ação, etc.
2.  **Lógica de Negócio Centralizada:** Realizar todos os cálculos, agregações e análises de dados. **Toda a lógica de cálculo atualmente simulada no frontend deve ser movida para o backend**. Isso garante consistência, performance e segurança.
3.  **Proxy Seguro para a API Gemini:** Servir como o único ponto de contato entre a aplicação e a API do Google Gemini, protegendo a chave de API e gerenciando todas as chamadas. O frontend **nunca** deve se comunicar diretamente com a API da IA.

### 1.1. Conceitos Fundamentais

-   **Dimensões/Fatores de Risco:** As 11 categorias de risco psicossocial avaliadas (Carga de Trabalho, Liderança, etc.), definidas no objeto `dimensions` do frontend.
-   **Escala Likert:** As respostas do questionário seguem uma escala de 5 pontos, que deve ser convertida para valores numéricos no backend (`Discordo totalmente` = 1, `Concordo totalmente` = 5).
-   **Pontuação Normalizada (0-100):** Para consistência nos dashboards, a pontuação média de uma dimensão (que varia de 1 a 5) deve ser normalizada para uma escala de 0 a 100 usando a fórmula: `PontuaçãoNormalizada = ((PontuaçãoMédia - 1) / 4) * 100`.
-   **IRP (Índice de Risco Psicossocial):** Uma métrica global (de 1 a 5) que representa a saúde psicossocial geral de um grupo. É calculado a partir da média das pontuações normalizadas de todas as dimensões, e então convertido de volta para a escala de 1 a 5: `IRP = (MédiaDasPontuaçõesNormalizadas / 100) * 4 + 1`.

### 1.2. Tecnologias Sugeridas

-   **Runtime:** Node.js (v18+)
-   **Framework:** NestJS (preferencialmente, pela arquitetura modular) ou Express.js com TypeScript.
-   **Banco de Dados:** PostgreSQL
-   **ORM:** Prisma
-   **Autenticação:** JWT (JSON Web Tokens)

---

## 2. Modelos de Dados (Schema Prisma)

O schema a seguir define a estrutura do banco de dados, projetada para suportar todas as funcionalidades da aplicação.

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
  COMPANY
  COLLABORATOR
}

model User {
  id                String    @id @default(cuid())
  role              Role
  // Relações com outros modelos
  surveyResponses   SurveyResponse[]
  journalEntries    JournalEntry[]
}

// Armazena a resposta bruta de um colaborador a um questionário
model SurveyResponse {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  answers         Json     // Ex: { "q1": "Concordo totalmente", "q2": "Neutro", ... }
  segmentation    Json     // Ex: { "empresa": "TechCorp", "setor": "Engenharia", ... }
  user            User     @relation(fields: [userId], references: [id])
  userId          String
}

// Armazena os resultados calculados de uma SurveyResponse para análise de evolução
model CollaboratorEvolutionEntry {
  id            String   @id @default(cuid())
  timestamp     DateTime @default(now())
  scores        Json     // Ex: { "d1_carga": 75, "d2_demandas": 60, ... }
  generalScore  Float    // Média das pontuações em 'scores'
  userId        String
}

// Armazena um plano de ação criado pela empresa
model ActionPlan {
  id          String      @id @default(cuid())
  createdAt   DateTime    @default(now())
  factor      String      // Nome do fator de risco, ex: "Organização e Carga de Trabalho"
  segment     String      // Descrição do público-alvo, ex: "Setor: Engenharia"
  progress    Float       // Progresso geral (0-100), calculado a partir das ActionItems
  planData    Json        // Armazena o JSON completo do plano gerado pela IA
  actions     ActionItem[]
}

// Armazena uma ação específica dentro de um ActionPlan
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

// Armazena uma iniciativa publicada para os colaboradores verem
model Initiative {
  id             String    @id @default(cuid())
  publishedDate  DateTime  @default(now())
  factor         String
  segment        String
  objective      String
  announcement   String
  actions        Json      // Lista de ações no formato { title, description }
  status         String    // "Em Andamento", "Concluído"
  supportCount   Int       @default(0)
}

// Armazena as entradas do diário de um colaborador
model JournalEntry {
  id        String   @id @default(cuid())
  date      DateTime @default(now())
  feeling   String
  emoji     String
  note      String?
  user      User     @relation(fields: [userId], references: [id])
  userId    String
}
```

---

## 3. Contrato da API (Endpoints)

Todos os endpoints devem ser prefixados com `/api`. A autenticação via Header `Authorization: Bearer <token>` é necessária para todos os endpoints, exceto `/auth/login`.

### 3.1. Autenticação (`/auth`)

-   **`POST /auth/login`**
    -   **Descrição:** Autentica um usuário e retorna um token JWT.
    -   **Body:** `{ "role": "company" | "collaborator" }`
    -   **Resposta (200 OK):** `{ "token": "jwt_token", "role": "..." }`
    -   **Lógica:** Para esta simulação, crie ou encontre um usuário mock com o `role` solicitado, gere um JWT contendo o `userId` e o `role`, e retorne-o.

### 3.2. Questionários e Dados do Colaborador

-   **`POST /surveys/responses`**
    -   **Autorização:** `collaborator`
    -   **Descrição:** Submete as respostas de um colaborador ao questionário psicossocial.
    -   **Body:** `{ "answers": { "q1": "Concordo", ... }, "segmentation": { ... } }`
    -   **Resposta (201 Created):** `{ "message": "Respostas salvas com sucesso." }`
    -   **Lógica Backend:**
        1.  Salvar a resposta bruta na tabela `SurveyResponse`, associada ao `userId` do token.
        2.  **Calcular os scores:** Iterar sobre as 11 dimensões. Para cada uma, calcular a pontuação média (1-5) com base nas respostas e normalizá-la para 0-100.
        3.  Calcular o `generalScore` (média de todas as pontuações de dimensão).
        4.  Criar e salvar uma nova entrada na tabela `CollaboratorEvolutionEntry` com os scores calculados.

-   **`GET /evolution/collaborator`**
    -   **Autorização:** `collaborator`
    -   **Descrição:** Retorna o histórico de evolução de um colaborador.
    -   **Resposta (200 OK):** `CollaboratorEvolutionEntry[]`
    -   **Lógica Backend:** Buscar todas as `CollaboratorEvolutionEntry` para o `userId` do token, ordenadas por `timestamp`.

-   **`GET /journal`** e **`POST /journal`**
    -   **Autorização:** `collaborator`
    -   **Descrição:** Operações CRUD para o diário de emoções do colaborador. Devem ser associadas ao `userId` do token.

### 3.3. Dados da Empresa (Dashboard, Evolução, Campanhas)

-   **`GET /dashboard`**
    -   **Autorização:** `company`
    -   **Descrição:** Endpoint central que fornece todos os dados calculados para o Dashboard Executivo.
    -   **Query Params:** `?empresa=...&diretoria=...&setor=...&cargo=...`
    -   **Resposta (200 OK):** Um objeto JSON idêntico à interface `DashboardData` de `services/dataService.ts`.
    -   **Lógica Backend (essencial):**
        1.  Filtre as `SurveyResponse` com base nos query params. Se nenhum filtro for aplicado, use todas as respostas.
        2.  **Cálculo dos Scores das Dimensões:** Execute a lógica de `calculateDataForResponses` para o grupo filtrado.
        3.  **Cálculo dos KPIs Principais:**
            -   `riskFactors`: Scores das 11 dimensões para o grupo filtrado.
            -   `companyAverageFactors`: Calcule os mesmos scores, mas usando **todas** as respostas (sem filtros) para comparação.
            -   `geralScore` e `irpGlobal`: Calcule com base nos `riskFactors` do grupo filtrado.
            -   `topRisks` / `topProtections`: Ordene os `riskFactors` para encontrar os 3 menores e 3 maiores scores.
            -   `participationRate`: `(respostasFiltradas.length / totalDeColaboradores) * 100`. O total de colaboradores pode ser um valor fixo ou `COUNT` da tabela `User` com `role=COLLABORATOR`.
            -   `maturityLevel`: Implemente a lógica de `getMaturityLevel` baseada na distribuição de risco dos fatores.
            -   **KPIs Financeiros e de RH:** Implemente as fórmulas de `absenteeismRate`, `presenteeismRate`, `estimatedSavings`, etc., que estão atualmente no `dataService.ts`. Estes são cruciais para o valor percebido do dashboard.
        4.  **Cálculo dos Dados para Gráficos:**
            -   `distributions`: Para cada dimensão, conte o número de ocorrências de cada opção Likert nas respostas filtradas.
            -   `climateTrend`: Agrupe **todas** as respostas por mês/ano e calcule o IRP médio para cada período para montar a série histórica.
            -   `sectorRiskDistribution`: Itere sobre cada setor único, calcule o IRP para aquele setor e categorize-o como risco 'alto', 'moderado' ou 'baixo'. Retorne as porcentagens de cada categoria.
            -   `crossAnalysis`: Calcule os dados para todos os gráficos de análise cruzada. Isso pode envolver consultas mais complexas, unindo dados de planos de ação arquivados e respostas de pesquisas.

-   **`GET /evolution/company`**
    -   **Autorização:** `company`
    -   **Descrição:** Fornece dados para o gráfico de evolução comparativo.
    -   **Query Params:** `?periodRange=...&sectors=...&factorId=...` (ex: `sectors=Engenharia,Marketing`)
    -   **Resposta (200 OK):** `MultiLineChartData` (interface de `CompanyEvolutionView.tsx`).
    -   **Lógica Backend:** Implemente a lógica de `calculateMultiSectorEvolution`, filtrando respostas por data e setor, agrupando por mês e calculando os scores para o `factorId` especificado.

-   **`GET /campaigns`**, **`POST /campaigns`**, etc.
    -   **Autorização:** `company`
    -   **Descrição:** CRUD completo para gerenciar Campanhas. O `POST` cria uma campanha com status `Pendente`.
    -   **Lógica Adicional:** O backend deve ter um mecanismo (talvez um endpoint de "aprovação" ou um job agendado) para mudar o status de `Pendente` para `Agendada` ou `Em Andamento`.

-   **`GET /action-plans/history`**, **`POST /action-plans`**, **`PATCH /action-plans/:id`**
    -   **Autorização:** `company`
    -   **Descrição:** CRUD para salvar e gerenciar `ActionPlan` e seus `ActionItem`. O `POST` arquiva um novo plano. O `PATCH` deve permitir a atualização do status de uma `ActionItem`.

-   **`GET /initiatives`**, **`POST /initiatives`**, **`POST /initiatives/:id/support`**
    -   **Autorização:** `company` para `POST /initiatives`, `collaborator` para `POST /initiatives/:id/support`, ambos para `GET`.
    -   **Descrição:** Gerencia o mural público de iniciativas. `POST /initiatives` converte um `ActionPlan` em uma `Initiative` pública.

### 3.7. Proxy Seguro para API Gemini (`/ai`)

Estes endpoints são essenciais para proteger sua `API_KEY`. Eles recebem uma solicitação do frontend, adicionam a chave de API e as instruções de sistema, chamam a API do Google Gemini e retornam a resposta.

-   **`POST /ai/analysis`** (Reflexão Pessoal)
    -   **Body:** `{ "userInput": "..." }`
    -   **Resposta:** `{ "result": "Texto da IA" }`
    -   **Lógica:** Chamar a API Gemini com o `userInput` e a instrução de sistema `systemInstruction`.

-   **`POST /ai/dashboard-insight`**
    -   **Body:** `{ "dashboardData": "String com dados formatados" }`
    -   **Resposta:** `AiInsightData` (JSON)
    -   **Lógica:** Chamar a API Gemini com os dados, a instrução `systemInstructionDashboard` e o `responseSchema` para garantir a saída em JSON.

-   **`POST /ai/evolution-insight`**
    -   **Body:** `{ "evolutionData": "String com dados formatados" }`
    -   **Resposta:** `EvolutionInsightData` (JSON)
    -   **Lógica:** Chamar a API Gemini com os dados, a instrução `systemInstructionEvolution` e o schema de resposta.

-   **`POST /ai/action-plan-suggestion`**
    -   **Body:** `{ "factorName": "...", "segmentDescription": "..." }`
    -   **Resposta:** `GeneratedPlan` (JSON)
    -   **Lógica:** Chamar a API Gemini com os dados, a instrução `systemInstructionActionPlan` e o schema de resposta.

-   **`POST /ai/assistant`** (Chat do Assistente)
    -   **Body:** `{ "message": "...", "sessionId": "..." }`
    -   **Resposta:** `{ "response": "Texto da IA" }`
    -   **Lógica:**
        1.  Gerencie sessões de chat no backend (um mapa de `sessionId` para uma instância de `Chat`).
        2.  Receba a mensagem e use a sessão correspondente.
        3.  **Tool Calling:** Se a IA retornar uma chamada de função (`functionCall`) para `queryRiskFactors`:
            a. Pause a interação com a IA.
            b. Execute a lógica da função `queryRiskFactors` **no seu próprio banco de dados**, usando os filtros fornecidos pela IA.
            c. Formate o resultado em um `toolResponse`.
            d. Envie o `toolResponse` de volta para a IA na mesma sessão de chat.
        4.  Retorne a resposta final em texto para o frontend.

---
## 4. Considerações Finais e Boas Práticas

### 4.1. Validação
-   **Validação de Entrada:** Utilize bibliotecas como `class-validator` (com NestJS) ou `zod` para validar todos os `body`, `query params` e `route params` em todos os endpoints. Isso previne dados malformados de alcançarem sua lógica de negócio ou banco de dados.

### 4.2. Tratamento de Erros (Error Handling)
-   **Estrutura de Erro Padrão:** Padronize as respostas de erro em um formato JSON consistente para facilitar o tratamento no frontend. Exemplo: `{ "statusCode": 404, "message": "Recurso não encontrado", "error": "Not Found" }`.
-   **Códigos de Status HTTP:** Use os códigos HTTP semanticamente corretos:
    -   `400 Bad Request`: Falha na validação dos dados de entrada.
    -   `401 Unauthorized`: Token JWT ausente ou inválido.
    -   `403 Forbidden`: O usuário (token válido) não tem permissão (`role`) para acessar o recurso.
    -   `404 Not Found`: Recurso não encontrado.
    -   `500 Internal Server Error`: Erros inesperados no servidor, incluindo falhas ao chamar a API Gemini. Não exponha detalhes sensíveis do erro ao cliente; registre-os em logs.

### 4.3. Performance
-   **Consultas Otimizadas:** Use o poder do Prisma para criar consultas eficientes. Utilize `select` para buscar apenas os campos necessários e evite o problema "N+1" com o uso de `include` ou consultas agregadas.
-   **Paginação:** Para endpoints que retornam listas (ex: `/action-plans/history`), implemente paginação (`skip`, `take`) para evitar a transferência de grandes volumes de dados.
-   **Cache:** Para endpoints de leitura com dados que mudam pouco (ex: dados de campanhas concluídas), considere implementar uma estratégia de cache (ex: com Redis) para reduzir a carga no banco de dados. O endpoint `/dashboard` também é um forte candidato para cache.

### 4.4. Segurança
-   **Autenticação JWT:** O token JWT deve ter um tempo de expiração curto (ex: 15-30 minutos) para limitar a janela de vulnerabilidade em caso de vazamento. Implemente um mecanismo de refresh token (com expiração mais longa, ex: 7 dias) para manter a sessão do usuário de forma segura. Armazene o refresh token em um cookie `HttpOnly`, `Secure` e `SameSite=Strict`.
-   **CORS (Cross-Origin Resource Sharing):** Configure o backend para aceitar requisições apenas do domínio da aplicação frontend em produção (`origin: 'https://seu-dominio.com'`).
-   **Rate Limiting:** Implemente limitação de taxa (ex: com `express-rate-limit`) em endpoints críticos, especialmente `/auth/login` e todos os endpoints `/api/ai/*`, para prevenir ataques de força bruta e abuso de API.
-   **Proteção contra Injeção:** Use um ORM como o Prisma, que parametriza consultas por padrão, para se proteger contra ataques de SQL Injection.
-   **Gerenciamento de Segredos:** A `API_KEY` do Gemini, o segredo do JWT e a `DATABASE_URL` **devem** ser gerenciados através de variáveis de ambiente (usando um arquivo `.env` e bibliotecas como `dotenv`) e nunca devem ser versionados no código-fonte.
