# Visão Geral da Arquitetura - Progredire+

## 1. Introdução

Este documento fornece uma visão de alto nível da arquitetura de software da plataforma Progredire+. Ele serve como o ponto de partida para entender como os diferentes componentes do sistema (frontend, backend, banco de dados, serviços de IA) se interconectam.

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

## 4. Princípios Arquitetônicos Chave

-   **Multi-Tenancy:** A arquitetura é projetada desde o início para suportar múltiplos clientes. O isolamento de dados é a principal prioridade e é garantido no nível do backend e do banco de dados através do uso obrigatório de `companyId` em todas as consultas.
-   **Proxy Seguro para IA:** A chave da API do Gemini é um segredo de produção e nunca deve ser exposta no lado do cliente. O padrão de proxy no backend é uma medida de segurança não negociável.
-   **Role-Based Access Control (RBAC):** O acesso a cada endpoint da API é rigorosamente controlado pelo papel (`STAFF`, `COMPANY`, `COLLABORATOR`) contido no token JWT do usuário.

---

## 5. Exemplo de Fluxo de Dados: Carregando o Dashboard

Para ilustrar como os componentes interagem, vamos detalhar o fluxo quando um usuário da **Empresa** acessa o dashboard:

1.  **Login:** O usuário insere suas credenciais. O frontend envia para `POST /api/auth/login`.
2.  **Token:** O backend valida as credenciais, gera um token JWT contendo `userId`, `role: 'COMPANY'`, e `companyId`, e o retorna ao frontend.
3.  **Navegação:** O usuário clica no link do Dashboard.
4.  **Requisição:** O frontend faz uma requisição `GET /api/dashboard` para o backend, incluindo o token JWT no header `Authorization`.
5.  **Autorização:** O backend recebe a requisição, valida a assinatura do token e extrai o payload, confirmando que o usuário tem o papel `COMPANY` e pertence a uma `companyId` específica.
6.  **Lógica de Negócio:** O serviço do dashboard no backend executa as consultas necessárias ao banco de dados para buscar as respostas dos questionários, **sempre** adicionando a cláusula `WHERE companyId = [companyId do token]`.
7.  **Agregação:** O backend calcula todas as métricas (IRP, rankings, distribuições) com base nos dados filtrados.
8.  **Resposta:** O backend monta um objeto JSON com todos os dados calculados para o dashboard e o retorna como resposta à requisição do frontend.
9.  **Renderização:** O frontend recebe o JSON e o utiliza para renderizar os componentes de gráficos e KPIs.

---

## 6. Onde ir a Seguir

-   Para entender **o que** o protótipo faz hoje: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
-   Para entender **como** o backend deve ser construído: [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)
-   Para entender **o processo** de migração: [FULL_STACK_MIGRATION_PLAN.md](./FULL_STACK_MIGRATION_PLAN.md)
-   Para entender **os princípios de segurança**: [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)
-   Para entender **os padrões visuais**: [UI_UX_GUIDE.md](./UI_UX_GUIDE.md)
-   Para entender **as métricas de negócio**: [DATA_GLOSSARY.md](./DATA_GLOSSARY.md)