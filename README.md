
# ✨ Progredire+ (Full-Stack)

Uma plataforma SaaS para análise psicossocial e pesquisa organizacional utilizando IA. O sistema transforma dados subjetivos de bem-estar em insights acionáveis para empresas e colaboradores.

---

## 🚀 Status do Projeto

**Versão Atual:** 2.0 (Monorepo Full-Stack)

O projeto evoluiu de um protótipo frontend para uma aplicação completa pronta para produção no **Replit**.

-   **Frontend:** React 19 + TypeScript + Vite (localizado na pasta `/frontend`).
-   **Backend:** NestJS + Prisma + PostgreSQL (localizado na raiz).
-   **Infraestrutura:** Configurado nativamente para o ambiente Replit (NixOS).

---

## 🛠️ Stack Tecnológica

### Backend (API & Core)
-   **Framework:** [NestJS](https://nestjs.com/) (Node.js)
-   **Linguagem:** TypeScript
-   **Banco de Dados:** PostgreSQL (via Replit Postgres)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **IA:** Google Gemini API (`@google/genai`)
-   **Autenticação:** JWT & Passport

### Frontend (Interface)
-   **Framework:** React 19
-   **Build Tool:** Vite
-   **Estilização:** Tailwind CSS
-   **Gráficos:** SVG Customizado

---

## 📂 Estrutura de Diretórios

O projeto opera como um monorepo híbrido:

```text
.
├── src/                 # Código fonte do Backend (NestJS)
├── prisma/              # Schema do Banco de Dados
├── frontend/            # Aplicação React (Movida para cá)
│   ├── src/
│   ├── index.html
│   └── vite.config.ts
├── docs/                # Documentação Técnica
├── .replit              # Configuração de execução do Replit
└── replit.nix           # Dependências do Sistema Linux
```

---

## ⚡ Como Rodar no Replit (Guia Rápido)

Siga estes passos para colocar o sistema no ar em minutos.

### 1. Configuração Inicial
1.  Importe este repositório para o Replit.
2.  Certifique-se de que a pasta `frontend` existe e contém os arquivos da interface.

### 2. Banco de Dados
1.  No painel lateral do Replit, vá em **Tools** > **PostgreSQL**.
2.  Clique para configurar o banco de dados padrão.

### 3. Segredos (Variáveis de Ambiente)
Vá em **Tools** > **Secrets** e adicione:

| Chave | Valor | Descrição |
| :--- | :--- | :--- |
| `API_KEY` | `AIzaSy...` | Sua chave da Google Gemini API. |
| `JWT_SECRET` | `sua-senha-secreta` | Hash para assinar tokens de login. |
| `DATABASE_URL` | (Automático) | Gerado pelo Replit Postgres. |

### 4. Instalação e Execução
1.  Abra o **Shell** e execute o script de setup para instalar dependências do Backend e do Frontend:
    ```bash
    npm run setup
    ```
2.  Clique no botão verde **Run** no topo da tela.

**O que vai acontecer?**
-   O Prisma irá gerar o cliente e criar as tabelas no banco (`db:deploy`).
-   O Backend iniciará na porta `3000`.
-   O Frontend iniciará na porta `5173` (com proxy para a API).
-   O Replit abrirá a janela de visualização (Webview).

---

## 📚 Documentação Técnica

Para detalhes profundos sobre o desenvolvimento e manutenção:

-   **[REPLIT_GUIDE.md](./docs/REPLIT_GUIDE.md):** Guia detalhado de configuração e troubleshooting no Replit.
-   **[BACKEND_IMPLEMENTATION_GUIDE.md](./docs/BACKEND_IMPLEMENTATION_GUIDE.md):** Especificação da API, Schema do Banco e Segurança.
-   **[DATA_GLOSSARY.md](./docs/DATA_GLOSSARY.md):** Explicação dos cálculos de IRP (Índice de Risco Psicossocial) e algoritmos.

---

## 🧪 Credenciais de Teste (Seed)

Se você rodar o script de seed (ou usar os mocks do frontend enquanto o backend não está 100% populado):

**Acesso Staff (Super Admin):**
-   **Email:** `leonardo.progredire@gmail.com`
-   **Senha:** `123`

**Acesso Empresa (InovaCorp):**
-   **Email:** `ana.costa@inovacorp.com`
-   **Senha:** `Mudar@123`

**Acesso Colaborador:**
-   **CPF:** `123.456.789-00`
-   **Senha:** `900`

---

## 🤝 Contribuição

1.  Sempre rode `npm run setup` após puxar novas alterações para garantir que as dependências de ambas as pastas (`/` e `/frontend`) estejam sincronizadas.
2.  Commits devem seguir o padrão Conventional Commits.
