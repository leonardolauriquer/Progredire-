
import React, { useState, useCallback } from 'react';
import { getInsightForFeeling, getDailyInsight } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { BrainIcon, PencilSquareIcon, SparklesIcon, CalendarDaysIcon, PaperAirplaneIcon } from './icons';
import { ActiveView } from '../App';

interface CollaboratorHomeViewProps {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
}

const feelings = [
  { label: 'Feliz', emoji: '😄' },
  { label: 'Motivado(a)', emoji: '🚀' },
  { label: 'Estressado(a)', emoji: '😥' },
  { label: 'Cansado(a)', emoji: '😴' },
  { label: 'Neutro(a)', emoji: '😐' },
];

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
        <Icon className="h-8 w-8 text-blue-600 mb-3" />
    </div>
    <div className="flex-grow">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 mt-1 text-sm">{description}</p>
    </div>
    <div className="mt-4">
        <span className="font-semibold text-blue-600 text-sm">Acessar →</span>
    </div>
  </button>
);

// MOCK DATA for campaigns
interface Campaign {
    id: number;
    name: string;
    status: 'Em Andamento' | 'Agendada' | 'Concluída';
    endDate: string;
}
const mockCampaigns: Campaign[] = [
    { id: 1, name: "Diagnóstico Q3 - Tecnologia", status: 'Em Andamento', endDate: "2024-08-15" },
    { id: 3, name: "Diagnóstico Anual Geral", status: 'Agendada', endDate: "2024-09-30" },
    { id: 2, name: "Pesquisa de Clima - Vendas & Mkt", status: 'Concluída', endDate: "2024-05-30" },
];


export const CollaboratorHomeView: React.FC<CollaboratorHomeViewProps> = ({ setActiveView }) => {
    // State for feeling tracker
    const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
    const [feelingInsight, setFeelingInsight] = useState<string>('');
    const [isFeelingLoading, setIsFeelingLoading] = useState<boolean>(false);
    const [feelingError, setFeelingError] = useState<string | null>(null);
    
    // State for daily reflection
    const [dailyInsight, setDailyInsight] = useState<string>('');
    const [isDailyInsightLoading, setIsDailyInsightLoading] = useState<boolean>(false);
    const [dailyInsightError, setDailyInsightError] = useState<string | null>(null);

    const handleFeelingSelect = useCallback(async (feeling: string) => {
        setSelectedFeeling(feeling);
        setIsFeelingLoading(true);
        setFeelingError(null);
        setFeelingInsight('');
        try {
            const result = await getInsightForFeeling(feeling);
            setFeelingInsight(result);
        } catch (err) {
            setFeelingError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsFeelingLoading(false);
        }
    }, []);

    const handleGenerateDailyInsight = useCallback(async () => {
        setIsDailyInsightLoading(true);
        setDailyInsightError(null);
        setDailyInsight('');
        try {
            const result = await getDailyInsight();
            setDailyInsight(result);
        } catch (err) {
            setDailyInsightError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsDailyInsightLoading(false);
        }
    }, []);

    const pendingCampaigns = mockCampaigns.filter(
        c => c.status === 'Em Andamento' || c.status === 'Agendada'
    );
    
    const getStatusStyles = (status: Campaign['status']) => {
        switch (status) {
            case 'Em Andamento': return 'bg-blue-100 text-blue-800';
            case 'Agendada': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      
        {/* Header */}
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Olá! Como você está hoje?
            </h1>
            <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
                Seu bem-estar é importante. Compartilhe como se sente e receba uma pequena reflexão.
            </p>
        </div>

        {/* Feeling Tracker Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-800 text-center mb-6">Como você está se sentindo?</h2>
            
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {feelings.map(({ label, emoji }) => (
                    <button
                        key={label}
                        onClick={() => handleFeelingSelect(label)}
                        disabled={isFeelingLoading}
                        className={`flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 p-2 rounded-2xl border-2 transition-all duration-200
                            ${selectedFeeling === label 
                                ? 'bg-blue-100 border-blue-500 scale-105' 
                                : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-300'
                            }`}
                    >
                        <span className="text-3xl md:text-4xl">{emoji}</span>
                        <span className="text-sm font-medium text-slate-700 mt-2">{label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6 min-h-[6rem] flex items-center justify-center">
                {isFeelingLoading && (
                    <div className="flex items-center text-slate-500">
                        <LoadingSpinner />
                        <span className="ml-2">Gerando uma mensagem para você...</span>
                    </div>
                )}
                {feelingError && (
                    <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm text-center">{feelingError}</div>
                )}
                {feelingInsight && !isFeelingLoading && (
                    <blockquote className="bg-slate-50/70 border-l-4 border-blue-500 p-4 text-left w-full">
                         <p className="text-slate-700 italic">
                            <SparklesIcon className="w-5 h-5 inline-block mr-2 text-blue-500" />
                            {feelingInsight}
                        </p>
                    </blockquote>
                )}
            </div>
        </div>
        
        {/* Pending Campaigns Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <PaperAirplaneIcon className="w-6 h-6 mr-3 text-blue-600"/>
                Campanhas Pendentes
            </h2>
            {pendingCampaigns.length > 0 ? (
                <div className="space-y-4">
                    {pendingCampaigns.map(campaign => (
                        <div key={campaign.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800">{campaign.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusStyles(campaign.status)}`}>
                                        {campaign.status}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        Encerra em: {new Date(campaign.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveView('corporate_survey')}
                                className="flex-shrink-0 w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 text-sm transition-colors"
                            >
                                Responder Agora
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-4">Você não tem nenhuma campanha pendente. Bom trabalho!</p>
            )}
        </div>

        {/* Daily Reflection Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Uma Reflexão para o seu Dia</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-lg mx-auto">Busque clareza e inspiração com um pensamento gerado especialmente para você.</p>
            
            <button
                onClick={handleGenerateDailyInsight}
                disabled={isDailyInsightLoading}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
            >
                {isDailyInsightLoading ? (
                    <> <LoadingSpinner /> Gerando... </>
                ) : (
                    <> <BrainIcon className="w-5 h-5" /> Gerar Reflexão </>
                )}
            </button>

            {dailyInsightError && (
                <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-md text-sm">{dailyInsightError}</div>
            )}

            {dailyInsight && (
                <blockquote className="mt-6 bg-slate-50/70 border-l-4 border-blue-500 p-4 text-left">
                    <p className="text-slate-700 italic">"{dailyInsight}"</p>
                </blockquote>
            )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
                icon={BrainIcon}
                title="Reflexão Pessoal"
                description="Precisa de uma perspectiva? Descreva um desafio e receba um insight da IA."
                onClick={() => setActiveView('personal_reflection')}
            />
            <ActionCard
                icon={PencilSquareIcon}
                title="Responder Questionário"
                description="Sua opinião é valiosa. Participe do questionário psicossocial da sua empresa."
                onClick={() => setActiveView('corporate_survey')}
            />
        </div>
    </div>
  );
};
