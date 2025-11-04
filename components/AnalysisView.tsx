import React, { useState, useCallback } from 'react';
import { runAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon } from './icons';

export const AnalysisView: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async () => {
        if (!userInput.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult('');

        try {
            const result = await runAnalysis(userInput);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        handleAnalysis();
        }
    };

    return (
        <>
            <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 space-y-6">
            
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Análise Psico-Social</h2>
                    <p className="text-slate-500 mt-2">
                    Descreva uma situação, um sentimento ou um desafio. A IA fornecerá uma perspectiva psico-social para te ajudar a refletir.
                    </p>
                </div>

                <div className="space-y-4">
                    <label htmlFor="userInput" className="sr-only">Sua descrição</label>
                    <textarea
                    id="userInput"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: 'Sinto-me sobrecarregado no trabalho e com dificuldade de me conectar com meus colegas...'"
                    className="w-full h-40 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none text-slate-700 placeholder-slate-400"
                    disabled={isLoading}
                    />
                    <button
                    onClick={handleAnalysis}
                    disabled={isLoading || !userInput.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                    >
                    {isLoading ? (
                        <>
                        <LoadingSpinner />
                        Analisando...
                        </>
                    ) : (
                        <>
                        <SparklesIcon className="w-5 h-5" />
                        Analisar Situação
                        </>
                    )}
                    </button>
                    <p className="text-xs text-center text-slate-400">Ou pressione Ctrl+Enter para enviar.</p>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Ocorreu um erro</p>
                    <p>{error}</p>
                    </div>
                )}

                {analysisResult && (
                    <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Perspectiva da IA</h3>
                    <div 
                        className="prose prose-slate max-w-none" 
                        dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}
                    />
                    </div>
                )}

            </div>
            <footer className="text-center mt-8">
                <p className="text-sm text-slate-500">
                    Progredire+ | Ferramenta de análise psicológica organizacional.
                </p>
            </footer>
        </>
    );
};