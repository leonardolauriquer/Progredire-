
export interface JournalEntry {
    id: number;
    date: string; // ISO string
    feeling: string;
    emoji: string;
    note: string;
}

const JOURNAL_KEY = 'progredire-mood-journal';

export const getJournalEntries = (): Promise<JournalEntry[]> => {
    return new Promise((resolve) => {
        try {
            const stored = localStorage.getItem(JOURNAL_KEY);
            const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
            // Sort by most recent first
            entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            resolve(entries);
        } catch (error) {
            console.error('Failed to get journal entries', error);
            resolve([]);
        }
    });
};

export const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>): Promise<void> => {
    return new Promise(async (resolve) => {
        try {
            const entries = await getJournalEntries();
            // We get entries sorted desc, so we unshift to keep that order
            const newEntry: JournalEntry = {
                ...entry,
                id: Date.now(),
                date: new Date().toISOString(),
            };
            const updatedEntries = [newEntry, ...entries];
            localStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedEntries));
        } catch (error) {
            console.error('Failed to add journal entry', error);
        }
        resolve();
    });
};
