# Plano de Migração Full-Stack: Do Protótipo à Produção

## 1. Visão Estratégica e Objetivos

O estado atual do **Progredire+** é um protótipo de frontend de alta fidelidade, totalmente funcional e interativo. Esta abordagem "frontend-first" foi crucial para validar a experiência do usuário e o design da interface.

O objetivo desta próxima fase é evoluir a aplicação para uma **arquitetura full-stack robusta, segura e escalável**. Isso envolve a criação de um servidor backend que centralizará a lógica de negócio, a persistência de dados e a comunicação com serviços externos (API Gemini), enquanto o frontend será refatorado para consumir este backend via uma API RESTful.

Este documento serve como a especificação técnica e o roteiro para essa transição.

---

## 2. Abordagem Arquitetônica

Adotaremos uma arquitetura clássica e comprovada, ideal para a complexidade e os requisitos do Progredire+.

1.  **Frontend (Single Page Application - SPA):**
    -   **Tecnologia:** React com TypeScript.
    -   **Responsabilidade:** Renderização da interface do usuário, gerenciamento do estado da UI e comunicação com o backend via chamadas HTTP. O frontend será "burro", ou seja, não conterá nenhuma lógica de negócio ou acesso direto a dados sensíveis.

2.  **Backend (Monólito com API RESTful):**
    -   **Tecnologia:** Node.js com o framework NestJS.
    -   **Responsabilidade:**
        -   **Lógica de Negócio:** Centralizar todos os cálculos de scores, KPIs, e análises que hoje estão simulados no `services/dataService.ts`.
        -   **Persistência de Dados:** Gerenciar toda a interação com o banco de dados (leitura e escrita).
        -   **Autenticação e Autorização:** Controlar o acesso aos recursos da API com base no `role` do usuário.
        -   **Proxy de IA:** Atuar como um intermediário seguro entre o frontend e a API do Google Gemini, protegendo a chave de API.

3.  **Banco de Dados (Relacional):**
    -   **Tecnologia:** PostgreSQL.
    -   **Responsabilidade:** Armazenar de forma persistente e segura todos os dados da aplicação, como usuários, respostas, planos de ação, etc.

4.  **Integração com IA (Padrão de Proxy):**
    -   **Abordagem:** O frontend **NUNCA** se comunicará diretamente com a API do Google Gemini. Todas as solicitações de IA serão enviadas para o nosso backend (ex: `POST /api/ai/dashboard-insight`). O backend então adicionará a `API_KEY` (armazenada de forma segura como uma variável de ambiente) e fará a chamada para a API do Gemini. Isso é **crítico** para a segurança.

---

## 3. Stack de Tecnologia (Linguagens e Dependências)

A escolha da tecnologia visa a produtividade, segurança e escalabilidade.

-   **Linguagem Principal: TypeScript**
    -   **Justificativa:** Usaremos TypeScript tanto no frontend (já em uso) quanto no backend. Isso garante consistência, segurança de tipos em todo o stack e facilita a colaboração entre as equipes.

