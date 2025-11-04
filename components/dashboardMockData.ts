// --- MOCK DATA ---
// This data simulates responses from a backend/database.

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

const likertOptions = ['Discordo Totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo Totalmente'];

const generateRandomAnswer = () => likertOptions[Math.floor(Math.random() * likertOptions.length)];
const generateWeightedAnswer = (favor: 'good' | 'bad') => {
    const rand = Math.random();
    if (favor === 'good') {
        if (rand < 0.1) return likertOptions[0]; // 10% DT
        if (rand < 0.2) return likertOptions[1]; // 10% D
        if (rand < 0.4) return likertOptions[2]; // 20% N
        if (rand < 0.7) return likertOptions[3]; // 30% C
        return likertOptions[4];                 // 30% CT
    } else { // bad
        if (rand < 0.3) return likertOptions[0]; // 30% DT
        if (rand < 0.6) return likertOptions[1]; // 30% D
        if (rand < 0.8) return likertOptions[2]; // 20% N
        if (rand < 0.9) return likertOptions[3]; // 10% C
        return likertOptions[4];                 // 10% CT
    }
};

const allQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

const now = Date.now();
const oneYear = 365 * 24 * 60 * 60 * 1000;
const generateRandomTimestamp = () => now - Math.random() * oneYear;

export const mockResponses: MockResponse[] = [
    // Engenharia (bom, mas sobrecarregado)
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Tecnologia', setor: 'Engenharia', cargo: 'Desenvolvedor' },
        answers: {
            q1: generateWeightedAnswer('bad'),  // Carga
            q2: generateWeightedAnswer('bad'),  // Ritmo
            q3: generateWeightedAnswer('good'), // Clareza
            q4: generateWeightedAnswer('good'), // Autonomia
            q5: generateWeightedAnswer('good'), // Suporte
            q6: generateWeightedAnswer('good'), // Relações
            q7: generateWeightedAnswer('good'), // Reconhecimento
            q8: generateWeightedAnswer('good'), // Segurança
            q9: generateWeightedAnswer('good'), // Comunicação
            q10: generateWeightedAnswer('good'),// Processos
        },
    })),
    // Marketing (relações ruins e falta de reconhecimento)
    ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 21,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Vendas & Mkt', setor: 'Marketing', cargo: 'Analista' },
        answers: {
            q1: generateWeightedAnswer('good'),
            q2: generateWeightedAnswer('good'),
            q3: generateWeightedAnswer('good'),
            q4: generateWeightedAnswer('good'),
            q5: generateWeightedAnswer('good'),
            q6: generateWeightedAnswer('bad'), // Relações
            q7: generateWeightedAnswer('bad'), // Reconhecimento
            q8: generateWeightedAnswer('good'),
            q9: generateWeightedAnswer('good'),
            q10: generateWeightedAnswer('good'),
        },
    })),
    // RH (geralmente bom)
    ...Array.from({ length: 8 }, (_, i) => ({
        id: i + 36,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Operações', setor: 'RH', cargo: 'Especialista' },
        answers: Object.fromEntries(allQuestions.map(q => [q, generateWeightedAnswer('good')])),
    })),
    // Vendas (insegurança e processos ruins)
     ...Array.from({ length: 12 }, (_, i) => ({
        id: i + 44,
        timestamp: generateRandomTimestamp(),
        segmentation: { empresa: 'TechCorp', diretoria: 'Vendas & Mkt', setor: 'Vendas', cargo: 'Executivo de Contas' },
        answers: {
            q1: generateWeightedAnswer('good'),
            q2: generateWeightedAnswer('good'),
            q3: generateWeightedAnswer('good'),
            q4: generateWeightedAnswer('good'),
            q5: generateWeightedAnswer('good'),
            q6: generateWeightedAnswer('good'), 
            q7: generateWeightedAnswer('good'), 
            q8: generateWeightedAnswer('bad'), // Insegurança
            q9: generateWeightedAnswer('good'),
            q10: generateWeightedAnswer('bad'),// Processos
        },
    })),
];


export const mockFilters = [
    { id: 'empresa', label: 'Empresa', options: ['TechCorp'] },
    { id: 'diretoria', label: 'Diretoria', options: ['Tecnologia', 'Vendas & Mkt', 'Operações'] },
    { id: 'setor', label: 'Setor / Área', options: ['Engenharia', 'Marketing', 'RH', 'Vendas'] },
    { id: 'cargo', label: 'Cargo', options: ['Desenvolvedor', 'Analista', 'Especialista', 'Executivo de Contas'] },
];