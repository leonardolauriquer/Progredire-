import React, { useState, useMemo, useCallback } from 'react';
import { runCorporateSurveyAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon } from './icons';

const corporateFields = [
    { id: 'empresa', label: 'Empresa', type: 'text' },
    { id: 'diretoria', label: 'Diretoria', type: 'text' },
    { id: 'setor', label: 'Setor / Área', type: 'text' },
    { id: 'cargo', label: 'Cargo', type: 'text' },
    { id: 'tempoEmpresa', label: 'Tempo de Empresa', type: 'select', options: ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', '5 a 10 anos', 'Mais de 10 anos'] },
];

const questions = [
  { id: 'q1', text: 'Sinto que o volume de trabalho e as metas são razoáveis e alcançáveis.', risk: 'Carga de trabalho excessiva' },
  { id: 'q2', text: 'Minha jornada de trabalho e o ritmo exigido permitem pausas adequadas e um bom equilíbrio com a vida pessoal.', risk: 'Jornada longa / Ritmo elevado' },
  { id: 'q3', text: 'Tenho clareza sobre minhas responsabilidades e o que a liderança espera de mim.', risk: 'Falta de clareza do papel' },
  { id: 'q4', text: 'Tenho autonomia para tomar decisões sobre como realizar meu trabalho.', risk: 'Baixo controle/autonomia' },
  { id: 'q5', text: 'Recebo apoio e ajuda da minha chefia e dos meus colegas quando preciso.', risk: 'Baixo suporte social' },
  { id: 'q6', text: 'O ambiente de trabalho é respeitoso e livre de conflitos, assédio ou hostilidade.', risk: 'Más relações interpessoais / Conflitos' },
  { id: 'q7', text: 'Meu esforço e minhas contribuições são devidamente reconhecidos e recompensados.', risk: 'Falta de reconhecimento' },
  { id: 'q8', text: 'Sinto-me seguro(a) em meu emprego e as mudanças na empresa são comunicadas de forma transparente.', risk: 'Insegurança no emprego' },
  { id: 'q9', text: 'Mesmo trabalhando de forma remota ou isolada, sinto-me conectado(a) e a comunicação com a equipe flui bem.', risk: 'Trabalho isolado / Comunicação difícil' },
  { id: 'q10', text: 'Os processos de trabalho são bem definidos e o ambiente é organizado.', risk: 'Clima organizacional inadequado' },
];

const likertOptions = ['Discordo Totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo Totalmente'];

export const CorporateSurveyView: React.FC = () => {
    const [corporateData, setCorporateData] = useState<Record<string, string>>({});
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDataChange = (id: string, value: string) => {
        setCorporateData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleAnswerChange = (questionId: string, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const allFieldsCompleted = useMemo(() => {
        const corporateFieldsCompleted = corporateFields.every(field => corporateData[field.id]?.trim());
        const questionsAnswered = Object.keys(answers).length === questions.length;
        return corporateFieldsCompleted && questionsAnswered;
    }, [corporateData, answers]);

    const handleSubmit = useCallback(async () => {
        if (!allFieldsCompleted || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult('');

        let formattedData = "Dados de Segmentação:\n";
        corporateFields.forEach(field => {
            formattedData += `- ${field.label}: ${corporateData[field.id]}\n`;
        });

        formattedData += "\nRespostas do Questionário:\n";
        questions.forEach(q => {
            formattedData += `- Pergunta (Fator de Risco: ${q.risk}): "${q.text}"\n  Resposta: ${answers[q.id]}\n`;
        });

        try {
            const result = await runCorporateSurveyAnalysis(formattedData);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [corporateData, answers, allFieldsCompleted, isLoading]);

    return (
        <>
            <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Análise de Riscos Psicossociais</h2>
                    <p className="text-slate-500 mt-2">
                        Preencha os dados e responda ao questionário. Suas respostas são confidenciais.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Segmentation Data */}
                    <div className="border border-slate-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-4">Dados de Segmentação (Anônimo)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {corporateFields.map(field => (
                                <div key={field.id}>
                                    <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                                    {field.type === 'text' ? (
                                        <input
                                            type="text"
                                            id={field.id}
                                            value={corporateData[field.id] || ''}
                                            onChange={(e) => handleDataChange(field.id, e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    ) : (
                                        <select
                                            id={field.id}
                                            value={corporateData[field.id] || ''}
                                            onChange={(e) => handleDataChange(field.id, e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-3">Estas informações são usadas apenas para agrupar dados e garantir o anonimato. Nenhum nome é coletado.</p>
                    </div>

                    {/* Questions */}
                    {questions.map((q, index) => (
                        <div key={q.id} className="border border-slate-200 p-4 rounded-lg">
                            <p className="font-semibold text-slate-800 mb-3">{index + 1}. {q.text}</p>
                            <fieldset className="flex flex-wrap gap-2">
                                <legend className="sr-only">Opções para: {q.text}</legend>
                                {likertOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswerChange(q.id, option)}
                                        role="radio"
                                        aria-checked={answers[q.id] === option}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border
                                            ${answers[q.id] === option 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </fieldset>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !allFieldsCompleted}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {isLoading ? <><LoadingSpinner /> Analisando...</> : <><SparklesIcon className="w-5 h-5" /> Analisar Respostas</>}
                </button>

                 {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Ocorreu um erro</p>
                        <p>{error}</p>
                    </div>
                )}

                {analysisResult && (
                    <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-slate-800 mb-3">Análise Preliminar Individual</h3>
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