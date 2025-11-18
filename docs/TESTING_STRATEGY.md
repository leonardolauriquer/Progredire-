# Estratégia de Testes - Progredire+

## 1. Introdução e Filosofia

Este documento define a estratégia de testes para a aplicação Progredire+, garantindo a qualidade, estabilidade e segurança do software, especialmente durante e após a migração para uma arquitetura full-stack.

Nossa filosofia de testes é baseada na **Pirâmide de Testes**, um modelo que prioriza a distribuição de esforços de teste para maximizar a eficiência e a confiança. A pirâmide é composta por três camadas principais:

1.  **Base (Testes Unitários):** A maior parte dos nossos testes. São rápidos, isolados e validam pequenas unidades de lógica.
2.  **Meio (Testes de Integração):** Verificam a interação entre diferentes componentes do sistema (ex: API + Banco de Dados).
3.  **Topo (Testes de Ponta a Ponta - E2E):** A menor parte dos testes. Simulam a jornada completa do usuário na aplicação real.

```
      / \
     / E \
    /-----\
   /  I  \
  /-------\
 /    U    \
/-----------\
```

Onde: `U` = Unit (Unitário), `I` = Integration (Integração), `E` = End-to-End (Ponta a Ponta).

---

## 2. Testes de Backend

O backend é o cérebro da nossa aplicação, contendo a lógica de negócio crítica e as regras de segurança. Portanto, ele requer uma cobertura de testes robusta.

-   **Ferramentas Sugeridas:**
    -   **Framework de Testes:** **Jest** ou **Vitest**.
    -   **Testes de API:** **Supertest**.
    -   **Mocking:** **Prisma Mock** para simular o banco de dados em testes unitários.

### 2.1. Testes Unitários

-   **O que testar:**
    -   **Lógica de Negócio Pura:** Todos os cálculos em `services` (cálculo de IRP, IPE, Nível de Maturidade, etc.) devem ser testados de forma isolada com entradas mockadas.
    -   **Validação de Dados (DTOs):** Testar as regras de validação (`class-validator`) para garantir que os DTOs rejeitam dados inválidos e aceitam dados válidos.
    -   **Funções Utilitárias:** Qualquer função auxiliar que manipule dados ou realize tarefas específicas.
-   **Objetivo:** Garantir que cada peça de lógica funcione corretamente de forma isolada. São os testes mais rápidos e baratos de executar.

### 2.2. Testes de Integração

-   **O que testar:**
    -   **Endpoints da API:** Para cada endpoint, testar:
        -   O caminho feliz (requisição válida, resposta 200 OK com o formato esperado).
        -   Respostas de erro (ex: requisição com dados inválidos, resposta 400 Bad Request).
        -   **Regras de Autorização (RBAC):** Tentar acessar um endpoint de `COMPANY` com um token de `COLLABORATOR` e garantir que a resposta seja `403 Forbidden`. Tentar acessar um endpoint de `STAFF` com um token de `COMPANY` e garantir o mesmo.
        -   **Isolamento Multi-Tenancy:** Criar um cenário de teste com duas empresas (Empresa A e Empresa B). Fazer uma requisição com um token da Empresa A para um recurso da Empresa A e garantir o sucesso. Em seguida, fazer uma requisição com o mesmo token para um recurso da Empresa B e garantir que a resposta seja `404 Not Found` ou `403 Forbidden`.
    -   **Interação com o Banco de Dados:** Testar a lógica de CRUD completa, garantindo que os dados são corretamente criados, lidos, atualizados e deletados no banco de dados de teste.
-   **Objetivo:** Garantir que os diferentes módulos do backend (controllers, services, ORM) funcionem corretamente juntos e que as regras de segurança sejam infalíveis.

---

## 3. Testes de Frontend

O frontend é a face da nossa aplicação. Os testes devem garantir que a interface seja funcional, responsiva e livre de bugs para o usuário final.

-   **Ferramentas Sugeridas:**
    -   **Framework de Testes:** **Vitest** com **React Testing Library**.
    -   **Testes E2E:** **Cypress** ou **Playwright**.

### 3.1. Testes Unitários e de Componentes

-   **O que testar:**
    -   **Lógica de Componentes:** Qualquer lógica complexa dentro de um componente (ex: cálculos para formatação de dados em um gráfico, validação de formulários do lado do cliente).
    -   **Renderização Condicional:** Testar se o componente renderiza os elementos corretos com base nas props recebidas.
    -   **Interações do Usuário:** Usando a React Testing Library, simular eventos de clique, digitação, etc., e verificar se o estado do componente e a UI são atualizados corretamente.
-   **Objetivo:** Validar que cada componente React se comporta como esperado de forma isolada.

### 3.2. Testes de Ponta a Ponta (E2E)

-   **O que testar:** Fluxos críticos completos do usuário, simulando a interação em um navegador real.
-   **Cenários Críticos a serem cobertos:**
    1.  **Fluxo de Login:** Um usuário `COMPANY` consegue fazer login e ser redirecionado para o dashboard.
    2.  **Dashboard e Filtros:** Um usuário `COMPANY` acessa o dashboard, aplica um filtro de "Setor", e verifica se os gráficos são atualizados.
    3.  **Geração de Relatório com IA:** No dashboard, clicar em "Gerar Relatório Estratégico" e verificar se a análise da IA é exibida.
    4.  **Criação de Plano de Ação:** Navegar para "Plano de Ação", selecionar um fator, gerar sugestões com IA, adicionar uma ação manualmente e arquivar o plano.
    5.  **Fluxo do Colaborador:** Um usuário `COLLABORATOR` faz login, responde ao questionário psicossocial e submete.
    6.  **Fluxo de Staff (Acesso Delegado):** Um usuário `STAFF` faz login, navega para "Acesso Delegado", simula o acesso como uma empresa e verifica se o banner de personificação é exibido.
-   **Objetivo:** Garantir que a aplicação como um todo funcione perfeitamente, validando a integração entre o frontend e o backend em cenários do mundo real.

---

## 4. Integração Contínua (Continuous Integration - CI)

A automação dos testes é fundamental para manter a qualidade e a velocidade do desenvolvimento.

-   **Ferramenta:** **GitHub Actions**.
-   **Estratégia:**
    1.  **Gatilho:** Um workflow de CI será configurado para ser executado automaticamente a cada `push` em um branch ou a cada abertura/atualização de um `Pull Request` (PR).
    2.  **Jobs:** O workflow terá jobs separados para o backend e para o frontend.
        -   **Backend Job:** Instala dependências, executa o linter e roda **todos os testes unitários e de integração**.
        -   **Frontend Job:** Instala dependências, executa o linter e roda **todos os testes unitários e de componentes**.
    3.  **Proteção de Branch:** A branch principal (`main` ou `develop`) será protegida. A fusão (merge) de um PR só será permitida se:
        -   O workflow de CI for concluído com sucesso (todos os testes passaram).
        -   Houver pelo menos uma aprovação de outro membro da equipe (code review).
-   **Objetivo:** Automatizar a verificação de qualidade, prevenir a introdução de regressões (bugs em funcionalidades existentes) e garantir que o código na branch principal esteja sempre estável e funcional.
