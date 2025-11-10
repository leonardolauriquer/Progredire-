# Status do Projeto: Progredire+

## 1. Visão Geral e Estado Atual

**Onde estamos:** Atualmente, o projeto Progredire+ existe como um **protótipo de frontend de alta fidelidade e totalmente funcional**. A interface do usuário (UI), a experiência do usuário (UX) e todas as interações do lado do cliente estão implementadas.

**Arquitetura Atual:** Seguimos uma abordagem "frontend-first". Isso significa que toda a lógica de negócio, manipulação de dados e chamadas à API de IA (Gemini) estão **simuladas diretamente no frontend**. Arquivos como `services/dataService.ts` e `components/dashboardMockData.ts` atuam como um "backend falso", permitindo que a interface seja desenvolvida e testada de forma independente.

**Próximo Grande Passo:** A próxima fase crítica do projeto é a **construção do backend** e a **refatoração do frontend** para se comunicar com ele, efetivamente transformando o protótipo em uma aplicação full-stack. O `BACKEND_IMPLEMENTATION_GUIDE.md` é o nosso mapa para essa fase.

---

## 2. Análise dos Arquivos e Próximas Etapas

Esta seção detalha o propósito de cada arquivo/módulo principal e o que precisa ser feito para conectá-lo ao backend.

### `App.tsx`
-   **O que é:** O componente raiz da aplicação. Gerencia o estado de autenticação, a navegação entre as diferentes "telas" (views) e a estrutura principal do layout (Sidebar, Header).
-   **Próximas Etapas:**
    1.  **Autenticação Real:** Modificar as funções `handleLogin` e `handleLogout` para fazer chamadas à API do backend (`POST /api/auth/login`, `POST /api/auth/logout`) em vez de usar o `authService` que manipula o `localStorage` diretamente.
    2.  **Verificação de Sessão:** Na inicialização, em vez de apenas ler o `localStorage`, fazer uma chamada a um endpoint como `GET /api/auth/verify` para validar o token no servidor.
    3.  **Notificações:** Substituir a chamada `generateAndFetchNotifications` por uma chamada a `GET /api/notifications` para buscar notificações reais do banco de dados.

### `services/dataService.ts`
-   **O que é:** **O arquivo mais crítico a ser modificado.** Atualmente, ele é o nosso **backend simulado**. Contém dados mockados e toda a lógica de cálculo de KPIs, scores, distribuições e tendências para os dashboards.
-   **Próximas Etapas:**
    1.  **Remoção Completa da Lógica:** Toda a lógica de cálculo (ex: `calculateDashboardData`, `calculateMultiSectorEvolution`) deve ser movida para o backend, conforme especificado no `BACKEND_IMPLEMENTATION_GUIDE.md`.
    2.  **Transformação em API Client:** As funções exportadas (ex: `getDashboardData`, `saveCollaboratorSurvey`) devem ser reescritas para se tornarem "clientes HTTP". Em vez de calcular dados, elas farão chamadas `fetch` para os endpoints correspondentes da nossa API backend (ex: `fetch('/api/dashboard?setor=Engenharia')`).
    3.  **Remoção de Dados Mockados:** Os `mockResponses` e outras simulações devem ser removidos, pois os dados virão do banco de dados via API.

### `services/geminiService.ts`
-   **O que é:** O serviço que atualmente faz chamadas **diretas** para a API do Google Gemini. **Esta é uma prática insegura para produção**, pois expõe a chave de API no lado do cliente.
-   **Próximas Etapas:**
    1.  **Criar um Proxy no Backend:** O backend deve implementar os endpoints da seção `/api/ai/*` (ex: `/api/ai/dashboard-insight`).
    2.  **Refatorar Funções:** Cada função neste arquivo (`runAnalysis`, `runDashboardAnalysis`, etc.) deve ser alterada. Em vez de chamar `ai.models.generateContent`, ela deve fazer uma chamada `fetch` para o seu endpoint correspondente no nosso backend (ex: `fetch('/api/ai/analysis', { method: 'POST', body: ... })`).
    3.  **Remover a `GoogleGenAI`:** A inicialização `new GoogleGenAI(...)` e a chave de API devem ser completamente removidas do frontend. O frontend não saberá mais que está falando com o Gemini; ele apenas se comunicará com o nosso backend.

