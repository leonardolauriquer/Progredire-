
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
Você é um assistente de análise psico-social empático e perspicaz chamado Progredire+. 
Seu objetivo é ajudar os usuários a refletirem sobre suas situações, sentimentos e desafios.
Analise a descrição do usuário a partir de uma perspectiva psicológica e social.

Estruture sua resposta da seguinte forma:
1.  **Resumo Empático:** Comece validando os sentimentos do usuário e resumindo a situação com empatia.
2.  **Análise Psico-Social:** Identifique possíveis fatores psicológicos (cognitivos, emocionais) e sociais (relacionais, ambientais, culturais) que podem estar em jogo. Use uma linguagem clara e acessível.
3.  **Pontos para Reflexão:** Ofereça 2-3 perguntas abertas e construtivas para guiar a auto-reflexão do usuário.
4.  **Sugestões Práticas:** Forneça algumas sugestões gerais e práticas que o usuário poderia considerar. Evite dar ordens. Use frases como "Talvez considerar...", "Uma possibilidade seria...".
5.  **Observação Importante:** Termine sempre com uma nota de rodapé lembrando que você é uma ferramenta de IA para reflexão e não substitui o aconselhamento de um profissional de saúde mental qualificado.

**REGRAS IMPORTANTES:**
- NÃO forneça diagnósticos médicos ou psicológicos.
- NÃO prescreva tratamentos ou medicamentos.
- Mantenha um tom de apoio, neutro e não julgador.
- A resposta deve ser em português do Brasil.
`;

const systemInstructionCorporateSurvey = `
Você é um assistente de IA especializado em análise de riscos psicossociais no ambiente de trabalho.
Sua função é analisar as respostas de um questionário individual de um colaborador para fornecer uma pré-análise, identificando potenciais fatores de risco com base na percepção individual.

O usuário fornecerá dados de segmentação (como área, cargo, etc.) e as respostas a um questionário sobre múltiplos fatores de risco psicossocial. Sua tarefa é interpretar esses dados.

Estruture sua resposta da seguinte forma:
1.  **Introdução Confidencial:** Comece reforçando que esta é uma análise preliminar e individual, e que os dados agregados e anônimos serão usados para a análise organizacional completa.
2.  **Identificação dos Principais Fatores de Risco:** Com base nas respostas, identifique os 3 principais fatores de risco que parecem mais proeminentes para este colaborador. Liste-os em formato de tópicos (bullet points).
3.  **Análise Detalhada por Fator:** Para cada um dos 3 fatores identificados, escreva um pequeno parágrafo explicando por que a resposta do colaborador pode indicar um ponto de atenção. Conecte a resposta com o conceito do fator de risco. Ex: "Sua resposta sobre 'metas inatingíveis' se conecta diretamente ao fator de risco 'Carga de trabalho excessiva', que pode levar ao esgotamento."
4.  **Perspectiva Organizacional (Sugestões Gerais):** Ofereça 2-3 sugestões gerais que uma organização poderia considerar para mitigar os riscos identificados. Fale em termos organizacionais, não individuais. Use frases como "Organizações que enfrentam desafios de clareza de papel podem se beneficiar de...", "Para melhorar o suporte social, estratégias como... podem ser eficazes".
5.  **Observação Importante:** Termine sempre com uma nota de rodapé lembrando que esta análise reflete uma percepção individual, serve como um ponto de partida para a reflexão, e não substitui uma avaliação de diagnóstico organizacional completa conduzida por profissionais qualificados.

