// --- MOCK DATA ---
// This data simulates responses from a backend/database.

export type CampaignStatus = 'Em Andamento' | 'Concluída' | 'Agendada' | 'Pendente';
export interface Campaign {
    id: number;
    name: string;
    description: string;
    status: CampaignStatus;
    targetAudience: string;
    adherence: number;
    startDate: string;
    endDate: string;
    emailMessage: string;
    filters: Record<string, string>;
}

type Segmentation = {
    empresa: string;
    diretoria: string;
    setor: string;
    cargo: string;
};

type MockResponse = {
    id: number;
    timestamp: number;
    segmentation: Segmentation;
    answers: Record<string, string>;
};

export const dimensions: Record<string, { name: string, questions: string[] }> = {
    'd1_carga': { name: 'Organização e Carga de Trabalho', questions: ['q1', 'q2', 'q3', 'q4', 'q5'] },
    'd2_demandas': { name: 'Demandas Emocionais e Cognitivas', questions: ['q6', 'q7', 'q8', 'q9', 'q10'] },
    'd3_autonomia': { name: 'Autonomia e Controle', questions: ['q11', 'q12', 'q13', 'q14'] },
    'd4_clareza': { name: 'Clareza de Papéis e Responsabilidades', questions: ['q15', 'q16', 'q17', 'q18'] },
    'd5_reconhecimento': { name: 'Reconhecimento e Recompensas', questions: ['q19', 'q20', 'q21', 'q22'] },
    'd6_suporte': { name: 'Relacionamentos e Suporte Social', questions: ['q23', 'q24', 'q25', 'q26'] },
    'd7_lideranca': { name: 'Liderança e Comunicação', questions: ['q27', 'q28', 'q29', 'q30'] },
    'd8_justica': { name: 'Justiça e Equidade', questions: ['q31', 'q32', 'q33', 'q34'] },
    'd9_seguranca': { name: 'Segurança Psicológica, Assédio e Respeito', questions: ['q35', 'q36', 'q37', 'q38'] },
    'd10_mudancas': { name: 'Mudanças Organizacionais e Estabilidade', questions: ['q39', 'q40', 'q41', 'q42'] },
    'd11_ambiente': { name: 'Ambiente e Condições de Trabalho', questions: ['q43', 'q44', 'q45'] },
};


const likertOptions = ['Discordo totalmente', 'Discordo parcialmente', 'Neutro / Indiferente', 'Concordo parcialmente', 'Concordo totalmente'];

const generateWeightedAnswer = (favor: 'good' | 'bad') => {
    const rand = Math.random();
    if (favor === 'good') {
        if (rand < 0.05) return likertOptions[0]; // 5% DT
        if (rand < 0.1) return likertOptions[1]; // 5% DP
        if (rand < 0.2) return likertOptions[2]; // 10% N
        if (rand < 0.6) return likertOptions[3]; // 40% CP
        return likertOptions[4];                 // 40% CT
    } else { // bad
        if (rand < 0.4) return likertOptions[0]; // 40% DT
        if (rand < 0.7) return likertOptions[1]; // 30% DP
        if (rand < 0.9) return likertOptions[2]; // 20% N
        if (rand < 0.95) return likertOptions[3]; // 5% CP
        return likertOptions[4];                 // 5% CT
    }
};

const allQuestions = Array.from({ length: 45 }, (_, i) => `q${i + 1}`);

const now = Date.now();
const oneYear = 365 * 24 * 60 * 60 * 1000;
const generateRandomTimestamp = () => now - Math.random() * oneYear;

const generateAnswers = (profile: Record<string, 'good' | 'bad'>) => {
    const answers: Record<string, string> = {};
    allQuestions.forEach(qId => {
        const dimensionId = Object.keys(dimensions).find(dId => dimensions[dId].questions.includes(qId));
        const favor = dimensionId ? (profile[dimensionId] || 'good') : 'good';
        answers[qId] = generateWeightedAnswer(favor);
    });
    return answers;
};

export const mockResponses: MockResponse[] = [
    // Engenharia (bom, mas sobrecarregado)
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Tecnologia', setor: 'Engenharia', cargo: 'Desenvolvedor' },
        answers: generateAnswers({ 'd1_carga': 'bad', 'd2_demandas': 'bad' }),
    })),
    // Marketing (relações ruins e falta de reconhecimento)
    ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 21,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Vendas & Mkt', setor: 'Marketing', cargo: 'Analista' },
        answers: generateAnswers({ 'd6_suporte': 'bad', 'd5_reconhecimento': 'bad' }),
    })),
    // RH (geralmente bom)
    ...Array.from({ length: 8 }, (_, i) => ({
        id: i + 36,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Operações', setor: 'RH', cargo: 'Especialista' },
        answers: generateAnswers({}), // All good by default
    })),
    // Vendas (insegurança e carga de trabalho)
     ...Array.from({ length: 12 }, (_, i) => ({
        id: i + 44,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Vendas & Mkt', setor: 'Vendas', cargo: 'Executivo de Contas' },
        answers: generateAnswers({ 'd10_mudancas': 'bad', 'd1_carga': 'bad' }),
    })),
];


export const mockFilters = [
    { id: 'empresa', label: 'Empresa', options: ['TechCorp'] },
    { id: 'diretoria', label: 'Diretoria', options: ['Tecnologia', 'Vendas & Mkt', 'Operações'] },
    { id: 'setor', label: 'Setor / Área', options: ['Engenharia', 'Marketing', 'RH', 'Vendas'] },
    { id: 'cargo', label: 'Cargo', options: ['Desenvolvedor', 'Analista', 'Especialista', 'Executivo de Contas'] },
];

export const initialCampaigns: Campaign[] = [
    { id: 1, name: "Diagnóstico Q3 - Tecnologia", description: "Avaliação trimestral da equipe de tecnologia.", status: "Em Andamento", targetAudience: "Diretoria de Tecnologia", adherence: 65, startDate: "2024-07-15", endDate: "2024-08-15", emailMessage: "...", filters: {diretoria: 'Tecnologia'}},
    { id: 2, name: "Pesquisa de Clima - Vendas & Mkt", description: "Análise do clima e engajamento das equipes comerciais.", status: "Concluída", targetAudience: "Diretoria de Vendas & Mkt", adherence: 92, startDate: "2024-05-01", endDate: "2024-05-30", emailMessage: "...", filters: {diretoria: 'Vendas & Mkt'}},
    { id: 3, name: "Diagnóstico Anual Geral", description: "Pesquisa de clima para toda a empresa.", status: "Pendente", targetAudience: "Toda a empresa", adherence: 0, startDate: "2024-09-01", endDate: "2024-09-30", emailMessage: "...", filters: {}},
];
