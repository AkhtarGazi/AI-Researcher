import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QualityScore from './QualityScore';

const CritiquePanel = ({ critique }) => {
    if (!critique) return null;

    const score = critique?.score ?? null;
    const text = typeof critique === 'string' ? critique : (critique?.text || '');

    return (
        <div className="critique-panel">
            <div className="critique-header">
                <span className="critique-title">⚖️ AI Critique</span>
                {score !== null && <QualityScore score={score} />}
            </div>
            {text && (
                <div className="nb-prose critique-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default CritiquePanel;
