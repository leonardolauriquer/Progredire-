# Plano de Migração Full-Stack: Do Protótipo à Produção

## 1. Visão Estratégica e Objetivos

O estado atual do **Progredire+** é um protótipo de frontend de alta fidelidade, totalmente funcional e interativo, que já inclui funcionalidades complexas como o painel de Staff e a gestão de múltiplos clientes. Esta abordagem "frontend-first" foi crucial para validar a experiência do usuário e o design da interface em todos os níveis de acesso.

O objetivo desta próxima fase é evoluir a aplicação para uma **arquitetura full-stack robusta, segura e escalável**. Isso envolve a criação de um servidor backend que centralizará a lógica de negócio, a persistência de dados e a comunicação com serviços externos (API Gemini), enquanto o frontend será refatorado para consumir este backend via uma API RESTful.

Este documento serve como a especificação técnica e o roteiro para essa transição.

---

## 2. Abordagem Arquitetônica

Adotaremos uma arquitetura projetada para suportar a complexidade e os requisitos de um SaaS multi-tenant.

1.  **Frontend (Single Page Application - SPA):**
    -   **Tecnologia:** React com TypeScript.
    -   **Responsabilidade:** Renderização da UI, gerenciamento do estado local e comunicação com o backend. O frontend será "burro", ou seja, não conterá nenhuma lógica de negócio ou acesso direto a dados sensíveis.

2.  **Backend (Monólito com API RESTful):**
    -   **Tecnologia:** Node.js com o framework NestJS.
    -   **Responsabilidade:**
        -   **Lógica de Negócio:** Centralizar todos os cálculos de scores, KPIs, e análises.
        -   **Persistência de Dados:** Gerenciar toda a interação com o banco de dados.
        -   **Multi-Tenancy:** Garantir o isolamento total dos dados entre as diferentes empresas clientes. Cada requisição de um usuário do tipo `COMPANY` ou `COLLABORATOR` deve ser estritamente escopada ao seu respectivo `companyId`.
        -   **Autenticação e Autorização:** Controlar o acesso aos recursos da API com base no `role` do usuário (`STAFF`, `COMPANY`, `COLLABORATOR`).
        -   **Proxy de IA:** Atuar como um intermediário seguro entre o frontend e a API do Google Gemini.

3.  **Banco de Dados (Relacional):**
    -   **Tecnologia:** PostgreSQL.
    -   **Responsabilidade:** Armazenar de forma persistente e segura todos os dados da aplicação, com relacionamentos claros que garantam a integridade e o isolamento dos dados dos tenants.

4.  **Integração com IA (Padrão de Proxy):**
    -   **Abordagem:** O frontend **NUNCA** se comunicará diretamente com a API do Google Gemini. Todas as solicitações de IA serão enviadas para o nosso backend (ex: `POST /api/ai/dashboard-insight`). O backend adicionará a `API_KEY` e fará a chamada para a API do Gemini. Isso é **crítico** para a segurança.

---

## 3. Stack de Tecnologia (Linguagens e Dependências)

-   **Linguagem Principal: TypeScript**
    -   **Justificativa:** Consistência e segurança de tipos em todo o stack.

-   **Backend:**
    -   **Runtime:** **Node.js** (v18+).
    -   **Framework:** **NestJS**.
        -   **Justificativa:** Arquitetura robusta, modular e escalável, ideal para organizar a lógica de negócio complexa e as regras de autorização multi-tenant.
    -   **Dependências Principais:**
        -   `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`
        -   `prisma`, `@prisma/client`
        -   `@nestjs/jwt`, `passport-jwt`
        -   `bcrypt`
        -   `class-validator`, `class-transformer`
        -   `dotenv`
        -   `@google/genai`

-   **Banco de Dados:**
    -   **SGBD:** **PostgreSQL**.
        -   **Justificativa:** Confiabilidade, performance em consultas analíticas e suporte a tipos de dados complexos (JSON).
    -   **ORM:** **Prisma**.
        -   **Justificativa:** Type-safety nas queries e um sistema de migração que simplifica a evolução do schema.

-   **Autenticação:**
    -   **Método:** **JWT (JSON Web Tokens)**.
        -   **Justificativa:** Padrão de mercado para APIs RESTful, permitindo um sistema de autenticação stateless. O payload do token conterá `userId`, `role` e `companyId` para forçar a autorização em cada requisição.

