import React, { useEffect, useState } from 'react';
import { useResearch } from '../context/ResearchContext';
import ResearchForm from '../components/ResearchForm';
import AgentStatusRail from '../components/AgentStatusRail';
import ReportViewer from '../components/ReportViewer';
import CritiquePanel from '../components/CritiquePanel';
import AIOrb from '../components/AIOrb';
import ReadingProgressBar from '../components/ReadingProgressBar';

const HomePage = () => {
    const { currentTask, loading, error, prefs, updatePrefs, cancelResearch } = useResearch();
    const [readingProgress, setReadingProgress] = useState(0);

    // Monitor workspace scroll for reading progress
    useEffect(() => {
        const workspace = document.querySelector('.main-workspace');
        if (!workspace) return;

        const handleScroll = () => {
            const winScroll = workspace.scrollTop;
            const height = workspace.scrollHeight - workspace.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setReadingProgress(scrolled);
        };

        workspace.addEventListener('scroll', handleScroll);
        return () => workspace.removeEventListener('scroll', handleScroll);
    }, [currentTask]);

    const getProcessingStep = () => {
        if (!currentTask || currentTask.status !== 'running') return 'pending';
        const runningStep = currentTask.steps?.find(s => s.status === 'running');
        return runningStep ? runningStep.step_name : 'pending';
    };

    return (
        <div className="workspace-content animate-fade-in">
            {/* Search Input Area */}
            {(!currentTask || currentTask.status === 'completed' || currentTask.status === 'failed' || currentTask.status === 'cancelled') && (
                <section style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
                        New Research Task
                    </h1>
                    <ResearchForm />
                </section>
            )}

            {/* Progress & Results Area */}
            {(currentTask || loading) && (
                <div className="workspace-results">
                    {/* Persistent Status Rail */}
                    <AgentStatusRail steps={currentTask?.steps} />

                    {/* Central AI Orb (Jarvis Style) */}
                    {(currentTask?.status === 'running' || currentTask?.status === 'queued') && (
                        <div className="jarvis-container">
                            <AIOrb state={getProcessingStep()} />
                        </div>
                    )}

                    {/* Report Viewer (Replaces Orb) */}
                    {currentTask?.status === 'completed' && (
                        <div style={{ marginTop: '20px' }}>
                            <div className="action-bar" style={{ position: 'static', background: 'transparent', border: 'none', padding: '0 0 20px', display: 'flex', justifyContent: 'space-between' }}>
                                <div className="view-toggle" style={{ margin: 0 }}>
                                    <button
                                        className={`view-toggle-btn ${prefs.viewMode === 'card' ? 'active' : ''}`}
                                        onClick={() => updatePrefs({ viewMode: 'card' })}
                                    >
                                        Cards
                                    </button>
                                    <button
                                        className={`view-toggle-btn ${prefs.viewMode === 'document' ? 'active' : ''}`}
                                        onClick={() => updatePrefs({ viewMode: 'document' })}
                                    >
                                        Document
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-secondary btn-sm" onClick={() => window.print()}>Export PDF</button>
                                    <button className="btn-secondary btn-sm" onClick={() => {
                                        navigator.clipboard.writeText(currentTask.report.full_text);
                                    }}>Copy MD</button>
                                </div>
                            </div>

                            <ReportViewer
                                report={currentTask.report}
                                viewMode={prefs.viewMode}
                            />

                            <CritiquePanel critique={currentTask.critique} />
                        </div>
                    )}

                    {/* Error State */}
                    {currentTask?.status === 'failed' && (
                        <div className="workspace-card" style={{ borderColor: 'var(--error)', textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--error)', marginBottom: '12px' }}>Research Failure</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{currentTask.error_message}</p>
                            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Progress (only for completed reports) */}
            {currentTask?.status === 'completed' && (
                <ReadingProgressBar progress={readingProgress} />
            )}
        </div>
    );
};

export default HomePage;
