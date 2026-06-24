import React, { useMemo, useState, useEffect } from 'react';
import { useResearch } from '../context/ResearchContext';

/**
 * Deterministic random in range based on a seed string (task ID)
 */
const seededRandom = (seed, min, max) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rnd = (Math.abs(hash) % 1000) / 1000;
    return Math.floor(rnd * (max - min + 1)) + min;
};

const ResearchProgress = () => {
    const { currentTask } = useResearch();
    const [displayValue, setDisplayValue] = useState(0);

    // Map stages to randomized ranges as per user request
    const progressRanges = useMemo(() => {
        if (!currentTask?.id) return null;
        const seed = String(currentTask.id);
        return {
            start: seededRandom(seed + 'start', 1, 2),
            search: seededRandom(seed + 'search', 25, 30),
            scrape: seededRandom(seed + 'scrape', 64, 68),
            write: seededRandom(seed + 'write', 87, 92),
            complete: 100
        };
    }, [currentTask?.id]);

    const targetValue = useMemo(() => {
        if (!currentTask || !progressRanges) return 0;

        const status = currentTask.status;
        const steps = currentTask.steps || [];

        if (status === 'completed') return 100;
        if (status === 'failed') return displayValue; // Freeze on failure

        const stageOrder = ['search', 'scrape', 'write', 'critique'];
        let highestStageIdx = -1;
        let isHighestCompleted = false;

        const activeSteps = steps.filter(s => s.status === 'running' || s.status === 'completed');

        activeSteps.forEach(s => {
            const idx = stageOrder.indexOf(s.step_name);
            if (idx > highestStageIdx) {
                highestStageIdx = idx;
                isHighestCompleted = s.status === 'completed';
            } else if (idx === highestStageIdx && s.status === 'completed') {
                isHighestCompleted = true;
            }
        });

        if (highestStageIdx === -1) return progressRanges.start;

        const stage = stageOrder[highestStageIdx];

        if (isHighestCompleted) {
            if (stage === 'search') return progressRanges.search;
            if (stage === 'scrape') return progressRanges.scrape;
            if (stage === 'write') return progressRanges.write;
            if (stage === 'critique') return 100;
        } else {
            if (stage === 'search') return progressRanges.start + 5;
            if (stage === 'scrape') return progressRanges.search + 5;
            if (stage === 'write') return progressRanges.scrape + 5;
            if (stage === 'critique') return progressRanges.write + 3;
        }

        return progressRanges.start;
    }, [currentTask, progressRanges]);

    // Gradual Animation Effect (Catch up to targetValue)
    useEffect(() => {
        if (displayValue === targetValue) return;

        const timer = setInterval(() => {
            setDisplayValue(prev => {
                if (prev < targetValue) {
                    const diff = targetValue - prev;
                    const increment = Math.max(0.1, diff * 0.05); // Smooth logarithmic easing
                    return Math.min(targetValue, prev + increment);
                } else if (prev > targetValue) {
                    return targetValue; // Snap if somehow ahead
                }
                return prev;
            });
        }, 50); // 20fps for smooth movement

        return () => clearInterval(timer);
    }, [targetValue, displayValue]);

    // Reset displayValue on NEW task
    useEffect(() => {
        if (!currentTask) {
            setDisplayValue(0);
        }
    }, [currentTask?.id]);

    const hasTask = !!currentTask;
    const isActive = currentTask?.status === 'running' || currentTask?.status === 'queued';
    const isCompleted = currentTask?.status === 'completed';
    const isFailed = currentTask?.status === 'failed';

    const roundedDisplay = Math.round(displayValue);

    return (
        <div className="panel-section">
            <div className="panel-section-title">Research Progress</div>
            <div className="progress-percentage" style={{
                color: isFailed ? 'var(--error)' : (isCompleted ? '#10B981' : (hasTask ? '#22D3EE' : 'var(--text-dim)'))
            }}>
                {isFailed ? 'FAILED' : `${roundedDisplay}%`}
            </div>
            <div className="progress-bar-track">
                <div
                    className={`progress-bar-fill ${isActive ? 'progress-bar-fill--active' : ''}`}
                    style={{
                        width: `${displayValue}%`,
                    }}
                />
            </div>
            {hasTask && (
                <div className="progress-stats">
                    <div className="progress-stat">
                        <span className="progress-stat-label">System</span>
                        <span className="progress-stat-value">Active</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResearchProgress;
