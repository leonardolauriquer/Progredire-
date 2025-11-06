
import React, { useState, useEffect, useCallback } from 'react';
import { getPublishedInitiatives, recordInitiativeSupport, PublishedInitiative } from '../services/dataService';
import { LightBulbIcon, FlagIcon, PaperAirplaneIcon } from './icons';

const InitiativeCard: React.FC<{
    initiative: PublishedInitiative;
    onSupport: (id: number) => void;
}> = ({ initiative, onSupport }) => {

    const getStatusStyles = (status: 'Em Andamento' | 'Concluído') => {
        return status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
            <div>
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{initiative.factor}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(initiative.status)}`}>
                        {initiative.status}
                    </span>
                </div>
                <p className="text-sm text-slate-500">Público: {initiative.segment}</p>
            </div>

            <blockquote className="bg-slate-50 border-l-4 border-blue-500 p-4">
                <p className="text-slate-700 italic">"{initiative.announcement}"</p>
                <footer className="text-xs text-slate-500 mt-2">- Publicado em {new Date(initiative.publishedDate).toLocaleDateString()}</footer>
            </blockquote>

            <div className="space-y-3">
                <div>
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><FlagIcon className="w-5 h-5 text-green-600"/> Objetivo</h4>
                    <p className="text-sm text-slate-600 pl-7">{initiative.objective}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><PaperAirplaneIcon className="w-5 h-5 text-indigo-600"/> Principais Ações</h4>
                    <ul className="list-disc list-inside pl-7 space-y-1 text-sm text-slate-600 mt-2">
                        {initiative.actions.slice(0, 3).map((action, index) => (
                            <li key={index}>{action.title}</li>
                        ))}
                        {initiative.actions.length > 3 && <li>E mais...</li>}
                    </ul>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                    onClick={() => onSupport(initiative.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                    <span role="img" aria-label="Apoiar">👍</span>
                    Apoiar ({initiative.supportCount})
                </button>
            </div>
        </div>
    );
};


export const InitiativesView: React.FC = () => {
    const [initiatives, setInitiatives] = useState<PublishedInitiative[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInitiatives = useCallback(async () => {
        setIsLoading(true);
        const data = await getPublishedInitiatives();
        setInitiatives(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchInitiatives();
    }, [fetchInitiatives]);

    const handleSupport = useCallback(async (id: number) => {
        const updatedInitiatives = await recordInitiativeSupport(id);
        setInitiatives(updatedInitiatives);
    }, []);

    if (isLoading) {
        return <div className="text-center p-8 text-slate-500">Carregando iniciativas...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <LightBulbIcon className="w-12 h-12 mx-auto text-blue-600 mb-2"/>
                <h1 className="text-3xl font-bold text-slate-900">Mural de Iniciativas</h1>
                <p className="text-slate-600 mt-1">
                    Acompanhe as ações que a empresa está tomando para melhorar nosso ambiente de trabalho.
                </p>
            </div>
            
            {initiatives.length > 0 ? (
                <div className="space-y-6">
                    {initiatives.map(initiative => (
                        <InitiativeCard 
                            key={initiative.id} 
                            initiative={initiative}
                            onSupport={handleSupport}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-white rounded-xl shadow border border-slate-200">
                    <LightBulbIcon className="w-16 h-16 mx-auto text-slate-300 mb-3"/>
                    <h2 className="text-xl font-semibold text-slate-800">Nenhuma iniciativa publicada ainda.</h2>
                    <p className="text-slate-500 mt-2">Quando a empresa compartilhar um plano de ação, ele aparecerá aqui.</p>
                </div>
            )}
        </div>
    );
};
