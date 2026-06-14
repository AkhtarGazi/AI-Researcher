import React from 'react';
import { NavLink } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';

const Sidebar = () => {
    const { history, setCurrentTask } = useResearch();

    return (
        <aside className="sidebar">
            <NavLink to="/" className="sidebar-logo">
                <div className="logo-box"></div>
                <span>Researcher</span>
            </NavLink>

            <button className="btn-primary" style={{ width: '100%', marginBottom: '24px' }} onClick={() => window.location.href = '/'}>
                + New Research
            </button>

            <nav className="sidebar-nav">
                <NavLink to="/" className="nav-item" end>
                    Workspace
                </NavLink>
                <NavLink to="/history" className="nav-item">
                    History
                </NavLink>
                <NavLink to="/settings" className="nav-item">
                    Settings
                </NavLink>
            </nav>

            <div className="sidebar-section">
                <div className="sidebar-label">Recent History</div>
                <div className="history-list">
                    {history.length > 0 ? (
                        history.slice(0, 8).map(item => (
                            <div
                                key={item.id}
                                className="history-item"
                                onClick={() => setCurrentTask(item)}
                                title={item.topic}
                            >
                                {item.topic}
                            </div>
                        ))
                    ) : (
                        <div className="history-item" style={{ opacity: 0.5, cursor: 'default' }}>No research yet</div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
                <div className="nav-item" style={{ cursor: 'pointer' }}>
                    User Profile
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
