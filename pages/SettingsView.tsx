import React, { useState, useEffect } from 'react';
import { PaintBrushIcon, AdjustmentsHorizontalIcon, ArrowPathIcon } from '../components/icons';

type Theme = 'theme-default-light' | 'theme-default-dark' | 'theme-colorblind-light' | 'theme-colorblind-dark';
type FontSize = 'font-size-sm' | 'font-size-md' | 'font-size-lg';

const themes: { value: Theme; label: string }[] = [
    { value: 'theme-default-light', label: 'Padrão (Claro)' },
    { value: 'theme-default-dark', label: 'Padrão (Escuro)' },
    { value: 'theme-colorblind-light', label: 'Daltonismo (Claro)' },
    { value: 'theme-colorblind-dark', label: 'Daltonismo (Escuro)' },
];

const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'font-size-sm', label: 'Pequeno' },
    { value: 'font-size-md', label: 'Médio' },
    { value: 'font-size-lg', label: 'Grande' },
];

const SettingsCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
        <h3 className="text-lg font-semibold text-[--color-card-foreground] mb-4 flex items-center">
            <Icon className="w-6 h-6 mr-3 text-[--color-primary-500]" />
            {title}
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

export const SettingsView: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('theme-default-light');
    const [fontSize, setFontSize] = useState<FontSize>('font-size-md');

    useEffect(() => {
        const savedTheme = localStorage.getItem('progredire-theme') as Theme || 'theme-default-light';
        const savedFontSize = localStorage.getItem('progredire-fontSize') as FontSize || 'font-size-md';
        setTheme(savedTheme);
        setFontSize(savedFontSize);
    }, []);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('progredire-theme', newTheme);
        const currentFontSize = document.documentElement.className.split(' ').find(cn => cn.startsWith('font-size-')) || 'font-size-md';
        document.documentElement.className = `${newTheme} ${currentFontSize}`;
    };
    
    const handleFontSizeChange = (newSize: FontSize) => {
        setFontSize(newSize);
        localStorage.setItem('progredire-fontSize', newSize);
        const currentTheme = document.documentElement.className.split(' ').find(cn => cn.startsWith('theme-')) || 'theme-default-light';
        document.documentElement.className = `${currentTheme} ${newSize}`;
    };

    const handleResetData = () => {
        if (window.confirm('Tem certeza que deseja resetar os dados da simulação? Esta ação não pode ser desfeita.')) {
            // In a real app, this would trigger a data reset. Here, we'll just show an alert.
            alert('Os dados da simulação foram resetados. A página será recarregada.');
            window.location.reload();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-[--color-foreground]">Configurações</h2>
                <p className="text-[--color-muted-foreground] mt-2">
                    Personalize a aparência e gerencie os dados da aplicação.
                </p>
            </div>
            
            <div className="space-y-6">
                <SettingsCard title="Aparência" icon={PaintBrushIcon}>
                    <div>
                        <label className="block text-sm font-medium text-[--color-card-muted-foreground] mb-2">Tema</label>
                        <div className="grid grid-cols-2 gap-2">
                            {themes.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => handleThemeChange(t.value)}
                                    className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                                        theme === t.value
                                        ? 'bg-[--color-primary-600] text-white font-semibold'
                                        : 'bg-[--color-accent] hover:bg-[--color-border] text-[--color-accent-foreground]'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingsCard>
                
                <SettingsCard title="Acessibilidade" icon={AdjustmentsHorizontalIcon}>
                    <div>
                        <label className="block text-sm font-medium text-[--color-card-muted-foreground] mb-2">Tamanho da Fonte</label>
                        <div className="flex bg-[--color-accent] p-1 rounded-md">
                            {fontSizes.map(fs => (
                                <button
                                    key={fs.value}
                                    onClick={() => handleFontSizeChange(fs.value)}
                                    className={`w-full p-2 rounded text-sm font-medium transition-colors ${
                                        fontSize === fs.value
                                        ? 'bg-[--color-primary-600] text-white shadow'
                                        : 'text-[--color-accent-foreground] hover:bg-[--color-card]'
                                    }`}
                                >
                                    {fs.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Gerenciamento de Dados" icon={ArrowPathIcon}>
                     <div>
                        <p className="text-sm text-[--color-card-muted-foreground] mb-3">
                            Isso limpará todos os dados da simulação do dashboard e dos relatórios. Útil para iniciar uma nova análise.
                        </p>
                        <button
                            onClick={handleResetData}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[--color-destructive] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-destructive] transition-all duration-300"
                        >
                            Resetar Simulação de Dados
                        </button>
                    </div>
                </SettingsCard>
            </div>
        </div>
    );
};
