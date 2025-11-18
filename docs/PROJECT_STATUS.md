# Status do Projeto: Progredire+

## 1. Visão Geral e Estado Atual

**Onde estamos:** Atualmente, o projeto Progredire+ existe como um **protótipo de frontend de alta fidelidade e totalmente funcional**. A interface do usuário (UI), a experiência do usuário (UX) e todas as interações do lado do cliente, incluindo o **Painel de Staff**, estão implementadas.

**Arquitetura Atual:** Seguimos uma abordagem "frontend-first". Isso significa que toda a lógica de negócio, manipulação de dados multi-tenant (múltiplas empresas, colaboradores, filiais) e chamadas à API de IA (Gemini) estão **simuladas diretamente no frontend**. Arquivos como `services/dataService.ts` atuam como um "backend falso", permitindo que a interface completa seja desenvolvida e testada de forma independente.

**Próximo Grande Passo:** A próxima fase crítica do projeto é a **construção do backend no Replit** e a **refatoração do frontend** para se comunicar com ele, efetivamente transformando o protótipo em uma aplicação full-stack.

---

## 2. Guias de Implementação

Para a próxima fase, consulte os guias específicos:

-   **[REPLIT_GUIDE.md](./REPLIT_GUIDE.md):** (PRINCIPAL) Passo a passo para configurar e rodar o backend e o banco de dados usando o Replit.
-   **[BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md):** Mapa técnico da API e Banco de Dados (independente da plataforma).
-   **[FULL_STACK_MIGRATION_PLAN.md](./FULL_STACK_MIGRATION_PLAN.md):** Estratégia de migração adaptada para o Replit.

---

## 3. Análise Detalhada dos Arquivos do Protótipo

Esta seção serve como um guia técnico completo, detalhando o propósito, a lógica e as responsabilidades de cada arquivo no projeto.

### 3.1. Raiz do Projeto

Estes são os arquivos centrais que inicializam e estruturam a aplicação.

-   **`index.html`**
    -   **O que é:** O ponto de entrada da aplicação web.
    -   **Lógica:**
        -   Define a estrutura básica do HTML, incluindo a tag `<div id="root"></div>`, onde a aplicação React será renderizada.
        -   Importa fontes do Google Fonts (`Inter`) e o CDN do Tailwind CSS para estilização.
        -   **Import Map (`<script type="importmap">`):** Mapeia os nomes dos pacotes (ex: `react`, `@google/genai`) para suas URLs de CDN. Isso permite o uso de `import` nativo do navegador sem um processo de build.
        -   **Script de Inicialização de Tema:** Um script de execução imediata lê o tema e o tamanho da fonte do `localStorage` e os aplica à tag `<html>` antes da renderização. Isso previne o "Flash of Unstyled Content" (FOUC), garantindo que a aparência correta seja exibida instantaneamente.
        -   Carrega o script principal da aplicação: `<script type="module" src="/index.tsx">`.

-   **`index.tsx`**
    -   **O que é:** O ponto de partida do React.
    -   **Lógica:**
        -   Importa `React`, `ReactDOM` e o componente principal `App`.
        -   Localiza o elemento `<div id="root">` no DOM.
        -   Utiliza `ReactDOM.createRoot` para inicializar a raiz da aplicação React e renderiza o componente `<App />` dentro dela. Envolve o `App` com `<React.StrictMode>` para ativar checagens e avisos adicionais durante o desenvolvimento.

