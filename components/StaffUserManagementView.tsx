
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    getCompanies, addCompany, deleteCompany, getEmployees, addEmployee, deleteEmployee, Company, Employee, addCompanies, addEmployees, 
    Branch, getBranches, addBranch, deleteBranch, addBranches, CompanyUser, getCompanyUsers, addCompanyUser, deleteCompanyUser, addCompanyUsers 
} from '../services/dataService';
import { 
    PlusCircleIcon,
    XIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    UploadIcon,
    TrashIcon,
    IdentificationIcon,
} from './icons';
import { Modal } from './Modal';

declare var XLSX: any;

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

// --- MAIN COMPONENT ---

export const StaffUserManagementView: React.FC = () => {
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
    const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
    const [companyUserSearchTerm, setCompanyUserSearchTerm] = useState('');
    const [companyUserPage, setCompanyUserPage] = useState(1);
    const [companyUserTotalPages, setCompanyUserTotalPages] = useState(1);
    const [isCompanyUserLoading, setIsCompanyUserLoading] = useState(false);
    const [isAddCompanyUserModalOpen, setIsAddCompanyUserModalOpen] = useState(false);
    const [isImportCompanyUserXlsModalOpen, setIsImportCompanyUserXlsModalOpen] = useState(false);

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

    const fetchCompanyUsers = useCallback(async (page: number, searchTerm: string) => {
        setIsCompanyUserLoading(true);
        const { users, pages } = await getCompanyUsers({ page, limit: 5, searchTerm });
        setCompanyUsers(users);
        setCompanyUserTotalPages(pages);
        setIsCompanyUserLoading(false);
    }, []);

    useEffect(() => {
        fetchCompanies();
        fetchEmployees(employeePage, employeeSearchTerm);
        fetchCompanyUsers(companyUserPage, companyUserSearchTerm);
    }, [fetchCompanies, fetchEmployees, employeePage, employeeSearchTerm, fetchCompanyUsers, companyUserPage, companyUserSearchTerm]);
    
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
        alert('Arquivo CSV de colaboradores importado com sucesso! (Simulação)');
        setIsImportEmployeeCsvModalOpen(false);
        fetchEmployees(1, '');
    };
    
    const handleImportCompanyCsv = async () => {
        const mockNewCompanies = ['Empresa CSV 1', 'Empresa CSV 2'];
        const updatedCompanies = await addCompanies(mockNewCompanies);
        setCompanies(updatedCompanies);
        alert('Arquivo CSV de empresas importado com sucesso! (Simulação)');
        setIsImportCompanyCsvModalOpen(false);
    };

    const handleCompanyUserSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyUserPage(1);
        fetchCompanyUsers(1, companyUserSearchTerm);
    };

    const handleAddCompanyUser = async (userData: Omit<CompanyUser, 'id'>) => {
        await addCompanyUser(userData);
        fetchCompanyUsers(1, '');
        setIsAddCompanyUserModalOpen(false);
    };

    const handleDeleteCompanyUser = async (id: number) => {
        if (window.confirm("Tem certeza que deseja revogar o acesso deste usuário?")) {
            await deleteCompanyUser(id);
            fetchCompanyUsers(companyUserPage, companyUserSearchTerm);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestão de Usuários</h1>
                <p className="text-slate-600 mt-1">Gerencie empresas, filiais, usuários da empresa e colaboradores.</p>
            </div>
            <div className="space-y-8">
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

                <BranchManagement companies={companies} />

                <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><IdentificationIcon className="w-6 h-6"/>Gestão de Usuários (Empresa)</h2>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setIsAddCompanyUserModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><PlusCircleIcon className="w-5 h-5"/> Cadastro Individual</button>
                            <button onClick={() => setIsImportCompanyUserXlsModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg"><UploadIcon className="w-5 h-5"/> Importar XLS</button>
                        </div>
                    </div>
                    <form onSubmit={handleCompanyUserSearch} className="flex gap-2 mb-4">
                        <input type="search" value={companyUserSearchTerm} onChange={e => setCompanyUserSearchTerm(e.target.value)} placeholder="Buscar por nome ou email..." className="flex-grow p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]" />
                        <button type="submit" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700">Buscar</button>
                    </form>
                    
                    <div className="min-h-[16rem]">
                        {isCompanyUserLoading ? <div className="text-center py-8">Carregando usuários...</div> : (
                            <ul className="space-y-2">
                                {companyUsers.map(u => (
                                    <li key={u.id} className="grid grid-cols-4 gap-4 items-center p-2 bg-[--color-muted] rounded-md">
                                        <span className="text-sm font-medium text-[--color-card-foreground] col-span-1 truncate">{u.name}</span>
                                        <span className="text-sm text-[--color-card-muted-foreground] col-span-1 truncate">{u.email}</span>
                                        <span className="text-sm text-[--color-card-muted-foreground] col-span-1">{u.companyName}</span>
                                        <button onClick={() => handleDeleteCompanyUser(u.id)} className="text-red-500 hover:text-red-700 justify-self-end"><TrashIcon className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                        <button onClick={() => setCompanyUserPage(p => Math.max(1, p - 1))} disabled={companyUserPage === 1} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50">Anterior</button>
                        <span className="text-sm text-slate-500">Página {companyUserPage} de {companyUserTotalPages}</span>
                        <button onClick={() => setCompanyUserPage(p => Math.min(companyUserTotalPages, p + 1))} disabled={companyUserPage === companyUserTotalPages} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50">Próxima</button>
                    </div>
                </div>

                <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><UserGroupIcon className="w-6 h-6"/>Gestão de Colaboradores</h2>
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

                        <div className="flex justify-between items-center mt-4">
                        <button onClick={() => setEmployeePage(p => Math.max(1, p - 1))} disabled={employeePage === 1} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50">Anterior</button>
                        <span className="text-sm text-slate-500">Página {employeePage} de {employeeTotalPages}</span>
                        <button onClick={() => setEmployeePage(p => Math.min(employeeTotalPages, p + 1))} disabled={employeePage === employeeTotalPages} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50">Próxima</button>
                    </div>
                </div>
            </div>
            <AddCompanyModal isOpen={isAddCompanyModalOpen} onClose={() => setIsAddCompanyModalOpen(false)} onAdd={handleAddCompany} />
            <AddEmployeeModal isOpen={isAddEmployeeModalOpen} onClose={() => setIsAddEmployeeModalOpen(false)} onAdd={handleAddEmployee} companyList={companies.map(c => c.name)} />
            <ImportEmployeesCsvModal isOpen={isImportEmployeeCsvModalOpen} onClose={() => setIsImportEmployeeCsvModalOpen(false)} onImport={handleImportEmployeeCsv} />
            <ImportCompaniesCsvModal isOpen={isImportCompanyCsvModalOpen} onClose={() => setIsImportCompanyCsvModalOpen(false)} onImport={handleImportCompanyCsv} />
            <ImportCompaniesXlsModal isOpen={isImportCompanyXlsModalOpen} onClose={() => setIsImportCompanyXlsModalOpen(false)} onImportSuccess={fetchCompanies} />
            <ImportEmployeesXlsModal isOpen={isImportEmployeeXlsModalOpen} onClose={() => setIsImportEmployeeXlsModalOpen(false)} onImportSuccess={() => fetchEmployees(1, '')} />
            <AddCompanyUserModal isOpen={isAddCompanyUserModalOpen} onClose={() => setIsAddCompanyUserModalOpen(false)} onAdd={handleAddCompanyUser} companyList={companies} />
            <ImportCompanyUserXlsModal isOpen={isImportCompanyUserXlsModalOpen} onClose={() => setIsImportCompanyUserXlsModalOpen(false)} onImportSuccess={() => fetchCompanyUsers(1, '')} companyList={companies} />
        </div>
    );
};

// --- Modals and Sub-components for User Management ---

const AddCompanyModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Company, 'id'>) => void;}> = ({isOpen, onClose, onAdd}) => {
    const [formData, setFormData] = useState({ name: '', razaoSocial: '', cnpj: '', setor: 'Tecnologia', numColaboradores: 0, contatoPrincipalNome: '', contatoPrincipalEmail: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name: formData.name, razaoSocial: formData.razaoSocial, cnpj: formData.cnpj, setor: formData.setor, numColaboradores: Number(formData.numColaboradores), contatoPrincipal: { nome: formData.contatoPrincipalNome, email: formData.contatoPrincipalEmail }, address: { logradouro: formData.logradouro, numero: formData.numero, bairro: formData.bairro, cidade: formData.cidade, estado: formData.estado, cep: formData.cep, } });
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Empresa"> <form onSubmit={handleSubmit} className="space-y-4"> {/* Form content... */} </form> </Modal> );
};
const AddEmployeeModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Employee, 'id'>) => void; companyList: string[]}> = ({isOpen, onClose, onAdd, companyList}) => {
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>({ name: '', email: '', company: companyList[0] || '', cpf: '', dataNascimento: '', genero: 'Prefiro não informar', dataAdmissao: '', nivelCargo: 'Júnior', status: 'Ativo' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd(formData); };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Colaborador"> <form onSubmit={handleSubmit} className="space-y-4"> {/* Form content... */} </form> </Modal> );
};
const ImportEmployeesCsvModal: React.FC<{isOpen: boolean; onClose: () => void; onImport: () => void;}> = ({isOpen, onClose, onImport}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Colaboradores via CSV"> <div className="space-y-4"> {/* Modal content... */} </div> </Modal>
);
const ImportCompaniesCsvModal: React.FC<{isOpen: boolean; onClose: () => void; onImport: () => void;}> = ({isOpen, onClose, onImport}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Empresas via CSV"> <div className="space-y-4"> {/* Modal content... */} </div> </Modal>
);
const ImportCompaniesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void;}> = ({isOpen, onClose, onImportSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => { /* ... */ };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Empresas via XLS"> <div className="space-y-4"> {/* Modal content... */} </div> </Modal> );
};
const ImportEmployeesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void;}> = ({isOpen, onClose, onImportSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => { /* ... */ };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Colaboradores via XLS"> <div className="space-y-4"> {/* Modal content... */} </div> </Modal> );
};
const BranchManagement: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const fetchBranches = useCallback(async (companyId: number) => { /* ... */ }, []);
    useEffect(() => { /* ... */ }, [selectedCompanyId, fetchBranches]);
    const handleAddBranch = async (branchData: Omit<Branch, 'id' | 'companyId'>) => { /* ... */ };
    const handleDeleteBranch = async (id: number) => { /* ... */ };
    return ( <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]"> {/* Component content... */} </div> );
};
const AddBranchModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Branch, 'id' | 'companyId'>) => void;}> = ({isOpen, onClose, onAdd}) => {
    const [formData, setFormData] = useState({ name: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
    const handleSubmit = (e: React.FormEvent) => { /* ... */ };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Filial"> <form onSubmit={handleSubmit} className="space-y-4"> {/* Form content... */} </form> </Modal> );
};
const ImportBranchesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void; companyId: number | '';}> = ({isOpen, onClose, onImportSuccess, companyId}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => { /* ... */ };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Filiais via XLS"> <div className="space-y-4"> {/* Modal content... */} </div> </Modal> );
};
const AddCompanyUserModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<CompanyUser, 'id'>) => void; companyList: Company[]}> = ({isOpen, onClose, onAdd, companyList}) => {
    const [formData, setFormData] = useState({ name: '', email: '', companyId: companyList[0]?.id || 0, role: 'Leader', status: 'Ativo' });
    useEffect(() => { /* ... */ }, [companyList, formData.companyId]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { /* ... */ };
    const handleSubmit = (e: React.FormEvent) => { /* ... */ };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Usuário da Empresa"> <form onSubmit={handleSubmit} className="space-y-4"> {/* Form content... */} </form> </Modal> );
};
const ImportCompanyUserXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void; companyList: Company[]}> = ({isOpen, onClose, onImportSuccess, companyList}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const companyMap = useMemo(() => new Map(companyList.map(c => [c.name.toLowerCase(), c.id])), [companyList]);
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => { /* ... */ };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Usuários da Empresa via XLS"> <div className="space-y-4"> {/* Modal content... */} </div> </Modal> );
};
