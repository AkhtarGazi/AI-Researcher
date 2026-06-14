import React from 'react';

const ReadingProgressBar = ({ progress }) => {
    if (progress <= 0) return null;

    return (
        <div className="progress-container">
            <div className="progress-track" title={`${Math.round(progress)}% read`}>
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="progress-label">{Math.round(progress)}% Read</div>
        </div>
    );
};

export default ReadingProgressBar;
