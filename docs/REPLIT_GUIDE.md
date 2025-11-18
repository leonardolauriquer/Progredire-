# ⚡ Guia Mestre de Implementação no Replit - Progredire+

Este guia foi projetado para extrair o **máximo potencial** da plataforma Replit, transformando o protótipo do Progredire+ em uma aplicação Full-Stack profissional, segura e performática.

---

## 1. Arquitetura Otimizada no Replit

Para maximizar a produtividade (Dev) e a performance (Prod), usaremos uma abordagem híbrida:

1.  **Estrutura Monorepo:** Backend (Raiz) e Frontend (`/frontend`) no mesmo Repl.
2.  **Modo Desenvolvimento (Fast):** Backend e Frontend rodam simultaneamente em portas diferentes, com *proxy* do Vite para a API. Isso garante Hot Reload (HMR) instantâneo.
3.  **Modo Produção (Lean):** O Frontend é compilado e servido estaticamente pelo NestJS, usando um único processo e economizando recursos do contêiner (Reserved VM).

---

## 2. Configuração do Sistema (Nix)

O Replit usa **Nix** para gerenciar pacotes. O Prisma exige bibliotecas do sistema (OpenSSL) que não vêm por padrão.

### Passo 1: Configurar `replit.nix`

No seu Repl, edite o arquivo `replit.nix` (se não estiver visível, clique nos três pontos "..." no painel de arquivos > "Show hidden files").

```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
    # Dependências Críticas para o Prisma e NestJS
    pkgs.openssl
    pkgs.libiconv
    pkgs.postgresql_14 # Cliente p/ debug via shell
    pkgs.lsof # Útil para matar processos travados na porta 3000
  ];
  env = {
    # Garante que o Prisma encontre as bibliotecas do OpenSSL no NixOS
    PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
    PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
    PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";
  };
}
```

### Passo 2: Configurar `.replit`

Diz ao botão "Run" para instalar tudo e iniciar o modo de desenvolvimento.

```toml
# Comando executado ao clicar em RUN
run = "npm run start:replit-dev"

# Configuração de portas
ports = [3000, 5173]

[env]
NODE_ENV = "development"

[nix]
channel = "stable-23_11"
```

---

## 3. Dependências e Scripts (Package.json)

Precisamos instalar o `concurrently` para rodar front e back juntos no modo Dev.

**Atualize o `package.json` na raiz do Backend:**

```json
{
  "name": "progredire-fullstack",
  "version": "1.0.0",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "build:ui": "cd frontend && npm install && npm run build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    
    "// --- COMANDOS DO REPLIT ---": "",
    "setup": "npm install && cd frontend && npm install && cd ..",
    "db:deploy": "npx prisma generate && npx prisma migrate deploy",
    "start:replit-dev": "npm run db:deploy && concurrently \"npm:start:dev\" \"npm:start:frontend\"",
    "start:frontend": "cd frontend && npm run dev"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/serve-static": "^4.0.0",
    "@prisma/client": "^5.10.0",
    "bcrypt": "^5.1.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "concurrently": "^8.2.0", 
    "prisma": "^5.10.0",
    "rimraf": "^5.0.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3"
  }
}
```

---

## 4. Otimização de Código para o Replit

### 4.1. Binding de Rede (CRÍTICO)

No Replit, o servidor **NÃO** pode escutar em `localhost` (padrão do NestJS). Ele deve escutar em `0.0.0.0` para ser acessível externamente.

**Arquivo: `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Prefixo global para a API
  app.setGlobalPrefix('api');
  
  // Validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe());
  
  // Habilita CORS para desenvolvimento (Frontend porta 5173 -> Backend 3000)
  app.enableCors();

  // OBRIGATÓRIO NO REPLIT: Escutar em 0.0.0.0
  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

### 4.2. Configuração do Frontend (Vite)

Para que o frontend funcione dentro do Replit no modo Dev, precisamos configurar o host e o proxy.

**Arquivo: `frontend/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Necessário para o Replit expor a porta
    port: 5173,
    hmr: {
      clientPort: 443 // Força o HMR via HTTPS (necessário pois o Replit usa SSL)
    },
    proxy: {
      // Redireciona chamadas /api para o backend local
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

---

## 5. Banco de Dados (Prisma)

### Schema Otimizado para NixOS

No arquivo `prisma/schema.prisma`, adicione `binaryTargets` para garantir compatibilidade com o ambiente Linux do Replit.

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
// ... resto do schema
```

---

## 6. Servindo o Frontend em Produção

Para o deploy final, não queremos rodar o Vite. Queremos que o NestJS sirva os arquivos estáticos.

**Arquivo: `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// ... imports dos seus módulos

@Module({
  imports: [
    // Serve o React buildado na rota raiz
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
      exclude: ['/api/(.*)'], // Não interfere na API
    }),
    // AuthModule, UserModule, etc...
  ],
})
export class AppModule {}
```

---

## 7. Workflow de Instalação

1.  **Crie o Repl:** Importe o repositório.
2.  **Secrets:** Configure `API_KEY` (Gemini) e `JWT_SECRET`.
3.  **Banco:** Ative o PostgreSQL no painel do Replit.
4.  **Estrutura:** Mova a pasta do frontend atual para dentro de uma nova pasta `/frontend`.
5.  **Instalação:** Rode no Shell:
    ```bash
    npm run setup
    ```
6.  **Execução:** Clique no botão **Run**.
    *   O NestJS iniciará na porta 3000.
    *   O Vite iniciará na porta 5173.
    *   O Replit detectará as portas e abrirá a Webview.

Com essa configuração, você terá um ambiente de desenvolvimento ágil e um ambiente de produção robusto e otimizado, tudo dentro do mesmo Repl.
