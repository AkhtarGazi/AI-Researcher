import React from 'react';
import { useResearch } from '../context/ResearchContext';

const NotificationToast = () => {
    const { toasts, removeToast } = useResearch();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' ? '✓' :
                            toast.type === 'error' ? '✕' : 'ℹ'}
                    </div>
                    <div className="toast-message">{toast.message}</div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
