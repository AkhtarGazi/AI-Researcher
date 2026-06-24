import React from 'react';
import { useResearch } from '../context/ResearchContext';

const NotificationToast = () => {
    const { toasts, removeToast } = useResearch();

    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <span>{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
