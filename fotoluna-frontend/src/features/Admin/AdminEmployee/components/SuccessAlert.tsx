import React, { useEffect } from 'react';
import '../styles/SuccessAlert.css';

interface SuccessAlertProps {
    message: string;
    visible: boolean;
    onClose: () => void;
    type?: 'success' | 'error';
    autoCloseDuration?: number;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({
    message,
    visible,
    onClose,
    type = 'success',
    autoCloseDuration = 4000,
}) => {
    useEffect(() => {
        if (visible && autoCloseDuration > 0) {
            const timer = setTimeout(onClose, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [visible, autoCloseDuration, onClose]);

    if (!visible) return null;

    return (
        <div className={`success-alert alert-${type}`}>
            <div className="alert-content">
                <span className="alert-icon">
                    {type === 'success' ? '✓' : '✕'}
                </span>
                <span className="alert-message">{message}</span>
            </div>
            <button
                className="alert-close"
                onClick={onClose}
                aria-label="Cerrar alerta"
            >
                ×
            </button>
        </div>
    );
};

export default SuccessAlert;
