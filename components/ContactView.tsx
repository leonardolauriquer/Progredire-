
import React, { useState } from 'react';
import { InstagramIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

export const ContactView: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        // Simulate API call
        setTimeout(() => {
            if (formData.name && formData.email && formData.subject && formData.message) {
                setSuccessMessage('Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
            }
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-[--color-foreground]">Entre em Contato</h2>
                <p className="text-[--color-muted-foreground] mt-2 max-w-2xl mx-auto">
                    Tem alguma dúvida, sugestão ou quer saber mais sobre nossos planos corporativos? Nossa equipe está pronta para ajudar.
                </p>
            </div>

            <div className="bg-[--color-card] p-6 md:p-8 rounded-2xl shadow-lg border border-[--color-border] grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-[--color-card-foreground]">Envie uma mensagem</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Nome completo</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Seu melhor e-mail</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]" />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Assunto</label>
                            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Sua mensagem</label>
                            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring] resize-none"></textarea>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300">
                            {isLoading ? <><LoadingSpinner /> Enviando...</> : 'Enviar Mensagem'}
                        </button>
                    </form>
                    {successMessage && <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">{successMessage}</div>}
                    {errorMessage && <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">{errorMessage}</div>}
                </div>

                {/* Contact Info */}
                <div className="bg-[--color-muted] p-6 rounded-lg space-y-6">
                    <h3 className="text-xl font-semibold text-[--color-card-foreground]">Outras formas de contato</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-[--color-card-foreground]">E-mail</h4>
                            <a href="mailto:contato@progrediremais.com.br" className="text-blue-600 hover:underline">contato@progrediremais.com.br</a>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[--color-card-foreground]">Telefone</h4>
                            <p className="text-[--color-card-muted-foreground]">+55 (11) 99999-8888</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[--color-card-foreground]">Redes Sociais</h4>
                            <a href="https://www.instagram.com/progredire.lideranca" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                                <InstagramIcon className="w-5 h-5" />
                                @progredire.lideranca
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};