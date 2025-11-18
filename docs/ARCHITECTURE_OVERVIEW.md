# Visão Geral da Arquitetura - Progredire+

## 1. Introdução

Este documento fornece uma visão de alto nível da arquitetura de software da plataforma Progredire+. Ele serve como o ponto de partida para entender como os diferentes componentes do sistema (frontend, backend, banco de dados, serviços de IA) se interconectam e como o código está organizado.

Para detalhes mais aprofundados sobre cada componente, consulte os documentos específicos linkados ao longo deste guia.

---

## 2. Diagrama da Arquitetura

A aplicação segue uma arquitetura moderna de SPA (Single Page Application) com um backend desacoplado que atua como uma API RESTful e um proxy seguro.

O fluxo de dados principal pode ser descrito da seguinte forma:

```
+---------------+      HTTPS      +---------------------+      SQL      +----------------+
|  Navegador do |  <----------> |   Backend (NestJS)  |  <--------> |  Banco de Dados  |
|   Usuário     |               | (API RESTful + Proxy) |             |  (PostgreSQL)    |
| (React SPA)   |               +----------^----------+             +----------------+
+---------------+                          |
                                           | HTTPS
                                           |
                                  +--------v--------+
                                  |    Google AI    |
                                  |  (Gemini API)   |
                                  +-----------------+
```

1.  **Usuário para Frontend:** O usuário interage com a aplicação React que é executada em seu navegador.
2.  **Frontend para Backend:** Todas as solicitações de dados, ações ou chamadas de IA são enviadas via HTTPS para a nossa API backend.
3.  **Backend para Banco de Dados:** O backend processa as solicitações, aplica a lógica de negócio e se comunica com o banco de dados PostgreSQL para persistir ou recuperar dados.
4.  **Backend para Google AI:** Quando uma funcionalidade de IA é solicitada, o backend (e **nunca** o frontend) se comunica de forma segura com a API do Google Gemini.

---

## 3. Detalhamento dos Componentes

### 3.1. Frontend (React SPA)

-   **Responsabilidade:** Renderizar a interface do usuário e gerenciar o estado da UI. É responsável por toda a experiência visual e interativa.
-   **Lógica:** Contém a lógica de apresentação. Não possui lógica de negócio crítica, não acessa o banco de dados diretamente e não armazena chaves de API.
-   **Comunicação:** Interage exclusivamente com o Backend através de uma API RESTful, enviando um token JWT para autenticação em cada requisição.
-   **Documentação Relevante:** [Guia de UI/UX e Padrões de Frontend](./UI_UX_GUIDE.md)

### 3.2. Backend (API NestJS)

-   **Responsabilidade:** É o "cérebro" da aplicação.
    1.  **Centraliza a Lógica de Negócio:** Todos os cálculos de KPIs (IRP, IPE), agregações de dados e regras de negócio residem aqui.
    2.  **Gerencia a Persistência:** É o único componente que tem permissão para se comunicar com o banco de dados.
    3.  **Controla Acesso:** Implementa a autenticação e autorização (RBAC), garantindo que os usuários só possam acessar os dados que lhes são permitidos.
    4.  **Atua como Proxy Seguro de IA:** Protege a chave da API do Gemini e gerencia todas as interações com o serviço de IA.
-   **Documentação Relevante:** [Guia de Implementação do Backend](./BACKEND_IMPLEMENTATION_GUIDE.md)

### 3.3. Banco de Dados (PostgreSQL)

-   **Responsabilidade:** Persistir todos os dados da aplicação de forma segura e estruturada.
-   **ORM:** A interação com o banco de dados é gerenciada pelo **Prisma**, que garante a segurança de tipos (type-safety) e ajuda a prevenir ataques de SQL Injection.
-   **Schema:** A estrutura completa das tabelas e seus relacionamentos está definida no `schema.prisma`, documentado no Guia de Backend.

### 3.4. Serviço de IA (Google Gemini)

-   **Responsabilidade:** Fornecer as capacidades de inteligência artificial para geração de relatórios, insights e respostas do assistente.
-   **Acesso:** É acessado exclusivamente pelo nosso Backend, que atua como um proxy seguro.
-   **Documentação Relevante:** [Arquitetura de Segurança](./SECURITY_ARCHITECTURE.md) (Pilar 4: Integração Segura)

---

## 4. Estrutura de Arquivos e Funcionalidade das Páginas

O frontend do projeto está organizado de forma modular. Abaixo descrevemos o propósito de cada diretório e arquivo principal.

### 4.1. Diretórios Principais

-   **`/components`**: Contém componentes de UI reutilizáveis e "dumb components" (apenas apresentação).
    -   `Sidebar.tsx` / `Header.tsx`: Estrutura de navegação principal.
    -   `Charts.tsx`: Biblioteca interna de gráficos (Radar, Linha, Barra, etc.).
    -   `icons.tsx`: Coleção centralizada de ícones SVG.
    -   `Modal.tsx`: Componente genérico para diálogos modais.
    
-   **`/pages`**: Contém as "Views" ou telas completas da aplicação. Cada arquivo aqui representa uma rota acessível pelo usuário.

