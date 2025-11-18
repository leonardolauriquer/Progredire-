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
- [Documentação Técnica](#-documentação-técnica)

---

## 🎯 Visão Geral

O **Progredire+** é uma plataforma de software como serviço (SaaS) projetada para ajudar organizações a entenderem e melhorarem a saúde psicossocial de seus colaboradores. A aplicação oferece ferramentas distintas para dois perfis principais:

1.  **Empresa:** Gestores e profissionais de RH têm acesso a um dashboard agregado e anônimo, que fornece uma visão macro da saúde organizacional. Com base nesses dados, eles podem gerar relatórios estratégicos com IA, criar planos de ação e lançar campanhas de pesquisa de clima.
2.  **Colaborador:** Os funcionários têm um espaço seguro e confidencial para autorreflexão, acompanhamento de seu bem-estar emocional e para responder aos questionários da empresa, sabendo que suas respostas individuais nunca serão expostas.

O objetivo é transformar dados subjetivos de bem-estar em insights acionáveis, promovendo uma cultura organizacional mais saudável, produtiva e resiliente.

---

## 🚀 Status Atual do Projeto

Atualmente, este repositório contém o **Frontend de Alta Fidelidade** da aplicação.

-   **Frontend:** Interface completa, responsiva e interativa desenvolvida em React.
-   **Backend Simulado:** A lógica de negócio e banco de dados estão atualmente simulados no frontend (`services/dataService.ts`) para fins de prototipagem e validação de UX.
-   **Próxima Fase (Em Andamento):** Estamos migrando a lógica de negócio para um backend real hospedado no **Replit**, utilizando NestJS e PostgreSQL.

---

## ✨ Principais Funcionalidades

### Para a Empresa (Gestores/RH)

-   **Dashboard Executivo:** Visualize o IRP (Índice de Risco Psicossocial) Global, fatores críticos, KPIs de bem-estar e análises cruzadas.
-   **Geração de Relatórios com IA:** Gere análises estratégicas do dashboard com sumário executivo, pontos fortes, pontos de atenção e recomendações.
-   **Análise de Evolução:** Acompanhe a trajetória dos indicadores de saúde organizacional ao longo do tempo e compare diferentes setores.
-   **Gerenciamento de Campanhas:** Crie, dispare e monitore pesquisas de clima para públicos segmentados.
-   **Plano de Ação com IA:** Transforme insights em planos de ação concretos, com diagnóstico, objetivos, ações sugeridas e KPIs gerados por IA.
-   **Assistente IA:** Converse com um assistente para obter respostas rápidas sobre os dados da sua organização.

### Para o Colaborador

-   **Reflexão Pessoal:** Um espaço confidencial para descrever um sentimento ou desafio e receber uma perspectiva de apoio da IA.
-   **Diário de Emoções:** Registre seu humor diário e acompanhe sua jornada emocional.
-   **Questionário Psicossocial:** Responda às pesquisas da empresa de forma 100% anônima.
-   **Evolução Pessoal:** Visualize seu progresso pessoal com base nas suas respostas aos questionários ao longo do tempo.
-   **Mural de Iniciativas:** Veja as ações que a empresa está tomando para melhorar o ambiente de trabalho.

### Para a Equipe Staff

-   **Painel de Staff:** Um painel centralizado para aprovar campanhas pendentes e gerenciar a documentação de segurança de todas as empresas clientes.
-   **Acesso Delegado:** Funcionalidade para simular a visão de clientes para suporte e testes.

---

## 🛠️ Stack de Tecnologia

### Frontend (Atual)

-   **Framework:** React 19
-   **Linguagem:** TypeScript
-   **Build Tool:** Vite
-   **Estilização:** Tailwind CSS
-   **IA:** Google Gemini API (`@google/genai`)

### Backend & Infraestrutura (Definido)

A infraestrutura de backend foi definida para utilizar a plataforma **Replit** pela sua agilidade e recursos integrados.

-   **Plataforma:** Replit
-   **Runtime:** Node.js
-   **Framework:** NestJS
-   **Banco de Dados:** PostgreSQL (Integrado ao Replit)
-   **ORM:** Prisma
-   **Autenticação:** JWT (JSON Web Tokens)
-   **Proxy de IA:** O backend atuará como proxy seguro para a API do Gemini.

---

## 💻 Como Usar o Protótipo

Como o projeto atual é um protótipo frontend-first, você pode testar todas as funcionalidades imediatamente:

1.  **Abra a aplicação:** A tela de login será exibida.
2.  **Escolha seu perfil:**
    -   Clique em **"Acessar como Empresa"** para entrar no painel de gestão.
    -   Clique em **"Acessar como Colaborador"** para entrar na visão do funcionário.
3.  **Acesso Staff (Especial):**
    -   Na tela de login, clique no link "É membro da equipe? Acesse aqui." na parte inferior.
    -   Use o e-mail: `leonardo.progredire@gmail.com` e senha `123`.

---

## 🏗️ Arquitetura e Próximos Passos

A arquitetura seguirá o modelo SPA (Single Page Application) consumindo uma API RESTful.

1.  **Frontend:** Responsável apenas pela apresentação e interação do usuário.
2.  **Backend (Replit):** Responsável pela regra de negócios, cálculos de IRP/IPE, segurança e persistência de dados.

Consulte o **[FULL_STACK_MIGRATION_PLAN.md](./docs/FULL_STACK_MIGRATION_PLAN.md)** para detalhes da migração.

---

## 📄 Documentação Técnica

A documentação detalhada para desenvolvedores está localizada na pasta `docs/`:

-   **[REPLIT_GUIDE.md](./docs/REPLIT_GUIDE.md):** (IMPORTANTE) Guia passo a passo para configurar o backend e banco de dados no Replit.
-   **[BACKEND_IMPLEMENTATION_GUIDE.md](./docs/BACKEND_IMPLEMENTATION_GUIDE.md):** Especificação técnica da API, Schema do Prisma e estrutura do NestJS.
-   **[ARCHITECTURE_OVERVIEW.md](./docs/ARCHITECTURE_OVERVIEW.md):** Mapa visual da arquitetura e explicação dos componentes.
-   **[SECURITY_ARCHITECTURE.md](./docs/SECURITY_ARCHITECTURE.md):** Diretrizes de segurança, criptografia e controle de acesso (RBAC).
-   **[DATA_GLOSSARY.md](./docs/DATA_GLOSSARY.md):** Explicação das métricas e cálculos (IRP, IPE, Maturidade).