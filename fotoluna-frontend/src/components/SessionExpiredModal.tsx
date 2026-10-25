import React from "react";
import { createPortal } from "react-dom";

interface SessionExpiredModalProps {
    open: boolean;
    onLoginAgain: () => void;
    onClose: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
    open,
    onLoginAgain,
    onClose,
}) => {
    if (!open) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.6)",
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    width: "100%",
                    maxWidth: 520,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                    overflow: "hidden",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
            >
                {/* Franja morada superior */}
                <div
                    style={{
                        backgroundColor: "#805FA6", // tu morado
                        color: "#fff",
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            border: "2px solid #fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                        }}
                    >
                        !
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Sesión expirada</h3>
                </div>

                {/* Contenido */}
                <div style={{ padding: "24px 24px 16px" }}>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#333" }}>
                        Tu sesión ha expirado por inactividad. Vuelve a iniciar sesión para continuar usando FotoLuna.
                    </p>
                </div>

                {/* Botones */}
                <div
                    style={{
                        padding: "16px 24px 24px",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "#555",
                            fontSize: 14,
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={onLoginAgain}
                        style={{
                            border: "none",
                            backgroundColor: "#805FA6",
                            color: "#fff",
                            padding: "8px 20px",
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        Volver a iniciar sesión
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