-   **`/services`**: Camada de lógica e dados.
    -   `apiClient.ts` (Planejado): Centralizará as chamadas HTTP para o backend.
    -   `authService.ts`: Gerencia login, logout e armazenamento de tokens.
    -   `dataService.ts`: (Atualmente Mock) Contém a lógica de manipulação de dados que será migrada para o backend.
    -   `geminiService.ts`: Gerencia a construção dos prompts e a comunicação com a IA.

-   **`/docs`**: Documentação técnica e de projeto.

### 4.2. Detalhamento das Páginas (Views)

#### Acesso Público / Comum
-   **`LoginView.tsx`**: Tela de autenticação. Gerencia o login para os três perfis (Staff, Empresa, Colaborador) e a lógica inicial de redirecionamento.
-   **`SettingsView.tsx`**: Configurações globais da aplicação, como troca de tema (Claro/Escuro/Daltonismo) e tamanho da fonte.
-   **`FaqView.tsx`**: Central de ajuda com perguntas frequentes segmentadas por perfil de usuário.

#### Perfil Empresa (Gestão)
-   **`CompanyHomeView.tsx`**: Landing page do gestor. Oferece um insight diário e atalhos rápidos para as principais ações (Dashboard, Campanhas).
-   **`DashboardView.tsx`**: O painel principal. Exibe KPIs (IRP, IPE), gráficos de risco e permite gerar o Relatório Estratégico com IA.
-   **`AssistantView.tsx`**: Interface de chat com a IA (RAG) para fazer perguntas em linguagem natural sobre os dados da empresa.
-   **`CampaignView.tsx`**: Gerenciamento de pesquisas de clima. Permite criar novas campanhas, ver status e histórico.
-   **`PlanoAcaoView.tsx`**: Ferramenta para criar planos de melhoria. O usuário seleciona um fator de risco e a IA gera sugestões de ações, objetivos e KPIs.
-   **`PlanoAcaoHistoryView.tsx`**: Painel de acompanhamento (Kanban/Lista) de todas as ações criadas e seus status.
-   **`CompanyEvolutionView.tsx`**: Gráficos de linha comparativos para analisar a tendência dos indicadores de saúde ao longo do tempo.
-   **`InitiativesView.tsx`**: Mural onde a empresa publica as iniciativas oficiais para que os colaboradores vejam.
-   **`DocumentationView.tsx`**: Repositório de documentos legais (PGR, PCMSO) com status de validade.
-   **`SupportTeamView.tsx`**: Lista de contatos de profissionais de saúde e da equipe Staff para suporte.

#### Perfil Colaborador
-   **`CollaboratorHomeView.tsx`**: Landing page do funcionário. Inclui o registro rápido de humor ("Como você se sente hoje?") e atalhos.
-   **`AnalysisView.tsx`** (Reflexão Pessoal): Espaço seguro para o colaborador descrever um problema e receber aconselhamento empático da IA.
-   **`CorporateSurveyView.tsx`**: Interface para responder aos questionários psicossociais enviados pela empresa.
-   **`JournalView.tsx`**: Diário de emoções pessoal, onde o colaborador vê o histórico de seus registros de humor.
-   **`CollaboratorEvolutionView.tsx`**: Visualização da própria evolução do colaborador (mood e respostas de questionário) ao longo do tempo.

#### Perfil Staff (Administração)
-   **`StaffDashboardView.tsx`**: Visão geral do sistema para administradores (nº de clientes, campanhas pendentes, etc.).
-   **`StaffCampaignApprovalView.tsx`**: Fila de aprovação para campanhas criadas pelas empresas.
-   **`StaffUserManagementView.tsx`**: CRUD completo de Empresas, Filiais, Usuários e Colaboradores.
-   **`StaffDocumentManagementView.tsx`**: Upload e gestão de validade de documentos para todas as empresas clientes.
-   **`StaffDataImportView.tsx`**: Interface para importação em massa de dados via planilhas Excel.
-   **`StaffImpersonationView.tsx`**: Ferramenta de "Acesso Delegado" para simular a visão de um cliente específico.

---

## 5. Princípios Arquitetônicos Chave

-   **Multi-Tenancy:** A arquitetura é projetada desde o início para suportar múltiplos clientes. O isolamento de dados é a principal prioridade e é garantido no nível do backend e do banco de dados através do uso obrigatório de `companyId` em todas as consultas.
-   **Proxy Seguro para IA:** A chave da API do Gemini é um segredo de produção e nunca deve ser exposta no lado do cliente. O padrão de proxy no backend é uma medida de segurança não negociável.
-   **Role-Based Access Control (RBAC):** O acesso a cada endpoint da API é rigorosamente controlado pelo papel (`STAFF`, `COMPANY`, `COLLABORATOR`) contido no token JWT do usuário.

---

## 6. Onde ir a Seguir

-   Para entender **o que** o protótipo faz hoje: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
-   Para entender **como** o backend deve ser construído: [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)
-   Para entender **o processo** de migração: [FULL_STACK_MIGRATION_PLAN.md](./FULL_STACK_MIGRATION_PLAN.md)
-   Para entender **os princípios de segurança**: [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)
-   Para entender **os padrões visuais**: [UI_UX_GUIDE.md](./UI_UX_GUIDE.md)
-   Para entender **as métricas de negócio**: [DATA_GLOSSARY.md](./DATA_GLOSSARY.md)
