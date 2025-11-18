# Guia de UI/UX e Padrões de Frontend - Progredire+

## 1. Introdução

Este documento serve como a fonte da verdade para a interface do usuário (UI) e a experiência do usuário (UX) da aplicação Progredire+. O seu objetivo é garantir **consistência, qualidade e eficiência** no desenvolvimento de novas funcionalidades e componentes.

Todos os desenvolvedores que trabalham no frontend devem seguir estas diretrizes para manter uma experiência coesa e intuitiva para todos os perfis de usuário.

---

## 2. Filosofia de Design

Nossa interface é guiada por quatro princípios fundamentais:

1.  **Empática:** A interface deve ser acolhedora e tranquilizadora. As cores, a linguagem e o feedback devem validar os sentimentos do usuário, especialmente nas seções de reflexão e bem-estar.
2.  **Clara:** A informação deve ser apresentada de forma direta e fácil de entender. Gráficos complexos devem ser acompanhados de legendas claras, e a hierarquia visual deve guiar o olho do usuário para o que é mais importante.
3.  **Acionável:** A interface não deve apenas apresentar dados, mas também inspirar a ação. Cada insight, gráfico ou relatório deve, sempre que possível, estar conectado a um próximo passo claro, seja um botão para "Criar Plano de Ação" ou uma sugestão para reflexão.
4.  **Confiável:** A UI deve transmitir segurança e profissionalismo. Isso se traduz em um design limpo, feedback consistente para as ações do usuário e uma clara separação visual entre dados e controles.

---

## 3. Sistema de Cores (Design Tokens)

As cores são gerenciadas através de **variáveis CSS (CSS Custom Properties)** definidas no `index.html`. Isso permite a troca de temas de forma eficiente e garante consistência.

### 3.1. Variáveis Semânticas

Sempre utilize as variáveis semânticas em vez de cores fixas.

-   `--color-background`: Cor de fundo principal da aplicação.
-   `--color-foreground`: Cor do texto principal.
-   `--color-card`: Cor de fundo para elementos contêiner, como cards e modais.
-   `--color-card-foreground`: Cor do texto principal dentro de um card.
-   `--color-card-muted-foreground`: Cor para texto secundário ou descritivo dentro de um card.
-   `--color-muted`: Cor de fundo para elementos sutis, como divisórias ou fundos de `blockquote`.
-   `--color-border`: Cor para bordas de cards, inputs e divisórias.
-   `--color-primary-600`: Cor principal para ações primárias (botões, links ativos).
-   `--color-primary-50`: Cor de fundo sutil para indicar um item ativo ou selecionado (ex: item de menu na sidebar).
-   `--color-destructive`: Cor para ações perigosas (ex: excluir).

### 3.2. Temas

O sistema suporta múltiplos temas que são aplicados como classes na tag `<html>`:

-   `theme-default-light` (Padrão)
-   `theme-default-dark`
-   `theme-colorblind-light` (Contraste otimizado)
-   `theme-colorblind-dark`

A lógica para aplicar o tema está no `index.html` e no componente `pages/SettingsView.tsx`.

---

## 4. Tipografia e Espaçamento

-   **Fonte Principal:** `Inter`. É uma fonte limpa e legível, ideal para interfaces.
-   **Hierarquia de Texto:**
    -   **Títulos de Página (`h1`):** `text-3xl font-bold` ou `text-4xl font-extrabold` em páginas de destaque como a Home.
    -   **Títulos de Seção (`h2`):** `text-2xl font-bold`.
    -   **Subtítulos (`h3`):** `text-xl font-semibold`.
    -   **Corpo de Texto:** Tamanho base (`1rem` / `16px`), `text-slate-600` ou `var(--color-card-muted-foreground)`.
-   **Tamanho da Fonte Acessível:** O sistema permite que o usuário altere o tamanho da fonte base (`sm`, `md`, `lg`) através de classes na tag `<html>`. Todos os tamanhos de fonte devem ser definidos com unidades relativas (`rem`) para respeitar essa configuração.
-   **Espaçamento:** Utilize as classes de espaçamento do Tailwind (`space-y-4`, `p-6`, `gap-8`) para manter um ritmo visual consistente.

---

## 5. Iconografia

-   **Biblioteca:** Utilizamos um conjunto de ícones no estilo "outline" do Heroicons, centralizados no arquivo `components/icons.tsx`.
-   **Padrões de Uso:**
    -   **Ícones em linha com texto ou em botões pequenos:** `w-5 h-5`.
    -   **Ícones de navegação (sidebar):** `w-6 h-6`.
    -   **Ícones de destaque em cards ou títulos:** `w-8 h-8` ou maior.
