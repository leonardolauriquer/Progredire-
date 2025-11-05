
import React from 'react';
import { StethoscopeIcon, ChatBubbleOvalLeftEllipsisIcon, ShieldCheckIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon } from './icons';

interface Professional {
  title: string;
  description: string;
  icon: React.ElementType;
}

const professionals: Professional[] = [
  {
    title: 'Psiquiatra',
    description: 'Apoio médico especializado em saúde mental, focado em diagnóstico, tratamento e prevenção de transtornos mentais, emocionais e comportamentais.',
    icon: StethoscopeIcon,
  },
  {
    title: 'Médico do Trabalho',
    description: 'Especialista na relação entre o trabalho e a saúde, atuando na prevenção de doenças e acidentes ocupacionais e na promoção da saúde do trabalhador.',
    icon: StethoscopeIcon,
  },
  {
    title: 'Psicólogo',
    description: 'Suporte emocional e terapêutico para lidar com desafios pessoais, estresse, ansiedade e desenvolvimento de habilidades de enfrentamento.',
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
  {
    title: 'Engenheiro de Segurança do Trabalho',
    description: 'Profissional dedicado a garantir um ambiente de trabalho seguro e saudável, identificando e mitigando riscos físicos, químicos e biológicos.',
    icon: ShieldCheckIcon,
  },
];

const ProfessionalCard: React.FC<{ professional: Professional }> = ({ professional }) => {
  const { title, description, icon: Icon } = professional;
  return (
    <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border] flex flex-col text-center items-center">
      <Icon className="h-12 w-12 text-blue-600 mb-4" />
      <h3 className="text-xl font-bold text-[--color-card-foreground]">{title}</h3>
      <p className="text-[--color-card-muted-foreground] mt-2 flex-grow">{description}</p>
      <button
        onClick={() => alert(`Entraremos em contato para agendar um bate-papo com um(a) ${title}.`)}
        className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
      >
        Agendar Bate-Papo
      </button>
    </div>
  );
};

const StaffCard: React.FC = () => (
    <div className="bg-[--color-muted] p-6 rounded-2xl shadow-lg border border-[--color-border] lg:col-span-2 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
      <div className="flex-shrink-0">
        <UserGroupIcon className="h-16 w-16 text-blue-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-[--color-card-foreground]">Fale com a Staff Progredire+</h3>
        <p className="text-[--color-card-muted-foreground] mt-2 mb-4">
          Nossa equipe está disponível para um bate-papo confidencial sobre qualquer questão. Entre em contato para agendar uma conversa.
        </p>
        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 text-sm">
          <a href="mailto:staff@progrediremais.com.br" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            <EnvelopeIcon className="w-5 h-5" />
            staff@progrediremais.com.br
          </a>
          <a href="tel:+5511999998888" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            <PhoneIcon className="w-5 h-5" />
            +55 (11) 99999-8888
          </a>
        </div>
      </div>
    </div>
);


export const SupportTeamView: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <UserGroupIcon className="h-16 w-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-[--color-foreground]">Equipe de Apoio Progredire+</h2>
        <p className="text-[--color-muted-foreground] mt-2 max-w-2xl mx-auto">
          Conheça os profissionais disponíveis para apoiar sua jornada de bem-estar e segurança no ambiente de trabalho.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <StaffCard />
        {professionals.map((prof, index) => (
          <ProfessionalCard key={index} professional={prof} />
        ))}
      </div>
    </div>
  );
};