
import React from 'react';
import { LogoIcon, BuildingOfficeIcon, UserIcon } from './icons';
import { UserRole } from '../App';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

const LoginCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-6 bg-[--color-card] rounded-2xl shadow-lg border border-[--color-border] hover:shadow-xl hover:border-[--color-primary-300] transition-all duration-300 flex items-center space-x-6"
    >
        <div className="flex-shrink-0 bg-blue-50 p-4 rounded-full">
            <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-[--color-card-foreground]">{title}</h3>
            <p className="text-[--color-card-muted-foreground] mt-1">{description}</p>
        </div>
    </button>
);

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
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
            <LoginCard 
                icon={BuildingOfficeIcon}
                title="Acessar como Empresa"
                description="Visualize dashboards, gerencie campanhas e crie planos de ação."
                onClick={() => onLogin('company')}
            />
            <LoginCard 
                icon={UserIcon}
                title="Acessar como Colaborador"
                description="Responda pesquisas e acesse ferramentas de reflexão pessoal."
                onClick={() => onLogin('collaborator')}
            />
        </div>

        <footer className="mt-12">
             <p className="text-sm text-slate-500">
                Progredire+ | Ferramenta de análise psicológica organizacional.
            </p>
        </footer>
      </div>
    </div>
  );
};
