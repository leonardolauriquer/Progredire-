# ✨ Progredire+

Uma aplicação para análise psicossocial e pesquisa organizacional utilizando IA. Descreva uma situação ou sentimento e receba insights e perspectivas de apoio para promover a autorreflexão e o entendimento.

---

## 📖 Tabela de Conteúdos

- [Visão Geral](#-visão-geral)
- [Status Atual do Projeto](#-status-atual-do-projeto)
- [Principais Funcionalidades](#-principais-funcionalidades)
  - [Para a Empresa (Gestores/RH)](#para-a-empresa-gestoresrh)
  - [Para o Colaborador](#para-o-colaborador)
  - [Para a Equipe Staff](#para-a-equipe-staff)
- [Stack de Tecnologia](#-stack-de-tecnologia)
- [Como Usar o Protótipo](#-como-usar-o-protótipo)
- [Arquitetura e Próximos Passos](#-arquitetura-e-próximos-passos)
- [Documentação Adicional](#-documentação-adicional)

---

## 🎯 Visão Geral

O **Progredire+** é uma plataforma de software como serviço (SaaS) projetada para ajudar organizações a entenderem e melhorarem a saúde psicossocial de seus colaboradores. A aplicação oferece ferramentas distintas para dois perfis principais:

1.  **Empresa:** Gestores e profissionais de RH têm acesso a um dashboard agregado e anônimo, que fornece uma visão macro da saúde organizacional. Com base nesses dados, eles podem gerar relatórios estratégicos com IA, criar planos de ação e lançar campanhas de pesquisa de clima.
2.  **Colaborador:** Os funcionários têm um espaço seguro e confidencial para autorreflexão, acompanhamento de seu bem-estar emocional e para responder aos questionários da empresa, sabendo que suas respostas individuais nunca serão expostas.

O objetivo é transformar dados subjetivos de bem-estar em insights acionáveis, promovendo uma cultura organizacional mais saudável, produtiva e resiliente.

---

## 🚀 Status Atual do Projeto

Atualmente, o projeto existe como um **protótipo de frontend de alta fidelidade e totalmente funcional**.

-   **Frontend-First:** Toda a interface, experiência do usuário e interações do lado do cliente estão implementadas.
-   **Backend Simulado:** A lógica de negócio, manipulação de dados (`services/dataService.ts`) e chamadas à API de IA (`services/geminiService.ts`) são simuladas diretamente no frontend. Isso permitiu o desenvolvimento e teste rápidos da interface.
-   **Próximo Passo:** A próxima fase crítica do projeto é a **construção do backend** e a refatoração do frontend para se comunicar com ele, transformando o protótipo em uma aplicação full-stack.

O `BACKEND_IMPLEMENTATION_GUIDE.md` é o mapa detalhado para essa próxima fase de desenvolvimento.

---

## ✨ Principais Funcionalidades

### Para a Empresa (Gestores/RH)

-   **Dashboard Executivo:** Visualize o IRP (Índice de Risco Psicossocial) Global, fatores críticos, KPIs de bem-estar e análises cruzadas.
-   **Geração de Relatórios com IA:** Gere análises estratégicas do dashboard com sumário executivo, pontos fortes, pontos de atenção e recomendações.
-   **Análise de Evolução:** Acompanhe a trajetória dos indicadores de saúde organizacional ao longo do tempo e compare diferentes setores.
-   **Gerenciamento de Campanhas:** Crie, dispare e monitore pesquisas de clima para públicos segmentados.
-   **Plano de Ação com IA:** Transforme insights em planos de ação concretos, com diagnóstico, objetivos, ações sugeridas e KPIs gerados por IA.
-   **Acompanhamento de Ações:** Monitore o progresso de todas as iniciativas em um painel centralizado.
-   **Assistente IA:** Converse com um assistente para obter respostas rápidas sobre os dados da sua organização.

### Para o Colaborador

-   **Reflexão Pessoal:** Um espaço confidencial para descrever um sentimento ou desafio e receber uma perspectiva de apoio da IA.
-   **Diário de Emoções:** Registre seu humor diário e acompanhe sua jornada emocional.
-   **Questionário Psicossocial:** Responda às pesquisas da empresa de forma 100% anônima.
-   **Evolução Pessoal:** Visualize seu progresso pessoal com base nas suas respostas aos questionários ao longo do tempo.
-   **Mural de Iniciativas:** Veja as ações que a empresa está tomando para melhorar o ambiente de trabalho.
-   **Equipe de Apoio:** Acesse contatos de profissionais de saúde e da equipe Progredire+ para um bate-papo confidencial.

### Para a Equipe Staff

-   **Painel de Staff:** Um painel centralizado para aprovar campanhas pendentes e gerenciar a documentação de segurança de todas as empresas clientes.
-   **Gerenciamento de Documentos:** Monitore o status de validade de documentos importantes (PGR, PCMSO, etc.) com filtros e dashboards.

---

## 🛠️ Stack de Tecnologia

### Frontend (Atual)

-   **Framework:** React 19
-   **Linguagem:** TypeScript
-   **Estilização:** Tailwind CSS
-   **IA:** Integração direta com a API do Google Gemini (`@google/genai`)

### Backend (Planejado)

-   **Runtime:** Node.js
-   **Framework:** NestJS
-   **Banco de Dados:** PostgreSQL
-   **ORM:** Prisma
-   **Autenticação:** JWT (JSON Web Tokens)
-   **IA:** Proxy seguro que fará as chamadas para a API do Google Gemini.

---

## 💻 Como Usar o Protótipo

Como o projeto é um protótipo autocontido, não há um processo de build ou instalação. A interação principal se dá pela tela de login, que simula diferentes perfis de usuário.

1.  **Abra a aplicação:** A tela de login será exibida.
2.  **Escolha seu perfil:**
    -   Clique em **"Acessar como Empresa"** para entrar no painel de gestão, com acesso ao dashboard, campanhas, etc.
    -   Clique em **"Acessar como Colaborador"** para entrar na visão do funcionário, com acesso à reflexão pessoal, diário e questionários.
3.  **Acesso Staff (Especial):**
    -   Na tela de login, clique no link "É membro da equipe? Acesse aqui." na parte inferior.
    -   Use um dos seguintes e-mails para autenticar:
        -   `paula.progredire@gmail.com`
        -   `natieli.progredire@gmail.com`
        -   `leonardo.progredire@gmail.com`

---

## 🏗️ Arquitetura e Próximos Passos

A arquitetura atual, "frontend-first", será migrada para uma arquitetura **full-stack** robusta.

-   **O Frontend** será refatorado para se tornar uma SPA (Single Page Application) "pura", responsável apenas pela apresentação.
-   **Um novo Backend** será construído para:
    1.  Centralizar toda a lógica de negócio e cálculos.
    2.  Persistir todos os dados em um banco de dados PostgreSQL.
    3.  Atuar como um proxy seguro para a API do Gemini, protegendo a chave de API.

O plano detalhado para esta migração está descrito no documento `FULL_STACK_MIGRATION_PLAN.md`.

---

## 📄 Documentação Adicional

-   **[PROJECT_STATUS.md](./PROJECT_STATUS.md):** Um resumo detalhado do estado atual do projeto e as próximas etapas para cada módulo.
-   **[BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md):** O guia técnico completo para a construção do servidor backend, incluindo o schema do banco de dados e o contrato da API.
-   **[FULL_STACK_MIGRATION_PLAN.md](./FULL_STACK_MIGRATION_PLAN.md):** O plano estratégico e arquitetônico para a transição do protótipo para uma aplicação full-stack.
