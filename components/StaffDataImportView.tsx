import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, ArrowDownTrayIcon, SparklesIcon } from './icons';
import { importSurveyResponses, importHistoricalIndicators, importLeaveEvents, importLeadershipData, importFinancialData } from '../services/dataService';
import { LoadingSpinner } from './LoadingSpinner';

declare var XLSX: any;

interface ImportCardProps {
    title: string;
    description: string;
    onDownloadTemplate: () => void;
    onImport: (file: File) => Promise<{ count: number; message: string; }>;
}

const ImportCard: React.FC<ImportCardProps> = ({ title, description, onDownloadTemplate, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setImportStatus(null);
        }
    };
    
    const handleImportClick = useCallback(async () => {
        if (!file) {
            setImportStatus({ message: 'Por favor, selecione um arquivo para importar.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setImportStatus(null);
        
        try {
            const result = await onImport(file);
            setImportStatus({ message: result.message, type: 'success' });
            setFile(null);
            setFileName('');
            if(fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            setImportStatus({ message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [file, onImport]);

    return (
        <div className="bg-[--color-muted] p-6 rounded-xl border border-[--color-border] flex flex-col">
            <h3 className="text-lg font-semibold text-[--color-card-foreground]">{title}</h3>
            <p className="text-sm text-[--color-card-muted-foreground] mt-1 flex-grow">{description}</p>
            <div className="mt-4 space-y-3">
                <button onClick={onDownloadTemplate} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                    Baixar Template XLS
                </button>
                <div className="text-center">
                     <label htmlFor={`file-upload-${title.replace(/ /g, '-')}`} className="cursor-pointer text-sm text-blue-600 hover:underline">
                        {fileName ? `Arquivo selecionado: ${fileName}` : 'Ou selecione um arquivo'}
                    </label>
                    <input id={`file-upload-${title.replace(/ /g, '-')}`} type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" ref={fileInputRef} />
                </div>
                <button
                    onClick={handleImportClick}
                    disabled={isLoading || !file}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400"
                >
                    {isLoading ? <><LoadingSpinner/> Processando...</> : 'Importar Dados'}
                </button>
                {importStatus && (
                    <div className={`p-3 rounded-md text-sm ${importStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {importStatus.message}
                    </div>
                )}
            </div>
        </div>
    );
};


export const StaffDataImportView: React.FC = () => {
    
    // --- Handlers for Survey Responses ---
    const downloadSurveyTemplate = () => {
        const headers = ['empresa', 'diretoria', 'setor', 'cargo', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33', 'q34', 'q35', 'q36', 'q37', 'q38', 'q39', 'q40', 'q41', 'q42', 'q43', 'q44', 'q45'];
        const exampleRow = ['TechCorp', 'Tecnologia', 'Engenharia', 'Desenvolvedor', 'Concordo totalmente', 'Concordo parcialmente', /* ... */];
        const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Respostas");
        XLSX.writeFile(wb, "template_respostas_diagnostico.xlsx");
    };
    
    const handleSurveyImport = (file: File) => new Promise<{ count: number; message: string; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                if (json.length === 0) throw new Error('O arquivo está vazio.');
                await importSurveyResponses(json);
                resolve({ count: json.length, message: `${json.length} respostas importadas com sucesso!` });
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        reader.readAsArrayBuffer(file);
    });

    // --- Handlers for Historical Indicators ---
    const downloadHistoricalTemplate = () => {
        const headers = ['Mês/Ano (ex: Jan/24)', 'IRP Global (0-100)', 'Turnover (%)', 'Afastamentos INSS'];
        const exampleData = [
            ['Jan/24', 72, 2.5, 5],
            ['Fev/24', 75, 2.1, 4],
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Indicadores");
        XLSX.writeFile(wb, "template_indicadores_historicos.xlsx");
    };

    const handleHistoricalImport = (file: File) => new Promise<{ count: number; message: string; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                if (json.length === 0) throw new Error('O arquivo está vazio.');
                await importHistoricalIndicators(json);
                resolve({ count: json.length, message: `${json.length} meses de indicadores importados!` });
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        reader.readAsArrayBuffer(file);
    });
    
    // --- Handlers for Leave Events ---
    const downloadLeaveEventsTemplate = () => {
        const headers = ['Tipo de Afastamento', 'Data (AAAA-MM-DD)'];
        const exampleData = [
            ['Burnout', '2024-05-10'],
            ['Ansiedade Generalizada', '2024-04-22'],
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Afastamentos");
        XLSX.writeFile(wb, "template_tipos_afastamento.xlsx");
    };

    const handleLeaveEventsImport = (file: File) => new Promise<{ count: number; message: string; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                if (json.length === 0) throw new Error('O arquivo está vazio.');
                await importLeaveEvents(json);
                resolve({ count: json.length, message: `${json.length} registros de afastamento importados!` });
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        reader.readAsArrayBuffer(file);
    });

    // --- Handlers for Leadership Data ---
    const downloadLeadershipTemplate = () => {
        const headers = ['% Líderes em Desenvolvimento (0-100)', 'Percepção da Liderança (1-5)', 'Segurança Psicológica (1-5)'];
        const exampleData = [ [75, 4.2, 3.8] ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Liderança");
        XLSX.writeFile(wb, "template_dados_lideranca.xlsx");
    };

    const handleLeadershipImport = (file: File) => new Promise<{ count: number; message: string; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                if (json.length === 0) throw new Error('O arquivo está vazio.');
                await importLeadershipData(json);
                resolve({ count: json.length, message: `Dados de liderança importados com sucesso!` });
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        reader.readAsArrayBuffer(file);
    });

    // --- Handlers for Financial Data ---
    const downloadFinancialTemplate = () => {
        const headers = ['Total de Colaboradores (para cálculo de adesão)', 'Custo Médio Anual por Colaborador (para ROI)', 'Economia Estimada Anual (valor manual)'];
        const exampleData = [ [80, 60000, 'R$ 150.000,00'] ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Financeiro");
        XLSX.writeFile(wb, "template_financeiro_demografico.xlsx");
    };

    const handleFinancialImport = (file: File) => new Promise<{ count: number; message: string; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                if (json.length === 0) throw new Error('O arquivo está vazio.');
                await importFinancialData(json);
                resolve({ count: json.length, message: `Dados financeiros e demográficos importados!` });
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        reader.readAsArrayBuffer(file);
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[--color-foreground]">Importação de Dados Analíticos</h1>
                <p className="text-[--color-muted-foreground] mt-1">Faça o upload dos dados para popular e validar todos os gráficos e KPIs dos dashboards.</p>
            </div>
            
            <div className="bg-[--color-card] p-6 md:p-8 rounded-2xl shadow-lg border border-[--color-border]">
                <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-500"/>
                    Hub de Importação
                </h2>
                <p className="text-sm text-[--color-card-muted-foreground] mt-2">
                    Cada importação substituirá os dados de simulação correspondentes, permitindo visualizar os dashboards com informações reais ou cenários de teste.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <ImportCard 
                        title="Respostas do Diagnóstico"
                        description="Importe as respostas dos questionários. Isso alimenta os cálculos de fatores de risco, rankings e a maioria dos KPIs."
                        onDownloadTemplate={downloadSurveyTemplate}
                        onImport={handleSurveyImport}
                    />
                    <ImportCard 
                        title="Indicadores Históricos"
                        description="Importe a série histórica de IRP Global, Turnover e Afastamentos INSS para popular os gráficos de tendência."
                        onDownloadTemplate={downloadHistoricalTemplate}
                        onImport={handleHistoricalImport}
                    />
                     <ImportCard 
                        title="Tipos de Afastamento"
                        description="Importe o histórico de tipos de afastamento para alimentar o gráfico de distribuição de motivos."
                        onDownloadTemplate={downloadLeaveEventsTemplate}
                        onImport={handleLeaveEventsImport}
                    />
                     <ImportCard 
                        title="Dados de Liderança e Engajamento"
                        description="Defina diretamente os KPIs de Liderança, Segurança Psicológica e % de líderes em desenvolvimento para o dashboard."
                        onDownloadTemplate={downloadLeadershipTemplate}
                        onImport={handleLeadershipImport}
                    />
                     <ImportCard 
                        title="Dados Financeiros e Demográficos"
                        description="Importe métricas de base como total de funcionários e custo médio, essenciais para cálculos de ROI e economia."
                        onDownloadTemplate={downloadFinancialTemplate}
                        onImport={handleFinancialImport}
                    />
                </div>
            </div>
        </div>
    );
};