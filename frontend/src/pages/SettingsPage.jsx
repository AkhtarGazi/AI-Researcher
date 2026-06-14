import React from 'react';
import { useResearch } from '../context/ResearchContext';

const SettingsPage = () => {
    const { prefs, updatePrefs } = useResearch();

    return (
        <div className="workspace-content fade-in" style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px' }}>Workspace Preferences</h1>

            <div className="workspace-card">
                <section className="settings-section">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Interface Configuration</h3>
                    <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <div className="settings-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Default Report View</div>
                        <select
                            className="workspace-input"
                            style={{ width: 'auto', padding: '6px 12px' }}
                            value={prefs.viewMode}
                            onChange={(e) => updatePrefs({ viewMode: e.target.value })}
                        >
                            <option value="document">Document</option>
                            <option value="card">Cards</option>
                        </select>
                    </div>
                    <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                        <div className="settings-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Workspace Theme</div>
                        <div className="settings-value" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Advanced Dark</div>
                    </div>
                </section>

                <section className="settings-section" style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px' }}>System Health</h3>
                    <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <div className="settings-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Intelligence Engine</div>
                        <div className="settings-value"><span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span></div>
                    </div>
                </section>

                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center' }}>
                    Intelligence Core v1.0 • Built for Deep Research
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