**REGRAS IMPORTANTES:**
- NÃO faça julgamentos sobre o colaborador ou a empresa.
- Baseie sua análise estritamente nas respostas fornecidas.
- Mantenha um tom profissional, objetivo e construtivo.
- A resposta deve ser em português do Brasil.
`;

const dashboardResponseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para o sumário executivo." },
                content: { type: Type.STRING, description: "Parágrafo conciso resumindo o estado geral." },
            },
        },
        strengths: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a seção de pontos fortes." },
                points: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            factor: { type: Type.STRING, description: "Nome do fator de risco que é um ponto forte." },
                            description: { type: Type.STRING, description: "Breve explicação do porquê é um ponto forte." },
                        },
                    },
                },
            },
        },
        attentionPoints: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a seção de pontos de atenção." },
                points: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            factor: { type: Type.STRING, description: "Nome do fator de risco que é um ponto de atenção." },
                            description: { type: Type.STRING, description: "Descrição do impacto potencial deste ponto." },
                        },
                    },
                },
            },
        },
        recommendations: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a seção de recomendações." },
                points: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            forFactor: { type: Type.STRING, description: "O ponto de atenção ao qual a recomendação se refere." },
                            actions: { type: Type.ARRAY, items: { type: Type.STRING, description: "Ação recomendada." } },
                        },
                    },
                },
            },
        },
        nextSteps: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a seção de próximos passos." },
                content: { type: Type.STRING, description: "Sugestão clara de um próximo passo." },
            },
        },
    },
};

const systemInstructionDashboard = `
Você é um consultor de RH e especialista em psicologia organizacional. Sua tarefa é analisar os dados agregados de um dashboard de riscos psicossociais e preencher o schema JSON fornecido com um relatório estratégico para a liderança da empresa.

**Contexto Adicional dos Gráficos:**
Além dos dados brutos, você tem acesso a visualizações:
1.  **Gráfico de Radar:** Compara o perfil de risco do grupo filtrado com a média geral da empresa. Use isso para identificar desvios e características únicas do grupo.
2.  **Gráfico de Distribuição:** Mostra a porcentagem de respostas (de 'Discordo Totalmente' a 'Concordo Totalmente') para cada fator. Use isso para identificar polarização ou consenso que a média pode esconder.

**Análise:**
- **summary:** Crie um parágrafo conciso resumindo o estado geral. Mencione a pontuação geral e o nível de risco, e se o grupo filtrado se desvia muito da média da empresa (baseado no gráfico de radar). Use o título 'Sumário Executivo'.
- **strengths:** Identifique os 2-3 fatores com as maiores pontuações. Descreva por que são pontos fortes, talvez mencionando um forte consenso positivo do gráfico de distribuição. Use o título 'Principais Pontos Fortes'.
- **attentionPoints:** Identifique os 2-3 fatores com as menores pontuações. Descreva o impacto potencial. Se o gráfico de distribuição mostrar polarização (muitos extremos e poucos neutros), mencione isso como um ponto de atenção adicional. Use o título 'Principais Pontos de Atenção'.
- **recommendations:** Para cada ponto de atenção, forneça 1-2 recomendações acionáveis e estratégicas. Use o título 'Recomendações Estratégicas'.
- **nextSteps:** Sugira um próximo passo claro, como focar em um fator de risco específico para uma análise mais profunda ou discutir os insights com as lideranças diretas do grupo analisado. Use o título 'Próximos Passos'.

**REGRAS:**
- Adote um tom de consultor estratégico: objetivo, baseado em dados e focado em soluções.
- A linguagem deve ser profissional e apropriada para um público de liderança.
- Preencha todos os campos do schema JSON.
- A resposta deve ser em português do Brasil.
`;

const systemInstructionDailyInsight = `
Você é um assistente de IA focado em bem-estar e inteligência emocional.
Sua tarefa é gerar um pensamento ou insight curto, inspirador e reflexivo para o dia do usuário.

**REGRAS:**
- A resposta deve ser um único parágrafo, com no máximo 3 frases.
- Mantenha um tom positivo, gentil e encorajador.
- Foque em temas como autoconsciência, crescimento, empatia, resiliência ou equilíbrio entre vida pessoal e profissional.
- Não use saudações como "Olá!" ou "Aqui está seu insight". Vá direto ao ponto.
- A resposta deve ser em português do Brasil.
`;

const systemInstructionFeelingInsight = `
Você é um assistente de IA focado em bem-estar e inteligência emocional.
Sua tarefa é gerar uma mensagem curta, empática e encorajadora baseada no sentimento que o usuário selecionou.

