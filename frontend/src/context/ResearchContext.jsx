import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { researchService } from '../services/api';
import { storageService } from '../services/storage';
import ResearchWebSocket from '../services/websocket';

const ResearchContext = createContext();

export const useResearch = () => useContext(ResearchContext);

export const ResearchProvider = ({ children }) => {
    const [currentTask, setCurrentTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [recentTopics, setRecentTopics] = useState(storageService.getRecentTopics());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wsConnection, setWsConnection] = useState(null);
    const [prefs, setPrefs] = useState(storageService.getPrefs());

    // Theme (dark / light)
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('ai-research-theme');
        return saved || 'dark';
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('ai-research-theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    // Global Toast State — with dedup
    const [toasts, setToasts] = useState([]);
    const seenEventKeys = useRef(new Set());

    const addToast = useCallback((message, type = 'info', dedupKey = null) => {
        // If a dedupKey is provided, only fire once per task session
        if (dedupKey) {
            if (seenEventKeys.current.has(dedupKey)) return;
            seenEventKeys.current.add(dedupKey);
        }
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    // Initialize history
    const fetchHistory = async () => {
        try {
            const response = await researchService.getHistory();
            setHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const updatePrefs = (newPrefs) => {
        const updated = { ...prefs, ...newPrefs };
        setPrefs(updated);
        storageService.setPrefs(updated);
    };

    const startResearch = async (topic) => {
        setLoading(true);
        setError(null);
        setCurrentTask(null);
        seenEventKeys.current = new Set(); // reset dedup on new task

        console.log('[Research] Starting research for topic:', topic);

        try {
            console.log('[Research] Calling researchService.create...');
            const response = await researchService.create(topic);
            console.log('[Research] Create response:', response);

            const taskId = response.data.task_id;
            console.log('[Research] Task ID:', taskId);

            // Update local recent topics
            const updatedTopics = storageService.saveRecentTopic(topic);
            setRecentTopics(updatedTopics);

            // Start fetching full task data
            console.log('[Research] Fetching full task data...');
            const taskRes = await researchService.get(taskId);
            console.log('[Research] Task data:', taskRes);
            setCurrentTask(taskRes.data);

            // Connect WebSocket
            console.log('[Research] Connecting WebSocket...');
            const ws = new ResearchWebSocket(
                taskId,
                (message) => handleWsMessage(message),
                () => console.log('[Research] WebSocket connected'),
                () => console.log('[Research] WebSocket disconnected'),
                (err) => {
                    console.error('[Research] WebSocket error:', err);
                    addToast('WebSocket connection error', 'error');
                }
            );
            ws.connect();
            setWsConnection(ws);

            addToast(`Research started: ${topic}`, 'info');
            return taskId;
        } catch (err) {
            console.error('[Research] ✕ Failed to start research:', err);
            console.error('[Research] Error details:', JSON.stringify(err, null, 2));
            setError(err);
            addToast(err.message || 'Failed to start research', 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const handleWsMessage = (message) => {
        const { type, data } = message;

        setCurrentTask(prev => {
            if (!prev) return null;
            const updated = { ...prev };

            if (type === 'research_started') {
                updated.status = 'running';
            } else if (type === 'step_update') {
                const stepIdx = updated.steps?.findIndex(s => s.step_name === data.step) ?? -1;
                const newStep = { step_name: data.step, status: data.status, timestamp: new Date().toISOString() };
                if (stepIdx !== -1) {
                    updated.steps = updated.steps.map((s, i) => i === stepIdx ? { ...s, status: data.status } : s);
                } else {
                    updated.steps = [...(updated.steps || []), newStep];
                }
            } else if (type === 'search_completed') {
                updated.search_results = data.result || updated.search_results;
                addToast('✓ Web search complete', 'success', 'search_completed');
            } else if (type === 'scraping_completed') {
                updated.scraped_content = data.result || updated.scraped_content;
                addToast('✓ Content extracted', 'success', 'scraping_completed');
            } else if (type === 'report_generated') {
                addToast('✓ Report generated', 'success', 'report_generated');
            } else if (type === 'critique_completed') {
                addToast('✓ Quality review complete', 'success', 'critique_completed');
            } else if (type === 'research_completed') {
                updated.status = 'completed';
                addToast('🎉 Research completed!', 'success', 'research_completed');
                refreshCurrentTask(prev.id);
                fetchHistory();
            } else if (type === 'research_failed') {
                updated.status = 'failed';
                updated.error_message = data.message;
                addToast(`Research failed: ${data.message}`, 'error', 'research_failed');
                refreshCurrentTask(prev.id);
            }

            return updated;
        });
    };

    const refreshCurrentTask = async (taskId) => {
        try {
            const response = await researchService.get(taskId);
            setCurrentTask(response.data);
        } catch (err) {
            console.error('Failed to refresh task:', err);
        }
    };

    const cancelResearch = async (taskId) => {
        try {
            await researchService.cancel(taskId);
            setCurrentTask(prev => prev?.id === taskId ? { ...prev, status: 'cancelled' } : prev);
            addToast('Research cancelled', 'info');
            if (wsConnection) wsConnection.close();
        } catch (err) {
            addToast(err.message || 'Failed to cancel', 'error');
        }
    };

    const value = {
        currentTask,
        setCurrentTask,
        history,
        recentTopics,
        loading,
        error,
        prefs,
        updatePrefs,
        startResearch,
        cancelResearch,
        toasts,
        removeToast,
        refreshCurrentTask,
        fetchHistory,
        theme,
        toggleTheme,
    };

    return (
        <ResearchContext.Provider value={value}>
            {children}
        </ResearchContext.Provider>
    );
};
