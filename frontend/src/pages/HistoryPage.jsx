import React, { useState } from 'react';
import { useResearch } from '../context/ResearchContext';
import { researchService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
    const { history, fetchHistory, setCurrentTask } = useResearch();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredHistory = history.filter(item =>
        item.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this research?')) {
            try {
                await researchService.delete(id);
                fetchHistory();
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    const handleTaskClick = async (taskId) => {
        try {
            const response = await researchService.get(taskId);
            setCurrentTask(response.data);
            navigate('/');
        } catch (err) {
            console.error('Load task failed:', err);
        }
    };

    return (
        <div className="right-panel-content" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Research Library</h1>
                <input
                    type="text"
                    className="research-input"
                    placeholder="Search topics..."
                    style={{ width: '200px', padding: '8px 14px', fontSize: '0.8rem', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '0.85rem' }}>No research found. Start a new research task.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredHistory.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleTaskClick(item.id)}
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: 'var(--radius-md)',
                                padding: '16px 18px',
                                cursor: 'pointer',
                                transition: 'all 200ms',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                        >
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                {item.topic}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>{formatDate(item.created_at)}</span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '100px',
                                    fontSize: '0.62rem',
                                    fontWeight: 600,
                                    background: item.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: item.status === 'completed' ? 'var(--success)' : 'var(--error)',
                                }}>
                                    {item.status}
                                </span>
                                {item.quality_score && (
                                    <span style={{ color: 'var(--warning)' }}>⭐ {item.quality_score}/10</span>
                                )}
                                <button
                                    className="btn-ghost"
                                    style={{ marginLeft: 'auto', color: 'var(--error)', fontSize: '0.68rem', padding: '2px 8px' }}
                                    onClick={(e) => handleDelete(e, item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
