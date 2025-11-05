
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

const faqData = [
    {
        question: "O que é o Progredire+?",
        answer: "Progredire+ é uma aplicação de software projetada para auxiliar na análise e reflexão sobre questões psicossociais. Utilizando inteligência artificial, a ferramenta oferece insights baseados em descrições de situações, sentimentos e desafios, além de fornecer um dashboard para análise de diagnósticos organizacionais."
    },
    {
        question: "Como funciona a Análise Psico-Social?",
        answer: "Na seção 'Nova Análise', você descreve uma situação ou sentimento. Nossa IA, treinada com princípios de psicologia e sociologia, analisa seu texto e fornece uma resposta estruturada que inclui um resumo empático, uma análise dos fatores em jogo, pontos para reflexão e sugestões práticas, sempre com um tom de apoio e sem julgamentos."
    },
    {
        question: "Meus dados estão seguros e confidenciais?",
        answer: "Sim. A confidencialidade é nossa prioridade. Na 'Análise Psico-Social', as informações que você insere não são armazenadas. No 'Questionário Psicossocial', os dados são anonimizados e agregados para a análise do dashboard, garantindo que nenhuma resposta individual possa ser identificada."
    },
    {
        question: "Quem deve usar o Questionário Psicossocial?",
        answer: "O 'Questionário Psicossocial' foi desenhado para equipes de RH, lideranças e consultores organizacionais. Ele permite a aplicação de um questionário padronizado sobre riscos psicossociais e, em seguida, a visualização dos dados agregados no 'Dashboard', ajudando a identificar pontos de atenção e a planejar ações estratégicas para melhorar o bem-estar no ambiente de trabalho."
    },
    {
        question: "Como funciona a nova tela de Evolução Organizacional?",
        answer: "A tela 'Evolução' permite visualizar o histórico dos indicadores de saúde organizacional. Ela exibe um gráfico de linha que mostra a tendência da pontuação geral ou de fatores de risco específicos ao longo do tempo. Você pode selecionar um fator no filtro para uma análise detalhada e usar o botão 'Analisar Tendência com IA' para receber um relatório automático sobre a evolução, suas possíveis causas e recomendações."
    },
    {
        question: "O Progredire+ substitui um terapeuta ou profissional de saúde mental?",
        answer: "Não. É muito importante entender que o Progredire+ é uma ferramenta de apoio à reflexão e autoconhecimento. Ele não fornece diagnósticos médicos ou psicológicos e não substitui, de forma alguma, o aconselhamento, diagnóstico ou tratamento de um profissional de saúde mental qualificado."
    },
    {
        question: "Como são gerados os insights do Dashboard?",
        answer: "Após a coleta das respostas do diagnóstico, os dados são processados e exibidos em gráficos interativos. Ao clicar em 'Gerar Insights', os dados consolidados do dashboard (pontuações, fatores de risco, comparações) são enviados para a IA, que atua como um consultor de RH, gerando um relatório estratégico com sumário, pontos fortes, pontos de atenção e recomendações para a liderança."
    }
];

const FaqItem: React.FC<{
    item: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-slate-200">
            <button
                className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-medium text-slate-800">{item.question}</h3>
                <ChevronDownIcon
                    className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="prose prose-slate max-w-none p-4 pt-0 text-slate-600">
                   {item.answer}
                </div>
            </div>
        </div>
    );
};

export const FaqView: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Perguntas Frequentes (FAQ)</h2>
                <p className="text-slate-500 mt-2">
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