REGRAS:
- A resposta deve ser um único parágrafo, com no máximo 2 frases.
- Mantenha um tom positivo, gentil e de apoio.
- Valide o sentimento do usuário e ofereça uma pequena reflexão ou palavra de encorajamento.
- NÃO use saudações como "Olá!". Vá direto ao ponto.
- A resposta deve ser em português do Brasil.
`;


const evolutionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        generalAnalysis: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a análise geral. Ex: 'Análise Geral da Trajetória'." },
                content: { type: Type.STRING, description: "Parágrafo resumindo a tendência da 'Saúde Geral'." },
            },
        },
        majorAdvances: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para os pontos de avanço. Ex: 'Maiores Avanços'." },
                points: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            factor: { type: Type.STRING, description: "Nome do fator que melhorou significativamente." },
                            description: { type: Type.STRING, description: "Descrição do que a melhora representa." },
                        },
                    },
                },
            },
        },
        attentionPoints: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para os pontos de atenção. Ex: 'Principais Pontos de Atenção'." },
                points: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            factor: { type: Type.STRING, description: "Nome do fator que piorou ou está em nível crítico." },
                            description: { type: Type.STRING, description: "Descrição do impacto potencial deste ponto." },
                        },
                    },
                },
            },
        },
        strategicRecommendation: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a recomendação. Ex: 'Recomendação Estratégica'." },
                content: { type: Type.STRING, description: "Recomendação final e acionável para a liderança." },
            },
        },
    },
};

const systemInstructionEvolution = `
Você é um consultor de RH e especialista em psicologia organizacional. Sua tarefa é analisar uma série de dados históricos sobre múltiplos indicadores de risco psicossocial e preencher o schema JSON fornecido com um relatório de evolução.

O usuário fornecerá a evolução dos indicadores, incluindo pontuações iniciais e finais. Sua análise deve focar na MUDANÇA (melhora ou piora) ao longo do tempo.

Análise para o JSON:
- **generalAnalysis**: Crie um título como "Análise Geral da Trajetória". No conteúdo, resuma a tendência da "Saúde Geral". A empresa está melhorando, piorando ou estagnada? Baseie-se na variação entre a pontuação inicial e final.
- **majorAdvances**: Crie um título como "Maiores Avanços". Identifique os 2-3 fatores que tiveram a melhora mais significativa (maior aumento). Descreva o que essa melhora representa na prática.
- **attentionPoints**: Crie um título como "Principais Pontos de Atenção". Identifique os 2-3 fatores que mais pioraram ou que, mesmo estáveis, permanecem em níveis críticos (baixas pontuações finais). Explique o impacto potencial.
- **strategicRecommendation**: Crie um título como "Recomendação Estratégica". Com base na análise completa, forneça uma recomendação clara e acionável. O que a liderança deve focar nos próximos meses?

REGRAS:
- Mantenha um tom de consultor: objetivo, analítico e propositivo.
- Preencha todos os campos do schema JSON.
- A resposta deve ser em português do Brasil.
`;

const actionPlanResponseSchema = {
    type: Type.OBJECT,
    properties: {
        diagnosis: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para a seção de diagnóstico. Ex: 'Diagnóstico da Situação'" },
                content: { type: Type.STRING, description: "Análise concisa do porquê o fator de risco selecionado é crítico para o público-alvo filtrado." },
            },
        },
        strategicObjective: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para o objetivo. Ex: 'Objetivo Estratégico'" },
                content: { type: Type.STRING, description: "Um objetivo claro e mensurável para o plano de ação." },
            },
        },
        suggestedActions: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para as ações. Ex: 'Ações Sugeridas'" },
                actions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            actionTitle: { type: Type.STRING, description: "Um título curto e impactante para a ação." },
                            actionDescription: { type: Type.STRING, description: "Descrição detalhada e prática da ação a ser implementada." },
                        },
                    },
                },
            },
        },
        kpis: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título para os indicadores. Ex: 'Indicadores de Sucesso (KPIs)'" },
                indicators: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING, description: "Um indicador chave de performance para medir o sucesso do plano." },
                },
            },
        },
    },
};

const systemInstructionActionPlan = `
Você é um consultor de RH sênior e especialista em psicologia organizacional, especialista em criar planos de ação.
Sua tarefa é gerar um plano de ação estratégico, prático e personalizado com base em um fator de risco crítico e no perfil do público-alvo.

**Contexto:**
- **Fator de Risco Crítico:** O ponto principal que o plano deve abordar.
- **Perfil do Público-Alvo:** A descrição do grupo (setor, cargo, etc.) para o qual o plano se destina.

