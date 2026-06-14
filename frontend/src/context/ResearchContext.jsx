import React, { createContext, useContext, useState, useEffect } from 'react';
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

    // Global Toast State
    const [toasts, setToasts] = useState([]);
    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

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

        try {
            const response = await researchService.create(topic);
            const taskId = response.data.task_id;

            // Update local recent topics
            const updatedTopics = storageService.saveRecentTopic(topic);
            setRecentTopics(updatedTopics);

            // Start fetching full task data
            const taskRes = await researchService.get(taskId);
            setCurrentTask(taskRes.data);

            // Connect WebSocket
            const ws = new ResearchWebSocket(
                taskId,
                (message) => handleWsMessage(message),
                () => console.log('Research WS Connected'),
                () => console.log('Research WS Disconnected'),
                (err) => addToast('WebSocket connection error', 'error')
            );
            ws.connect();
            setWsConnection(ws);

            addToast(`Research started: ${topic}`, 'info');
            return taskId;
        } catch (err) {
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
                // Find existing step or add new
                const stepIdx = updated.steps.findIndex(s => s.step_name === data.step);
                if (stepIdx !== -1) {
                    updated.steps[stepIdx] = { ...updated.steps[stepIdx], status: data.status };
                } else {
                    updated.steps.push({ step_name: data.step, status: data.status, timestamp: new Date().toISOString() });
                }
            } else if (type === 'search_completed') {
                updated.search_results = data.result || updated.search_results;
                addToast('Web search complete', 'success');
            } else if (type === 'scraping_completed') {
                updated.scraped_content = data.result || updated.scraped_content;
                addToast('Scraping complete', 'success');
            } else if (type === 'report_generated') {
                addToast('Report generated', 'success');
                // We'll fetch full data at completion for consistency
            } else if (type === 'research_completed') {
                updated.status = 'completed';
                addToast('Research completed successfully!', 'success');
                refreshCurrentTask(prev.id);
                fetchHistory();
            } else if (type === 'research_failed') {
                updated.status = 'failed';
                updated.error_message = data.message;
                addToast(`Research failed: ${data.message}`, 'error');
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
        fetchHistory
    };

    return (
        <ResearchContext.Provider value={value}>
            {children}
        </ResearchContext.Provider>
    );
};
