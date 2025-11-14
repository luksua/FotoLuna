import "../styles/confirmModal.css"
import React, { useEffect } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";

export type ConfirmModalType = "warning" | "success" | "info" | "error";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmModalType;
    isLoading?: boolean;
}

const typeConfig = {
    warning: {
        icon: WarningIcon,
        bg: "#FFF7D6",
        border: "#F6C850",
        color: "#B28900",
        button: "btn-warning"
    },
    success: {
        icon: CheckCircleIcon,
        bg: "#E6F8EC",
        border: "#49C774",
        color: "#1D8B45",
        button: "btn-success"
    },
    info: {
        icon: InfoIcon,
        bg: "#E6F1FF",
        border: "#4C8DFF",
        color: "#1D5CCB",
        button: "btn-primary"
    },
    error: {
        icon: ErrorIcon,
        bg: "#FFE8E8",
        border: "#E25A5A",
        color: "#B20A0A",
        button: "btn-danger"
    }
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "warning",
    isLoading = false,
}) => {
    const config = typeConfig[type];
    const Icon = config.icon;

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Fondo oscuro */}
            <div className="confirm-backdrop" onClick={() => !isLoading && onClose()} />

            {/* Contenedor del modal */}
            <div className="confirm-modal-container">
                <div className="modal-content rounded-4 shadow-lg p-4" style={{ maxWidth: 420 }}>
                    
                    {/* Icono */}
                    <div
                        className="confirm-circle"
                        style={{
                            background: config.bg,
                            borderColor: config.border,
                            color: config.color,
                        }}
                    >
                        <Icon style={{ fontSize: 40 }} />
                    </div>

                    {/* Título */}
                    <h3 className="fw-bold text-center mt-3">{title}</h3>

                    {/* Mensaje */}
                    <p className="text-center mt-2">{message}</p>

                    {/* Botones */}
                    <div className="d-flex gap-3 mt-4">
                        <button
                            className="btn btn-outline-secondary w-50"
                            disabled={isLoading}
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>

                        <button
                            className={`btn w-50 text-white ${config.button}`}
                            disabled={isLoading}
                            onClick={onConfirm}
                        >
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : null}

                            {isLoading ? "Procesando..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
