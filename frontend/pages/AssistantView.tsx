

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { startAssistantChat, runAssistantChat } from '../services/geminiService';
import { PaperAirplaneIcon, LogoIcon, UserIcon, SparklesIcon } from '../components/icons';

interface Message {
    role: 'user' | 'model' | 'loading';
    content: string;
}

const examplePrompts = [
    "Qual o fator mais crítico na diretoria de Tecnologia?",
    "Compare a pontuação de 'Liderança' com 'Reconhecimento' para toda a empresa.",
    "Qual a pontuação de 'Carga de Trabalho' para o setor de Vendas?",
];

export const AssistantView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Olá! Sou o Assistente IA do Progredire+. Como posso ajudar a analisar os dados da sua organização hoje?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startAssistantChat(); // Initialize the chat session when the component mounts
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async (prompt: string) => {
        const messageToSend = prompt.trim();
        if (!messageToSend || isLoading) return;

        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: messageToSend }, { role: 'loading', content: '' }]);

        try {
            const response = await runAssistantChat(messageToSend);
            setMessages(prev => {
                const newMessages = [...prev];
                // Replace the loading message with the actual model response
                const loadingIndex = newMessages.findIndex(m => m.role === 'loading');
                if (loadingIndex !== -1) {
                    newMessages[loadingIndex] = { role: 'model', content: response };
                }
                return newMessages;
            });
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            setMessages(prev => {
                const newMessages = [...prev];
                const loadingIndex = newMessages.findIndex(m => m.role === 'loading');
                if (loadingIndex !== -1) {
                    newMessages[loadingIndex] = { role: 'model', content: `Desculpe, não consegui processar sua solicitação. Erro: ${errorMessage}` };
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-[--color-card] rounded-2xl shadow-lg border border-[--color-border]">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-[--color-border]">
                <h2 className="text-xl font-bold text-[--color-card-foreground] text-center flex items-center justify-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-600"/>
                    Assistente IA
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-[--color-muted]">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <LogoIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        
                        <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                            {msg.role === 'loading' ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            ) : (
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-slate-600" />
                            </div>
                        )}
                    </div>
                ))}
                {messages.length === 1 && (
                    <div className="pt-4 space-y-2">
                        <p className="text-center text-sm text-slate-500">Experimente perguntar:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {examplePrompts.map(prompt => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSendMessage(prompt)}
                                    className="px-3 py-1 bg-white border border-slate-300 rounded-full text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    "{prompt}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="flex-shrink-0 p-4 border-t border-[--color-border] bg-[--color-card]">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte algo sobre os dados da sua organização..."
                        className="w-full p-3 bg-[--color-muted] border border-[--color-border] rounded-xl focus:ring-2 focus:ring-[--color-ring] transition duration-200 text-[--color-foreground] placeholder-slate-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};
