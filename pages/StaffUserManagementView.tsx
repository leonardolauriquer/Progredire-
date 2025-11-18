import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    getCompanies, addCompany, deleteCompany, getEmployees, addEmployee, deleteEmployee, Company, Employee,
    Branch, getBranches, addBranch, deleteBranch, CompanyUser, getCompanyUsers, addCompanyUser, deleteCompanyUser,
    addCompanies, addBranches, addCompanyUsers, addEmployees, 
} from '../services/dataService';
import { 
    PlusCircleIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    TrashIcon,
    IdentificationIcon,
    UploadIcon,
    ArrowDownTrayIcon,
} from '../components/icons';
import { Modal } from '../components/Modal';

declare var XLSX: any;

// --- Sub-components (moved before main component to fix hoisting issue) ---

const ImportCard: React.FC<{title: string; onImportClick: () => void}> = ({title, onImportClick}) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
        <UploadIcon className="w-8 h-8 text-slate-500 mb-2" />
        <h3 className="font-semibold text-slate-700">{title}</h3>
        <button onClick={onImportClick} className="mt-2 text-sm text-blue-600 hover:underline">Importar XLS</button>
    </div>
);

const AddCompanyModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Company, 'id'>) => void;}> = ({isOpen, onClose, onAdd}) => {
    const [formData, setFormData] = useState({ name: '', razaoSocial: '', cnpj: '', setor: 'Tecnologia', numColaboradores: 0, contatoPrincipalNome: '', contatoPrincipalEmail: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name: formData.name, razaoSocial: formData.razaoSocial, cnpj: formData.cnpj, setor: formData.setor, numColaboradores: Number(formData.numColaboradores), contatoPrincipal: { nome: formData.contatoPrincipalNome, email: formData.contatoPrincipalEmail }, address: { logradouro: formData.logradouro, numero: formData.numero, bairro: formData.bairro, cidade: formData.cidade, estado: formData.estado, cep: formData.cep, } });
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Empresa"> 
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-md font-semibold text-slate-600">Dados da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia</label><input id="name" type="text" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="razaoSocial" className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label><input id="razaoSocial" type="text" value={formData.razaoSocial} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="cnpj" className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label><input id="cnpj" type="text" value={formData.cnpj} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="numColaboradores" className="block text-sm font-medium text-slate-700 mb-1">Nº Colaboradores</label><input id="numColaboradores" type="number" value={formData.numColaboradores} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
            </div>
            <h3 className="text-md font-semibold text-slate-600 pt-2">Contato Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label htmlFor="contatoPrincipalNome" className="block text-sm font-medium text-slate-700 mb-1">Nome</label><input id="contatoPrincipalNome" type="text" value={formData.contatoPrincipalNome} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                 <div><label htmlFor="contatoPrincipalEmail" className="block text-sm font-medium text-slate-700 mb-1">Email</label><input id="contatoPrincipalEmail" type="email" value={formData.contatoPrincipalEmail} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Salvar Empresa</button>
            </div>
        </form> 
    </Modal> );
};
const AddEmployeeModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Employee, 'id'|'password'>) => void; companyList: string[]}> = ({isOpen, onClose, onAdd, companyList}) => {
    const [formData, setFormData] = useState<Omit<Employee, 'id' | 'password'>>({ name: '', email: '', company: companyList[0] || '', cpf: '', dataNascimento: '', genero: 'Prefiro não informar', dataAdmissao: '', nivelCargo: 'Júnior', status: 'Ativo' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd(formData); };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Colaborador"> 
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label><input id="name" type="text" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label><input id="email" type="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1">CPF</label><input id="cpf" type="text" value={formData.cpf} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label><select id="company" value={formData.company} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md"><option value="" disabled>Selecione</option>{companyList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <p className="text-xs text-slate-500 mt-2 p-2 bg-slate-100 rounded-md">Nota: A senha inicial será os 3 últimos dígitos do CPF.</p>
             <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Salvar Colaborador</button>
            </div>
        </form> 
    </Modal> );
};

const AddBranchModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<Branch, 'id' | 'companyId'>) => void;}> = ({isOpen, onClose, onAdd}) => {
    const [formData, setFormData] = useState({ name: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFormData(prev => ({ ...prev, [e.target.id]: e.target.value })) };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd({name: formData.name, address: { logradouro: formData.logradouro, numero: formData.numero, bairro: formData.bairro, cidade: formData.cidade, estado: formData.estado, cep: formData.cep, }}) };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Filial"> 
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome da Filial</label><input id="name" type="text" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
            <h3 className="text-md font-semibold text-slate-600 pt-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="logradouro" className="block text-sm font-medium text-slate-700 mb-1">Logradouro</label><input id="logradouro" type="text" value={formData.logradouro} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="numero" className="block text-sm font-medium text-slate-700 mb-1">Número</label><input id="numero" type="text" value={formData.numero} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="cidade" className="block text-sm font-medium text-slate-700 mb-1">Cidade</label><input id="cidade" type="text" value={formData.cidade} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">Estado</label><input id="estado" type="text" value={formData.estado} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
            </div>
             <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Salvar Filial</button>
            </div>
        </form> 
    </Modal> );
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
        if (selectedCompanyId) {
            await addBranch({ ...branchData, companyId: Number(selectedCompanyId) });
            fetchBranches(Number(selectedCompanyId));
            setIsAddModalOpen(false);
        }
    };

    const handleDeleteBranch = async (id: number) => {
        if(window.confirm("Tem certeza que deseja excluir esta filial?")) {
            await deleteBranch(id);
            if (selectedCompanyId) fetchBranches(Number(selectedCompanyId));
        }
    };
    return ( 
        <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><BuildingOfficeIcon className="w-6 h-6"/>Filiais</h2>
                <div className="flex flex-wrap gap-2 items-center">
                    <select value={selectedCompanyId} onChange={e => setSelectedCompanyId(Number(e.target.value))} className="p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione uma empresa</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={() => setIsAddModalOpen(true)} disabled={!selectedCompanyId} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusCircleIcon className="w-5 h-5"/> Nova Filial
                    </button>
                </div>
            </div>
            <div className="min-h-[6rem]">
                {isLoading ? <div className="text-center">Carregando...</div> : branches.length > 0 ? (
                     <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {branches.map(b => (
                            <li key={b.id} className="flex justify-between items-center p-2 bg-[--color-muted] rounded-md">
                                <span className="text-sm font-medium text-[--color-card-foreground]">{b.name}</span>
                                <button onClick={() => handleDeleteBranch(b.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-slate-500 pt-4">{selectedCompanyId ? 'Nenhuma filial cadastrada para esta empresa.' : 'Selecione uma empresa para ver as filiais.'}</p>
                )}
            </div>
            <AddBranchModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddBranch} />
        </div> 
    );
};

const AddCompanyUserModal: React.FC<{isOpen: boolean; onClose: () => void; onAdd: (data: Omit<CompanyUser, 'id'|'password'>) => void; companyList: Company[]}> = ({isOpen, onClose, onAdd, companyList}) => {
    const [formData, setFormData] = useState({ name: '', email: '', companyId: companyList[0]?.id || 0, companyName: companyList[0]?.name || '', role: 'Leader', status: 'Ativo' });
    
    useEffect(() => {
        if (companyList.length > 0 && !formData.companyId) {
            setFormData(prev => ({...prev, companyId: companyList[0].id, companyName: companyList[0].name}));
        }
    }, [companyList, formData.companyId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
        const { id, value } = e.target;
        if (id === 'companyId') {
            const company = companyList.find(c => c.id === Number(value));
            setFormData(prev => ({ ...prev, companyId: Number(value), companyName: company?.name || '' }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            role: formData.role as CompanyUser['role'],
            status: formData.status as CompanyUser['status'],
        });
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Usuário da Empresa"> 
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label><input id="name" type="text" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label><input id="email" type="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-white border border-slate-300 rounded-md" /></div>
                <div><label htmlFor="companyId" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label><select id="companyId" value={formData.companyId} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md">{companyList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Papel</label><select id="role" value={formData.role} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md"><option>Admin</option><option>RH</option><option>Leader</option></select></div>
            </div>
            <div>
                <label htmlFor="default-password" className="block text-sm font-medium text-slate-600 mb-1">Senha Padrão</label>
                <input id="default-password" type="text" value="Mudar@123" readOnly className="w-full p-2 bg-slate-100 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed"/>
                <p className="text-xs text-slate-500 mt-1">O usuário deverá alterar esta senha no primeiro login.</p>
            </div>
             <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Salvar Usuário</button>
            </div>
        </form> 
    </Modal> );
};

const ImportCompaniesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void;}> = ({isOpen, onClose, onImportSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const downloadTemplate = () => {
        const headers = ['Nome Fantasia'];
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Empresas");
        XLSX.writeFile(wb, "template_empresas.xlsx");
    };
    const handleImport = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return alert("Selecione um arquivo.");
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: { 'Nome Fantasia': string }[] = XLSX.utils.sheet_to_json(worksheet);
            const companyNames = json.map(row => row['Nome Fantasia']).filter(Boolean);
            if (companyNames.length > 0) {
                await addCompanies(companyNames);
                onImportSuccess();
                onClose();
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Empresas via XLS"> 
        <div className="space-y-4">
            <p className="text-sm text-slate-500">Faça o download do template, preencha com os nomes das empresas e importe o arquivo.</p>
            <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><ArrowDownTrayIcon className="w-5 h-5"/> Baixar Template</button>
            <div><label htmlFor="company-import-file" className="block text-sm font-medium text-slate-700 mb-1">Arquivo XLS</label><input id="company-import-file" type="file" ref={fileInputRef} accept=".xlsx, .xls" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
                <button type="button" onClick={handleImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
            </div>
        </div> 
    </Modal> );
};

const ImportBranchesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void; companies: Company[];}> = ({isOpen, onClose, onImportSuccess, companies}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>(companies[0]?.id || '');
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file || !selectedCompanyId) return alert("Selecione uma empresa e um arquivo.");
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: Omit<Branch, 'id' | 'companyId'>[] = XLSX.utils.sheet_to_json(worksheet);
            if (json.length > 0) {
                await addBranches(Number(selectedCompanyId), json);
                onImportSuccess();
                onClose();
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Filiais via XLS"> <div className="space-y-4"> 
        <p className="text-sm text-slate-500">Selecione a empresa, baixe o template, preencha com os dados das filiais e importe.</p>
        <div><label htmlFor="branch-import-company" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label><select id="branch-import-company" value={selectedCompanyId} onChange={e => setSelectedCompanyId(Number(e.target.value))} className="w-full p-2 bg-white border border-slate-300 rounded-md"><option value="">Selecione</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><ArrowDownTrayIcon className="w-5 h-5"/> Baixar Template</button>
        <div><label htmlFor="branch-import-file" className="block text-sm font-medium text-slate-700 mb-1">Arquivo XLS</label><input id="branch-import-file" type="file" ref={fileInputRef} accept=".xlsx, .xls" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>
        <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
            <button type="button" onClick={handleImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
        </div>
    </div> </Modal> );
};

const ImportCompanyUserXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void; companyList: Company[]}> = ({isOpen, onClose, onImportSuccess, companyList}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const companyMap = useMemo(() => new Map(companyList.map(c => [c.name.toLowerCase(), c.id])), [companyList]);
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return alert("Selecione um arquivo.");
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const usersToImport: Omit<CompanyUser, 'id' | 'password'>[] = json.map(row => {
                const companyId = companyMap.get(row['Empresa']?.toLowerCase());
                if (!companyId) return null;
                return { name: row['Nome'], email: row['Email'], companyId, companyName: row['Empresa'], role: row['Papel (Admin, RH, Leader)'], status: 'Ativo' };
            }).filter((u): u is Omit<CompanyUser, 'id' | 'password'> => u !== null);

            if (usersToImport.length > 0) {
                await addCompanyUsers(usersToImport);
                onImportSuccess();
                onClose();
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Usuários da Empresa via XLS"> <div className="space-y-4">
        <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-md border border-blue-200">
            A senha inicial para cada usuário será **'Mudar@123'**. Não é necessário incluir uma coluna de senha no arquivo.
        </p>
        <p className="text-sm text-slate-500">Baixe o template, preencha os dados e importe. A coluna 'Empresa' deve corresponder exatamente a um nome de empresa já cadastrado.</p>
        <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><ArrowDownTrayIcon className="w-5 h-5"/> Baixar Template</button>
        <div><label htmlFor="c-user-import-file" className="block text-sm font-medium text-slate-700 mb-1">Arquivo XLS</label><input id="c-user-import-file" type="file" ref={fileInputRef} accept=".xlsx, .xls" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>
        <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
            <button type="button" onClick={handleImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
        </div>
    </div> </Modal> );
};

const ImportEmployeesXlsModal: React.FC<{isOpen: boolean; onClose: () => void; onImportSuccess: () => void;}> = ({isOpen, onClose, onImportSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const downloadTemplate = () => { /* ... */ };
    const handleImport = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return alert("Selecione um arquivo.");
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: Omit<Employee, 'id'|'password'>[] = XLSX.utils.sheet_to_json(worksheet);
            if (json.length > 0) {
                await addEmployees(json);
                onImportSuccess();
                onClose();
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return ( <Modal isOpen={isOpen} onClose={onClose} title="Importar Colaboradores via XLS"> <div className="space-y-4">
        <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-md border border-blue-200">
            A senha inicial para cada colaborador será gerada automaticamente com os **3 últimos dígitos do CPF**. Não é necessário incluir uma coluna de senha no arquivo.
        </p>
         <p className="text-sm text-slate-500">Baixe o template, preencha todos os dados dos colaboradores e importe.</p>
        <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><ArrowDownTrayIcon className="w-5 h-5"/> Baixar Template</button>
        <div><label htmlFor="employee-import-file" className="block text-sm font-medium text-slate-700 mb-1">Arquivo XLS</label><input id="employee-import-file" type="file" ref={fileInputRef} accept=".xlsx, .xls" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>
        <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md">Cancelar</button>
            <button type="button" onClick={handleImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Importar</button>
        </div>
    </div> </Modal> );
};


// --- MAIN COMPONENT ---

export const StaffUserManagementView: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [employeePage, setEmployeePage] = useState(1);
    const [employeeTotalPages, setEmployeeTotalPages] = useState(1);
    const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
    const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
    const [companyUserSearchTerm, setCompanyUserSearchTerm] = useState('');
    const [companyUserPage, setCompanyUserPage] = useState(1);
    const [companyUserTotalPages, setCompanyUserTotalPages] = useState(1);
    const [isCompanyUserLoading, setIsCompanyUserLoading] = useState(false);
    
    const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isAddCompanyUserModalOpen, setIsAddCompanyUserModalOpen] = useState(false);
    const [isImportCompanyXlsModalOpen, setIsImportCompanyXlsModalOpen] = useState(false);
    const [isImportBranchXlsModalOpen, setIsImportBranchXlsModalOpen] = useState(false);
    const [isImportCompanyUserXlsModalOpen, setIsImportCompanyUserXlsModalOpen] = useState(false);
    const [isImportEmployeeXlsModalOpen, setIsImportEmployeeXlsModalOpen] = useState(false);

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

     const handleAddEmployee = async (employeeData: Omit<Employee, 'id'|'password'>) => {
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

    const handleCompanyUserSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyUserPage(1);
        fetchCompanyUsers(1, companyUserSearchTerm);
    };

    const handleAddCompanyUser = async (userData: Omit<CompanyUser, 'id'|'password'>) => {
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
                <h1 className="text-3xl font-bold text-slate-900">Gestão de Usuários e Cadastros</h1>
                <p className="text-slate-600 mt-1">Gerencie empresas, filiais, usuários da empresa e colaboradores através de cadastros individuais ou importação em massa.</p>
            </div>

            {/* Import Cards Section */}
             <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                <h2 className="text-xl font-semibold text-[--color-card-foreground] mb-4">Importação em Massa (XLS)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ImportCard title="Importar Empresas" onImportClick={() => setIsImportCompanyXlsModalOpen(true)} />
                    <ImportCard title="Importar Filiais" onImportClick={() => setIsImportBranchXlsModalOpen(true)} />
                    <ImportCard title="Importar Usuários" onImportClick={() => setIsImportCompanyUserXlsModalOpen(true)} />
                    <ImportCard title="Importar Colaboradores" onImportClick={() => setIsImportEmployeeXlsModalOpen(true)} />
                </div>
            </div>


            <div className="space-y-8">
                {/* Company Management */}
                <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                     <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><BuildingOfficeIcon className="w-6 h-6"/>Empresas</h2>
                        <button onClick={() => setIsAddCompanyModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><PlusCircleIcon className="w-5 h-5"/> Cadastro Individual</button>
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

                {/* Company User Management */}
                <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                     <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><IdentificationIcon className="w-6 h-6"/>Gestão de Usuários (Empresa)</h2>
                        <button onClick={() => setIsAddCompanyUserModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><PlusCircleIcon className="w-5 h-5"/> Cadastro Individual</button>
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

                {/* Employee Management */}
                <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-[--color-card-foreground] flex items-center gap-2"><UserGroupIcon className="w-6 h-6"/>Gestão de Colaboradores</h2>
                        <button onClick={() => setIsAddEmployeeModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg"><PlusCircleIcon className="w-5 h-5"/> Cadastro Individual</button>
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
            
            {/* Modals for individual add */}
            <AddCompanyModal isOpen={isAddCompanyModalOpen} onClose={() => setIsAddCompanyModalOpen(false)} onAdd={handleAddCompany} />
            <AddEmployeeModal isOpen={isAddEmployeeModalOpen} onClose={() => setIsAddEmployeeModalOpen(false)} onAdd={handleAddEmployee} companyList={companies.map(c => c.name)} />
            <AddCompanyUserModal isOpen={isAddCompanyUserModalOpen} onClose={() => setIsAddCompanyUserModalOpen(false)} onAdd={handleAddCompanyUser} companyList={companies} />

            {/* Modals for XLS import */}
            <ImportCompaniesXlsModal isOpen={isImportCompanyXlsModalOpen} onClose={() => setIsImportCompanyXlsModalOpen(false)} onImportSuccess={fetchCompanies} />
            <ImportBranchesXlsModal isOpen={isImportBranchXlsModalOpen} onClose={() => setIsImportBranchXlsModalOpen(false)} onImportSuccess={() => {}} companies={companies} />
            <ImportCompanyUserXlsModal isOpen={isImportCompanyUserXlsModalOpen} onClose={() => setIsImportCompanyUserXlsModalOpen(false)} onImportSuccess={() => fetchCompanyUsers(1, '')} companyList={companies} />
            <ImportEmployeesXlsModal isOpen={isImportEmployeeXlsModalOpen} onClose={() => setIsImportEmployeeXlsModalOpen(false)} onImportSuccess={() => fetchEmployees(1, '')} />

        </div>
    );
};