-   **`App.tsx`**
    -   **O que é:** O componente orquestrador de toda a aplicação. É o coração do frontend.
    -   **Lógica de Estado:**
        -   `user`: Armazena os dados de autenticação (`AuthData`) do usuário logado. É nulo se ninguém estiver logado.
        -   `activeView`: Controla qual "página" (componente de visualização) é exibida. Atua como um roteador de estado simples.
        -   `isSidebarCollapsed`, `isMobileSidebarOpen`: Gerenciam o estado visual da barra de navegação lateral.
        -   `impersonationOrigin`: Armazena os dados do usuário `staff` original quando o "acesso delegado" está ativo, permitindo a exibição do banner e o retorno à sessão original.
        -   `dashboardFilters`, `actionPlanContext`: Estados de navegação contextual. Permitem que uma ação em uma página (ex: clicar em uma notificação) leve o usuário para outra página com um contexto pré-definido (ex: dashboard com filtros já aplicados).
    -   **Lógica de Autenticação e Ciclo de Vida:**
        -   `useEffect`: Ao carregar, verifica o `localStorage` (via `authService`) para ver se já existe uma sessão de usuário ou de personificação, atualizando os estados `user` e `impersonationOrigin`.
        -   `handleLogin`, `handleLogout`: Funções que interagem com o `authService` e atualizam o estado `user` para refletir o login ou logout.
        -   `handleImpersonateLogin`, `handleStopImpersonation`: Orquestram a lógica de acesso delegado, salvando o estado original e definindo o novo estado de usuário simulado.
    -   **Lógica de Navegação:**
        -   `handleDirectNavigation`, `handleNavigateToDashboard`, `handleNavigateToActionPlan`: Funções que atualizam o `activeView` e os estados de contexto para controlar a renderização das páginas.
    -   **Renderização Condicional (`renderContent`):**
        -   Atua como o roteador principal da aplicação.
        -   Um `switch` com base no `activeView` e no `user.role` decide qual componente de página (da pasta `/pages`) deve ser renderizado. Isso garante que um `collaborator` não possa ver uma página de `staff`, por exemplo.
    -   **Layout:**
        -   Monta a estrutura visual principal, combinando os componentes compartilhados (`Sidebar`, `Header`, `ImpersonationBanner`) com o conteúdo da página ativa renderizado por `renderContent`. A lógica de `padding` (`md:pl-64`) se ajusta dinamicamente com base no estado de colapso da `Sidebar`. A navegação foi unificada na `Sidebar` para todos os dispositivos (mobile e desktop).

-   **`metadata.json`**
    -   **O que é:** Um arquivo de configuração padrão para a plataforma AI Studio.
    -   **Lógica:** Fornece metadados básicos como o nome e a descrição da aplicação. O campo `requestFramePermissions` seria usado para solicitar permissões do navegador, como acesso à câmera ou geolocalização, caso fossem necessários.

-   **`README.md`**
    -   **O que é:** A documentação principal do projeto.
    -   **Conteúdo:** Explica a visão geral do Progredire+, seu status atual (protótipo funcional), as principais funcionalidades para cada perfil de usuário, a stack de tecnologia (atual e planejada) e, crucialmente, como navegar e interagir com o protótipo. Também aponta para os outros documentos para informações mais detalhadas.

### 3.2. Serviços (`services/`)

Estes arquivos encapsulam a lógica de negócio, acesso a dados e comunicação com APIs externas. No protótipo, eles simulam um backend completo.

-   **`authService.ts`**
    -   **O que é:** Simula um serviço de autenticação.
    -   **Lógica:**
        -   Usa o `localStorage` do navegador para persistir o estado de login (`AUTH_KEY`) e o estado de personificação (`IMPERSONATION_ORIGIN_KEY`).
        -   `login`: Simula uma chamada de API com `setTimeout`. Valida as credenciais fornecidas contra dados mockados (ex: lista de emails de staff, senhas fixas). Em caso de sucesso, cria um objeto `AuthData` (simulando um token JWT) e o salva no `localStorage`.
        -   `impersonateLogin` / `stopImpersonation`: Orquestra a troca de tokens no `localStorage`, salvando a sessão original do staff para permitir o retorno posterior.

-   **`dataService.ts`**
    -   **O que é:** O "backend falso" da aplicação. Simula um banco de dados e toda a lógica de negócio para cálculo de dados.
    -   **Lógica de Cálculo (`calculateDashboardData`):**
        -   Esta é a função mais complexa. Ela recebe `filters` (ex: diretoria, setor) e executa uma série de passos:
        1.  Filtra o array de respostas mockadas (`mockResponses`) com base nos filtros.
        2.  Chama a sub-rotina `calculateDataForResponses`.
        3.  **`calculateDataForResponses`:** Itera sobre cada resposta, converte as strings de escala Likert (ex: "Concordo totalmente") para valores numéricos (1 a 5), calcula a pontuação média para cada dimensão de risco psicossocial e, em seguida, **normaliza** essa pontuação para uma escala de 0 a 100 usando a fórmula `((PontuaçãoMédia - 1) / 4) * 100`.
        4.  Carrega dados "históricos" e "financeiros" de outros locais do `localStorage`, com fallbacks para dados mockados.
        5.  Calcula métricas derivadas:
            -   **`geralScore`:** Média de todas as pontuações de dimensão (0-100).
            -   **`irpGlobal`:** Converte o `geralScore` de volta para uma escala de 1-5 (`(geralScore / 100) * 4 + 1`).
            -   **`riskClassification`:** Classifica o IRP como 'Baixo', 'Moderado' ou 'Alto'.
            -   **`topRisks` / `topProtections`:** Ordena os fatores de risco por pontuação para encontrar os 3 piores e os 3 melhores.
            -   **`maturityLevel`:** Calcula a porcentagem de fatores em cada nível de risco e aplica uma lógica de negócio para determinar o nível de maturidade da empresa.
        -   Retorna um objeto `DashboardData` massivo com todos os KPIs e dados para os gráficos.
    -   **Lógica de CRUD (Create, Read, Update, Delete):**
        -   Funções como `getCompanies`, `addEmployee`, `deleteBranch` manipulam arrays de objetos que são lidos e salvos no `localStorage`, simulando operações de um banco de dados. A paginação e a busca também são simuladas aqui, operando diretamente sobre esses arrays.
    -   **Lógica de Importação (`import...`):**
        -   As funções como `importSurveyResponses` recebem dados JSON (processados a partir de um arquivo XLS na UI) e **substituem** os dados de simulação correspondentes no `localStorage`. Isso permite que o dashboard seja alimentado com dados customizados.

