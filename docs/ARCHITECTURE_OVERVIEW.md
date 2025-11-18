# Visão Geral da Arquitetura - Progredire+

## 1. Introdução

Este documento fornece uma visão de alto nível da arquitetura de software da plataforma Progredire+. Ele descreve como os componentes se interconectam, com foco na infraestrutura escolhida (Replit).

---

## 2. Diagrama da Arquitetura

A aplicação segue uma arquitetura SPA (Single Page Application) com backend RESTful hospedado na nuvem.

```
+---------------+      HTTPS      +---------------------+      SQL      +----------------+
|  Navegador do |  <----------> |   Backend (NestJS)  |  <--------> |  Banco de Dados  |
|   Usuário     |               |  (Hospedado no      |             |  (PostgreSQL     |
| (React SPA)   |               |      Replit)        |             |   do Replit)     |
+---------------+               +----------^----------+             +----------------+
                                           |
                                           | HTTPS (Server-to-Server)
                                           |
                                  +--------v--------+
                                  |    Google AI    |
                                  |  (Gemini API)   |
                                  +-----------------+
```

---

## 3. Detalhamento dos Componentes

### 3.1. Frontend (React SPA)
-   **Tecnologia:** React, TypeScript, Tailwind CSS.
-   **Responsabilidade:** Interface do usuário.
-   **Hospedagem:** Pode ser hospedado no próprio Replit (como arquivos estáticos servidos pelo NestJS) ou em serviços como Vercel/Netlify.

### 3.2. Backend (NestJS no Replit)
-   **Tecnologia:** NestJS (Node.js).
-   **Infraestrutura:** **Replit**. O Replit fornece o ambiente de execução Node.js e gerencia o processo do servidor.
-   **Responsabilidade:**
    -   API RESTful.
    -   Lógica de Negócio (Cálculo de IRP, IPE).
    -   Autenticação e Autorização.
    -   **Proxy Seguro:** Protege a `API_KEY` do Gemini e intermedeia as chamadas de IA.

### 3.3. Banco de Dados (Replit Postgres)
-   **Tecnologia:** PostgreSQL.
-   **Infraestrutura:** Integrada nativamente ao Replit. A connection string é injetada automaticamente nas variáveis de ambiente do Repl.
-   **ORM:** Prisma. Usado para gerenciar o schema e as queries de forma segura.

### 3.4. Integração com IA
-   **Serviço:** Google Gemini API.
-   **Segurança:** A chave de API reside apenas nas **Secrets** do Replit, nunca no código do frontend.

---

## 4. Estrutura de Diretórios

*   `/src` (Frontend): Código React atual.
*   `/docs`: Documentação.
*   *(No Backend/Repl separado)*:
    *   `/src`: Controllers, Services e Modules do NestJS.
    *   `/prisma`: Schema do banco de dados.

---

## 5. Onde ir a Seguir

*   Para configurar o backend: **[REPLIT_GUIDE.md](./REPLIT_GUIDE.md)**.
*   Para entender o banco de dados: **[BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)**.
*   Para entender a segurança: **[SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)**.