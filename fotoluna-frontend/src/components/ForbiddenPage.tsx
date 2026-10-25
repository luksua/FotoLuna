import React from "react";

export const ForbiddenPage: React.FC = () => {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f8",
                fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    padding: "32px 40px",
                    borderRadius: 12,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                    maxWidth: 480,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        margin: "0 auto 16px",
                        backgroundColor: "#805FA6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        fontWeight: 700,
                    }}
                >
                    403
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Acceso restringido</h2>
                <p style={{ margin: "0 0 24px", fontSize: 14, color: "#555" }}>
                    No tienes permisos para ver esta página. Si crees que se trata de un error,
                    ponte en contacto con el administrador del sistema.
                </p>
                <a
                    href="/"
                    style={{
                        display: "inline-block",
                        padding: "8px 18px",
                        borderRadius: 6,
                        backgroundColor: "#805FA6",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 14,
                    }}
                >
                    Volver al inicio
                </a>
            </div>
        </div>
    );
};
