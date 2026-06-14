import React, { useState } from 'react';

const ReportCard = ({ title, icon, iconClass, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={`glass-card report-card animate-fade-in`}>
            <div className="report-card-header">
                <div className="report-card-title">
                    <div className={`report-card-icon ${iconClass}`}>{icon}</div>
                    {title}
                </div>
                <button
                    className="btn-ghost btn-sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Collapse' : 'Expand'}
                </button>
            </div>
            <div className={`report-card-body ${!isExpanded ? 'collapsed' : ''}`}>
                {children}
            </div>
            {!isExpanded && (
                <button className="expand-btn" onClick={() => setIsExpanded(true)}>
                    Read full section
                </button>
            )}
        </div>
    );
};

const ReportViewer = ({ report, viewMode }) => {
    if (!report) return null;

    const { introduction, findings, conclusion, sources, full_text } = report;

    if (viewMode === 'card') {
        return (
            <div className="report-cards">
                {introduction && (
                    <ReportCard title="Introduction" icon="📝" iconClass="intro">
                        <div dangerouslySetInnerHTML={{ __html: introduction.replace(/\n/g, '<br/>') }} />
                    </ReportCard>
                )}
                {findings && (
                    <ReportCard title="Key Findings" icon="💡" iconClass="findings">
                        <div dangerouslySetInnerHTML={{ __html: findings.replace(/\n/g, '<br/>') }} />
                    </ReportCard>
                )}
                {conclusion && (
                    <ReportCard title="Conclusion" icon="🎯" iconClass="conclusion">
                        <div dangerouslySetInnerHTML={{ __html: conclusion.replace(/\n/g, '<br/>') }} />
                    </ReportCard>
                )}
                {sources && (
                    <ReportCard title="Sources & References" icon="📚" iconClass="sources" defaultExpanded={false}>
                        <div dangerouslySetInnerHTML={{ __html: sources.replace(/\n/g, '<br/>') }} />
                    </ReportCard>
                )}
            </div>
        );
    }

    // Document View
    return (
        <div className="document-view animate-slide-up">
            <div className="markdown-content">
                {/* Simple markdown-to-html like rendering for the full text */}
                {full_text.split('\n\n').map((para, i) => {
                    if (para.startsWith('##')) {
                        return <h2 key={i}>{para.replace('##', '').trim()}</h2>;
                    } else if (para.startsWith('#')) {
                        return <h1 key={i}>{para.replace('#', '').trim()}</h1>;
                    } else if (para.startsWith('- ') || para.startsWith('* ')) {
                        return (
                            <ul key={i}>
                                {para.split('\n').map((li, j) => (
                                    <li key={j}>{li.replace(/^[-*]\s+/, '')}</li>
                                ))}
                            </ul>
                        );
                    }
                    return <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\n/g, '<br/>') }} />;
                })}
            </div>
        </div>
    );
};

export default ReportViewer;