### `components/DashboardView.tsx`
-   **O que é:** A principal tela de visualização de dados para o perfil "Empresa".
-   **Próximas Etapas:**
    1.  **Fonte de Dados:** Alterar o `useEffect` para chamar a nova versão de `getDashboardData` (que buscará os dados da API `GET /api/dashboard`).
    2.  **Geração de Insight:** A função `handleGenerateInsight` deve chamar a nova versão de `runDashboardAnalysis` (que enviará os dados para `POST /api/ai/dashboard-insight`).

### `components/CompanyEvolutionView.tsx` / `CollaboratorEvolutionView.tsx`
-   **O que é:** Telas que exibem a evolução dos indicadores ao longo do tempo.
-   **Próximas Etapas:**
    1.  **Fonte de Dados:** Substituir a lógica de cálculo (`calculate...`) por chamadas aos endpoints `GET /api/evolution/company` e `GET /api/evolution/collaborator`. Os componentes receberão os dados já formatados para os gráficos.
    2.  **Análise por IA:** A geração do relatório de evolução deve chamar o endpoint `POST /api/ai/evolution-insight`.

### `components/CorporateSurveyView.tsx`
-   **O que é:** O questionário que o colaborador responde.
-   **Próximas Etapas:**
    1.  **Submissão de Respostas:** A função `handleSubmit` deve ser modificada para enviar os dados (`answers` e `segmentation`) via `POST /api/surveys/responses` em vez de salvá-los no `localStorage`. O backend será então responsável por calcular e salvar a entrada de evolução.

### `components/PlanoAcaoView.tsx` e `PlanoAcaoHistoryView.tsx`
-   **O que é:** Telas para criar, gerenciar e visualizar o histórico de planos de ação.
-   **Próximas Etapas:**
    1.  **Salvar e Buscar Planos:** Substituir toda a manipulação do `localStorage` por chamadas à API para `GET`, `POST` e `PATCH` nos endpoints `/api/action-plans/*`.
    2.  **Publicar Iniciativas:** A função `handlePublishPlan` deve chamar `POST /api/initiatives` para salvar a iniciativa no banco de dados e torná-la visível para os colaboradores.

### `BACKEND_IMPLEMENTATION_GUIDE.md`
-   **O que é:** O documento mais importante para a próxima fase. É o **plano de construção** para o nosso servidor.
-   **Próximas Etapas:**
    1.  **Implementação:** Utilizar este guia como a fonte da verdade para desenvolver cada modelo de dados, endpoint e lógica de negócio no backend.

---

## 3. Resumo das Fases Futuras

1.  **Fase 1: Construção do Backend (Core)**
    -   Configurar o projeto Node.js/NestJS.
    -   Implementar o schema do banco de dados com Prisma.
    -   Criar os endpoints de autenticação e CRUD para os modelos principais (`SurveyResponse`, `ActionPlan`, etc.).

2.  **Fase 2: Migração da Lógica de Negócio**
    -   Mover toda a lógica de cálculo de `dataService.ts` para os serviços do backend, garantindo que o endpoint `GET /api/dashboard` retorne a estrutura de dados completa e correta.

3.  **Fase 3: Refatoração do Frontend**
    -   Criar um cliente de API centralizado no frontend (ex: `apiService.ts`) para lidar com as chamadas `fetch`.
    -   Substituir todas as chamadas aos serviços mockados (`dataService`, `geminiService`) pelas chamadas ao novo cliente de API.
    -   Remover completamente os arquivos de dados mockados e a lógica de cálculo do frontend.
