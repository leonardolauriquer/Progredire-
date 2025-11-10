import React, { useState, useMemo } from 'react';
import { ArchiveBoxIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ShieldCheckIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from './icons';

interface Document {
  id: number;
  name: string;
  category: 'Segurança do Trabalho';
  branch: 'Matriz' | 'Filial SP' | 'Filial RJ' | 'Filial MG';
  uploadDate: string;
  expiryDate: string;
  fileUrl: string; // Mock URL
}

const mockDocuments: Document[] = [
  // Matriz
  { id: 1, name: 'PGR - Programa de Gerenciamento de Riscos', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 2, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 3, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 4, name: 'AET - Análise Ergonômica do Trabalho', category: 'Segurança do Trabalho', branch: 'Matriz', uploadDate: '2024-01-10', expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },

  // Filial SP
  { id: 5, name: 'PGR - Programa de Gerenciamento de Riscos', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 6, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 7, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 8, name: 'AET - Análise Ergonômica do Trabalho', category: 'Segurança do Trabalho', branch: 'Filial SP', uploadDate: '2024-02-15', expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },

  // Filial RJ
  { id: 9, name: 'PGR - Programa de Gerenciamento de Riscos', category: 'Segurança do Trabalho', branch: 'Filial RJ', uploadDate: '2024-03-20', expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 10, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', category: 'Segurança do Trabalho', branch: 'Filial RJ', uploadDate: '2024-03-20', expiryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 11, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', category: 'Segurança do Trabalho', branch: 'Filial RJ', uploadDate: '2024-03-20', expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 12, name: 'AET - Análise Ergonômica do Trabalho', category: 'Segurança do Trabalho', branch: 'Filial RJ', uploadDate: '2024-03-20', expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },

  // Filial MG
  { id: 13, name: 'PGR - Programa de Gerenciamento de Riscos', category: 'Segurança do Trabalho', branch: 'Filial MG', uploadDate: '2024-04-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 14, name: 'PCMSO - Prog. de Controle Médico de Saúde Ocupacional', category: 'Segurança do Trabalho', branch: 'Filial MG', uploadDate: '2024-04-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 15, name: 'LTCAT - Laudo Técnico das Condições do Ambiente de Trabalho', category: 'Segurança do Trabalho', branch: 'Filial MG', uploadDate: '2024-04-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
  { id: 16, name: 'AET - Análise Ergonômica do Trabalho', category: 'Segurança do Trabalho', branch: 'Filial MG', uploadDate: '2024-04-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], fileUrl: '#' },
];


const branches = ['Todas', 'Matriz', 'Filial SP', 'Filial RJ', 'Filial MG'];
const categories = ['Todas', 'Segurança do Trabalho'];
const statuses = ['Todos', 'Em dia', 'Próximo ao Vencimento', 'Vencido'];

type DocumentStatus = 'Em dia' | 'Próximo ao Vencimento' | 'Vencido';
type SortableKeys = keyof Document | 'status';

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

export const DocumentationView: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'expiryDate', direction: 'ascending' });

  const summary = useMemo(() => {
    const total = mockDocuments.length;
    let inGoodStanding = 0;
    let expiringSoon = 0;
    let expired = 0;

    mockDocuments.forEach(doc => {
      const { status } = getDocumentStatus(doc.expiryDate);
      if (status === 'Em dia') {
        inGoodStanding++;
      } else if (status === 'Próximo ao Vencimento') {
        expiringSoon++;
      } else if (status === 'Vencido') {
        expired++;
      }
    });

    return { total, inGoodStanding, expiringSoon, expired };
  }, []);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredDocuments = useMemo(() => {
    let sortableItems = [...mockDocuments].filter(doc => {
      const branchMatch = selectedBranch === 'Todas' || doc.branch === selectedBranch;
      const categoryMatch = selectedCategory === 'Todas' || doc.category === selectedCategory;
      const statusMatch = selectedStatus === 'Todos' || getDocumentStatus(doc.expiryDate).status === selectedStatus;
      const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return branchMatch && categoryMatch && statusMatch && searchMatch;
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
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [selectedBranch, selectedCategory, selectedStatus, searchTerm, sortConfig]);

  const handleExportCSV = () => {
    if (sortedAndFilteredDocuments.length === 0) {
      alert("Nenhum documento para exportar.");
      return;
    }

    const headers = ['Nome do Documento', 'Status', 'Validade', 'Categoria', 'Filial'];
    const rows = sortedAndFilteredDocuments.map(doc => [
      `"${doc.name.replace(/"/g, '""')}"`,
      getDocumentStatus(doc.expiryDate).status,
      new Date(doc.expiryDate).toLocaleDateString('pt-BR'),
      doc.category,
      doc.branch
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'documentos_progredire.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Documentação</h1>
            <p className="text-slate-600 mt-1">
            Acesse e gerencie todos os documentos importantes da sua organização.
            </p>
        </div>
        <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar (CSV)
        </button>
      </div>

      {/* Painel de Acompanhamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total de Documentos" value={summary.total} icon={ArchiveBoxIcon} />
        <KpiCard title="Em Dia" value={summary.inGoodStanding} icon={ShieldCheckIcon} colorClass="text-green-600" />
        <KpiCard title="Próximo ao Vencimento" value={summary.expiringSoon} icon={ExclamationTriangleIcon} colorClass="text-yellow-600" />
        <KpiCard title="Vencidos" value={summary.expired} icon={ExclamationCircleIcon} colorClass="text-red-600" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="branch-filter" className="block text-sm font-medium text-slate-700 mb-1">
              Filial
            </label>
            <select
              id="branch-filter"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 mb-1">
              Categoria
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
           <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label htmlFor="search-filter" className="block text-sm font-medium text-slate-700 mb-1">
              Buscar por Nome
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Ex: PGR, PCMSO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
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
                <SortableHeader column="category" title="Categoria" sortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader column="branch" title="Filial" sortConfig={sortConfig} requestSort={requestSort} />
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedAndFilteredDocuments.length > 0 ? (
                sortedAndFilteredDocuments.map((doc) => {
                  const { status, days } = getDocumentStatus(doc.expiryDate);
                  const statusStyles = getStatusStyles(status);
                  const tooltipText = status === 'Vencido' ? `Vencido há ${Math.abs(days)} dias` : status === 'Próximo ao Vencimento' ? `Vence em ${days} dias` : `Válido por mais de ${days} dias`;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{doc.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span title={tooltipText} className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{doc.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{doc.branch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={doc.fileUrl} download className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Baixar
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
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
  );
};