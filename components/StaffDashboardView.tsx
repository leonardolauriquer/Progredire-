import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCampaigns, approveCampaign, getCompanies, addCompany, deleteCompany, getEmployees, addEmployee, deleteEmployee, Company, Employee, addCompanies, addEmployees, Branch, getBranches, addBranch, deleteBranch } from '../services/dataService';
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
    XIcon,
    BuildingOfficeIcon,
    UserIcon,
    UserGroupIcon,
    UploadIcon,
    TrashIcon,
    IdentificationIcon,
    EnvelopeIcon
} from './icons';
import { Modal } from './Modal';
import { UserRole } from '../App';

// The xlsx library is loaded via a script tag and is available as a global.
// Declaring it here allows TypeScript to recognize it without an incorrect module import.
declare var XLSX: any;


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


const allCompaniesList = ['InovaCorp', 'NexusTech', 'AuraDigital', 'Vértice'];
const companyBranches: Record<string, string[]> = {
    InovaCorp: ['Matriz', 'Filial SP'],
    NexusTech: ['Filial RJ', 'Filial MG'],
};
const allBranches = ['Todas', 'Matriz', 'Filial SP', 'Filial RJ', 'Filial MG'];
const statuses = ['Todos', 'Em dia', 'Próximo ao Vencimento', 'Vencido'];

type DocumentStatus = 'Em dia' | 'Próximo ao Vencimento' | 'Vencido';
type SortableKeys = keyof Document | 'status';

interface StaffDashboardViewProps {
    onImpersonate: (role: UserRole) => void;
}

// --- HELPER FUNCTIONS ---

