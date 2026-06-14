import React, { useState } from 'react';
import { useResearch } from '../context/ResearchContext';
import { researchService } from '../services/api';

const HistoryPage = () => {
    const { history, fetchHistory, setCurrentTask } = useResearch();
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredHistory = history.filter(item =>
        item.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this research?')) {
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
            // Navigate to home to show the task
            window.scrollTo(0, 0);
            document.querySelector('.navbar-link').click(); // Crude but works for simple routing
        } catch (err) {
            console.error('Load task failed:', err);
        }
    };

    return (
        <div className="workspace-content fade-in">
            <div className="history-header">
                <h1 className="history-title">Research Library</h1>
                <div className="history-filters">
                    <input
                        type="text"
                        className="workspace-input"
                        placeholder="Search topics..."
                        style={{ width: '240px', padding: '10px 16px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="workspace-card" style={{ textAlign: 'center' }}>
                    <h3>Empty Library</h3>
                    <p>Begin a new exploration to start your collection.</p>
                </div>
            ) : (
                <div className="history-grid">
                    {filteredHistory.map((item) => (
                        <div key={item.id} className="workspace-card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => handleTaskClick(item.id)}>
                            <div className="history-card-topic">{item.topic}</div>
                            <div className="history-card-meta">
                                <span>{formatDate(item.created_at)}</span>
                                <span className={`badge ${item.status === 'completed' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem' }}>
                                    {item.status}
                                </span>
                                {item.quality_score && (
                                    <span className="score-mini">
                                        ⭐ {item.quality_score}/10
                                    </span>
                                )}
                            </div>
                            <div className="history-card-actions">
                                <button className="btn-ghost btn-sm" style={{ color: 'var(--error)', padding: '4px 0' }} onClick={(e) => handleDelete(e, item.id)}>
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
