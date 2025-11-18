# Glossário de Dados e Lógica de Negócio - Progredire+

## 1. Introdução

Este documento é a fonte da verdade para as métricas, conceitos e cálculos que formam a base da lógica de negócio do Progredire+. O seu objetivo é garantir que todos os membros da equipe (desenvolvimento, produto, stakeholders) tenham um entendimento comum dos termos e das fórmulas utilizadas na plataforma.

---

## 2. Métricas Chave e KPIs

Estas são as principais métricas exibidas nos dashboards e relatórios.

### 2.1. Pontuação de Fator de Risco (Escala 0-100)

-   **O que é:** Uma métrica normalizada que representa a percepção dos colaboradores sobre uma dimensão psicossocial específica (ex: "Carga de Trabalho"). A escala vai de 0 (pior percepção) a 100 (melhor percepção).
-   **Cálculo:**
    1.  As respostas da **Escala Likert** são convertidas para um valor numérico de 1 a 5 (onde "Discordo totalmente" = 1 e "Concordo totalmente" = 5).
    2.  Calcula-se a média das pontuações de todas as perguntas dentro daquela dimensão para um determinado grupo de respondentes.
    3.  A pontuação média (1-5) é normalizada para a escala de 0-100 usando a fórmula:
        ```
        Pontuação (0-100) = ((Pontuação Média - 1) / 4) * 100
        ```

### 2.2. IRP (Índice de Risco Psicossocial) Global (Escala 1-5)

-   **O que é:** O principal indicador de saúde organizacional. É uma nota única, de 1 a 5, que resume a média de todas as dimensões psicossociais. Valores mais altos indicam uma melhor saúde psicossocial.
-   **Cálculo:**
    1.  Calcula-se a média de todas as "Pontuações de Fator de Risco (0-100)" para um determinado grupo.
    2.  Essa média (0-100) é então convertida de volta para a escala de 1 a 5:
        ```
        IRP (1-5) = (Média das Pontuações (0-100) / 100) * 4 + 1
        ```
-   **Classificação de Risco:**
    -   **Baixo:** IRP >= 3.5
    -   **Moderado:** 2.5 <= IRP < 3.5
    -   **Alto:** IRP < 2.5

### 2.3. IPE (Índice de Presenteísmo Emocional)

-   **O que é:** Uma estimativa da perda de produtividade causada por colaboradores que estão fisicamente presentes no trabalho, mas mental ou emocionalmente ausentes.
-   **Cálculo (Simplificado no Protótipo):**
    ```
    IPE (%) = (5 - IRP Global) * 5
    ```

### 2.4. Nível de Maturidade (M1 a M5)

-   **O que é:** Classifica a capacidade da organização de gerenciar os riscos psicossociais, com base na distribuição dos níveis de risco dos fatores.
-   **Níveis:**
    -   **M1 (Reativa):** >60% dos fatores em risco alto.
    -   **M2 (Consciente):** 40-60% dos fatores em risco moderado/alto.
    -   **M3 (Estruturada):** 30-40% dos fatores em risco moderado.
    -   **M4 (Preventiva):** 10-30% dos fatores em risco moderado.
    -   **M5 (Estratégica):** >80% dos fatores em risco baixo.

---

## 3. Conceitos do Domínio

### 3.1. Dimensões Psicosociais

Estas são as 11 áreas de risco psicossocial avaliadas pelo questionário principal, baseadas em modelos científicos de saúde ocupacional.

1.  **Organização e Carga de Trabalho**
2.  **Demandas Emocionais e Cognitivas**
3.  **Autonomia e Controle**
4.  **Clareza de Papéis e Responsabilidades**
5.  **Reconhecimento e Recompensas**
6.  **Relacionamentos e Suporte Social**
7.  **Liderança e Comunicação**
8.  **Justiça e Equidade**
9.  **Segurança Psicológica, Assédio e Respeito**
10. **Mudanças Organizacionais e Estabilidade**
11. **Ambiente e Condições de Trabalho**

### 3.2. Fatores de Risco vs. Fatores de Proteção

-   **Fator de Risco:** Uma dimensão psicossocial com baixa pontuação, indicando um ponto de atenção crítico que pode impactar negativamente o bem-estar e a produtividade.
-   **Fator de Proteção:** Uma dimensão psicossocial com alta pontuação, representando um ponto forte da cultura organizacional que promove o bem-estar.

### 3.3. Multi-Tenancy

-   **O que é:** O princípio arquitetônico que garante que os dados de cada empresa cliente sejam completamente isolados e inacessíveis por outras empresas. Cada dado (usuário, resposta, campanha) está estritamente vinculado a uma `companyId`.

---

## 4. Fórmulas de Cálculo (Resumo)

| Métrica                               | Fórmula / Lógica                                                                        | Escala  |
| ------------------------------------- | --------------------------------------------------------------------------------------- | ------- |
| **Pontuação (0-100)**                 | `((Média_Likert - 1) / 4) * 100`                                                         | 0-100   |
| **IRP Global**                        | `(Média_Pontuações_0-100 / 100) * 4 + 1`                                                  | 1-5     |
| **IPE (%)**                           | `(5 - IRP_Global) * 5`                                                                  | %       |
| **Absenteísmo Estimado (%)**          | `(5 - IRP_Global) * 1.5`                                                                | %       |
| **Custo do Presenteísmo (ROI)**       | `Total_Colaboradores * Custo_Médio_Anual * (IPE / 100)`                                   | R$      |
| **Progresso do Plano de Ação (%)**    | `(Nº_Ações_Concluídas / Nº_Total_Ações) * 100`                                            | %       |