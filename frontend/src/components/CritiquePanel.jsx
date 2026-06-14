import React from 'react';

const CritiquePanel = ({ critique }) => {
    if (!critique) return null;

    const { score, text } = critique;
    const numScore = parseFloat(score);

    const getScoreClass = () => {
        if (numScore >= 7) return 'high';
        if (numScore >= 4) return 'medium';
        return 'low';
    };

    const getScoreColor = () => {
        if (numScore >= 7) return '#10B981';
        if (numScore >= 4) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className="glass-card report-card animate-fade-in" style={{ marginTop: '24px' }}>
            <div className="report-card-header">
                <div className="report-card-title">
                    <div className="report-card-icon critique">⚖️</div>
                    Quality Analysis
                </div>
            </div>

            <div className="critique-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div className="score-viz" style={{ flexShrink: 0 }}>
                    <div
                        className={`score-circle ${getScoreClass()}`}
                        style={{
                            '--score-pct': (numScore || 0) * 10,
                            '--score-color': getScoreColor()
                        }}
                    >
                        {numScore || '?'}
                    </div>
                    <div className="score-label" style={{ textAlign: 'center', marginTop: '8px' }}>
                        Score / 10
                    </div>
                </div>

                <div className="critique-body">
                    <div className="score-verdict" style={{ marginBottom: '8px' }}>
                        {numScore >= 8 ? 'Exceptional Coverage' :
                            numScore >= 6 ? 'Comprehensive Analysis' :
                                numScore >= 4 ? 'General Overview' : 'Requires Further Research'}
                    </div>
                    <div
                        className="text-secondary"
                        style={{ fontSize: '0.85rem', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CritiquePanel;
