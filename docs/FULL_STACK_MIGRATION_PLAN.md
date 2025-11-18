# Plano de Migração Full-Stack: Do Protótipo à Produção (Via Replit)

## 1. Visão Estratégica e Objetivos

O estado atual do **Progredire+** é um protótipo de frontend de alta fidelidade. O objetivo desta próxima fase é evoluir para uma **arquitetura full-stack robusta**, utilizando o **Replit** como plataforma de infraestrutura. Isso nos permitirá ter um backend NestJS e um banco de dados PostgreSQL prontos para produção em minutos, sem a complexidade de gerenciar servidores.

---

## 2. Abordagem Arquitetônica

1.  **Frontend (SPA):** React + TypeScript (hospedado onde preferir, consumindo o backend do Replit).
2.  **Backend (Replit):** NestJS rodando em um Repl.
    -   Lógica de negócio e cálculos (IRP, IPE).
    -   Proxy seguro para a API do Gemini.
    -   Autenticação JWT e RBAC.
3.  **Banco de Dados (Replit):** PostgreSQL integrado ao ambiente do Replit.

---

## 3. Stack de Tecnologia

-   **Linguagem:** TypeScript (Frontend e Backend).
-   **Backend Framework:** NestJS.
    -   Dependências: `@nestjs/core`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `@google/genai`.
-   **Banco de Dados:** PostgreSQL (via Replit Postgres).
-   **ORM:** Prisma (`prisma`, `@prisma/client`).

---

## 4. Plano de Execução Detalhado

### Fase 1: Configuração do Ambiente no Replit
1.  **Criar Repl:** Iniciar um projeto "Node.js" no Replit chamado `progredire-backend`.
2.  **Dependências:** Configurar o `package.json` com as libs do NestJS e Prisma (ver `REPLIT_GUIDE.md`).
3.  **Banco de Dados:** Ativar o PostgreSQL no painel lateral do Replit.
4.  **Secrets:** Configurar `API_KEY` (Gemini) e `JWT_SECRET` nas Secrets do Replit.
5.  **Schema e Migração:** Copiar o `schema.prisma` (do `BACKEND_IMPLEMENTATION_GUIDE.md`) e rodar `npx prisma migrate dev` no shell do Replit.

### Fase 2: Desenvolvimento do Core Backend
1.  **Auth Module:** Implementar login e JWT para os 3 papéis (`STAFF`, `COMPANY`, `COLLABORATOR`).
2.  **Migração de Lógica:** Transferir as funções de cálculo de `services/dataService.ts` (frontend) para Services do NestJS.
3.  **Proxy Gemini:** Criar o `AiModule` para receber requisições do frontend, adicionar a `API_KEY` segura e chamar o Google Gemini.

### Fase 3: Endpoints de Dados e Gestão
1.  **Dashboard:** Criar `GET /api/dashboard` com filtragem estrita por `companyId`.
2.  **Staff:** Implementar endpoints para criar empresas e usuários, protegidos pelo guard de `STAFF`.
3.  **Importação:** Implementar endpoints que aceitam JSON (convertido de XLS no frontend) para popular o banco.

### Fase 4: Integração do Frontend
1.  **API Client:** Criar `services/apiClient.ts` no frontend.
2.  **Configuração:** Apontar a `BASE_URL` do frontend para a URL pública do Repl (ex: `https://progredire-backend.user.repl.co/api`).
3.  **Substituição:** Trocar as chamadas ao `dataService.ts` (mock) pelas chamadas ao `apiClient.ts`.

### Fase 5: Testes e Validação
1.  **Testes de Integração:** Usar o Shell do Replit para rodar testes (`npm run test`) e verificar a integridade dos dados.
2.  **Validação E2E:** Acessar o frontend, fazer login e verificar se os dados carregados vêm do banco do Replit.

---

## 5. Conclusão

Utilizar o Replit acelera drasticamente a configuração da infraestrutura, permitindo que foquemos na lógica de negócio e na segurança dos dados. Siga o `REPLIT_GUIDE.md` para os comandos exatos de configuração.