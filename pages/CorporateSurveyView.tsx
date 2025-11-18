import React, { useState, useMemo, useCallback } from 'react';
import { runCorporateSurveyAnalysis } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SparklesIcon, ShieldCheckIcon } from '../components/icons';
import { saveCollaboratorSurvey } from '../services/dataService';
import { ActiveView } from '../App';

interface SurveyQuestion {
    id: string;
    text: string;
    type?: 'textarea';
}

interface SurveyTopic {
    title: string;
    questions: SurveyQuestion[];
}

interface CorporateSurveyViewProps {
  setActiveView: (view: ActiveView) => void;
}

const corporateFields = [
    { id: 'empresa', label: 'Empresa', type: 'text' },
    { id: 'diretoria', label: 'Diretoria', type: 'text' },
    { id: 'setor', label: 'Setor / Área', type: 'text' },
    { id: 'cargo', label: 'Cargo', type: 'text' },
    { id: 'tempoEmpresa', label: 'Tempo de Empresa', type: 'select', options: ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', '5 a 10 anos', 'Mais de 10 anos'] },
];

const surveyStructure: SurveyTopic[] = [
    {
        title: '1. Organização e Carga de Trabalho',
        questions: [
            { id: 'q1', text: 'Tenho tempo suficiente para realizar minhas atividades com qualidade.' },
            { id: 'q2', text: 'O volume de tarefas é compatível com o que consigo entregar.' },
            { id: 'q3', text: 'As metas estabelecidas são realistas e possíveis de atingir.' },
            { id: 'q4', text: 'Recebo informações claras sobre prazos e prioridades.' },
            { id: 'q5', text: 'Consigo equilibrar as demandas do trabalho com minha vida pessoal.' },
        ]
    },
    {
        title: '2. Demandas Emocionais e Cognitivas',
        questions: [
            { id: 'q6', text: 'O trabalho exige atenção constante e concentração intensa.' },
            { id: 'q7', text: 'Preciso lidar com situações que geram estresse com frequência.' },
            { id: 'q8', text: 'Meu trabalho exige lidar com pessoas em momentos difíceis.' },
            { id: 'q9', text: 'Tenho energia emocional suficiente para lidar com os desafios diários.' },
            { id: 'q10', text: 'As situações de pressão são bem gerenciadas pela equipe.' },
        ]
    },
    {
        title: '3. Autonomia e Controle',
        questions: [
            { id: 'q11', text: 'Tenho liberdade para decidir como realizar minhas tarefas.' },
            { id: 'q12', text: 'Posso propor melhorias ou mudanças na forma de trabalhar.' },
            { id: 'q13', text: 'Sou ouvido(a) quando apresento sugestões.' },
            { id: 'q14', text: 'Sinto que confiam na minha capacidade de tomar decisões.' },
        ]
    },
    {
        title: '4. Clareza de Papéis e Responsabilidades',
        questions: [
            { id: 'q15', text: 'Sei claramente o que se espera do meu trabalho.' },
            { id: 'q16', text: 'As responsabilidades da minha função estão bem definidas.' },
            { id: 'q17', text: 'As tarefas de diferentes áreas não se confundem.' },
            { id: 'q18', text: 'As metas individuais e da equipe são comunicadas com clareza.' },
        ]
    },
    {
        title: '5. Reconhecimento e Recompensas',
        questions: [
            { id: 'q19', text: 'Sinto que meu trabalho é valorizado.' },
            { id: 'q20', text: 'Recebo feedback sobre meu desempenho.' },
            { id: 'q21', text: 'Quando entrego bons resultados, isso é reconhecido.' },
            { id: 'q22', text: 'Tenho oportunidades de crescer e me desenvolver profissionalmente.' },
        ]
    },
    {
        title: '6. Relacionamentos e Suporte Social',
        questions: [
            { id: 'q23', text: 'Tenho um bom relacionamento com meus colegas de trabalho.' },
            { id: 'q24', text: 'Posso contar com ajuda quando preciso resolver um problema.' },
            { id: 'q25', text: 'Há colaboração e espírito de equipe no ambiente de trabalho.' },
            { id: 'q26', text: 'Sinto que minha equipe é unida.' },
        ]
    },
    {
        title: '7. Liderança e Comunicação',
        questions: [
            { id: 'q27', text: 'Meu líder comunica com clareza as informações importantes.' },
            { id: 'q28', text: 'Posso conversar com minha liderança sobre dificuldades no trabalho.' },
            { id: 'q29', text: 'As decisões da liderança são coerentes e justas.' },
            { id: 'q30', text: 'Sinto que minha liderança se preocupa com o bem-estar da equipe.' },
        ]
    },
    {
        title: '8. Justiça e Equidade',
        questions: [
            { id: 'q31', text: 'As regras e políticas da empresa são aplicadas de forma justa.' },
            { id: 'q32', text: 'As oportunidades são oferecidas de forma igual para todos.' },
            { id: 'q33', text: 'O esforço de cada pessoa é reconhecido de maneira equilibrada.' },
            { id: 'q34', text: 'As decisões são tomadas de forma transparente.' },
        ]
    },
    {
        title: '9. Segurança Psicológica, Assédio e Respeito',
        questions: [
            { id: 'q35', text: 'Sinto-me seguro(a) para expressar opiniões diferentes.' },
            { id: 'q36', text: 'No meu trabalho, as pessoas se tratam com respeito.' },
            { id: 'q37', text: 'Não presencio comportamentos de assédio ou humilhação.' },
            { id: 'q38', text: 'Tenho liberdade para relatar situações inadequadas sem medo de punição.' },
        ]
    },
    {
        title: '10. Mudanças Organizacionais e Estabilidade',
        questions: [
            { id: 'q39', text: 'As mudanças na empresa são comunicadas de forma clara.' },
            { id: 'q40', text: 'Recebo explicações sobre os motivos das mudanças.' },
            { id: 'q41', text: 'Sinto segurança em relação à continuidade do meu trabalho.' },
            { id: 'q42', text: 'Confio na direção que a empresa está seguindo.' },
        ]
    },
    {
        title: '11. Ambiente e Condições de Trabalho',
        questions: [
            { id: 'q43', text: 'O ambiente físico de trabalho é adequado para as atividades que realizo.' },
            { id: 'q44', text: 'Tenho os recursos e equipamentos necessários para desempenhar bem.' },
            { id: 'q45', text: 'As condições do local de trabalho favorecem o foco e a produtividade.' },
        ]
    },
    {
        title: 'Perguntas Abertas (percepções qualitativas)',
        questions: [
            { id: 'q46', text: 'O que mais causa estresse ou desconforto no seu trabalho?', type: 'textarea' },
            { id: 'q47', text: 'O que você acredita que a empresa poderia fazer para melhorar o clima e o bem-estar?', type: 'textarea' },
            { id: 'q48', text: 'Que prática ou atitude da liderança você considera mais importante manter?', type: 'textarea' },
        ]
    }
];

const likertOptions = ['Discordo totalmente', 'Discordo parcialmente', 'Neutro / Indiferente', 'Concordo parcialmente', 'Concordo totalmente'];

export const CorporateSurveyView: React.FC<CorporateSurveyViewProps> = ({ setActiveView }) => {
    const [corporateData, setCorporateData] = useState<Record<string, string>>({});
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleDataChange = (id: string, value: string) => {
        setCorporateData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const likertQuestions = useMemo(() => 
        surveyStructure.flatMap(topic => topic.questions).filter(q => q.type !== 'textarea'), 
        []
    );

    const allFieldsCompleted = useMemo(() => {
        const corporateFieldsCompleted = corporateFields.every(field => corporateData[field.id]?.trim());
        const questionsAnswered = likertQuestions.every(q => answers[q.id]);
        return corporateFieldsCompleted && questionsAnswered;
    }, [corporateData, answers, likertQuestions]);

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
        surveyStructure.forEach(topic => {
            topic.questions.forEach(q => {
                const answer = answers[q.id];
                if (answer && answer.trim()) { // Only include answered questions
                    formattedData += `- Pergunta (Dimensão: ${topic.title}): "${q.text}"\n  Resposta: ${answer}\n`;
                }
            });
        });

        try {
            const result = await runCorporateSurveyAnalysis(formattedData);
            setAnalysisResult(result);
            await saveCollaboratorSurvey(answers);
            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [corporateData, answers, allFieldsCompleted, isLoading]);

    if (isSubmitted) {
        return (
            <div className="w-full max-w-4xl mx-auto bg-[--color-card] rounded-2xl shadow-lg border border-[--color-border] p-6 md:p-8 space-y-6 text-center">
                <ShieldCheckIcon className="w-16 h-16 text-green-500 mx-auto"/>
                <h2 className="text-2xl md:text-3xl font-bold text-[--color-card-foreground]">Obrigado por sua participação!</h2>
                <p className="text-[--color-card-muted-foreground]">Suas respostas foram registradas de forma 100% confidencial. A sua evolução pessoal foi atualizada.</p>
                {analysisResult && (
                    <div className="bg-[--color-muted] p-6 rounded-xl text-left border border-[--color-border]">
                        <h3 className="text-xl font-semibold text-[--color-card-foreground] mb-3">Análise Preliminar Individual</h3>
                        <div 
                            className="prose prose-slate max-w-none" 
                            dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}
                        />
                    </div>
                )}
                 <button 
                    onClick={() => setActiveView('history')} 
                    className="mt-4 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700"
                >
                    Ver Minha Evolução
                </button>
            </div>
        )
    }


    return (
        <>
            <div className="w-full max-w-4xl mx-auto bg-[--color-card] rounded-2xl shadow-lg border border-[--color-border] p-6 md:p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-[--color-card-foreground]">Questionário Psicossocial</h2>
                    <p className="text-[--color-card-muted-foreground] mt-2">
                        Responda ao questionário de forma confidencial. Suas percepções são fundamentais para construirmos um ambiente de trabalho melhor.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Segmentation Data */}
                    <div className="bg-[--color-muted] p-4 rounded-xl border border-[--color-border]">
                        <h3 className="font-semibold text-[--color-card-foreground] mb-4">Dados de Segmentação (Anônimo)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {corporateFields.map(field => (
                                <div key={field.id}>
                                    <label htmlFor={field.id} className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">{field.label}</label>
                                    {field.type === 'text' ? (
                                        <input
                                            type="text"
                                            id={field.id}
                                            value={corporateData[field.id] || ''}
                                            onChange={(e) => handleDataChange(field.id, e.target.value)}
                                            className="w-full p-2 bg-[--color-input] border border-[--color-border] rounded-md focus:ring-2 focus:ring-[--color-ring] transition"
                                        />
                                    ) : (
                                        <select
                                            id={field.id}
                                            value={corporateData[field.id] || ''}
                                            onChange={(e) => handleDataChange(field.id, e.target.value)}
                                            className="w-full p-2 bg-[--color-input] border border-[--color-border] rounded-md focus:ring-2 focus:ring-[--color-ring] transition"
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

                    {/* Questions by Topic */}
                    <div className="space-y-6">
                        {surveyStructure.map((topic, topicIndex) => (
                            <div key={topicIndex} className="bg-[--color-muted] p-4 md:p-6 rounded-xl border border-[--color-border]">
                                <h3 className="font-semibold text-[--color-card-foreground] mb-6 text-lg">{topic.title}</h3>
                                <div className="space-y-8">
                                    {topic.questions.map((q) => (
                                        <div key={q.id}>
                                            <label htmlFor={q.id} className="font-medium text-[--color-card-foreground] mb-3 block">{q.id.replace('q', '')}. {q.text}</label>
                                            {q.type === 'textarea' ? (
                                                <textarea
                                                    id={q.id}
                                                    value={answers[q.id] || ''}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="w-full h-28 p-3 bg-[--color-input] border border-[--color-border] rounded-md focus:ring-2 focus:ring-[--color-ring] transition resize-none"
                                                    placeholder="Sua resposta (opcional)..."
                                                />
                                            ) : (
                                                <fieldset>
                                                    <legend className="sr-only">Opções para: {q.text}</legend>
                                                    <div className="flex flex-wrap gap-2">
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
                                                    </div>
                                                </fieldset>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
            </div>
             <footer className="text-center mt-8">
                <p className="text-sm text-slate-500">
                    Progredire+ | Ferramenta de análise psicológica organizacional.
                </p>
            </footer>
        </>
    );
};