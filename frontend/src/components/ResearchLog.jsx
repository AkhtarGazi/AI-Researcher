import React, { useState, useEffect, useRef } from 'react';
import { useResearch } from '../context/ResearchContext';

const SIMULATED_LOG = [
    { text: 'Initializing research pipeline', delay: 0 },
    { text: 'Search agent activated', delay: 800 },
    { text: 'Querying knowledge sources', delay: 2000 },
    { text: 'Sources discovered', delay: 4000 },
    { text: 'Reader agent activated', delay: 5500 },
    { text: 'Reading article content', delay: 7000 },
    { text: 'Extracting information', delay: 9000 },
    { text: 'Writer agent activated', delay: 11000 },
    { text: 'Building report structure', delay: 13000 },
    { text: 'Generating analysis', delay: 15000 },
    { text: 'Critic agent activated', delay: 17000 },
    { text: 'Running quality review', delay: 19000 },
];

const ResearchLog = () => {
    const { currentTask } = useResearch();
    const [logs, setLogs] = useState([]);
    const scrollRef = useRef(null);
    const timersRef = useRef([]);

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        if (currentTask?.status === 'running') {
            setLogs([]);
            SIMULATED_LOG.forEach((entry) => {
                const timer = setTimeout(() => {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    setLogs(prev => [...prev, { time: timeStr, text: entry.text }]);
                }, entry.delay);
                timersRef.current.push(timer);
            });
        } else if (currentTask?.status === 'completed') {
            setLogs(prev => {
                if (prev.length > 0 && prev[prev.length - 1].text === 'Research completed') return prev;
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                return [...prev, { time: timeStr, text: 'Research completed ✓' }];
            });
        } else if (!currentTask) {
            // Reset logs when there's no active task
            setLogs([]);
        }

        return () => {
            timersRef.current.forEach(clearTimeout);
        };
    }, [currentTask?.status]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Hide entirely when no task has been started yet
    if (!currentTask) {
        return null;
    }

    return (
        <div className="panel-section">
            <div className="panel-section-title">Live Research Log</div>
            <div className="research-log-list" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="log-entry" style={{ color: 'var(--text-dim)' }}>
                        Starting up…
                    </div>
                ) : (
                    logs.map((log, idx) => (
                        <div className="log-entry" key={idx}>
                            <span className="log-check">✓</span>
                            <span className="log-time">{log.time}</span>
                            <span>{log.text}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResearchLog;