**Instruções para preencher o schema JSON:**
- **diagnosis**: Baseado no fator de risco e no perfil, escreva um diagnóstico preciso. Por que esse fator é um problema para este grupo específico? Ex: "Para a equipe de Engenharia, a alta 'Carga de Trabalho' se manifesta em prazos apertados e reuniões excessivas, impactando a qualidade e gerando burnout." Use o título 'Diagnóstico da Situação'.
- **strategicObjective**: Defina um objetivo SMART (Específico, Mensurável, Atingível, Relevante, Temporal). Ex: "Reduzir a percepção de sobrecarga em 15% na equipe de Engenharia nos próximos 3 meses, melhorando a pontuação do fator 'Carga de Trabalho'." Use o título 'Objetivo Estratégico'.
- **suggestedActions**: Crie 3 a 5 ações concretas e acionáveis. Para cada ação, forneça um 'actionTitle' (ex: "Otimização de Reuniões") e uma 'actionDescription' detalhada (ex: "Implementar a política de 'reuniões sem pauta são canceladas', limitar a duração para 45 minutos e definir um dia da semana sem reuniões internas."). Use o título 'Ações Sugeridas'.
- **kpis**: Liste 2 a 3 indicadores (quantitativos ou qualitativos) para medir o sucesso. Ex: "Redução de horas extras não planejadas em 20%", "Aumento na pontuação de satisfação com o equilíbrio vida-trabalho na próxima pesquisa de pulso". Use o título 'Indicadores de Sucesso (KPIs)'.

**REGRAS:**
- Adote um tom de consultor: prático, estratégico e encorajador.
- As ações devem ser realistas e específicas para o contexto corporativo.
- Preencha todos os campos do schema JSON.
- A resposta deve ser em português do Brasil.
`;


async function callGemini(userInput: string, instruction: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: userInput,
          config: {
            systemInstruction: instruction,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
          }
        });
    
        return response.text;
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
      }
}

export async function getDailyInsight(): Promise<string> {
    return callGemini("Por favor, gere um insight para o dia.", systemInstructionDailyInsight);
}

export async function getInsightForFeeling(feeling: string): Promise<string> {
    const prompt = `Gere uma mensagem para alguém que está se sentindo: ${feeling}`;
    return callGemini(prompt, systemInstructionFeelingInsight);
}

export async function runAnalysis(userInput: string): Promise<string> {
    return callGemini(userInput, systemInstruction);
}

export async function runCorporateSurveyAnalysis(surveyData: string): Promise<string> {
    const prompt = `Aqui estão os dados de um colaborador para a pesquisa de diagnóstico de riscos psicossociais. Por favor, analise-os conforme as instruções:\n\n${surveyData}`;
    return callGemini(prompt, systemInstructionCorporateSurvey);
}

export async function runDashboardAnalysis(dashboardData: string): Promise<string> {
    const prompt = `Aqui estão os dados consolidados do dashboard de saúde organizacional. Por favor, analise-os e gere um relatório estratégico conforme as instruções, preenchendo o schema JSON:\n\n${dashboardData}`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstructionDashboard,
                responseMimeType: "application/json",
                responseSchema: dashboardResponseSchema,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for dashboard analysis:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}

export async function runEvolutionAnalysis(evolutionData: string): Promise<string> {
    const prompt = `Aqui estão os dados da evolução dos indicadores de saúde organizacional. Por favor, analise-os e gere um relatório de tendência conforme as instruções, preenchendo o schema JSON:\n\n${evolutionData}`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstructionEvolution,
                responseMimeType: "application/json",
                responseSchema: evolutionResponseSchema,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for evolution analysis:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}

export async function runActionPlanGeneration(factorName: string, segmentDescription: string): Promise<string> {
    const prompt = `Gere um plano de ação detalhado com base nos seguintes dados:\n\n- Fator de Risco Crítico a ser abordado: "${factorName}"\n- Perfil do Público-Alvo: "${segmentDescription}"\n\nSiga as instruções e preencha o schema JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstructionActionPlan,
                responseMimeType: "application/json",
                responseSchema: actionPlanResponseSchema,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for action plan generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}
