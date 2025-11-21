// import "../styles/confirmModal.css"
// import React, { useEffect } from "react";
// import WarningIcon from "@mui/icons-material/Warning";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import InfoIcon from "@mui/icons-material/Info";
// import ErrorIcon from "@mui/icons-material/Error";

// export type ConfirmModalType = "warning" | "success" | "info" | "error";

// interface ConfirmModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onConfirm: () => void;
//     title: string;
//     message?: React.ReactNode;
//     confirmText?: string;
//     cancelText?: string;
//     type?: ConfirmModalType;
//     isLoading?: boolean;
// }

// const typeConfig = {
//     warning: {
//         icon: WarningIcon,
//         bg: "#FFF7D6",
//         border: "#F6C850",
//         color: "#B28900",
//         button: "btn-warning"
//     },
//     success: {
//         icon: CheckCircleIcon,
//         bg: "#E6F8EC",
//         border: "#49C774",
//         color: "#1D8B45",
//         button: "btn-success"
//     },
//     info: {
//         icon: InfoIcon,
//         bg: "#E6F1FF",
//         border: "#4C8DFF",
//         color: "#1D5CCB",
//         button: "btn-primary"
//     },
//     error: {
//         icon: ErrorIcon,
//         bg: "#FFE8E8",
//         border: "#E25A5A",
//         color: "#B20A0A",
//         button: "btn-danger"
//     }
// };

// export const ConfirmModal: React.FC<ConfirmModalProps> = ({
//     isOpen,
//     onClose,
//     onConfirm,
//     title,
//     message,
//     confirmText = "Confirmar",
//     cancelText = "Cancelar",
//     type = "warning",
//     isLoading = false,
// }) => {
//     const config = typeConfig[type];
//     const Icon = config.icon;

//     // Bloquear scroll del body
//     useEffect(() => {
//         document.body.style.overflow = isOpen ? "hidden" : "auto";
//     }, [isOpen]);

//     if (!isOpen) return null;

//     return (
//         <>
//             {/* Fondo oscuro */}
//             <div className="confirm-backdrop" onClick={() => !isLoading && onClose()} />

//             {/* Contenedor del modal */}
//             <div className="confirm-modal-container">
//                 <div className="modal-content rounded-4 shadow-lg p-4" style={{ maxWidth: 420 }}>

//                     {/* Icono */}
//                     <div
//                         className="confirm-circle"
//                         style={{
//                             background: config.bg,
//                             borderColor: config.border,
//                             color: config.color,
//                         }}
//                     >
//                         <Icon style={{ fontSize: 40 }} />
//                     </div>

//                     {/* Título */}
//                     <h3 className="fw-bold text-center mt-3">{title}</h3>

//                     {/* Mensaje */}
//                     <p className="text-center mt-2">{message}</p>

//                     {/* Botones */}
//                     <div className="d-flex gap-3 mt-4">
//                         <button
//                             className="btn btn-outline-secondary w-50"
//                             disabled={isLoading}
//                             onClick={onClose}
//                         >
//                             {cancelText}
//                         </button>

//                         <button
//                             className={`btn w-50 text-white ${config.button}`}
//                             disabled={isLoading}
//                             onClick={onConfirm}
//                         >
//                             {isLoading ? (
//                                 <span className="spinner-border spinner-border-sm me-2"></span>
//                             ) : null}

//                             {isLoading ? "Procesando..." : confirmText}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

import React from "react";
import { createPortal } from "react-dom";
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
    warning: { icon: WarningIcon, color: "#B28900" },
    success: { icon: CheckCircleIcon, color: "#1D8B45" },
    info: { icon: InfoIcon, color: "#1D5CCB" },
    error: { icon: ErrorIcon, color: "#B20A0A" },
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
    if (!isOpen) return null;

    const config = typeConfig[type];
    const Icon = config.icon;

    // DEBUG: para asegurar que se está renderizando
    console.log("ConfirmModal renderizado, isOpen:", isOpen);

    const modal = (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Fondo oscuro */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                }}
                onClick={() => !isLoading && onClose()}
            />

            {/* Caja del modal */}
            <div
                style={{
                    position: "relative",
                    zIndex: 100000,
                    backgroundColor: "white",
                    padding: "24px 20px",
                    borderRadius: "16px",
                    maxWidth: "420px",
                    width: "100%",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    textAlign: "center",
                }}
            >
                <div style={{ marginBottom: "12px" }}>
                    <Icon style={{ fontSize: 40, color: config.color }} />
                </div>

                <h3
                    style={{
                        margin: "0 0 8px",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#212529",
                    }}
                >
                    {title}
                </h3>

                {message && (
                    <p
                        style={{
                            margin: "0 0 16px",
                            fontSize: "14px",
                            color: "#6c757d",
                        }}
                    >
                        {message}
                    </p>
                )}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "16px",
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #ced4da",
                            backgroundColor: "#e9ecef",
                            color: "#495057",
                            fontWeight: 500,
                            cursor: isLoading ? "default" : "pointer",
                        }}
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#dc3545",
                            color: "white",
                            fontWeight: 500,
                            cursor: isLoading ? "default" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};
