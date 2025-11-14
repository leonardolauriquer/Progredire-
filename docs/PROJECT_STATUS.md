# Status do Projeto: Progredire+

## 1. Visão Geral e Estado Atual

**Onde estamos:** Atualmente, o projeto Progredire+ existe como um **protótipo de frontend de alta fidelidade e totalmente funcional**. A interface do usuário (UI), a experiência do usuário (UX) e todas as interações do lado do cliente, incluindo o novo **Painel de Staff**, estão implementadas.

**Arquitetura Atual:** Seguimos uma abordagem "frontend-first". Isso significa que toda a lógica de negócio, manipulação de dados multi-tenant (múltiplas empresas, colaboradores, filiais) e chamadas à API de IA (Gemini) estão **simuladas diretamente no frontend**. Arquivos como `services/dataService.ts` atuam como um "backend falso", permitindo que a interface completa seja desenvolvida e testada de forma independente.

**Próximo Grande Passo:** A próxima fase crítica do projeto é a **construção do backend** e a **refatoração do frontend** para se comunicar com ele, efetivamente transformando o protótipo em uma aplicação full-stack. O `BACKEND_IMPLEMENTATION_GUIDE.md` é o nosso mapa para essa fase.

---

## 2. Análise dos Arquivos e Próximas Etapas

Esta seção detalha o propósito de cada arquivo/módulo principal e o que precisa ser feito para conectá-lo ao backend.

### `App.tsx`
-   **O que é:** O componente raiz. Gerencia o estado de autenticação (incluindo o novo `role` de `staff`), a navegação, e a lógica de "personificação" (acesso delegado) iniciada pelo Staff.
-   **Próximas Etapas:**
    1.  **Autenticação Real:** Modificar `handleLogin` para fazer chamadas a `POST /api/auth/login`, enviando email/senha para o `staff`.
    2.  **Acesso Delegado:** As funções `handleImpersonateLogin` e `handleStopImpersonation` devem interagir com a API do backend (ex: `POST /api/auth/impersonate`) para obter tokens JWT com permissões temporárias.
    3.  **Notificações:** A busca de notificações deve vir de um endpoint `GET /api/notifications`.

### `services/dataService.ts`
-   **O que é:** **O arquivo mais crítico a ser modificado.** Atualmente, é o nosso **backend simulado multi-tenant**. Contém dados mockados e toda a lógica para gerenciar empresas, filiais, colaboradores, documentos, campanhas, e calcular KPIs para os dashboards.
-   **Próximas Etapas:**
    1.  **Remoção Completa da Lógica:** Toda a lógica de cálculo e gerenciamento de dados deve ser movida para o backend.
    2.  **Transformação em API Client:** As funções (`getDashboardData`, `getCompanies`, `addEmployee`, `approveCampaign`, etc.) devem ser reescritas para fazerem chamadas `fetch` aos endpoints correspondentes da nossa API backend (ex: `GET /api/dashboard`, `POST /api/staff/companies`, `PATCH /api/staff/campaigns/:id/approve`).
    3.  **Remoção de Dados Mockados:** Os dados mockados devem ser removidos, pois os dados virão do banco de dados via API.

### `services/geminiService.ts`
-   **O que é:** O serviço que atualmente faz chamadas diretas para a API do Google Gemini.
-   **Próximas Etapas:**
    1.  **Refatorar para Proxy:** Alterar todas as funções para fazerem chamadas `fetch` aos endpoints de proxy no nosso backend (ex: `POST /api/ai/analysis`).
    2.  **Remover `GoogleGenAI`:** A inicialização do SDK e a chave de API devem ser completamente removidas do frontend.

### `components/StaffDashboardView.tsx`
-   **O que é:** O novo hub central para usuários do tipo `staff`. Ele consolida a aprovação de campanhas, gestão de documentos, e o gerenciamento completo de empresas, filiais e colaboradores (CRUD e importação).
-   **Próximas Etapas:**
    1.  **Conectar à API de Staff:** Todas as funcionalidades (aprovar campanha, buscar empresas, adicionar colaborador, deletar filial, etc.) devem ser conectadas aos seus respectivos endpoints `staff` no backend (ex: `GET /api/staff/companies`, `DELETE /api/staff/employees/:id`).
    2.  **Upload de Arquivos:** A funcionalidade de upload de documentos e importação de XLS/CSV deve ser implementada para enviar os arquivos para o backend, que será responsável por processá-los e salvá-los.

### `components/DashboardView.tsx`, `CompanyEvolutionView.tsx`, `CampaignView.tsx`
-   **O que são:** As principais telas de visualização para o perfil "Empresa".
-   **Próximas Etapas:**
    1.  **Fonte de Dados:** Alterar o `useEffect` para chamar as novas versões dos serviços que buscarão dados dos endpoints da API (`GET /api/dashboard`, `GET /api/evolution/company`, `GET /api/campaigns`). O backend garantirá que os dados retornados sejam apenas os da empresa autenticada.

### `components/DocumentationView.tsx`
-   **O que é:** A tela para o usuário `company` visualizar os documentos de sua própria empresa.
-   **Próximas Etapas:** Conectar a busca e listagem de documentos a um endpoint `GET /api/documents`, que retornará apenas os documentos associados ao `companyId` do usuário logado.

### `components/CorporateSurveyView.tsx`
-   **O que é:** O questionário que o colaborador responde.
-   **Próximas Etapas:** A função `handleSubmit` deve ser modificada para enviar os dados via `POST /api/surveys/responses`.

### `components/PlanoAcaoView.tsx` e `PlanoAcaoHistoryView.tsx`
-   **O que são:** Telas para criar e gerenciar planos de ação.
-   **Próximas Etapas:** Substituir a manipulação do `localStorage` por chamadas à API para `GET`, `POST`, e `PATCH` nos endpoints `/api/action-plans/*`, que também serão escopados por `companyId`.

### `BACKEND_IMPLEMENTATION_GUIDE.md`
-   **O que é:** O documento mais importante para a próxima fase. É o **plano de construção** para o nosso servidor.
-   **Próximas Etapas:** Utilizar este guia como a fonte da verdade para desenvolver cada modelo de dados, endpoint e lógica de negócio no backend, com foco especial na arquitetura multi-tenant e na diferenciação de permissões entre os papéis de usuário.

---

## 3. Resumo das Fases Futuras

1.  **Fase 1: Construção do Backend (Core Multi-Tenant)**
    -   Configurar o projeto NestJS e o banco de dados com Prisma.
    -   Implementar o schema do banco de dados multi-tenant (`User`, `Company`, `Branch`, `Employee`, `Document`, etc.).
    -   Criar os endpoints de autenticação para todos os papéis e a lógica de personificação.

2.  **Fase 2: Migração da Lógica de Negócio e Endpoints de Staff**
    -   Mover toda a lógica de cálculo de `dataService.ts` para os services do backend.
    -   Implementar o endpoint `GET /api/dashboard`, garantindo o isolamento de dados por `companyId`.
    -   Implementar todos os endpoints de `staff` para gerenciamento de clientes.

3.  **Fase 3: Refatoração do Frontend**
    -   Criar um cliente de API centralizado no frontend.
    -   Substituir todas as chamadas aos serviços mockados pelas chamadas ao novo cliente de API.
    -   Remover completamente os arquivos de dados mockados e a lógica de cálculo do frontend.