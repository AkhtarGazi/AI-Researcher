import React from 'react';
import { useResearch } from '../context/ResearchContext';
import ResearchForm from '../components/ResearchForm';
import ReportViewer from '../components/ReportViewer';
import CritiquePanel from '../components/CritiquePanel';
import NeuralCore from '../components/NeuralCore';
import { exportReportPDF } from '../services/pdfExport';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Map task status → neural core visual state ── */
const getAgentState = (task) => {
    if (!task) return 'idle';
    switch (task.status) {
        case 'running':
        case 'queued': return 'running';
        case 'completed': return 'completed';
        case 'failed': return 'failed';
        default: return 'idle';
    }
};

/* ── State badge ── */
const StateBadge = ({ status }) => {
    const cfg = {
        idle: { label: 'Ready', cls: 'state-idle' },
        running: { label: 'Processing', cls: 'state-running' },
        completed: { label: 'Completed', cls: 'state-completed' },
        failed: { label: 'Failed', cls: 'state-failed' },
    };
    const { label, cls } = cfg[status] || cfg.idle;
    return <span className={`agent-state-badge ${cls}`}>{label}</span>;
};

const HomePage = () => {
    const { currentTask } = useResearch();

    const status = currentTask?.status || 'idle';
    const isIdle = !currentTask || status === 'cancelled';
    const isRunning = status === 'running' || status === 'queued';
    const isCompleted = status === 'completed';
    const isFailed = status === 'failed';

    const handleExportPDF = async () => {
        if (!currentTask?.report) return;
        try {
            await exportReportPDF(currentTask);
        } catch (err) {
            console.error('PDF export failed:', err);
        }
    };

    return (
        <>
            <div className="right-panel-content">
                <AnimatePresence mode="wait">

                    {/* ── Idle / Welcome ── */}
                    {isIdle && (
                        <motion.div key="welcome" className="welcome-state"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}>
                            <NeuralCore agentState="idle" />
                            <StateBadge status="idle" />
                            <div className="welcome-text">
                                <h1 className="welcome-title">AI Research Workspace</h1>
                                <p className="welcome-subtitle">
                                    Multiple AI agents working in parallel to search, read, analyze, and generate comprehensive research reports.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Running ── */}
                    {isRunning && (
                        <motion.div key="running" className="welcome-state"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6 }}>
                            <NeuralCore agentState="running" />
                            <StateBadge status="running" />
                            <div className="welcome-text">
                                <h1 className="welcome-title">Researching…</h1>
                                <p className="welcome-subtitle">
                                    {currentTask?.topic || 'AI agents are actively processing your research task'}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Completed ── */}
                    {isCompleted && (
                        <motion.div key="report" className="report-area"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}>

                            <div className="report-header">
                                <div className="report-header-left">
                                    <NeuralCore agentState="completed" />
                                    <div>
                                        <h2 className="report-title">{currentTask?.topic}</h2>
                                        <StateBadge status="completed" />
                                    </div>
                                </div>
                                <div className="report-actions">
                                    <button className="btn-ghost" onClick={handleExportPDF}>
                                        ⬇ Download PDF
                                    </button>
                                    <button className="btn-ghost" onClick={() => {
                                        const text = currentTask?.report?.full_text || '';
                                        if (text) navigator.clipboard.writeText(text);
                                    }}>
                                        Copy MD
                                    </button>
                                </div>
                            </div>

                            <ReportViewer report={currentTask?.report} />
                            <CritiquePanel critique={currentTask?.critique} />
                        </motion.div>
                    )}

                    {/* ── Failed ── */}
                    {isFailed && (
                        <motion.div key="error" className="welcome-state"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}>
                            <NeuralCore agentState="failed" />
                            <StateBadge status="failed" />
                            <div className="error-card">
                                <h3>Research Failed</h3>
                                <p>{currentTask?.error_message || 'An unexpected error occurred.'}</p>
                                <button className="btn-primary" onClick={() => window.location.reload()}>
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <ResearchForm />
        </>
    );
};

export default HomePage;
