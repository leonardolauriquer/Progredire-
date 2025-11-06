

import React, { useState, useCallback } from 'react';
import { getDailyInsight } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { BrainIcon, ChartBarIcon, InstagramIcon, InovaCorpLogo, VerticeLogo, NexusTechLogo, AuraDigitalLogo, ShieldCheckIcon, PaperAirplaneIcon, ClipboardDocumentListIcon } from './icons';
import { ActiveView } from '../App';

interface CompanyHomeViewProps {
  setActiveView: (view: ActiveView) => void;
  onNavigateToDashboard: (filters?: Record<string, string>) => void;
}

const ActionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 text-left w-full flex flex-col"
  >
    <div className="flex-shrink-0">
        <Icon className="h-10 w-10 text-blue-600 mb-4" />
    </div>
    <div className="flex-grow">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 mt-2">{description}</p>
    </div>
    <div className="mt-4">
        <span className="font-semibold text-blue-600">Começar →</span>
    </div>
  </button>
);

export const CompanyHomeView: React.FC<CompanyHomeViewProps> = ({ setActiveView, onNavigateToDashboard }) => {
    const [insight, setInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateInsight = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setInsight('');
        try {
            const result = await getDailyInsight();
            setInsight(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 md:space-y-12">
      
        {/* Header */}
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extold text-slate-900">
                Bem-vindo ao <span className="text-blue-600">Progredire+</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Onde a Inteligência Artificial encontra a Inteligência Emocional. Explore insights para o seu desenvolvimento pessoal e profissional.
            </p>
        </div>

        {/* AI Insight Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Uma Reflexão para o seu Dia</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-lg mx-auto">Busque clareza e inspiração com um pensamento gerado especialmente para você. Um pequeno impulso para um grande dia.</p>
            
            <button
                onClick={handleGenerateInsight}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        Gerando...
                    </>
                ) : (
                    <>
                        <BrainIcon className="w-5 h-5" />
                        Gerar Reflexão
                    </>
                )}
            </button>

            {error && (
                <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</div>
            )}

            {insight && (
                <blockquote className="mt-6 bg-slate-50/70 border-l-4 border-blue-500 p-4 text-left">
                    <p className="text-slate-700 italic">"{insight}"</p>
                </blockquote>
            )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ActionCard
                icon={ChartBarIcon}
                title="Dashboard Organizacional"
                description="Explore dados agregados e gere relatórios estratégicos com IA para aprimorar o ambiente de trabalho."
                onClick={() => onNavigateToDashboard()}
            />
            <ActionCard
                icon={PaperAirplaneIcon}
                title="Gerenciar Campanhas"
                description="Crie, dispare e acompanhe pesquisas de clima para coletar dados valiosos de forma confidencial."
                onClick={() => setActiveView('campaigns')}
            />
            <ActionCard
                icon={ClipboardDocumentListIcon}
                title="Criar Plano de Ação"
                description="Transforme insights do dashboard em ações concretas para impulsionar a melhoria contínua."
                onClick={() => setActiveView('plano_acao')}
            />
        </div>
        
        {/* Impact Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-10 flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8">
            <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-16 w-16 text-blue-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Mais de <span className="text-blue-600">20 mil+</span> vidas cobertas por nossas análises de bem-estar
                </h2>
                <p className="text-slate-500 mt-2">
                    Estamos comprometidos em ajudar organizações a construir ambientes de trabalho mais seguros, saudáveis e produtivos. Cada análise é um passo em direção a uma cultura organizacional mais forte.
                </p>
            </div>
        </div>

        {/* Clients Section */}
        <div className="text-center pt-8">
            <h2 className="text-xl font-semibold text-slate-600 mb-6">Empresas que confiam na Progredire+</h2>
            <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
                <InovaCorpLogo className="h-8 text-slate-400 hover:text-slate-600 transition-colors" />
                <VerticeLogo className="h-8 text-slate-400 hover:text-slate-600 transition-colors" />
                <NexusTechLogo className="h-8 text-slate-400 hover:text-slate-600 transition-colors" />
                <AuraDigitalLogo className="h-8 text-slate-400 hover:text-slate-600 transition-colors" />
            </div>
        </div>

        {/* Instagram Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-slate-200 p-8 md:p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Conecte-se Conosco nas Redes Sociais</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-xl mx-auto">
                Acompanhe conteúdos sobre treinamentos, cultura e mentoria que aceleram líderes e equipes para resultados exponenciais. Cresça, inspire e progrida conosco.
            </p>
            <a
                href="https://www.instagram.com/progredire.lideranca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
                <InstagramIcon className="w-6 h-6" />
                Siga-nos no Instagram
            </a>
        </div>
    </div>
  );
};