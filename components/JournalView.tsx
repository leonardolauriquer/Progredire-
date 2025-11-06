
import React, { useState, useEffect } from 'react';
import { getJournalEntries, JournalEntry } from '../services/journalService';
import { BookOpenIcon } from './icons';

export const JournalView: React.FC = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            setIsLoading(true);
            const data = await getJournalEntries();
            setEntries(data);
            setIsLoading(false);
        };
        fetchEntries();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8">Carregando seu diário...</div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center">
                <BookOpenIcon className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                <h1 className="text-3xl font-bold text-slate-900">Diário de Emoções</h1>
                <p className="text-slate-600 mt-1">
                    Seu espaço privado para registrar e refletir sobre seus sentimentos ao longo do tempo.
                </p>
            </div>
            
            {entries.length > 0 ? (
                <div className="space-y-4">
                    {entries.map(entry => (
                        <div key={entry.id} className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{entry.emoji}</span>
                                <div>
                                    <p className="font-bold text-slate-800">{entry.feeling}</p>
                                    <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            {entry.note && (
                                <blockquote className="mt-3 bg-slate-50 border-l-4 border-blue-300 p-3 text-sm text-slate-700 italic">
                                    "{entry.note}"
                                </blockquote>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow border border-slate-200">
                    <BookOpenIcon className="w-16 h-16 mx-auto text-slate-300 mb-3" />
                    <h2 className="text-xl font-semibold text-slate-800">Seu diário está vazio.</h2>
                    <p className="text-slate-500 mt-2">Comece a registrar como você se sente na tela inicial.</p>
                </div>
            )}
        </div>
    );
};