-   **Consistência:** Sempre que possível, utilize ícones já existentes no `icons.tsx`. Se um novo ícone for necessário, ele deve seguir o mesmo estilo (outline, `strokeWidth={1.5}`) e ser adicionado ao arquivo central.

---

## 6. Componentes e Padrões de UI

### 6.1. Cards

O **Card** é o principal contêiner de conteúdo.

-   **Estilo:** `bg-[--color-card]`, `rounded-2xl`, `shadow-lg`, `border border-[--color-border]`.
-   **Padding:** Geralmente `p-6` ou `p-8`.
-   **Uso:** Agrupar informações relacionadas, como um gráfico, uma seção de um formulário ou um item de uma lista.

### 6.2. Botões

-   **Botão Primário (Ação Principal):**
    -   **Estilo:** `bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700`.
    -   **Uso:** Para a ação mais importante em uma tela (ex: "Analisar", "Salvar").
-   **Botão Secundário (Ação Alternativa):**
    -   **Estilo:** `bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50`.
    -   **Uso:** Para ações secundárias (ex: "Exportar", "Cancelar").
-   **Botão de Perigo (Destrutivo):**
    -   **Estilo:** `bg-[--color-destructive] text-white ...`.
    -   **Uso:** Para ações irreversíveis (ex: "Excluir").

### 6.3. Formulários

-   **Inputs e Selects:** Devem ter um fundo `bg-white` ou `bg-[--color-input]`, borda `border border-slate-300`, e um anel de foco claro `focus:ring-2 focus:ring-blue-500`.
-   **Labels:** Devem estar sempre presentes (`<label>`), associadas ao seu input (`htmlFor`). Use a classe `sr-only` se o label precisar ser visualmente oculto.

### 6.4. Campos de Data (Date Pickers)

-   **Comportamento:** Para garantir uma experiência consistente e intuitiva, não utilizamos o estilo padrão do navegador para inputs de data.
-   **Implementação:** Utilizamos um contêiner personalizado que simula um input de texto com um ícone de calendário. Ao clicar em *qualquer parte* do campo, o seletor de data nativo do sistema operacional (mobile ou desktop) é acionado programaticamente (`showPicker()`). Isso resolve problemas de usabilidade onde o clique precisava ser exato no ícone padrão do navegador e garante que o calendário sempre apareça.

### 6.5. Navegação Responsiva

-   **Unificação:** A navegação foi consolidada na **Barra Lateral (Sidebar)** para todas as resoluções, removendo a barra inferior em dispositivos móveis.
-   **Mobile:** A barra lateral fica oculta por padrão e desliza sobre o conteúdo (estilo Drawer) ao ser acionada pelo ícone de menu "hambúrguer" no cabeçalho.
-   **Desktop:** A barra lateral é fixa, podendo ser colapsada para ganhar espaço de tela.

---

## 7. Padrões de Feedback ao Usuário

A comunicação clara do estado da aplicação é crucial para uma boa UX.

-   **Estado de Carregamento (Loading):**
    -   **Ações em Botões:** O texto do botão muda para "Carregando..." e um `<LoadingSpinner />` é exibido. O botão é desabilitado.
    -   **Carregamento de Dados de Página/Componente:** Exiba um esqueleto de UI (se for complexo) ou um spinner centralizado com uma mensagem ("Carregando dados...").
-   **Estado de Erro (Error):**
    -   Exiba um componente de alerta claro, geralmente com fundo vermelho (`bg-red-100`) e borda (`border-red-500`), informando o que deu errado e, se possível, como o usuário pode prosseguir.
-   **Estado de Sucesso (Success):**
    -   Para ações que não resultam em uma mudança de página, forneça um feedback claro. Ex: o botão "Salvar" muda para "Salvo com Sucesso!" por alguns segundos, ou um "toast" de notificação aparece.

---

## 8. Acessibilidade (A11y)

-   **HTML Semântico:** Use as tags HTML corretas para o seu propósito (`<nav>`, `<main>`, `<button>`, etc.).
-   **Atributos ARIA:** Use atributos `aria-*` quando necessário para descrever o papel e o estado de componentes dinâmicos (ex: `aria-expanded` para acordeões).
-   **Contraste de Cores:** Nossos temas foram criados com o contraste em mente. O tema "Daltonismo" oferece uma paleta alternativa para garantir a legibilidade dos gráficos.
-   **Navegação por Teclado:** Garanta que todos os elementos interativos (botões, links, inputs) sejam focáveis e operáveis via teclado. O anel de foco (`focus:ring`) é um indicador visual essencial e não deve ser removido.
-   **Texto Alternativo:** Forneça texto alternativo para imagens (`alt` attribute), a menos que sejam puramente decorativas.
