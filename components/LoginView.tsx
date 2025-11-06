

import React, { useState } from 'react';
import { LogoIcon, BuildingOfficeIcon, UserIcon, ExclamationCircleIcon } from './icons';
import { UserRole } from '../App';
import { authService, AuthData } from '../services/authService';
import { LoadingSpinner } from './LoadingSpinner';

interface LoginViewProps {
  onLogin: (authData: AuthData) => void;
}

const LoginButton: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  isLoading: boolean;
}> = ({ icon: Icon, title, description, onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full text-left p-6 bg-[--color-card] rounded-2xl shadow-lg border border-[--color-border] hover:shadow-xl hover:border-[--color-primary-300] transition-all duration-300 flex items-center space-x-6 disabled:opacity-70 disabled:cursor-not-allowed"
    >
        <div className="flex-shrink-0 bg-blue-50 p-4 rounded-full">
            {isLoading ? <LoadingSpinner /> : <Icon className="h-8 w-8 text-blue-600" />}
        </div>
        <div>
            <h3 className="text-xl font-bold text-[--color-card-foreground]">
                {isLoading ? 'Autenticando...' : title}
            </h3>
            <p className="text-[--color-card-muted-foreground] mt-1">{description}</p>
        </div>
    </button>
);

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState<false | UserRole>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginAttempt = async (role: UserRole) => {
    setIsLoading(role);
    setError(null);
    try {
      const authData = await authService.login(role);
      onLogin(authData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex justify-center items-center space-x-3 mb-8">
            <LogoIcon className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-slate-800 tracking-tight">
                Progredire<span className="text-blue-600">+</span>
            </span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800">Selecione seu tipo de acesso</h1>
        <p className="text-slate-500 mt-2 mb-8">
            Escolha como você deseja acessar a plataforma.
        </p>

        <div className="space-y-6">
            <LoginButton 
                icon={BuildingOfficeIcon}
                title="Acessar como Empresa"
                description="Visualize dashboards, gerencie campanhas e crie planos de ação."
                onClick={() => handleLoginAttempt('company')}
                isLoading={isLoading === 'company'}
            />
            <LoginButton 
                icon={UserIcon}
                title="Acessar como Colaborador"
                description="Responda pesquisas e acesse ferramentas de reflexão pessoal."
                onClick={() => handleLoginAttempt('collaborator')}
                isLoading={isLoading === 'collaborator'}
            />
        </div>
        
        {error && (
            <div className="mt-6 bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg flex items-center justify-center text-sm" role="alert">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
        )}

        <footer className="mt-12">
             <p className="text-sm text-slate-500">
                Progredire+ | Ferramenta de análise psicológica organizacional.
            </p>
        </footer>
      </div>
    </div>
  );
};
