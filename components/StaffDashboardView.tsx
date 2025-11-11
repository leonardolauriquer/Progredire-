import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getCampaigns, approveCampaign } from '../services/dataService';
import { Campaign } from './dashboardMockData';
import { 
    ShieldCheckIcon, 
    ClockIcon, 
    ArchiveBoxIcon, 
    MagnifyingGlassIcon, 
    ArrowDownTrayIcon, 
    ExclamationTriangleIcon, 
    ExclamationCircleIcon,
    PlusCircleIcon,
    XIcon
} from './icons';
import { Modal } from './Modal';


// --- TYPES AND MOCK DATA FOR DOCUMENTATION (INTEGRATED) ---

interface Document {
  id: number;
  name: string;
  company: 'InovaCorp' | 'NexusTech';
  category: 'Segurança do Trabalho';
  branch: 'Matriz' | 'Filial SP' | 'Filial RJ' | 'Filial MG';
  uploadDate: string;
  expiryDate: string;
}

const initialMockDocuments: Document[] = [
  // InovaCorp
  { id: 1, name: 'PGR - Programa de Gerenciamento de Riscos', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 2, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 3, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 4, name: 'AET - Análise Ergonômica do Trabalho', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 5, name: 'PGR - Programa de Gerenciamento de Riscos', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 6, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 7, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 8, name: 'AET - Análise Ergonômica do Trabalho', company: 'InovaCorp', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },

  // NexusTech
  { id: 9, name: 'PGR - Programa de Gerenciamento de Riscos', company: 'NexusTech', category: 'Segurança do Trabalho', branch: 'Filial RJ', uploadDate: '2024-03-20', expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 10, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', company: 'NexusTech', category: 'Segurança do Trabalho', branch: 'Filial RJ', uploadDate: '2024-03-20', expiryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 11, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', company: 'NexusTech', category: 'Segurança do Trabalho', branch: 'Filial MG', uploadDate: '2024-04-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 12, name: 'AET - Análise Ergonômica do Trabalho', company: 'NexusTech', category: 'Segurança do Trabalho', branch: 'Filial MG', uploadDate: '2024-04-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];


const companies = ['Todas', 'InovaCorp', 'NexusTech'];
const companyBranches: Record<string, string[]> = {
    InovaCorp: ['Matriz', 'Filial SP'],
    NexusTech: ['Filial RJ', 'Filial MG'],
};
const allBranches = ['Todas', 'Matriz', 'Filial SP', 'Filial RJ', 'Filial MG'];
const statuses = ['Todos', 'Em dia', 'Próximo ao Vencimento', 'Vencido'];

type DocumentStatus = 'Em dia' | 'Próximo ao Vencimento' | 'Vencido';
type SortableKeys = keyof Document | 'status';

// --- HELPER FUNCTIONS ---

const getDocumentStatus = (expiryDate: string): { status: DocumentStatus; days: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { status: 'Vencido', days: diffDays };
    }
    if (diffDays <= 30) {
        return { status: 'Próximo ao Vencimento', days: diffDays };
    }
    return { status: 'Em dia', days: diffDays };
};

const getStatusStyles = (status: DocumentStatus): string => {
    switch (status) {
        case 'Em dia': return 'bg-green-100 text-green-800';
        case 'Próximo ao Vencimento': return 'bg-yellow-100 text-yellow-800';
        case 'Vencido': return 'bg-red-100 text-red-800';
    }
};

