import React from 'react';

const AgentStatusRail = ({ steps }) => {
    const stages = [
        { key: 'search', label: 'Search', icon: '🔍' },
        { key: 'scrape', label: 'Read', icon: '📄' },
        { key: 'write', label: 'Write', icon: '✍️' },
        { key: 'critique', label: 'Review', icon: '⚖️' },
    ];

    const getStatus = (key) => {
        const step = steps?.find(s => s.step_name === key);
        return step ? step.status : 'waiting';
    };

    return (
        <div className="status-rail">
            {stages.map((stage, idx) => {
                const status = getStatus(stage.key);
                return (
                    <React.Fragment key={stage.key}>
                        <div className={`status-chip ${status}`}>
                            <span className="status-icon">{status === 'completed' ? '✓' : stage.icon}</span>
                            {stage.label}
                        </div>
                        {idx < stages.length - 1 && <div className="status-connector" />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default AgentStatusRail;