-   **Backend:**
    -   **Runtime:** **Node.js** (v18 ou superior).
    -   **Framework:** **NestJS**.
        -   **Justificativa:** É um framework opinativo construído sobre o Express.js que nos fornece uma arquitetura robusta, modular e escalável desde o início. Sua estrutura com Módulos, Controllers e Services, juntamente com o sistema de injeção de dependência, é perfeita para organizar nossa lógica de negócio complexa.
    -   **Dependências Principais (NPM/Yarn):**
        -   `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: Core do NestJS.
        -   `prisma`, `@prisma/client`: Para interação com o banco de dados.
        -   `@nestjs/jwt`, `passport-jwt`: Para implementação da autenticação com JSON Web Tokens.
        -   `bcrypt`: Para hashing de senhas (se aplicável no futuro).
        -   `class-validator`, `class-transformer`: Para validação automática de dados de entrada (DTOs).
        -   `dotenv`: Para gerenciar variáveis de ambiente.
        -   `@google/genai`: SDK oficial para comunicação com a API Gemini no lado do servidor.

-   **Banco de Dados:**
    -   **SGBD:** **PostgreSQL**.
        -   **Justificativa:** Um dos bancos de dados relacionais de código aberto mais avançados e confiáveis do mundo, com excelente suporte a tipos de dados complexos (como JSON), performance robusta para consultas analíticas e um ecossistema maduro.
    -   **ORM (Object-Relational Mapping):** **Prisma**.
        -   **Justificativa:** Oferece uma experiência de desenvolvimento superior com autocomplete e type-safety total nas queries do banco de dados. Seu sistema de migração simplifica a evolução do schema do banco de dados de forma segura.

-   **Autenticação:**
    -   **Método:** **JWT (JSON Web Tokens)**.
        -   **Justificativa:** Padrão de mercado para APIs RESTful, permitindo a criação de um sistema de autenticação stateless, onde cada requisição do cliente contém toda a informação necessária para o servidor validá-la.

---

## 4. Plano de Execução Detalhado

A migração será dividida em fases para garantir um desenvolvimento organizado e iterativo.

### Fase 1: Configuração do Ambiente e Backend Core
1.  **Inicializar Projeto Backend:** Criar um novo projeto NestJS (`nest new progredire-backend`).
2.  **Instalar Dependências:** Adicionar as dependências listadas acima.
3.  **Configurar Prisma:** Inicializar o Prisma (`prisma init`) e configurar a conexão com o banco de dados PostgreSQL.
4.  **Definir Schema do Banco de Dados:** Copiar o schema definido no `BACKEND_IMPLEMENTATION_GUIDE.md` para o arquivo `prisma/schema.prisma`.
5.  **Executar Migração:** Gerar e aplicar a primeira migração para criar as tabelas no banco de dados (`prisma migrate dev`).
6.  **Implementar Autenticação:** Criar o módulo de autenticação (`AuthModule`) com os endpoints `POST /api/auth/login` e uma estratégia de validação de JWT para proteger os demais endpoints.

### Fase 2: Migração da Lógica de Negócio (O Coração da Migração)
1.  **Mover Cálculos:** Transferir **toda** a lógica de `services/dataService.ts` para os *services* do NestJS. Isso inclui o cálculo de scores de dimensão, IRP, KPIs, dados de tendências, etc.
2.  **Implementar `GET /api/dashboard`:** Este será o endpoint mais complexo. Ele deve usar os services criados para filtrar as respostas do banco de dados, realizar todos os cálculos e retornar o objeto `DashboardData` completo.
3.  **Implementar Endpoints de Suporte:** Criar os endpoints para `GET /api/evolution/company`, `POST /api/surveys/responses`, CRUD para `action-plans`, `initiatives`, `journal`, etc.

### Fase 3: Implementação do Proxy Seguro da API Gemini
1.  **Criar Módulo de IA:** Criar um `AiModule` no NestJS.
2.  **Configurar Variável de Ambiente:** Armazenar a `API_KEY` do Google Gemini de forma segura em um arquivo `.env`.
3.  **Implementar Endpoints de Proxy:** Criar os controllers para os endpoints `/api/ai/*` (ex: `POST /api/ai/dashboard-insight`).
4.  **Lógica do Service:** O `AiService` receberá os dados do frontend, inicializará o SDK `@google/genai` com a chave de API do servidor, adicionará as `systemInstruction` e `responseSchema` apropriados, fará a chamada para a API Gemini e retornará a resposta formatada para o frontend.

### Fase 4: Refatoração do Frontend
1.  **Criar API Client:** Criar um novo serviço no frontend (ex: `services/apiClient.ts`) que encapsulará todas as chamadas `fetch` para o nosso backend, gerenciando a adição do token de autenticação nos headers.
2.  **Refatorar Serviços:**
    -   Reescrever `services/dataService.ts` para que suas funções chamem os endpoints do backend (`/api/dashboard`, `/api/evolution/company`, etc.) em vez de calcular dados.
    -   Reescrever `services/geminiService.ts` para que suas funções chamem os endpoints de proxy do backend (`/api/ai/*`).
3.  **Refatorar Componentes:** Atualizar os componentes (`DashboardView`, `CompanyEvolutionView`, etc.) para lidar com o estado de `loading` e `error` das chamadas de API assíncronas.
4.  **Remover Código Legado:** Excluir `components/dashboardMockData.ts` e toda a lógica de cálculo e chamadas diretas ao Gemini do frontend.

### Fase 5: Deployment e Testes
1.  **Containerização:** Criar `Dockerfile`s para as aplicações de frontend e backend.
2.  **CI/CD:** Configurar um pipeline de integração e deploy contínuo (ex: GitHub Actions) para automatizar testes e deploys para um ambiente de staging/produção.
3.  **Gerenciamento de Segredos:** Garantir que todas as chaves e senhas (`DATABASE_URL`, `API_KEY`, `JWT_SECRET`) sejam injetadas como variáveis de ambiente no ambiente de produção.

---

## 5. Contrato da API Detalhado

*Esta seção é uma réplica do `BACKEND_IMPLEMENTATION_GUIDE.md` para centralizar a informação.*

[O conteúdo completo da seção "3. Contrato da API (Endpoints)" do `BACKEND_IMPLEMENTATION_GUIDE.md` será inserido aqui, detalhando cada endpoint, método, body, resposta e lógica esperada.]

---

## 6. Conclusão

Este plano abrangente fornece a base técnica e estratégica para a transição do Progredire+ de um protótipo para uma aplicação full-stack de nível de produção. Seguindo estas fases e diretrizes, garantiremos um desenvolvimento estruturado, resultando em um produto final seguro, escalável e de alta qualidade.
