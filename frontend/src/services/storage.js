const STORAGE_KEY_HISTORY = 'research_history_topics';
const STORAGE_KEY_PREFS = 'research_user_prefs';

export const storageService = {
    // Save a recent topic to local list
    saveRecentTopic: (topic) => {
        const topics = storageService.getRecentTopics();
        const filtered = [topic, ...topics.filter(t => t !== topic)].slice(0, 5);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
        return filtered;
    },

    getRecentTopics: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY)) || [];
        } catch {
            return [];
        }
    },

    setPrefs: (prefs) => {
        const current = storageService.getPrefs();
        localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify({ ...current, ...prefs }));
    },

    getPrefs: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS)) || {
                viewMode: 'document', // 'card' or 'document'
                theme: 'dark'
            };
        } catch {
            return { viewMode: 'document', theme: 'dark' };
        }
    }
};
