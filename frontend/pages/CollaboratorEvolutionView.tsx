

import React, { useState, useEffect, useMemo } from 'react';
import { getCollaboratorEvolutionData, CollaboratorEvolutionEntry } from '../services/dataService';
import { getJournalEntries, JournalEntry } from '../services/journalService';
import { LineChart } from '../components/Charts';
import { dimensions } from '../components/dashboardMockData';
import { ArrowTrendingUpIcon, ShieldCheckIcon, ExclamationTriangleIcon, BrainIcon } from '../components/icons';
import { ActiveView } from '../App';

interface CollaboratorEvolutionViewProps {
  setActiveView: (view: ActiveView) => void;
}

const factorIdToName: Record<string, string> = {
  'geral': 'Saúde Geral',
  ...Object.fromEntries(Object.entries(dimensions).map(([id, { name }]) => [id, name]))
};
const allFactorIds = Object.keys(factorIdToName);
const feelingToScore: Record<string, number> = { 'Feliz': 5, 'Motivado(a)': 4, 'Neutro(a)': 3, 'Cansado(a)': 2, 'Estressado(a)': 1 };


export const CollaboratorEvolutionView: React.FC<CollaboratorEvolutionViewProps> = ({ setActiveView }) => {
  const [evolutionData, setEvolutionData] = useState<CollaboratorEvolutionEntry[]>([]);
  const [journalData, setJournalData] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFactorId, setSelectedFactorId] = useState<string>('geral');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [evoData, jData] = await Promise.all([
          getCollaboratorEvolutionData(),
          getJournalEntries()
      ]);
      setEvolutionData(evoData);
      setJournalData(jData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const surveyChartData = useMemo(() => {
    if (evolutionData.length === 0) return null;

    const labels = evolutionData.map(entry => new Date(entry.timestamp).toLocaleDateString('pt-BR'));
    const data = evolutionData.map(entry => {
      if (selectedFactorId === 'geral') {
        return entry.generalScore;
      }
      return entry.scores?.[selectedFactorId] ?? null;
    });

    return {
      labels,
      datasets: [{
        label: factorIdToName[selectedFactorId],
        data,
        color: '#3b82f6',
      }]
    };
  }, [evolutionData, selectedFactorId]);
  
  const moodChartData = useMemo(() => {
    if (journalData.length < 2) return null;
    
    // Journal entries are sorted descending, reverse for chronological chart
    const chronologicalData = [...journalData].reverse();
    
    const labels = chronologicalData.map(e => new Date(e.date).toLocaleDateString('pt-BR'));
    const data = chronologicalData.map(e => feelingToScore[e.feeling] ?? null);
    
    return {
        labels,
        datasets: [{
            label: 'Humor (1-5)',
            data,
            color: '#8b5cf6'
        }]
    };
  }, [journalData]);

  const keyInsights = useMemo(() => {
    if (!evolutionData || evolutionData.length < 2) {
        return null;
    }

    const last = evolutionData[0]; // Data is sorted descending from service
    const secondLast = evolutionData[1];
    
    if (!last || !secondLast) {
        return null;
    }

    let changes: { factorId: string, change: number, endScore: number }[] = [];

    allFactorIds.forEach(factorId => {
      const lastScore = factorId === 'geral' ? last.generalScore : last.scores?.[factorId];
      const secondLastScore = factorId === 'geral' ? secondLast.generalScore : secondLast.scores?.[factorId];
      
      if (typeof lastScore === 'number' && typeof secondLastScore === 'number') {
        changes.push({
          factorId,
          change: lastScore - secondLastScore,
          endScore: lastScore,
        });
      }
    });

    changes.sort((a, b) => b.change - a.change);
    
    const topImprovement = changes.length > 0 ? changes[0] : null;
    
    let attentionPoint: { factorId: string; score: number } | null = null;
    if (last.scores && typeof last.scores === 'object' && Object.keys(last.scores).length > 0) {
        const validScores = Object.entries(last.scores)
            .filter((entry): entry is [string, number] => typeof entry[1] === 'number');

        if (validScores.length > 0) {
            const attentionPointEntry = validScores.sort(([, a], [, b]) => a - b)[0];
            if (attentionPointEntry) {
                attentionPoint = { factorId: attentionPointEntry[0], score: attentionPointEntry[1] };
            }
        }
    }

    return { topImprovement, attentionPoint };
  }, [evolutionData]);


  if (isLoading) {
    return <div className="text-center p-8">Carregando sua evolução...</div>;
  }

  if (evolutionData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow border border-slate-200">
        <BrainIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
        <h2 className="text-xl font-semibold text-slate-800">Sua jornada começa agora.</h2>
        <p className="text-slate-500 mt-2">Ainda não temos dados sobre sua evolução.</p>
        <p className="text-slate-500">Responda a um questionário para começar a acompanhar seu progresso.</p>
        <button 
            onClick={() => setActiveView('corporate_survey')} 
            className="mt-4 bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700">
            Responder Questionário
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Minha Evolução</h1>
        <p className="text-slate-600 mt-1">Acompanhe sua jornada de bem-estar ao longo do tempo.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center gap-3">
        <ShieldCheckIcon className="w-8 h-8 flex-shrink-0" />
        <div>
          <h3 className="font-bold">Seus dados são 100% confidenciais.</h3>
          <p className="text-sm">Esta visualização é exclusivamente sua. Ninguém mais na sua empresa tem acesso a estas informações.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Evolução (Baseado nos Questionários)</h2>
             <div>
                <label htmlFor="factor-select-collab" className="sr-only">Analisar Fator</label>
                <select 
                    id="factor-select-collab"
                    value={selectedFactorId}
                    onChange={(e) => setSelectedFactorId(e.target.value)}
                    className="p-2 w-full sm:w-auto bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                    {allFactorIds.map(id => <option key={id} value={id}>{factorIdToName[id]}</option>)}
                </select>
            </div>
        </div>
        {surveyChartData ? <LineChart chartData={surveyChartData} yMin={0} yMax={100} yAxisLabels={[0, 25, 50, 75, 100]} /> : <p className="text-center text-slate-500">Selecione um fator para ver a evolução.</p>}
      </div>

      {moodChartData && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Evolução do Humor (Baseado no Diário)</h2>
              <LineChart chartData={moodChartData} yMin={1} yMax={5} yAxisLabels={[1, 2, 3, 4, 5]} />
          </div>
      )}

      {keyInsights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Insights Rápidos (do último questionário)</h2>
                <div className="space-y-4">
                    {keyInsights.topImprovement && keyInsights.topImprovement.change > 0 && (
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-2 rounded-full"><ArrowTrendingUpIcon className="w-6 h-6 text-green-600" /></div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Seu Maior Progresso</h3>
                                <p className="text-slate-600 text-sm">Você teve a maior melhora em <span className="font-bold">{factorIdToName[keyInsights.topImprovement.factorId]}</span>. Ótimo trabalho!</p>
                            </div>
                        </div>
                    )}
                    {keyInsights.attentionPoint && (
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 p-2 rounded-full"><ExclamationTriangleIcon className="w-6 h-6 text-orange-600" /></div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Seu Ponto de Atenção Atual</h3>
                                <p className="text-slate-600 text-sm">O fator com a menor pontuação na sua última resposta foi <span className="font-bold">{factorIdToName[keyInsights.attentionPoint.factorId]}</span> ({keyInsights.attentionPoint.score}/100). Pode ser uma boa área para focar.</p>
                            </div>
                        </div>
                    )}
                    {!keyInsights.topImprovement && !keyInsights.attentionPoint && (
                        <p className="text-slate-500 text-sm">Não há insights suficientes para comparar. Responda a mais um questionário para ver as mudanças.</p>
                    )}
                </div>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center items-center text-center">
                <BrainIcon className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-800">Precisa de uma nova perspectiva?</h3>
                <p className="text-slate-600 mt-1 text-sm">Use a ferramenta de Reflexão Pessoal para explorar um desafio ou sentimento com a ajuda da IA.</p>
                <button 
                    onClick={() => setActiveView('personal_reflection')} 
                    className="mt-4 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-100">
                    Ir para Reflexão Pessoal
                </button>
             </div>
          </div>
      )}
    </div>
  );
};