---

## 4. Plano de Execução Detalhado

A migração será dividida em fases para garantir um desenvolvimento organizado.

### Fase 1: Configuração do Ambiente e Backend Core Multi-Tenant
1.  **Inicializar Projeto Backend:** Criar um novo projeto NestJS (`nest new progredire-backend`).
2.  **Configurar Prisma e DB:** Configurar a conexão com o PostgreSQL.
3.  **Definir e Migrar Schema:** Implementar o schema multi-tenant completo (com `Company`, `User`, `Branch`, `Document`, etc.) definido no `BACKEND_IMPLEMENTATION_GUIDE.md` e executar a migração inicial (`prisma migrate dev`).
4.  **Implementar Autenticação:** Criar o `AuthModule` com a lógica de login para todos os papéis (`STAFF`, `COMPANY`, `COLLABORATOR`) e a estratégia de validação de JWT. Implementar a lógica de "personificação".

### Fase 2: Migração da Lógica de Negócio e Endpoints de Gestão
1.  **Mover Cálculos:** Transferir **toda** a lógica de `services/dataService.ts` para os *services* do NestJS.
2.  **Implementar Endpoints de Cliente (`COMPANY`/`COLLABORATOR`):** Criar os endpoints principais como `GET /api/dashboard`, `GET /api/evolution/company`, etc., garantindo que todas as consultas ao banco de dados sejam estritamente filtradas pelo `companyId` presente no token JWT.
3.  **Implementar Endpoints de Staff:** Desenvolver todos os endpoints de CRUD para gerenciamento de empresas, filiais, colaboradores e documentos, além do endpoint de aprovação de campanhas, todos protegidos para acesso exclusivo do `role` `STAFF`.
4.  **Implementar Endpoints de Importação de Dados:** Criar os endpoints `POST /api/staff/import/*` para lidar com o upload e processamento de arquivos XLS, populando o banco de dados.

### Fase 3: Implementação do Proxy Seguro da API Gemini
1.  **Criar Módulo de IA:** Criar um `AiModule` no NestJS.
2.  **Configurar Variável de Ambiente:** Armazenar a `API_KEY` do Google Gemini de forma segura.
3.  **Implementar Endpoints de Proxy:** Criar os controllers para os endpoints `/api/ai/*`. A lógica do serviço deve adicionar a `API_KEY`, as instruções de sistema e chamar o Gemini, retornando a resposta ao frontend.

### Fase 4: Refatoração do Frontend
1.  **Criar API Client:** Criar um novo serviço `services/apiClient.ts` que encapsulará todas as chamadas `fetch`, gerenciando a adição do token de autenticação.
2.  **Refatorar Serviços:**
    -   Reescrever `services/dataService.ts` e `services/geminiService.ts` para que suas funções chamem os endpoints do backend via `apiClient`.
3.  **Refatorar Componentes:** Atualizar todos os componentes que consomem dados para lidar com os estados de `loading` e `error` das chamadas de API assíncronas.
4.  **Remover Código Legado:** Excluir `components/dashboardMockData.ts` e toda a lógica de cálculo e chamadas diretas ao Gemini do frontend.

### Fase 5: Deployment e Testes
1.  **Containerização:** Criar `Dockerfile`s para as aplicações.
2.  **CI/CD:** Configurar um pipeline de integração e deploy contínuo (ex: GitHub Actions).
3.  **Gerenciamento de Segredos:** Garantir que todas as chaves e senhas sejam injetadas como variáveis de ambiente no ambiente de produção.

---

## 5. Contrato da API Detalhado

O contrato completo da API, com todos os endpoints, métodos, payloads e respostas esperadas, está documentado no arquivo `BACKEND_IMPLEMENTATION_GUIDE.md`. Este documento é a fonte da verdade para a implementação da comunicação entre frontend e backend.

---

## 6. Conclusão

Este plano abrangente fornece a base técnica e estratégica para a transição do Progredire+ de um protótipo para uma aplicação full-stack de nível de produção, com uma arquitetura multi-tenant robusta desde o início. Seguir estas fases e diretrizes garantirá um desenvolvimento estruturado, resultando em um produto final seguro, escalável e de alta qualidade.