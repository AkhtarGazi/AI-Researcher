import React from 'react';

const ProgressTracker = ({ steps, status }) => {
    const allCoreSteps = [
        { key: 'search', label: 'Web Search', icon: '🔍' },
        { key: 'scrape', label: 'Source Extraction', icon: '📄' },
        { key: 'write', label: 'Report Generation', icon: '✍️' },
        { key: 'critique', label: 'Quality Review', icon: '⚖️' },
    ];

    const getStepStatus = (key) => {
        const step = steps?.find(s => s.step_name === key);
        return step ? step.status : 'pending';
    };

    return (
        <aside className="activity-rail animate-fade-in">
            <div className="activity-rail-header">Process Chain</div>

            <div className="activity-steps">
                {allCoreSteps.map((step, idx) => {
                    const stepStatus = getStepStatus(step.key);
                    const isComplete = stepStatus === 'completed';
                    const isRunning = stepStatus === 'running';
                    const isFailed = stepStatus === 'failed';

                    return (
                        <div key={idx} className={`activity-step ${stepStatus}`}>
                            <div className={`step-indicator ${stepStatus}`}>
                                {isComplete ? '✓' : step.icon}
                            </div>
                            <div className="step-info">
                                <h4>{step.label}</h4>
                                <p>
                                    {isRunning ? <span className="running-text">Processing...</span> :
                                        isComplete ? 'Complete' :
                                            isFailed ? 'Error occurred' : 'Waiting'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {status === 'running' && (
                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Research agent is currently navigating the web, extracting deep context and synthesizing findings.
                    </p>
                </div>
            )}
        </aside>
    );
};

export default ProgressTracker;
