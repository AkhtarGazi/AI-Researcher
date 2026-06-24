import React from 'react';
import { useResearch } from '../context/ResearchContext';

const SettingsPage = () => {
    const { prefs, updatePrefs } = useResearch();

    return (
        <div className="right-panel-content" style={{ padding: '24px 28px', maxWidth: '560px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '24px' }}>
                Workspace Preferences
            </h1>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Interface
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Default Report View</span>
                    <select
                        style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            padding: '5px 10px',
                            fontSize: '0.78rem',
                            fontFamily: 'inherit',
                            outline: 'none',
                        }}
                        value={prefs.viewMode}
                        onChange={(e) => updatePrefs({ viewMode: e.target.value })}
                    >
                        <option value="document">Document</option>
                        <option value="card">Cards</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Theme</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Advanced Dark</span>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        System
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Intelligence Engine</span>
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '2px 10px',
                            borderRadius: '100px',
                            background: 'rgba(16,185,129,0.1)',
                            color: 'var(--success)'
                        }}>Active</span>
                    </div>
                </div>

                <div style={{
                    marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)',
                    color: 'var(--text-dim)', fontSize: '0.68rem', textAlign: 'center'
                }}>
                    Intelligence Core v1.0 • Built for Deep Research
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
