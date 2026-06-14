import React, { useState } from 'react';
import { useResearch } from '../context/ResearchContext';

const ResearchForm = () => {
    const [topic, setTopic] = useState('');
    const { startResearch, loading, recentTopics } = useResearch();
    const [localError, setLocalError] = useState('');

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
        <div className="research-form animate-slide-up">
            <form onSubmit={handleSubmit}>
                <div className="research-input-wrapper">
                    <input
                        type="text"
                        className="input"
                        placeholder="What would you like to research today?"
                        value={topic}
                        onChange={(e) => {
                            setTopic(e.target.value);
                            if (localError) setLocalError('');
                        }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !topic.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spin" style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
                                Starting...
                            </>
                        ) : (
                            'Start Research'
                        )}
                    </button>
                    <div className="char-count">
                        {topic.length}/500
                    </div>
                </div>
                {localError && <div className="form-error">{localError}</div>}
            </form>

            {recentTopics.length > 0 && !loading && (
                <div className="recent-searches">
                    {recentTopics.map((t, idx) => (
                        <button
                            key={idx}
                            className="recent-chip"
                            onClick={() => setTopic(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResearchForm;