-   **`geminiService.ts`**
    -   **O que é:** O único ponto de contato com a API do Google Gemini.
    -   **Lógica:**
        -   **Instruções de Sistema (`systemInstruction...`):** Define o "cérebro" ou a "personalidade" da IA para cada tarefa. Por exemplo, `systemInstructionDashboard` instrui a IA a agir como um consultor de RH e a preencher um schema JSON específico, enquanto `systemInstructionAssistant` define a persona do assistente de chat e o informa sobre as ferramentas disponíveis (`queryRiskFactors`).
        -   **Schemas JSON (`...ResponseSchema`):** Define a estrutura de saída que a IA deve seguir para tarefas que exigem uma resposta JSON estruturada (Dashboard, Plano de Ação, etc.). Isso torna a resposta da IA previsível e fácil de analisar no código.
        -   **Declarações de Ferramentas (`...FunctionDeclaration`):** Descreve as "ferramentas" (funções) que a IA pode solicitar que sejam executadas. `queryRiskFactorsFunctionDeclaration` informa ao modelo que ele pode pedir os dados de fatores de risco para um determinado segmento.
        -   **Funções de Chamada (`run...`):** Cada função (`runDashboardAnalysis`, `runActionPlanGeneration`, etc.) é uma "receita" para uma tarefa específica. Ela combina um prompt do usuário com a instrução de sistema correta, e opcionalmente um schema JSON, antes de chamar a API.
        -   **Lógica de Chat com Ferramentas (`runAssistantChat`):** Implementa um ciclo de conversação. Envia a mensagem do usuário, recebe uma resposta da IA que pode ser um pedido para usar uma ferramenta (`functionCall`), executa a ferramenta localmente (chamando `dataService.queryRiskFactors`), envia o resultado de volta para a IA, e repete até que a IA forneça uma resposta final em texto.

-   **`journalService.ts` / `notificationService.ts`**
    -   **O que são:** Serviços mais simples que gerenciam, respectivamente, as entradas do diário de emoções e as notificações, usando o `localStorage` para persistência.
    -   **Lógica (`notificationService`):** A função `generateAndFetchNotifications` contém lógica de negócio para criar novas notificações, como a de boas-vindas para o primeiro acesso ou uma notificação quando uma campanha de pesquisa é concluída.

### 3.3. Componentes Compartilhados (`components/`)

Estes são os blocos de construção reutilizáveis da UI.

-   **`Header.tsx`, `Sidebar.tsx`:** Componentes de navegação principais. Recebem o `activeView` e o `userRole` para destacar o item de menu ativo e renderizar apenas os links permitidos para aquele perfil.
-   **`Charts.tsx`:** Uma biblioteca interna de componentes de visualização de dados.
    -   **Lógica:** Cada componente (ex: `LineChart`, `RadarChart`, `BubbleScatterChart`) é um componente React que renderiza SVG. Eles recebem dados através de props e contêm a lógica matemática para calcular as coordenadas, caminhos (`d` attribute of `<path>`), e pontos para desenhar o gráfico. Por exemplo, o `GaugeChart` usa `stroke-dasharray` em um arco SVG para criar o efeito de preenchimento. O `LineChart` consegue lidar com dados ausentes (`null`) para criar linhas com falhas.
-   **`icons.tsx`:** Um arquivo que exporta ícones SVG como componentes React. Isso permite fácil reutilização e estilização dos ícones em toda a aplicação.
-   **`Modal.tsx`, `ImpersonationBanner.tsx`, `LoadingSpinner.tsx`:** Componentes de UI utilitários para feedback visual (modais, banners, spinners de carregamento).
-   **`dashboardMockData.ts`:**
    -   **O que é:** A fonte de dados "bruta" para a simulação.
    -   **Lógica:** Contém arrays de objetos que simulam tabelas de banco de dados (campanhas, documentos). Inclui a função `generateWeightedAnswer` que gera respostas de questionário com um viés ("bom" ou "ruim"), tornando a simulação de dados mais realista.

