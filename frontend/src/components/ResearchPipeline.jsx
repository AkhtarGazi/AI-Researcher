import React from 'react';
import { useResearch } from '../context/ResearchContext';

const STAGES = [
    { key: 'search', label: 'Search', icon: '🔍' },
    { key: 'scrape', label: 'Reader', icon: '📖' },
    { key: 'write', label: 'Writer', icon: '✍️' },
    { key: 'critique', label: 'Critic', icon: '⚖️' },
];

const ResearchPipeline = () => {
    const { currentTask } = useResearch();
    const steps = currentTask?.steps || [];

    // Find the latest active step to ensure exclusive glow
    // We want the HIGHEST index that is 'running'
    const activeStepIdx = STAGES.reduce((acc, stage, idx) => {
        const step = steps.find(s => s.step_name === stage.key);
        if (step?.status === 'running') return idx;
        return acc;
    }, -1);

    // Special case: If research just started and no steps are found yet,
    // we default Search (index 0) to 'running'
    const isInitialRunning = currentTask?.status === 'running' && steps.length === 0;
    const effectiveActiveIdx = isInitialRunning ? 0 : activeStepIdx;

    const getStatus = (key, idx) => {
        if (!currentTask) return 'idle';

        // Special case for initial Search glow
        if (isInitialRunning && idx === 0) return 'running';

        const step = steps.find(s => s.step_name === key);
        if (!step) return 'idle';

        // Exclusive glow: if this step is 'running' but it's not the 'effectiveActiveIdx', 
        // we treat it as pending (though backend usually only has one running)
        if (step.status === 'running' && idx !== effectiveActiveIdx) {
            return 'pending';
        }

        return step.status;
    };

    return (
        <div className="panel-section">
            <div className="panel-section-title">Research Pipeline</div>
            <div className="pipeline-stages">
                {STAGES.map((stage, idx) => {
                    const status = getStatus(stage.key, idx);
                    return (
                        <React.Fragment key={stage.key}>
                            <div className={`pipeline-stage pipeline-stage--${status}`}>
                                <div className={`pipeline-icon pipeline-icon--${status}`}>
                                    {status === 'completed' ? '✓' : stage.icon}
                                </div>
                                <div className="pipeline-info">
                                    <div className="pipeline-name">{stage.label}</div>
                                </div>
                            </div>
                            {idx < STAGES.length - 1 && (
                                <div className={`pipeline-connector ${status === 'completed' ? 'done' : ''}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ResearchPipeline;
