import React, { useState, useEffect } from 'react';
import { useResearch } from '../context/ResearchContext';

const ACTIVITY_MESSAGES = {
    search: [
        'Scanning knowledge bases...',
        'Querying web sources...',
        'Discovering relevant articles...',
    ],
    scrape: [
        'Reading source content...',
        'Extracting key information...',
        'Parsing article data...',
    ],
    write: [
        'Structuring report outline...',
        'Generating analysis sections...',
        'Composing final report...',
    ],
    critique: [
        'Running quality assessment...',
        'Verifying source accuracy...',
        'Evaluating argument strength...',
    ],
};

const AgentActivity = () => {
    const { currentTask } = useResearch();
    const [msgIndex, setMsgIndex] = useState(0);

    const runningStep = currentTask?.steps?.find(s => s.status === 'running');
    const agentKey = runningStep?.step_name || null;
    const messages = agentKey ? ACTIVITY_MESSAGES[agentKey] || [] : [];

    useEffect(() => {
        if (!agentKey || messages.length === 0) return;
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [agentKey, messages.length]);

    const agentNames = {
        search: 'Search Agent',
        scrape: 'Reader Agent',
        write: 'Writer Agent',
        critique: 'Critic Agent',
    };

    if (!currentTask || currentTask.status !== 'running') {
        return (
            <div className="panel-section">
                <div className="panel-section-title">Agent Activity</div>
                <div className="agent-activity-item">
                    <div className="agent-activity-text" style={{ color: 'var(--text-dim)' }}>
                        No active agents
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel-section">
            <div className="panel-section-title">Agent Activity</div>
            <div className="agent-activity-item">
                <div className="agent-activity-dot" />
                <div>
                    <div className="agent-activity-text">
                        {messages[msgIndex] || 'Processing...'}
                    </div>
                    <div className="agent-activity-label">
                        {agentNames[agentKey] || 'Agent'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentActivity;
