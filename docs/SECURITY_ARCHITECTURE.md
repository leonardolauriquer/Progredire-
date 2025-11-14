# Arquitetura de Segurança - Progredire+

## 1. Introdução e Filosofia

Este documento descreve a arquitetura de segurança da aplicação Progredire+. Dada a natureza dos dados que manuseamos — informações psicossociais sensíveis de colaboradores — e o modelo de negócio multi-tenant (múltiplas empresas clientes em uma única plataforma), a segurança não é um recurso, mas sim o **fundamento principal** do nosso sistema.

Nossa filosofia é a **defesa em profundidade**. Implementamos múltiplas camadas de segurança independentes, de modo que a falha de uma camada não comprometa a segurança do sistema como um todo.

---

## 2. Os 5 Pilares da Segurança

Nossa estratégia se baseia em cinco pilares fundamentais:

### Pilar 1: Autenticação e Autorização Robusta (Controle de Acesso)

Este pilar responde a duas perguntas: **"Quem é você?"** (Autenticação) e **"O que você tem permissão para fazer?"** (Autorização).

#### a. Autenticação Segura
-   **Backend:** As senhas dos usuários NUNCA devem ser armazenadas em texto simples. Utilizaremos um algoritmo de hash de via única, forte e com "sal" (salt), como o **bcrypt**. Apenas o hash da senha é armazenado no banco de dados, tornando impossível a engenharia reversa para descobrir a senha original.
-   **Frontend:** A responsabilidade do frontend é fornecer uma interface segura para a coleta de credenciais e transmiti-las de forma segura (via HTTPS) para o backend.

#### b. Autorização por Papel (Role-Based Access Control - RBAC)
-   **Backend:** O backend é a autoridade final para autorização. Cada requisição à API deve ser validada para garantir que o usuário autenticado tem permissão para realizar a ação.
-   **Definição dos Papéis:**
    -   **`STAFF`:** Superusuário da plataforma. Pode gerenciar clientes (empresas), aprovar campanhas e visualizar dados de saúde do sistema. O acesso aos dados de um cliente específico só é permitido através de uma funcionalidade de **"Acesso Delegado"**, que deve ser auditada e registrada.
    -   **`COMPANY`:** Usuário de gestão (RH, líder). Acesso **restrito aos dados agregados e anônimos da sua própria empresa**. É tecnicamente impossível para um usuário `COMPANY` visualizar dados de outra empresa ou respostas individuais de um colaborador.
    -   **`COLLABORATOR`:** Usuário final (funcionário). Acesso **estritamente limitado aos seus próprios dados pessoais**, como histórico de evolução, diário de emoções e suas próprias respostas de questionário.

#### c. Gerenciamento de Sessão com JWT (JSON Web Tokens)
-   **Backend:** Após o login, o backend gera um token JWT assinado digitalmente. Este token conterá claims essenciais:
    -   `userId`: Identificador único do usuário.
    -   `role`: O papel do usuário (`STAFF`, `COMPANY`, `COLLABORATOR`).
    -   `companyId`: O identificador da empresa do usuário (nulo para `STAFF`). Este claim é **CRÍTICO** para o pilar de Multi-Tenancy.
-   **Frontend:** O token é armazenado no cliente (atualmente `localStorage`, mas idealmente em um **cookie `HttpOnly`** para maior segurança contra ataques XSS) e enviado em cada requisição à API no header `Authorization: Bearer <token>`.

### Pilar 2: Multi-Tenancy e Isolamento Total de Dados

Este é o pilar de segurança mais crítico para um SaaS. A regra de ouro é: **os dados da "InovaCorp" NUNCA devem ser vistos pela "NexusTech"**.

#### a. No Banco de Dados
-   Cada tabela que contém dados de um cliente (ex: `Users`, `SurveyResponses`, `ActionPlans`, `Documents`) **deve obrigatoriamente** ter uma coluna `companyId` que atua como uma chave estrangeira para a tabela `Company`.

#### b. No Backend (API) - A Camada de Execução
-   Esta é a camada onde o isolamento é garantido.
-   **TODA E QUALQUER CONSULTA AO BANCO DE DADOS** que se origine de uma requisição de um usuário `COMPANY` ou `COLLABORATOR` **DEVE SER AUTOMATICAMENTE FILTRADA** pelo `companyId` extraído do seu token JWT.
-   **Exemplo Prático (usando Prisma):** Uma chamada de serviço para buscar planos de ação, como `prisma.actionPlan.findMany()`, deve ser implementada como `prisma.actionPlan.findMany({ where: { companyId: user.companyId } })`. Esta lógica deve ser centralizada, por exemplo, em um serviço base ou em um decorador, para evitar esquecimentos e garantir a aplicação consistente desta regra em toda a API.