### 3.4. Páginas (`pages/`)

Cada arquivo aqui representa uma "página" ou visão principal da aplicação.

-   **`LoginView.tsx`:**
    -   **Lógica:** Gerencia um estado interno (`activeForm`) para alternar entre a tela de seleção de perfil e os formulários de login específicos para `collaborator`, `company` e `staff`. Ao submeter, chama `authService.login` e, em caso de sucesso, invoca a prop `onLogin` do `App.tsx`.
-   **`DashboardView.tsx`:**
    -   **Lógica:** Uma das páginas mais complexas.
        -   `useEffect`: Dispara a busca de dados (`getDashboardData`) sempre que os `filters` mudam.
        -   Gerencia estados de carregamento e erro para os dados principais e para a análise da IA.
        -   `handleGenerateInsight`: Chama o `geminiService` com os dados do dashboard para obter o relatório estratégico em JSON, que é então renderizado.
        -   Renderiza uma grande variedade de componentes de `Charts.tsx`, passando os dados corretos para cada um.
-   **`CompanyEvolutionView.tsx` / `CollaboratorEvolutionView.tsx`:**
    -   **Lógica:** Buscam dados de evolução (`get...EvolutionData`). Contêm lógica em `useMemo` para processar e formatar os dados para o `LineChart`. A versão da empresa (`CompanyEvolutionView`) também tem a lógica para comparar múltiplos setores.
-   **`PlanoAcaoView.tsx`:**
    -   **Lógica:** Permite ao usuário selecionar filtros e um fator de risco. `handleGenerateSuggestions` chama o `geminiService` para obter um plano de ação em JSON. Gerencia um estado local (`currentActions`) para permitir que o usuário adicione, edite e remova ações manualmente. Possui a lógica para arquivar o plano no `localStorage` ou publicá-lo como uma iniciativa.
-   **`StaffUserManagementView.tsx` / `StaffDataImportView.tsx` etc.:**
    -   **Lógica:** Implementam a interface do painel de Staff.
        -   **`StaffUserManagementView`:** Contém a lógica de UI para CRUD (Adicionar, Deletar) de Empresas, Filiais, Usuários e Colaboradores. Inclui paginação e busca, cujos estados são usados para chamar as funções correspondentes do `dataService`.
        -   **`StaffDataImportView`:** Lida com a interface de upload de arquivos. Usa a biblioteca `XLSX` (carregada via CDN no `index.html`) para ler os arquivos `.xls` ou `.xlsx` no navegador, convertê-los para JSON e, em seguida, enviar esses dados para as funções `import...` do `dataService`.

### 3.5. Documentação (`docs/`)

-   **`REPLIT_GUIDE.md`:** (NOVO) Guia completo para configurar e rodar o projeto no Replit.
-   **`BACKEND_IMPLEMENTATION_GUIDE.md`:** O guia técnico para a construção do servidor backend. Descreve o schema do banco de dados (usando a sintaxe do Prisma) e o contrato da API RESTful (endpoints, métodos, payloads).
-   **`FULL_STACK_MIGRATION_PLAN.md`:** O plano estratégico para a transição do protótipo para uma aplicação full-stack no Replit.
-   **`SECURITY_ARCHITECTURE.md`:** Descreve os pilares de segurança da aplicação, com foco em Autenticação (bcrypt), Autorização (RBAC com JWT), Multi-Tenancy (isolamento de dados por `companyId`) e o padrão de Proxy Seguro para a API do Gemini.
-   **`PROJECT_STATUS.md`:** Este próprio arquivo, que serve como um resumo e um índice técnico de todo o projeto no seu estado atual.

---

## 4. Resumo das Fases Futuras (Focadas no Replit)

1.  **Fase 1: Construção do Backend no Replit**
    -   Criar o Repl "Node.js".
    -   Configurar dependências e o banco de dados PostgreSQL integrado do Replit.
    -   Implementar o schema Prisma e a autenticação.

2.  **Fase 2: Migração da Lógica de Negócio**
    -   Mover toda a lógica de cálculo de `dataService.ts` para os services do NestJS.
    -   Implementar os endpoints da API e testar no ambiente do Replit.

3.  **Fase 3: Integração com Frontend**
    -   Atualizar o frontend para apontar para a URL pública do Repl do backend.
    -   Substituir o mock service pelo cliente HTTP real.