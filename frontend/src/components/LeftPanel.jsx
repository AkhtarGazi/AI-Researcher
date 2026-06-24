import React, { useState, useEffect, useMemo } from 'react';
import { useResearch } from '../context/ResearchContext';
import ResearchPipeline from './ResearchPipeline';
import AgentActivity from './AgentActivity';
import ResearchProgress from './ResearchProgress';
import ResearchLog from './ResearchLog';

const LeftPanel = () => {
    const { currentTask } = useResearch();
    const [readingProgress, setReadingProgress] = useState(0);

    const showReadingProgress = currentTask?.status === 'completed' && currentTask?.report;

    // Derived stats for reading progress
    const readingStats = useMemo(() => {
        if (!currentTask?.report) return null;

        const report = currentTask.report;
        const sectionsCount = report.sections?.length || 0;

        // Simple word count for estimated reading time
        // Typical adult reading speed: 200-250 wpm
        const fullText = report.full_text || '';
        const wordCount = fullText.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 225));

        return {
            sectionsCount,
            readingTime
        };
    }, [currentTask?.report]);

    // Track reading progress from the right panel scroll
    useEffect(() => {
        const rightContent = document.querySelector('.right-panel-content');
        if (!rightContent) return;

        const handleScroll = () => {
            const scrollTop = rightContent.scrollTop;
            const scrollHeight = rightContent.scrollHeight - rightContent.clientHeight;
            if (scrollHeight > 0) {
                setReadingProgress(Math.round((scrollTop / scrollHeight) * 100));
            } else {
                setReadingProgress(0);
            }
        };

        rightContent.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => rightContent.removeEventListener('scroll', handleScroll);
    }, [currentTask]);

    return (
        <aside className="left-panel">
            <div className="left-panel-scroll">
                <ResearchPipeline />
                <AgentActivity />
                <ResearchProgress />
                <ResearchLog />
            </div>

            {showReadingProgress && (
                <div className="reading-progress-section">
                    <div className="reading-progress-label">Reading Progress</div>
                    <div className="reading-progress-track">
                        <div className="reading-progress-fill" style={{ width: `${readingProgress}%` }} />
                    </div>
                    <div className="reading-progress-stats">
                        <span>{readingProgress}% read</span>
                        <span>{readingStats?.readingTime} min read</span>
                    </div>
                    <div className="reading-progress-stats" style={{ marginTop: '4px', opacity: 0.8 }}>
                        <span>{readingStats?.sectionsCount} key sections</span>
                        <span>{currentTask?.critique?.score ? `Score: ${currentTask.critique.score}/10` : ''}</span>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default LeftPanel;