### Pilar 3: Proteção de Dados e Privacidade

#### a. Dados em Trânsito
-   Toda a comunicação entre o cliente (navegador) e o nosso servidor backend deve ser criptografada usando **HTTPS (TLS)**. Isso impede que ataques de "man-in-the-middle" interceptem e leiam os dados.

#### b. Dados em Repouso
-   Os dados no banco de dados devem ser criptografados. A maioria dos provedores de banco de dados em nuvem (como AWS RDS, Google Cloud SQL) oferece criptografia em repouso por padrão.

#### c. Anonimização de Dados
-   Para o dashboard da empresa, o backend é responsável por agregar os dados. As respostas individuais (`SurveyResponse`) são processadas para gerar estatísticas (médias, contagens, porcentagens). Apenas esses **dados agregados e anônimos** são expostos aos usuários do tipo `COMPANY`. A ligação direta entre um colaborador e suas respostas brutas é quebrada para fins de análise gerencial.

### Pilar 4: Integração Segura com a API de IA (Gemini)

#### a. O Problema
-   A chave de API do Google Gemini é um segredo extremamente sensível. Se exposta no código do frontend, ela pode ser roubada e usada por qualquer pessoa, gerando custos significativos em nossa conta e permitindo o uso indevido do serviço.

#### b. A Solução: Padrão de Proxy Seguro
1.  O frontend **NUNCA** se comunicará diretamente com a API do Gemini.
2.  O frontend fará chamadas para o **nosso próprio backend** (ex: `POST /api/ai/dashboard-insight`).
3.  O nosso backend receberá a requisição, validará a autenticação e autorização do usuário.
4.  O backend, de forma segura no ambiente do servidor, recuperará a `API_KEY` de uma variável de ambiente.
5.  O backend então fará a chamada para a API do Gemini, adicionando a chave.
6.  A resposta do Gemini volta para o nosso backend, que pode processá-la antes de repassá-la ao frontend.

**Benefício:** A chave de API nunca sai do nosso ambiente de servidor controlado e seguro.

### Pilar 5: Segurança da Aplicação e Código (Boas Práticas)

#### a. Validação de Entrada
-   **Backend:** O backend **NUNCA DEVE CONFIAR** nos dados vindos do frontend. Toda entrada de API deve ser rigorosamente validada (tipo, formato, comprimento, valores permitidos) usando DTOs (Data Transfer Objects) e bibliotecas como `class-validator`. Isso previne uma vasta gama de ataques, incluindo injeção de dados.

#### b. Prevenção de Vulnerabilidades Comuns
-   **SQL Injection:** O uso de um ORM como o **Prisma** mitiga esse risco, pois ele constrói as queries de forma segura e parametrizada.
-   **Cross-Site Scripting (XSS):**
    -   **Frontend:** O React, por padrão, "escapa" o conteúdo renderizado, o que nos protege da maioria dos ataques XSS. Devemos **evitar ao máximo** o uso da propriedade `dangerouslySetInnerHTML`.
    -   **Backend:** O backend pode reforçar a proteção definindo um header `Content-Security-Policy` (CSP) para restringir de onde os scripts podem ser carregados.
-   **Cross-Site Request Forgery (CSRF):** A nossa abordagem de usar tokens JWT enviados no header `Authorization` já é uma excelente mitigação contra o CSRF tradicional.

#### c. Gerenciamento de Dependências
-   Devemos auditar regularmente as dependências do nosso projeto (tanto no frontend quanto no backend) usando ferramentas como `npm audit` para identificar e corrigir vulnerabilidades conhecidas.

---

## 4. Conclusão

A segurança da aplicação Progredire+ é uma responsabilidade compartilhada entre o frontend e o backend, mas com o **backend atuando como a autoridade final e a muralha de proteção dos dados**. Ao implementar rigorosamente estes cinco pilares, garantimos a confidencialidade, integridade e disponibilidade dos dados de nossos clientes, construindo uma plataforma confiável e segura.