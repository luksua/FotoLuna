import React from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onDownload?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    onDownload,
}) => {
    if (!isOpen) return null;

    const modal = (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Backdrop */}
            <div
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div style={{
                position: 'relative', backgroundColor: 'white', borderRadius: '8px',
                width: '90%', maxWidth: '800px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px', borderBottom: '1px solid #dee2e6'
                }}>
                    <h5 style={{ margin: 0, fontWeight: 'bold' }}>{title}</h5>
                    <button onClick={onClose} style={{
                        border: 'none', background: 'none', cursor: 'pointer'
                    }}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '16px', overflowY: 'auto' }}>
                    {children}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px', borderTop: '1px solid #dee2e6',
                    display: 'flex', justifyContent: 'flex-end', gap: '10px'
                }}>
                    <button onClick={onClose} className="btn btn-secondary">
                        Cerrar
                    </button>
                    {onDownload && (
                        <button onClick={onDownload} className="btn btn-success">
                            Descargar Excel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};
