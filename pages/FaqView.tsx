

import React, { useState, useMemo } from 'react';
import { ChevronDownIcon } from '../components/icons';
import { UserRole } from '../App';

// Data for Company Role
const companyFaqData = [
    {
        question: "Como utilizar o painel da empresa? (Vídeo Tutorial)",
        answer: `Preparamos um vídeo tutorial completo para guiar você por todas as funcionalidades do painel da empresa, desde a análise do dashboard até a criação de planos de ação. Assista abaixo:
        <div class="w-full aspect-video rounded-lg overflow-hidden mt-4 shadow-lg">
            <iframe class="w-full h-full" src="https://www.youtube.com/embed/Nn_Z_h54y5s" title="Tutorial Painel da Empresa" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>`
    },
    {
        question: "O que é o Progredire+?",
        answer: "Progredire+ é uma aplicação de software projetada para auxiliar na análise e gestão de riscos psicossociais. Utilizando inteligência artificial, a ferramenta fornece um dashboard para diagnósticos organizacionais, facilita a criação de planos de ação e acompanha a evolução do clima ao longo do tempo."
    },
    {
        question: "Os dados da empresa e dos colaboradores estão seguros?",
        answer: "Sim. A confidencialidade é nossa prioridade. No 'Questionário Psicossocial', os dados são anonimizados e agregados para a análise do dashboard, garantindo que nenhuma resposta individual possa ser identificada."
    },
    {
        question: "O que são as 'Campanhas'?",
        answer: "As Campanhas permitem que você crie e gerencie o envio do 'Questionário Psicossocial' para públicos específicos da sua organização. Você pode definir o nome, a descrição, o período e segmentar os participantes por diretoria, setor, etc. É uma forma de realizar diagnósticos focados e acompanhar a adesão em tempo real."
    },
    {
        question: "Como os insights do Dashboard são gerados?",
        answer: "Após a coleta das respostas de uma campanha, os dados são processados e exibidos em gráficos interativos no Dashboard. Ao clicar em 'Gerar Relatório Estratégico', os dados consolidados (pontuações, fatores de risco, comparações) são enviados para a IA, que atua como um consultor de RH, gerando uma análise com sumário, pontos fortes, pontos de atenção e recomendações para a liderança."
    },
    {
        question: "Como funciona a tela de Evolução Organizacional?",
        answer: "A tela 'Evolução' permite visualizar o histórico dos indicadores de saúde organizacional. Ela exibe gráficos que mostram a tendência da pontuação geral ou de fatores de risco específicos ao longo do tempo. Você pode comparar a evolução entre diferentes setores e usar o botão 'Analisar Evolução' para receber um relatório automático da IA sobre a trajetória, suas possíveis causas e recomendações."
    },
    {
        question: "Para que serve a tela 'Plano de Ação'?",
        answer: "É uma ferramenta para transformar os insights do Dashboard em ações concretas. Após filtrar um público-alvo e identificar um fator de risco crítico, você pode usar a IA para gerar um plano estratégico completo, com diagnóstico, objetivos, ações sugeridas e KPIs. Você também tem a flexibilidade de adicionar e gerenciar suas próprias ações manualmente, usando a IA como uma assistente para sugestões."
    },
    {
        question: "Como funciona o 'Acompanhamento' dos planos de ação?",
        answer: "A tela de 'Acompanhamento' é um painel central para gerenciar todas as iniciativas em andamento. Ela consolida as ações de diferentes planos, permitindo que você filtre por status ou responsável. O 'Mapa de Calor' oferece uma visão rápida de quais fatores de risco concentram mais ações, ajudando a priorizar esforços."
    },
    {
        question: "Como posso entrar em contato com a equipe Progredire+?",
        answer: "Você pode encontrar as informações de contato da nossa equipe, como e-mail e telefone, na página 'Equipe de Apoio', disponível no menu. A equipe de Staff está disponível para um bate-papo confidencial sobre qualquer questão."
    },
    {
        question: "O Progredire+ substitui uma consultoria de RH?",
        answer: "O Progredire+ é uma ferramenta poderosa de diagnóstico e gestão que complementa o trabalho do RH, mas não substitui a expertise de consultores e profissionais da área. Ele automatiza a coleta e análise de dados, fornecendo insights para que a equipe de RH possa tomar decisões mais estratégicas."
    }
];

