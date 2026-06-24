import React, { useState, useMemo } from 'react';
import { useResearch } from '../context/ResearchContext';

const ResearchForm = () => {
    const [topic, setTopic] = useState('');
    const { startResearch, loading, recentTopics } = useResearch();
    const [localError, setLocalError] = useState('');

    // Dynamic placeholder based on recent research
    const placeholderText = useMemo(() => {
        if (recentTopics && recentTopics.length > 0) {
            const last = recentTopics[0];
            const truncated = last.length > 40 ? last.substring(0, 40) + '...' : last;
            return `Example: ${truncated}`;
        }
        return "Research any topic...";
    }, [recentTopics]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = topic.trim();

        if (trimmed.length < 5) {
            setLocalError('Topic must be at least 5 characters.');
            return;
        }
        if (trimmed.length > 500) {
            setLocalError('Topic must be less than 500 characters.');
            return;
        }

        setLocalError('');
        try {
            await startResearch(trimmed);
            setTopic('');
        } catch (err) {
            // Error handled in context
        }
    };

    return (
        <div className="research-input-bar">
            <form onSubmit={handleSubmit}>
                <div className="research-input-wrapper">
                    <input
                        type="text"
                        className="research-input"
                        placeholder={placeholderText}
                        value={topic}
                        onChange={(e) => {
                            setTopic(e.target.value);
                            if (localError) setLocalError('');
                        }}
                        disabled={loading}
                    />
                    <button type="button" className="input-action-btn" title="Attach file">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                    </button>
                    <button type="button" className="input-action-btn" title="Voice input">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    </button>
                    <button
                        type="submit"
                        className="input-send-btn"
                        disabled={loading || !topic.trim()}
                        title="Start Research"
                    >
                        {loading ? (
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="char-counter">{topic.length}/500</div>
                {localError && <div className="form-error">{localError}</div>}
            </form>
        </div>
    );
};

export default ResearchForm;