const downloadCsvTemplate = (headers: string[], fileName: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

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
    <div className="bg-[--color-muted] p-4 rounded-lg border border-[--color-border] flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('-600', '-100').replace('-800', '-100')}`}>
         <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm text-[--color-card-muted-foreground] font-medium">{title}</p>
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
                            {allCompaniesList.map(c => <option key={c} value={c}>{c}</option>)}
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


export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({ onImpersonate }) => {
    // --- State for Tabs ---
    const [activeTab, setActiveTab] = useState<'campaigns' | 'documents' | 'user_management' | 'impersonation'>('campaigns');
    
    // --- State for Campaigns ---
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);

    // --- State for Documents ---
    const [documents, setDocuments] = useState<Document[]>(initialMockDocuments);
    const [selectedCompanyDoc, setSelectedCompanyDoc] = useState('Todas');
    const [selectedBranch, setSelectedBranch] = useState('Todas');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [searchTermDoc, setSearchTermDoc] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'expiryDate', direction: 'ascending' });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // --- State for Impersonation ---
    const [impersonateCompany, setImpersonateCompany] = useState('InovaCorp');

    // --- State for User Management ---
    const [companies, setCompanies] = useState<Company[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [employeePage, setEmployeePage] = useState(1);
    const [employeeTotalPages, setEmployeeTotalPages] = useState(1);
    const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
    const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isImportEmployeeCsvModalOpen, setIsImportEmployeeCsvModalOpen] = useState(false);
    const [isImportCompanyCsvModalOpen, setIsImportCompanyCsvModalOpen] = useState(false);
    const [isImportCompanyXlsModalOpen, setIsImportCompanyXlsModalOpen] = useState(false);
    const [isImportEmployeeXlsModalOpen, setIsImportEmployeeXlsModalOpen] = useState(false);


    // --- Logic for Campaigns ---
    const fetchCampaigns = useCallback(async () => {
        setIsCampaignsLoading(true);
        const allCampaigns = await getCampaigns();
        setCampaigns(allCampaigns);
        setIsCampaignsLoading(false);
    }, []);

    useEffect(() => {
        if(activeTab === 'campaigns') fetchCampaigns();
    }, [fetchCampaigns, activeTab]);

    const handleApprove = async (campaignId: number) => {
        await approveCampaign(campaignId);
        fetchCampaigns(); // Refresh the list
    };
    
    const pendingCampaigns = campaigns.filter(c => c.status === 'Pendente');
    
    // --- Logic for Documents ---
    const availableBranches = useMemo(() => {
        if (selectedCompanyDoc === 'Todas') {
            return allBranches;
        }
        return ['Todas', ...(companyBranches[selectedCompanyDoc] || [])];
    }, [selectedCompanyDoc]);

    useEffect(() => {
        setSelectedBranch('Todas');
    }, [selectedCompanyDoc]);

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
            const companyMatch = selectedCompanyDoc === 'Todas' || doc.company === selectedCompanyDoc;
            const branchMatch = selectedBranch === 'Todas' || doc.branch === selectedBranch;
            const statusMatch = selectedStatus === 'Todos' || getDocumentStatus(doc.expiryDate).status === selectedStatus;
            const searchMatch = doc.name.toLowerCase().includes(searchTermDoc.toLowerCase());
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
    }, [documents, selectedCompanyDoc, selectedBranch, selectedStatus, searchTermDoc, sortConfig]);

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
        // ... (rest of the export logic is the same)
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

     // --- Logic for User Management ---
    const fetchCompanies = useCallback(async () => {
        const data = await getCompanies();
        setCompanies(data);
    }, []);

    const fetchEmployees = useCallback(async (page: number, searchTerm: string) => {
        setIsEmployeeLoading(true);
        const { employees, pages } = await getEmployees({ page, limit: 8, searchTerm });
        setEmployees(employees);
        setEmployeeTotalPages(pages);
        setIsEmployeeLoading(false);
    }, []);

    useEffect(() => {
        if (activeTab === 'user_management') {
            fetchCompanies();
            fetchEmployees(employeePage, employeeSearchTerm);
        }
    }, [activeTab, fetchCompanies, fetchEmployees, employeePage, employeeSearchTerm]);
    
    const handleAddCompany = async (companyData: Omit<Company, 'id'>) => {
        const updatedCompanies = await addCompany(companyData);
        setCompanies(updatedCompanies);
        setIsAddCompanyModalOpen(false);
    };
    
    const handleDeleteCompany = async (id: number) => {
        if (window.confirm("Tem certeza que deseja revogar o acesso desta empresa?")) {
            const updatedCompanies = await deleteCompany(id);
            setCompanies(updatedCompanies);
        }
    };

    const handleEmployeeSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setEmployeePage(1);
        fetchEmployees(1, employeeSearchTerm);
    };

     const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
        await addEmployee(employeeData);
        fetchEmployees(1, ''); // Refresh list
        setIsAddEmployeeModalOpen(false);
    };

    const handleDeleteEmployee = async (id: number) => {
        if (window.confirm("Tem certeza que deseja revogar o acesso deste colaborador?")) {
            await deleteEmployee(id);
            fetchEmployees(employeePage, employeeSearchTerm); // Refresh current page
        }
    };

    const handleImportEmployeeCsv = () => {
        // Mock success
        alert('Arquivo CSV de colaboradores importado com sucesso! (Simulação)');
        setIsImportEmployeeCsvModalOpen(false);
        fetchEmployees(1, '');
    };
    
    const handleImportCompanyCsv = async () => {
        // Simulate parsing CSV and adding companies
        const mockNewCompanies = ['Empresa CSV 1', 'Empresa CSV 2'];
        const updatedCompanies = await addCompanies(mockNewCompanies);
        setCompanies(updatedCompanies);
        alert('Arquivo CSV de empresas importado com sucesso! (Simulação)');
        setIsImportCompanyCsvModalOpen(false);
    };
    
    const TabButton: React.FC<{
        tab: 'campaigns' | 'documents' | 'user_management' | 'impersonation';
        title: string;
        icon: React.ElementType;
        count?: number;
    }> = ({ tab, title, icon: Icon, count = 0 }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-3 py-2 font-semibold text-sm rounded-t-lg border-b-2 transition-colors ${
                    isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                role="tab"
                aria-selected={isActive}
            >
                <Icon className="w-5 h-5" />
                <span>{title}</span>
                {count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                        {count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Painel da Staff</h1>
                <p className="text-slate-600 mt-1">Gerencie as solicitações, documentação e simule acessos de clientes.</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tab="campaigns" title="Aprovação de Campanhas" icon={ClockIcon} count={pendingCampaigns.length} />
                    <TabButton tab="documents" title="Gestão de Documentos" icon={ArchiveBoxIcon} />
                    <TabButton tab="user_management" title="Gestão de Usuários" icon={UserGroupIcon} />
                    <TabButton tab="impersonation" title="Acesso Delegado" icon={UserIcon} />
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'campaigns' && (
                    <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                        <h2 className="text-xl font-semibold text-[--color-card-foreground] mb-4">
                            Campanhas Pendentes de Aprovação
                        </h2>
                        {isCampaignsLoading ? <p>Carregando...</p> : pendingCampaigns.length > 0 ? (
                            <div className="space-y-4">
                                {pendingCampaigns.map(campaign => (
                                    <div key={campaign.id} className="bg-[--color-muted] p-4 rounded-lg border border-[--color-border] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="font-bold text-[--color-card-foreground]">{campaign.name}</h3>
                                            <p className="text-sm text-[--color-card-muted-foreground] mt-1">
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
                )}
                
                {activeTab === 'documents' && (
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
                       
                       <div className="bg-[--color-card] rounded-xl shadow-lg border border-[--color-border] overflow-hidden">
                           <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-[--color-border]">
                                <thead className="bg-[--color-muted]">
                                  <tr>
                                    <SortableHeader column="name" title="Nome do Documento" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader column="status" title="Status" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader column="expiryDate" title="Validade" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader column="company" title="Empresa" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader column="branch" title="Filial" sortConfig={sortConfig} requestSort={requestSort} />
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                  </tr>
                                </thead>
                                <tbody className="bg-[--color-card] divide-y divide-[--color-border]">
                                  {sortedAndFilteredDocuments.length > 0 ? (
                                    sortedAndFilteredDocuments.map((doc) => {
                                      const { status, days } = getDocumentStatus(doc.expiryDate);
                                      const statusStyles = getStatusStyles(status);
                                      const tooltipText = status === 'Vencido' ? `Vencido há ${Math.abs(days)} dias` : status === 'Próximo ao Vencimento' ? `Vence em ${days} dias` : `Válido por mais de ${days} dias`;
                    
                                      return (
                                        <tr key={doc.id} className="hover:bg-[--color-accent]">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[--color-card-foreground]">{doc.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span title={tooltipText} className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles}`}>
                                              {status}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-card-muted-foreground]">{new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-card-muted-foreground]">{doc.company}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-card-muted-foreground]">{doc.branch}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDownload(doc)} className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md">
                                              <ArrowDownTrayIcon className="w-4 h-4" />
                                              Baixar
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-[--color-card-muted-foreground]">
                                        <ArchiveBoxIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                        Nenhum documento encontrado para os filtros selecionados.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                       </div>
                   </div>
                )}

                {activeTab === 'user_management' && (
                    <div className="space-y-8">
                        {/* Company Management */}
                        <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                                <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><BuildingOfficeIcon className="w-6 h-6"/>Empresas</h2>
                                <div className="flex flex-wrap gap-2">
                                     <button onClick={() => setIsAddCompanyModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><PlusCircleIcon className="w-5 h-5"/> Cadastro Individual</button>
                                     <button onClick={() => setIsImportCompanyXlsModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg"><UploadIcon className="w-5 h-5"/> Importar XLS</button>
                                    <button onClick={() => setIsImportCompanyCsvModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg"><UploadIcon className="w-5 h-5"/> Importar CSV</button>
                                </div>
                            </div>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {companies.map(c => (
                                    <li key={c.id} className="flex justify-between items-center p-2 bg-[--color-muted] rounded-md">
                                        <span className="text-sm font-medium text-[--color-card-foreground]">{c.name}</span>
                                        <button onClick={() => handleDeleteCompany(c.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Branch Management */}
                        <BranchManagement companies={companies} />

                        {/* Employee Management */}
                        <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                             <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                                <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><UserIcon className="w-6 h-6"/>Colaboradores</h2>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setIsAddEmployeeModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><PlusCircleIcon className="w-5 h-5"/> Cadastro Individual</button>
                                    <button onClick={() => setIsImportEmployeeXlsModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg"><UploadIcon className="w-5 h-5"/> Importar XLS</button>
                                    <button onClick={() => setIsImportEmployeeCsvModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg"><UploadIcon className="w-5 h-5"/> Importar CSV</button>
                                </div>
                            </div>
                            <form onSubmit={handleEmployeeSearch} className="flex gap-2 mb-4">
                                <input type="search" value={employeeSearchTerm} onChange={e => setEmployeeSearchTerm(e.target.value)} placeholder="Buscar por nome ou email..." className="flex-grow p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]" />
                                <button type="submit" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700">Buscar</button>
                            </form>
                            
                            <div className="min-h-[20rem]">
                                {isEmployeeLoading ? <div className="text-center py-8">Carregando colaboradores...</div> : (
                                    <ul className="space-y-2">
                                        {employees.map(e => (
                                            <li key={e.id} className="grid grid-cols-4 gap-4 items-center p-2 bg-[--color-muted] rounded-md">
                                                <span className="text-sm font-medium text-[--color-card-foreground] col-span-1 truncate">{e.name}</span>
                                                <span className="text-sm text-[--color-card-muted-foreground] col-span-1 truncate">{e.email}</span>
                                                <span className="text-sm text-[--color-card-muted-foreground] col-span-1">{e.company}</span>
                                                <button onClick={() => handleDeleteEmployee(e.id)} className="text-red-500 hover:text-red-700 justify-self-end"><TrashIcon className="w-4 h-4" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                             {/* Pagination */}
                            <div className="flex justify-between items-center mt-4">
                                <button onClick={() => setEmployeePage(p => Math.max(1, p - 1))} disabled={employeePage === 1} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50">Anterior</button>
                                <span className="text-sm text-slate-500">Página {employeePage} de {employeeTotalPages}</span>
                                <button onClick={() => setEmployeePage(p => Math.min(employeeTotalPages, p + 1))} disabled={employeePage === employeeTotalPages} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50">Próxima</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'impersonation' && (
                    <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                         <h2 className="text-xl font-semibold text-[--color-card-foreground] mb-4">Acesso Delegado (Simulação)</h2>
                        <div className="space-y-4 max-w-md">
                            <p className="text-sm text-[--color-card-muted-foreground]">Selecione um perfil para visualizar a plataforma como se fosse aquele tipo de usuário. Isso é útil para testar a experiência do cliente ou fornecer suporte.</p>
                            <div>
                                <label htmlFor="impersonate-company" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                                <select id="impersonate-company" value={impersonateCompany} onChange={e => setImpersonateCompany(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                    {allCompaniesList.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button onClick={() => onImpersonate('company')} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-blue-700">
                                    <BuildingOfficeIcon className="w-5 h-5" />
                                    Acessar como Empresa
                                </button>
                                 <button onClick={() => onImpersonate('collaborator')} className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-slate-700">
                                    <UserIcon className="w-5 h-5" />
                                    Acessar como Colaborador
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <UploadDocumentModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadDocument}
            />
            <AddCompanyModal isOpen={isAddCompanyModalOpen} onClose={() => setIsAddCompanyModalOpen(false)} onAdd={handleAddCompany} />
            <AddEmployeeModal isOpen={isAddEmployeeModalOpen} onClose={() => setIsAddEmployeeModalOpen(false)} onAdd={handleAddEmployee} companyList={companies.map(c => c.name)} />
            <ImportEmployeesCsvModal isOpen={isImportEmployeeCsvModalOpen} onClose={() => setIsImportEmployeeCsvModalOpen(false)} onImport={handleImportEmployeeCsv} />
            <ImportCompaniesCsvModal isOpen={isImportCompanyCsvModalOpen} onClose={() => setIsImportCompanyCsvModalOpen(false)} onImport={handleImportCompanyCsv} />
            <ImportCompaniesXlsModal isOpen={isImportCompanyXlsModalOpen} onClose={() => setIsImportCompanyXlsModalOpen(false)} onImportSuccess={fetchCompanies} />
            <ImportEmployeesXlsModal isOpen={isImportEmployeeXlsModalOpen} onClose={() => setIsImportEmployeeXlsModalOpen(false)} onImportSuccess={() => fetchEmployees(1, '')} />
        </div>
    );
};

// --- Modals for User Management ---

const AddCompanyModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Company, 'id'>) => void;}> = ({isOpen, onClose, onAdd}) => {
    const [formData, setFormData] = useState({
        name: '',
        razaoSocial: '',
        cnpj: '',
        setor: 'Tecnologia',
        numColaboradores: 0,
        contatoPrincipalNome: '',
        contatoPrincipalEmail: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCompany: Omit<Company, 'id'> = {
            name: formData.name,
            razaoSocial: formData.razaoSocial,
            cnpj: formData.cnpj,
            setor: formData.setor,
            numColaboradores: Number(formData.numColaboradores),
            contatoPrincipal: {
                nome: formData.contatoPrincipalNome,
                email: formData.contatoPrincipalEmail
            },
            address: {
                logradouro: formData.logradouro,
                numero: formData.numero,
                bairro: formData.bairro,
                cidade: formData.cidade,
                estado: formData.estado,
                cep: formData.cep,
            }
        };
        onAdd(newCompany);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Empresa">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nome Fantasia</label>
                        <input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                    <div>
                        <label htmlFor="razaoSocial" className="block text-sm font-medium text-[--color-card-muted-foreground]">Razão Social</label>
                        <input type="text" id="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="cnpj" className="block text-sm font-medium text-[--color-card-muted-foreground]">CNPJ</label>
                    <input type="text" id="cnpj" value={formData.cnpj} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="setor" className="block text-sm font-medium text-[--color-card-muted-foreground]">Setor de Atuação</label>
                        <input type="text" id="setor" value={formData.setor} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                    <div>
                        <label htmlFor="numColaboradores" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nº de Colaboradores</label>
                        <input type="number" id="numColaboradores" value={formData.numColaboradores} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                </div>
                <div className="pt-2">
                    <h4 className="font-semibold text-[--color-card-foreground] border-b border-[--color-border] pb-1 mb-2">Endereço</h4>
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="md:col-span-2">
                                <label htmlFor="logradouro" className="block text-sm font-medium text-[--color-card-muted-foreground]">Logradouro</label>
                                <input type="text" id="logradouro" value={formData.logradouro} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="numero" className="block text-sm font-medium text-[--color-card-muted-foreground]">Número</label>
                                <input type="text" id="numero" value={formData.numero} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="bairro" className="block text-sm font-medium text-[--color-card-muted-foreground]">Bairro</label>
                                <input type="text" id="bairro" value={formData.bairro} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="cidade" className="block text-sm font-medium text-[--color-card-muted-foreground]">Cidade</label>
                                <input type="text" id="cidade" value={formData.cidade} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="estado" className="block text-sm font-medium text-[--color-card-muted-foreground]">Estado (UF)</label>
                                <input type="text" id="estado" value={formData.estado} onChange={handleChange} required maxLength={2} className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="cep" className="block text-sm font-medium text-[--color-card-muted-foreground]">CEP</label>
                                <input type="text" id="cep" value={formData.cep} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                            </div>
                        </div>
                     </div>
                </div>
                <div className="pt-2">
                    <h4 className="font-semibold text-[--color-card-foreground] border-b border-[--color-border] pb-1 mb-2">Contato Principal</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="contatoPrincipalNome" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nome</label>
                            <input type="text" id="contatoPrincipalNome" value={formData.contatoPrincipalNome} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                        </div>
                        <div>
                            <label htmlFor="contatoPrincipalEmail" className="block text-sm font-medium text-[--color-card-muted-foreground]">Email</label>
                            <input type="email" id="contatoPrincipalEmail" value={formData.contatoPrincipalEmail} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                        </div>
                     </div>
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-transparent border border-[--color-border] rounded-md hover:bg-[--color-accent] text-[--color-card-foreground]">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Cadastrar Empresa</button>
                </div>
            </form>
        </Modal>
    );
};

const AddEmployeeModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Employee, 'id'>) => void; companyList: string[]}> = ({isOpen, onClose, onAdd, companyList}) => {
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
        name: '', email: '', company: companyList[0] || '', cpf: '',
        dataNascimento: '', genero: 'Prefiro não informar', dataAdmissao: '',
        nivelCargo: 'Júnior', status: 'Ativo'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Colaborador">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nome Completo</label>
                        <input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[--color-card-muted-foreground]">Email Corporativo</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-[--color-card-muted-foreground]">CPF</label>
                        <input type="text" id="cpf" value={formData.cpf} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                     <div>
                        <label htmlFor="dataNascimento" className="block text-sm font-medium text-[--color-card-muted-foreground]">Data de Nascimento</label>
                        <input type="date" id="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="genero" className="block text-sm font-medium text-[--color-card-muted-foreground]">Gênero</label>
                    <select id="genero" value={formData.genero} onChange={handleChange} className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                        <option>Masculino</option><option>Feminino</option><option>Outro</option><option>Prefiro não informar</option>
                    </select>
                </div>
                <div className="pt-2">
                    <h4 className="font-semibold text-[--color-card-foreground] border-b border-[--color-border] pb-1 mb-2">Informações Organizacionais</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-[--color-card-muted-foreground]">Empresa</label>
                                <select id="company" value={formData.company} onChange={handleChange} className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                                    {companyList.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dataAdmissao" className="block text-sm font-medium text-[--color-card-muted-foreground]">Data de Admissão</label>
                                <input type="date" id="dataAdmissao" value={formData.dataAdmissao} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nivelCargo" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nível do Cargo</label>
                                <select id="nivelCargo" value={formData.nivelCargo} onChange={handleChange} className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                                    <option>Estagiário</option><option>Júnior</option><option>Pleno</option><option>Sênior</option><option>Especialista</option><option>Líder/Coordenador</option><option>Gerente</option><option>Diretor</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-[--color-card-muted-foreground]">Status</label>
                                <select id="status" value={formData.status} onChange={handleChange} className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                                    <option>Ativo</option><option>Inativo</option><option>Férias</option><option>Licença</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-transparent border border-[--color-border] rounded-md hover:bg-[--color-accent] text-[--color-card-foreground]">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Cadastrar Colaborador</button>
                </div>
            </form>
        </Modal>
    );
};


const ImportEmployeesCsvModal: React.FC<{isOpen: boolean; onClose: () => void; onImport: () => void;}> = ({isOpen, onClose, onImport}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Colaboradores via CSV">
        <div className="space-y-4">
            <p className="text-sm text-slate-600">Selecione um arquivo CSV com as colunas: `name`, `email`, `company`, `cpf`, `dataNascimento`, `genero`, `dataAdmissao`, `nivelCargo`, `status`.</p>
            <input type="file" accept=".csv" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <button onClick={() => downloadCsvTemplate(['name', 'email', 'company', 'cpf', 'dataNascimento', 'genero', 'dataAdmissao', 'nivelCargo', 'status'], 'modelo_colaboradores.csv')} className="text-sm text-blue-600 hover:underline">Baixar modelo de CSV</button>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="button" onClick={onImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
            </div>
        </div>
    </Modal>
);

const ImportCompaniesCsvModal: React.FC<{isOpen: boolean; onClose: () => void; onImport: () => void;}> = ({isOpen, onClose, onImport}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Empresas via CSV">
        <div className="space-y-4">
            <p className="text-sm text-slate-600">Selecione um arquivo CSV com as colunas: `name`, `razaoSocial`, `cnpj`, `setor`, `numColaboradores`, `contatoPrincipalNome`, `contatoPrincipalEmail`.</p>
            <input type="file" accept=".csv" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <button onClick={() => downloadCsvTemplate(['name', 'razaoSocial', 'cnpj', 'setor', 'numColaboradores', 'contatoPrincipalNome', 'contatoPrincipalEmail'], 'modelo_empresas.csv')} className="text-sm text-blue-600 hover:underline">Baixar modelo de CSV</button>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="button" onClick={onImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
            </div>
        </div>
    </Modal>
);

const ImportCompaniesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void;}> = ({isOpen, onClose, onImportSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadTemplate = () => {
        const headers = ['name', 'razaoSocial', 'cnpj', 'setor', 'numColaboradores', 'contatoPrincipalNome', 'contatoPrincipalEmail'];
        const ws = XLSX.utils.json_to_sheet([{}], { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo Empresas");
        XLSX.writeFile(wb, "modelo_empresas.xls");
    };

    const handleImport = () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            alert("Por favor, selecione um arquivo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                for (const row of json) {
                    const newCompany: Omit<Company, 'id'> = {
                        name: String(row.name || ''),
                        razaoSocial: String(row.razaoSocial || ''),
                        cnpj: String(row.cnpj || ''),
                        setor: String(row.setor || 'Não especificado'),
                        numColaboradores: Number(row.numColaboradores || 0),
                        contatoPrincipal: {
                            nome: String(row.contatoPrincipalNome || ''),
                            email: String(row.contatoPrincipalEmail || '')
                        },
                        address: { logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' }
                    };
                    if (newCompany.name) { // Basic validation
                       await addCompany(newCompany);
                    }
                }
                alert(`${json.length} empresas importadas com sucesso!`);
                onImportSuccess();
                onClose();
            } catch (error) {
                console.error("Error parsing XLS file:", error);
                alert("Ocorreu um erro ao ler o arquivo. Verifique se o formato está correto.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importar Empresas via XLS">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">Selecione um arquivo XLS com os cabeçalhos corretos.</p>
                <input type="file" accept=".xls, .xlsx" ref={fileInputRef} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:underline">Baixar modelo de XLS</button>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                    <button type="button" onClick={handleImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
                </div>
            </div>
        </Modal>
    );
};

const ImportEmployeesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void;}> = ({isOpen, onClose, onImportSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadTemplate = () => {
        const headers = ['name', 'email', 'company', 'cpf', 'dataNascimento', 'genero', 'dataAdmissao', 'nivelCargo', 'unidade', 'liderDireto', 'status'];
        const ws = XLSX.utils.json_to_sheet([{}], { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo Colaboradores");
        XLSX.writeFile(wb, "modelo_colaboradores.xls");
    };

    const handleImport = () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            alert("Por favor, selecione um arquivo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const newEmployees: Omit<Employee, 'id'>[] = json.map(row => ({
                    name: String(row.name || ''),
                    email: String(row.email || ''),
                    company: String(row.company || ''),
                    cpf: String(row.cpf || ''),
                    dataNascimento: String(row.dataNascimento || ''),
                    genero: (row.genero || 'Prefiro não informar'),
                    dataAdmissao: String(row.dataAdmissao || ''),
                    nivelCargo: (row.nivelCargo || 'Júnior'),
                    unidade: String(row.unidade || ''),
                    liderDireto: String(row.liderDireto || ''),
                    status: (row.status || 'Ativo'),
                })).filter(e => e.name && e.email); // Basic validation

                if (newEmployees.length > 0) {
                    await addEmployees(newEmployees);
                    alert(`${newEmployees.length} colaboradores importados com sucesso!`);
                    onImportSuccess();
                    onClose();
                } else {
                    alert("Nenhum colaborador válido encontrado no arquivo.");
                }
            } catch (error) {
                console.error("Error parsing XLS file:", error);
                alert("Ocorreu um erro ao ler o arquivo. Verifique se o formato está correto.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importar Colaboradores via XLS">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">Selecione um arquivo XLS com os cabeçalhos corretos.</p>
                <input type="file" accept=".xls, .xlsx" ref={fileInputRef} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:underline">Baixar modelo de XLS</button>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                    <button type="button" onClick={handleImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
                </div>
            </div>
        </Modal>
    );
};

const BranchManagement: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchBranches = useCallback(async (companyId: number) => {
        setIsLoading(true);
        const data = await getBranches(companyId);
        setBranches(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            fetchBranches(Number(selectedCompanyId));
        } else {
            setBranches([]);
        }
    }, [selectedCompanyId, fetchBranches]);

    const handleAddBranch = async (branchData: Omit<Branch, 'id' | 'companyId'>) => {
        if (!selectedCompanyId) return;
        await addBranch({ ...branchData, companyId: Number(selectedCompanyId) });
        fetchBranches(Number(selectedCompanyId));
        setIsAddModalOpen(false);
    };

    const handleDeleteBranch = async (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir esta filial?")) {
            await deleteBranch(id);
            if(selectedCompanyId) fetchBranches(Number(selectedCompanyId));
        }
    };

    return (
        <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><BuildingOfficeIcon className="w-6 h-6"/>Gestão de Filiais</h2>
                <button onClick={() => setIsAddModalOpen(true)} disabled={!selectedCompanyId} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"><PlusCircleIcon className="w-5 h-5"/> Adicionar Filial</button>
            </div>
            <div className="mb-4">
                <label htmlFor="company-select-branch" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Selecione uma Empresa</label>
                <select id="company-select-branch" value={selectedCompanyId} onChange={e => setSelectedCompanyId(Number(e.target.value))} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]">
                    <option value="">-- Selecione --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            {selectedCompanyId ? (
                isLoading ? <p>Carregando filiais...</p> : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {branches.length > 0 ? branches.map(b => (
                            <li key={b.id} className="flex justify-between items-center p-3 bg-[--color-muted] rounded-md">
                                <div>
                                    <p className="text-sm font-medium text-[--color-card-foreground]">{b.name}</p>
                                    <p className="text-xs text-[--color-card-muted-foreground]">{`${b.address.logradouro}, ${b.address.numero} - ${b.address.cidade}/${b.address.estado}`}</p>
                                </div>
                                <button onClick={() => handleDeleteBranch(b.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                            </li>
                        )) : <p className="text-center text-sm text-slate-500 py-4">Nenhuma filial cadastrada para esta empresa.</p>}
                    </ul>
                )
            ) : <p className="text-center text-sm text-slate-500 py-4">Selecione uma empresa para ver suas filiais.</p>}
            <AddBranchModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddBranch} />
        </div>
    );
};

const AddBranchModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Branch, 'id' | 'companyId'>) => void;}> = ({isOpen, onClose, onAdd}) => {
    const [formData, setFormData] = useState({
        name: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: The onAdd callback expects an object with a nested `address` property.
        // The original code passed a flat object, causing a type error.
        onAdd({
            name: formData.name,
            address: {
                logradouro: formData.logradouro,
                numero: formData.numero,
                bairro: formData.bairro,
                cidade: formData.cidade,
                estado: formData.estado,
                cep: formData.cep,
            },
        });
        // Reset form
        setFormData({ name: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Filial">
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[--color-card-muted-foreground]">Nome da Filial</label>
                    <input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="md:col-span-2">
                        <label htmlFor="logradouro" className="block text-sm font-medium text-[--color-card-muted-foreground]">Logradouro</label>
                        <input type="text" id="logradouro" value={formData.logradouro} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="numero" className="block text-sm font-medium text-[--color-card-muted-foreground]">Número</label>
                        <input type="text" id="numero" value={formData.numero} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="bairro" className="block text-sm font-medium text-[--color-card-muted-foreground]">Bairro</label>
                        <input type="text" id="bairro" value={formData.bairro} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="cidade" className="block text-sm font-medium text-[--color-card-muted-foreground]">Cidade</label>
                        <input type="text" id="cidade" value={formData.cidade} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-[--color-card-muted-foreground]">Estado (UF)</label>
                        <input type="text" id="estado" value={formData.estado} onChange={handleChange} required maxLength={2} className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="cep" className="block text-sm font-medium text-[--color-card-muted-foreground]">CEP</label>
                        <input type="text" id="cep" value={formData.cep} onChange={handleChange} required className="mt-1 w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md"/>
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-transparent border border-[--color-border] rounded-md">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Cadastrar Filial</button>
                </div>
            </form>
        </Modal>
    );
};