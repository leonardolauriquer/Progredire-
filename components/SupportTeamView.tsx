import React, { useState } from 'react';
import { StethoscopeIcon, ChatBubbleOvalLeftEllipsisIcon, ShieldCheckIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon } from './icons';
import { Modal } from './Modal';

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

const ProfessionalCard: React.FC<{ professional: Professional, onSchedule: (prof: Professional) => void }> = ({ professional, onSchedule }) => {
  const { title, description, icon: Icon } = professional;
  return (
    <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border] flex flex-col text-center items-center hover:-translate-y-1 transition-transform duration-300">
      <Icon className="h-12 w-12 text-blue-600 mb-4" />
      <h3 className="text-xl font-bold text-[--color-card-foreground]">{title}</h3>
      <p className="text-[--color-card-muted-foreground] mt-2 flex-grow">{description}</p>
      <button
        onClick={() => onSchedule(professional)}
        className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
      >
        Agendar Bate-Papo
      </button>
    </div>
  );
};

const StaffCard: React.FC = () => (
    <div className="bg-[--color-muted] p-6 rounded-2xl shadow-lg border border-[--color-border] lg:col-span-2">
        <div className="text-center md:text-left">
             <h3 className="text-2xl font-bold text-[--color-card-foreground] flex items-center justify-center md:justify-start gap-3">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                Fale com a Staff Progredire+
            </h3>
            <p className="text-[--color-card-muted-foreground] mt-2">
                Nossa equipe está disponível para um bate-papo confidencial sobre qualquer questão. Entre em contato para agendar uma conversa.
            </p>
        </div>
      
        <div className="mt-6 pt-6 border-t border-[--color-border] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <h4 className="font-semibold text-[--color-card-foreground]">Paula</h4>
                <div className="mt-2 space-y-2 text-sm">
                    <a href="mailto:paula.progredire@gmail.com" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <EnvelopeIcon className="w-5 h-5" />
                        <span>paula.progredire@gmail.com</span>
                    </a>
                    <a href="https://wa.me/554896805355" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <PhoneIcon className="w-5 h-5" />
                        <span>(48) 9680-5355</span>
                    </a>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-[--color-card-foreground]">Natieli</h4>
                 <div className="mt-2 space-y-2 text-sm">
                    <a href="mailto:natieli.progredire@gmail.com" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <EnvelopeIcon className="w-5 h-5" />
                        <span>natieli.progredire@gmail.com</span>
                    </a>
                    <a href="https://wa.me/554796159997" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <PhoneIcon className="w-5 h-5" />
                        <span>(47) 9615-9997</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const SchedulingModalContent: React.FC<{ professional: Professional; onConfirm: () => void }> = ({ professional, onConfirm }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00'];

    const canSubmit = date && time;

    return (
        <div className="space-y-4">
            <p className="text-sm text-[--color-card-muted-foreground]">Você está agendando uma conversa confidencial com um(a) especialista.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="schedule-date" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Data</label>
                    <input type="date" id="schedule-date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[--color-card-muted-foreground] mb-2">Horário</label>
                    <div className="flex flex-wrap gap-2">
                        {timeSlots.map(slot => (
                            <button key={slot} onClick={() => setTime(slot)} className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${time === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-[--color-accent] hover:bg-[--color-border] text-[--color-accent-foreground] border-[--color-border]'}`}>{slot}</button>
                        ))}
                    </div>
                </div>
                <div>
                     <label htmlFor="schedule-notes" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Observação (opcional)</label>
                     <textarea id="schedule-notes" rows={3} placeholder="Gostaria de falar sobre..." className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring] resize-none"></textarea>
                </div>
            </div>
            <div className="pt-4 flex justify-end">
                 <button onClick={onConfirm} disabled={!canSubmit} className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                    Confirmar Agendamento
                 </button>
            </div>
        </div>
    );
};


export const SupportTeamView: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleOpenModal = (professional: Professional) => {
        setSelectedProfessional(professional);
        setIsModalOpen(true);
        setIsConfirmed(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Delay clearing professional to allow for fade-out animation
        setTimeout(() => {
             setSelectedProfessional(null);
             setIsConfirmed(false);
        }, 300);
    };

    const handleConfirm = () => {
        setIsConfirmed(true);
        setTimeout(() => {
            handleCloseModal();
        }, 3000); // Close modal after 3 seconds
    };

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
          <ProfessionalCard key={index} professional={prof} onSchedule={handleOpenModal} />
        ))}
      </div>

       {selectedProfessional && (
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={isConfirmed ? "Agendamento Confirmado!" : `Agendar com ${selectedProfessional.title}`}
            >
                {isConfirmed ? (
                    <div className="text-center py-8">
                        <ShieldCheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[--color-card-foreground]">Tudo certo!</h3>
                        <p className="text-[--color-card-muted-foreground] mt-2">
                            Sua solicitação de agendamento foi enviada. Em breve, você receberá um e-mail com a confirmação e os detalhes do seu bate-papo com um(a) <strong>{selectedProfessional.title}</strong>.
                        </p>
                    </div>
                ) : (
                    <SchedulingModalContent professional={selectedProfessional} onConfirm={handleConfirm} />
                )}
            </Modal>
        )}
    </div>
  );
};