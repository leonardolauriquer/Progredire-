# Progredire+ - Replit Configuration

## Estrutura do Projeto

Este é um projeto monorepo com:
- **Backend (NestJS)**: Na raiz do projeto (`/src`)
- **Frontend (React + Vite)**: Na pasta `/frontend`

## Como Rodar o Projeto

### Primeira Vez (Setup Inicial)

1. As dependências do backend já estão instaladas
2. Para instalar as dependências do frontend, execute:
   ```bash
   ./setup-frontend.sh
   ```

### Desenvolvimento

O workflow "Frontend" está configurado para rodar automaticamente:
- **Comando**: `cd frontend && npm run dev`
- **Porta**: 5000 (configurada no Vite)
- **URL**: O Replit abrirá automaticamente a webview

### Estrutura de Pastas

```
/
├── src/                    # Backend NestJS
├── frontend/               # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços (API, auth, etc)
│   ├── vite.config.ts     # Configuração do Vite (porta 5000)
│   └── package.json       # Dependências do frontend
├── prisma/                # Schema do banco de dados
└── package.json           # Dependências do backend

```

## Variáveis de Ambiente Necessárias

Adicione estas secrets no Replit:
- `GEMINI_API_KEY` ou `API_KEY`: Chave da API do Google Gemini (obtenha em https://aistudio.google.com/app/apikey)
- `JWT_SECRET`: Segredo para tokens JWT
- `DATABASE_URL`: URL do banco PostgreSQL (gerado automaticamente pelo Replit)

**Nota**: A aplicação carrega normalmente mesmo sem a `GEMINI_API_KEY` configurada. As funcionalidades de IA só serão ativadas após você adicionar a chave nas Secrets do Replit.

## Tecnologias

### Frontend
- React 19
- TypeScript
- Vite
- Google Gemini AI SDK (@google/genai)

### Backend
- NestJS
- Prisma
- PostgreSQL
- JWT Authentication

## Notas Importantes

- O frontend roda na **porta 5000** (única porta exposta para webview no Replit)
- O backend (quando implementado) rodará em outra porta interna
- Use `./setup-frontend.sh` sempre que atualizar dependências do frontend