// Data for Collaborator Role
const collaboratorFaqData = [
    {
        question: "Como utilizar a plataforma? (Vídeo Tutorial)",
        answer: `Este vídeo rápido mostra como você pode usar o Progredire+ para registrar suas emoções, responder aos questionários de forma confidencial e acompanhar sua evolução pessoal. Confira:
        <div class="w-full aspect-video rounded-lg overflow-hidden mt-4 shadow-lg">
            <iframe class="w-full h-full" src="https://www.youtube.com/embed/Nn_Z_h54y5s" title="Tutorial do Colaborador" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>`
    },
     {
        question: "O que é o Progredire+?",
        answer: "Progredire+ é uma ferramenta de bem-estar que ajuda você a refletir sobre seus sentimentos e a participar de pesquisas confidenciais da sua empresa para melhorar o ambiente de trabalho."
    },
    {
        question: "Minhas respostas são anônimas?",
        answer: "Sim, sua confidencialidade é 100% garantida. Suas respostas ao 'Questionário Psicossocial' são agrupadas com as de outros colegas e se tornam dados anônimos. Sua liderança ou o RH nunca terão acesso às suas respostas individuais."
    },
     {
        question: "Como funciona a 'Reflexão Pessoal'?",
        answer: "Na seção 'Reflexão Pessoal', você descreve uma situação ou sentimento. Nossa IA analisa seu texto e fornece uma resposta para te ajudar a refletir, com um resumo empático, pontos de vista e sugestões. Nenhuma informação que você escreve nesta seção é salva ou compartilhada."
    },
    {
        question: "O que é o 'Questionário Psicossocial'?",
        answer: "É uma pesquisa confidencial que sua empresa pode enviar para entender melhor o ambiente de trabalho. Suas respostas honestas ajudam a identificar pontos fortes e oportunidades de melhoria para todos."
    },
    {
        question: "Preciso de ajuda com uma questão pessoal. O que devo fazer?",
        answer: "Na seção 'Equipe de Apoio', você encontrará uma lista de profissionais de saúde e bem-estar, como psicólogos e médicos, além dos contatos da equipe Staff da Progredire+. Você pode agendar um bate-papo confidencial com eles."
    },
    {
        question: "O Progredire+ substitui um terapeuta?",
        answer: "Não. É muito importante entender que o Progredire+ é uma ferramenta de apoio à reflexão. Ele não fornece diagnósticos médicos ou psicológicos e não substitui, de forma alguma, o aconselhamento ou tratamento de um profissional de saúde mental qualificado."
    }
];

interface FaqViewProps {
  userRole: UserRole | null;
}

const FaqItem: React.FC<{
    item: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-[--color-border]">
            <button
                className="w-full flex justify-between items-center text-left py-5 px-2 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-medium text-[--color-card-foreground]">{item.question}</h3>
                <ChevronDownIcon
                    className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div 
                        className="prose prose-slate max-w-none p-4 pt-0 text-[--color-card-muted-foreground]"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                </div>
            </div>
        </div>
    );
};

export const FaqView: React.FC<FaqViewProps> = ({ userRole }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqData = useMemo(() => {
        return userRole === 'company' ? companyFaqData : collaboratorFaqData;
    }, [userRole]);

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-[--color-card] rounded-2xl shadow-lg border border-[--color-border] p-6 md:p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[--color-card-foreground]">Perguntas Frequentes (FAQ)</h2>
                <p className="text-[--color-card-muted-foreground] mt-2">
                    Encontre respostas para as dúvidas mais comuns sobre o Progredire+.
                </p>
            </div>
            <div className="space-y-2">
                {faqData.map((item, index) => (
                    <FaqItem
                        key={index}
                        item={item}
                        isOpen={openIndex === index}
                        onClick={() => handleItemClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};