const exportToExcel = (htmlContent: string, filename: string) => {
    const template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Relatorio</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
            <style>
                table { border-collapse: collapse; margin-bottom: 20px; }
                td, th { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h2 { font-size: 1.2rem; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
                h3 { font-size: 1.1rem; font-weight: bold; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>`;
    const blob = new Blob([`\uFEFF${template}`], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- HELPER COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: number; icon: React.ElementType; colorClass?: string }> = ({ title, value, icon: Icon, colorClass = "text-slate-600" }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('-600', '-100').replace('-800', '-100')}`}>
         <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      </div>
    </div>
);

const SortableHeader: React.FC<{
  column: SortableKeys;
  title: string;
  sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
  requestSort: (key: SortableKeys) => void;
}> = ({ column, title, sortConfig, requestSort }) => {
  const isSorted = sortConfig?.key === column;
  const directionIcon = sortConfig?.direction === 'ascending' ? '▲' : '▼';

  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
      <button onClick={() => requestSort(column)} className="flex items-center gap-1 hover:text-slate-700">
        {title}
        {isSorted && <span className="text-slate-700">{directionIcon}</span>}
      </button>
    </th>
  );
};

const documentNames = [
    'PGR - Programa de Gerenciamento de Riscos',
    'PCMSO - Prog. de Controle Médico de Saúde Ocupacional',
    'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho',
    'AET - Análise Ergonômica do Trabalho'
];

const UploadDocumentModal: React.FC<{ isOpen: boolean; onClose: () => void; onUpload: (doc: Omit<Document, 'id' | 'uploadDate' | 'category'>) => void; }> = ({ isOpen, onClose, onUpload }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState<string>('InovaCorp');
    const [branch, setBranch] = useState<string>('Matriz');
    const [emissionDate, setEmissionDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [fileName, setFileName] = useState('');
    
    const availableBranches = useMemo(() => companyBranches[company] || [], [company]);
    
    useEffect(() => {
        // Reset branch when company changes
        if (availableBranches.length > 0) {
            setBranch(availableBranches[0]);
        } else {
            setBranch('');
        }
    }, [company, availableBranches]);

    useEffect(() => {
        if (emissionDate) {
            const date = new Date(emissionDate);
            // Handle timezone offset by working with UTC dates
            date.setUTCFullYear(date.getUTCFullYear() + 1);
            setExpiryDate(date.toISOString().split('T')[0]);
        } else {
            setExpiryDate('');
        }
    }, [emissionDate]);

    const resetAndClose = () => {
        setName('');
        setCompany('InovaCorp');
        setBranch('Matriz');
        setEmissionDate('');
        setExpiryDate('');
        setFileName('');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && company && branch && emissionDate && fileName) {
            onUpload({ 
                name, 
                company: company as 'InovaCorp' | 'NexusTech', 
                branch: branch as 'Matriz' | 'Filial SP' | 'Filial RJ' | 'Filial MG', 
                expiryDate 
            });
            resetAndClose();
        } else {
            alert('Por favor, preencha todos os campos e selecione um arquivo.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="Enviar Novo Documento">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="doc-name" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nome do Documento</label>
                    <select id="doc-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                        <option value="" disabled>Selecione um documento...</option>
                        {documentNames.map(docName => <option key={docName} value={docName}>{docName}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="doc-company" className="block text-sm font-medium text-[--color-card-muted-foreground]">Empresa</label>
                        <select id="doc-company" value={company} onChange={e => setCompany(e.target.value)} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                            {companies.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="doc-branch" className="block text-sm font-medium text-[--color-card-muted-foreground]">Filial</label>
                        <select id="doc-branch" value={branch} onChange={e => setBranch(e.target.value)} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                            {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="doc-emission" className="block text-sm font-medium text-[--color-card-muted-foreground]">Data de Emissão</label>
                        <input type="date" id="doc-emission" value={emissionDate} onChange={e => setEmissionDate(e.target.value)} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                    <div>
                        <label htmlFor="doc-expiry" className="block text-sm font-medium text-[--color-card-muted-foreground]">Data de Vencimento (Automático)</label>
                        <input type="date" id="doc-expiry" value={expiryDate} readOnly className="mt-1 w-full p-2 bg-[--color-muted] border border-[--color-border] text-[--color-muted-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring] cursor-not-allowed"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="doc-file" className="block text-sm font-medium text-[--color-card-muted-foreground]">Arquivo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[--color-border] border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-[--color-muted-foreground]">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-[--color-card] rounded-md font-medium text-[--color-primary-600] hover:text-[--color-primary-500] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[--color-ring]">
                                    <span>Selecione o arquivo</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                            </div>
                            {fileName ? <p className="text-xs text-[--color-muted-foreground]">{fileName}</p> : <p className="text-xs text-[--color-muted-foreground]">PDF, DOCX, XLSX até 10MB</p>}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={resetAndClose} className="px-4 py-2 text-sm bg-transparent border border-[--color-border] rounded-md hover:bg-[--color-accent] text-[--color-card-foreground]">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-[--color-primary-600] text-white rounded-md hover:bg-[--color-primary-700]">Enviar Documento</button>
                </div>
            </form>
        </Modal>
    );
};


export const StaffDashboardView: React.FC = () => {
    // --- State for Campaigns ---
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);

    // --- State for Documents ---
    const [documents, setDocuments] = useState<Document[]>(initialMockDocuments);
    const [selectedCompany, setSelectedCompany] = useState('Todas');
    const [selectedBranch, setSelectedBranch] = useState('Todas');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'expiryDate', direction: 'ascending' });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // --- Logic for Campaigns ---
    const fetchCampaigns = useCallback(async () => {
        setIsCampaignsLoading(true);
        const allCampaigns = await getCampaigns();
        setCampaigns(allCampaigns);
        setIsCampaignsLoading(false);
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleApprove = async (campaignId: number) => {
        await approveCampaign(campaignId);
        fetchCampaigns(); // Refresh the list
    };
    
    const pendingCampaigns = campaigns.filter(c => c.status === 'Pendente');
    
    // --- Logic for Documents ---
    const availableBranches = useMemo(() => {
        if (selectedCompany === 'Todas') {
            return allBranches;
        }
        return ['Todas', ...(companyBranches[selectedCompany] || [])];
    }, [selectedCompany]);

    useEffect(() => {
        setSelectedBranch('Todas');
    }, [selectedCompany]);

    const summary = useMemo(() => {
        const total = documents.length;
        let inGoodStanding = 0, expiringSoon = 0, expired = 0;
        documents.forEach(doc => {
            const { status } = getDocumentStatus(doc.expiryDate);
            if (status === 'Em dia') inGoodStanding++;
            else if (status === 'Próximo ao Vencimento') expiringSoon++;
            else expired++;
        });
        return { total, inGoodStanding, expiringSoon, expired };
    }, [documents]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredDocuments = useMemo(() => {
        let sortableItems = [...documents].filter(doc => {
            const companyMatch = selectedCompany === 'Todas' || doc.company === selectedCompany;
            const branchMatch = selectedBranch === 'Todas' || doc.branch === selectedBranch;
            const statusMatch = selectedStatus === 'Todos' || getDocumentStatus(doc.expiryDate).status === selectedStatus;
            const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
            return companyMatch && branchMatch && statusMatch && searchMatch;
        });

        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.key === 'status') {
                aValue = getDocumentStatus(a.expiryDate).days;
                bValue = getDocumentStatus(b.expiryDate).days;
            } else {
                aValue = a[sortConfig.key as keyof Document];
                bValue = b[sortConfig.key as keyof Document];
            }
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          });
        }
        return sortableItems;
    }, [documents, selectedCompany, selectedBranch, selectedStatus, searchTerm, sortConfig]);

    const handleDownload = (doc: Document) => {
        const fileContent = `Arquivo de exemplo para:\n\n${doc.name}\nFilial: ${doc.branch}`;
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.name.replace(/ /g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportXls = () => {
        if (sortedAndFilteredDocuments.length === 0) {
          alert("Nenhum documento para exportar com os filtros atuais.");
          return;
        }
    
        const headers = ['Nome do Documento', 'Status', 'Validade', 'Empresa', 'Filial'];
        
        let html = '<h2>Relatório de Documentos da Staff</h2>';
    
        const activeFilters: Record<string, string> = {};
        if (selectedCompany !== 'Todas') activeFilters['Empresa'] = selectedCompany;
        if (selectedBranch !== 'Todas') activeFilters['Filial'] = selectedBranch;
        if (selectedStatus !== 'Todos') activeFilters['Status'] = selectedStatus;
        if (searchTerm) activeFilters['Busca'] = searchTerm;
    
        if (Object.keys(activeFilters).length > 0) {
            html += '<h3>Filtros Aplicados</h3><table><tbody>';
            for (const key in activeFilters) {
                html += `<tr><td><strong>${key}</strong></td><td>${activeFilters[key]}</td></tr>`;
            }
            html += '</tbody></table>';
        }
    
        html += '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
    
        sortedAndFilteredDocuments.forEach(doc => {
          html += '<tr>';
          html += `<td>${doc.name}</td>`;
          html += `<td>${getDocumentStatus(doc.expiryDate).status}</td>`;
          html += `<td>${new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</td>`;
          html += `<td>${doc.company}</td>`;
          html += `<td>${doc.branch}</td>`;
          html += '</tr>';
        });
    
        html += '</tbody></table>';
    
        exportToExcel(html, 'relatorio_staff_documentos');
    };

    const handleUploadDocument = (newDocData: Omit<Document, 'id'|'uploadDate'|'category'>) => {
        const newDoc: Document = {
            id: Date.now(),
            uploadDate: new Date().toISOString().split('T')[0],
            category: 'Segurança do Trabalho',
            ...newDocData,
        };
        setDocuments(prev => [...prev, newDoc]);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Painel da Staff</h1>
                <p className="text-slate-600 mt-1">Gerencie as solicitações e a documentação de todas as unidades.</p>
            </div>

            {/* Section: Campaign Approval */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-orange-500"/>
                    Campanhas Pendentes de Aprovação
                </h2>
                {isCampaignsLoading ? <p>Carregando...</p> : pendingCampaigns.length > 0 ? (
                    <div className="space-y-4">
                        {pendingCampaigns.map(campaign => (
                            <div key={campaign.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">{campaign.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Público: {campaign.targetAudience} | Período: {new Date(campaign.startDate).toLocaleDateString()} a {new Date(campaign.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleApprove(campaign.id)}
                                    className="flex-shrink-0 w-full sm:w-auto bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-700 text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShieldCheckIcon className="w-5 h-5"/>
                                    Aprovar
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <ShieldCheckIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
                        <p>Nenhuma campanha pendente no momento.</p>
                    </div>
                )}
            </div>

            {/* Section: Document Management */}
            <div className="space-y-6">
                 <div className="flex flex-wrap justify-between items-start gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Documentos</h2>
                    <div className="flex gap-2">
                         <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                            <PlusCircleIcon className="w-5 h-5"/> Enviar Documento
                        </button>
                        <button onClick={handleExportXls} className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50">
                            <ArrowDownTrayIcon className="w-5 h-5" /> Exportar (XLS)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Total de Documentos" value={summary.total} icon={ArchiveBoxIcon} />
                    <KpiCard title="Em Dia" value={summary.inGoodStanding} icon={ShieldCheckIcon} colorClass="text-green-600" />
                    <KpiCard title="Próximo ao Vencimento" value={summary.expiringSoon} icon={ExclamationTriangleIcon} colorClass="text-yellow-600" />
                    <KpiCard title="Vencidos" value={summary.expired} icon={ExclamationCircleIcon} colorClass="text-red-600" />
                </div>

                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <label htmlFor="search-filter" className="block text-sm font-medium text-slate-700 mb-1">Buscar por Nome</label>
                            <input id="search-filter" type="text" placeholder="Ex: PGR, PCMSO..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"/>
                            <MagnifyingGlassIcon className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <label htmlFor="company-filter" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                            <select id="company-filter" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="branch-filter" className="block text-sm font-medium text-slate-700 mb-1">Filial</label>
                            <select id="branch-filter" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select id="status-filter" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                        <tr>
                            <SortableHeader column="name" title="Nome do Documento" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader column="status" title="Status" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader column="expiryDate" title="Validade" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader column="company" title="Empresa" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader column="branch" title="Filial" sortConfig={sortConfig} requestSort={requestSort} />
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                        {sortedAndFilteredDocuments.map(doc => {
                            const { status, days } = getDocumentStatus(doc.expiryDate);
                            return (
                                <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{doc.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyles(status)}`}>{status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{doc.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{doc.branch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDownload(doc)} className="flex items-center gap-2 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md">
                                            <ArrowDownTrayIcon className="w-4 h-4"/> Baixar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            <UploadDocumentModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadDocument}
            />
        </div>
    );
};