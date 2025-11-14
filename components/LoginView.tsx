import React, { useState } from 'react';
// FIX: The original code imported a non-existent 'ArrowLeftIcon'. It has been replaced with 'ChevronLeftIcon' to match the icon used and fix the import error.
import { LogoIcon, BuildingOfficeIcon, UserIcon, ExclamationCircleIcon, ChevronLeftIcon } from './icons';
import { UserRole } from '../App';
import { authService, AuthData } from '../services/authService';
import { LoadingSpinner } from './LoadingSpinner';

interface LoginViewProps {
  onLogin: (authData: AuthData) => void;
}

type ActiveForm = 'chooser' | 'collaborator' | 'company' | 'staff';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [activeForm, setActiveForm] = useState<ActiveForm>('chooser');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [cpf, setCpf] = useState('123.456.789-00');
  const [collaboratorPassword, setCollaboratorPassword] = useState('900');
  const [companyEmail, setCompanyEmail] = useState('ana.costa@inovacorp.com');
  const [companyPassword, setCompanyPassword] = useState('Mudar@123');
  const [staffEmail, setStaffEmail] = useState('leonardo.progredire@gmail.com');
  const [staffPassword, setStaffPassword] = useState('123');

  const handleLoginAttempt = async (credentials: Parameters<typeof authService.login>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      const authData = await authService.login(credentials);
      onLogin(authData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToChooser = () => {
      setActiveForm('chooser');
      setError(null);
      // Keep form fields pre-filled for convenience
      setCpf('123.456.789-00');
      setCollaboratorPassword('900');
      setCompanyEmail('ana.costa@inovacorp.com');
      setCompanyPassword('Mudar@123');
      setStaffEmail('leonardo.progredire@gmail.com');
      setStaffPassword('123');
  };

  const renderForm = () => {
    switch (activeForm) {
      case 'collaborator':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleLoginAttempt({ role: 'collaborator', cpf, password: collaboratorPassword }); }} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Acesso do Colaborador</h2>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
              <input id="cpf" type="text" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" required className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="collab-password"  className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input id="collab-password" type="password" value={collaboratorPassword} onChange={e => setCollaboratorPassword(e.target.value)} placeholder="••••••••" required className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400">
              {isLoading ? <><LoadingSpinner /> Entrando...</> : 'Entrar'}
            </button>
          </form>
        );
      case 'company':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleLoginAttempt({ role: 'company', email: companyEmail, password: companyPassword }); }} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Acesso da Empresa</h2>
            <div>
              <label htmlFor="company-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input id="company-email" type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="seu.email@empresa.com" required className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="company-password"  className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input id="company-password" type="password" value={companyPassword} onChange={e => setCompanyPassword(e.target.value)} placeholder="••••••••" required className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400">
              {isLoading ? <><LoadingSpinner /> Entrando...</> : 'Entrar'}
            </button>
          </form>
        );
      case 'staff':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleLoginAttempt({ role: 'staff', email: staffEmail, password: staffPassword }); }} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Acesso da Equipe</h2>
            <div>
              <label htmlFor="staff-email" className="block text-sm font-medium text-slate-700 mb-1">Email de Staff</label>
              <input id="staff-email" type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="seu-email@progrediremais.com.br" required className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm" />
            </div>
             <div>
              <label htmlFor="staff-password"  className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input id="staff-password" type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} placeholder="••••••••" required className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-slate-800 disabled:bg-slate-400">
              {isLoading ? <><LoadingSpinner /> Entrando...</> : 'Entrar'}
            </button>
          </form>
        );
      default: // chooser
        return (
          <div className="space-y-6">
            <button onClick={() => setActiveForm('collaborator')} className="w-full text-left p-6 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex items-center space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-50 p-4 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-100">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Sou Colaborador</h3>
                    <p className="text-slate-500 mt-1">Acessar com meu CPF e senha.</p>
                </div>
            </button>
             <button onClick={() => setActiveForm('company')} className="w-full text-left p-6 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex items-center space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-50 p-4 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-100">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Sou da Empresa</h3>
                    <p className="text-slate-500 mt-1">Acessar com meu email corporativo.</p>
                </div>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center items-center space-x-3 mb-8">
            <LogoIcon className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-slate-800 tracking-tight">
                Progredire<span className="text-blue-600">+</span>
            </span>
        </div>
        
        {activeForm === 'chooser' && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-800">Seja bem-vindo(a)</h1>
            <p className="text-slate-500 mt-2">Escolha seu perfil para continuar.</p>
          </div>
        )}
        
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            {renderForm()}
        </div>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg flex items-center justify-center text-sm" role="alert">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
            {activeForm !== 'chooser' ? (
                <button onClick={handleBackToChooser} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 mx-auto">
                    {/* FIX: Replaced inline SVG with the 'ChevronLeftIcon' component for consistency and maintainability. */}
                    <ChevronLeftIcon className="w-4 h-4" />
                    Voltar para seleção de perfil
                </button>
            ) : (
                <button onClick={() => setActiveForm('staff')} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    É membro da equipe? Acesse aqui.
                </button>
            )}
        </div>
      </div>
       <footer className="absolute bottom-6">
            <p className="text-sm text-slate-500">
               Progredire+ | Ferramenta de análise psicológica organizacional.
           </p>
       </footer>
    </div>
  );
};