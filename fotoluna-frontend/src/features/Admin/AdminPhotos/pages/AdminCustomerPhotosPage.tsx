// AdminPhotos/pages/AdminCustomerPhotosPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import { PhotoModal } from "../Components/PhotoModal"; // Importar el Modal

// 🚨 USAMOS LA URL BASE MÁS COMÚN
const API_BASE_URL = "http://127.0.0.1:8000/api";

interface PhotoItem {
    id: number;
    url: string;
    event_name: string;
    created_at: string;
    original_name: string;
    size: number;
}

interface ApiResponse {
    message: string;
    photos: PhotoItem[];
    current_page: number;
    last_page: number;
    total: number;
}

const AdminCustomerPhotosPage: React.FC = () => {
    // Usamos string para customerId ya que viene de la URL (useParams)
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();

    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🚨 ESTADO ÚNICO DEL MODAL: Si es null, el modal está cerrado.
    const [modalPhoto, setModalPhoto] = useState<PhotoItem | null>(null);

    const perPage = 24;

    const fetchPhotos = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay sesión activa. Inicia sesión de nuevo.");

            // RUTA API: Obtiene las fotos de ese cliente específico
            const url = `${API_BASE_URL}/employee/customers/${customerId}/cloud-photos?page=${page}&per_page=${perPage}`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (res.status === 401 || res.status === 403) {
                throw new Error("No tienes permiso para ver las fotos de este cliente (401/403).");
            }

            if (!res.ok) {
                throw new Error("Error al cargar las fotos: " + res.statusText);
            }

            const data: ApiResponse = await res.json();

            setPhotos(data.photos);
            setCurrentPage(data.current_page);
            setLastPage(data.last_page);
            setTotal(data.total);
        } catch (err: any) {
            console.error(err);
            // El error de CORS se capturaría aquí como "TypeError: Failed to fetch"
            setError(err.message ?? "Error al cargar las fotos del cliente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > lastPage) return;
        fetchPhotos(page);
    };

    const formatSize = (bytes: number) => {
        if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        if (bytes > 1024) return (bytes / 1024).toFixed(1) + " KB";
        return bytes + " B";
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setModalPhoto(null);
    };

    return (
        <HomeLayout>
            <div style={{ padding: "1.5rem" }}>
                <button
                    onClick={() => navigate("/admin/photos")}
                    style={{
                        marginBottom: "1rem",
                        borderRadius: 999,
                        padding: "0.4rem 1rem",
                        fontSize: 14,
                        cursor: "pointer",
                        border: "1px solid #d1d5db",
                        background: "#fff",
                    }}
                >
                    ← Volver a clientes
                </button>

                <h1>Galería completa del cliente #{customerId}</h1>

                {loading && <p>Cargando fotos...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && photos.length === 0 && (
                    <p>No se encontraron fotos para este cliente.</p>
                )}

                {!loading && !error && photos.length > 0 && (
                    <>
                        <p style={{ fontSize: 13, color: "#6b7280" }}>
                            Total: {total} fotos · Página {currentPage} de {lastPage}
                        </p>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                gap: "0.8rem",
                                marginTop: "1rem",
                            }}
                        >
                            {photos.map((photo) => (
                                <button
                                    key={photo.id}
                                    type="button"
                                    // 🚨 CLIC: solo establece UN estado del modal.
                                    onClick={() => setModalPhoto(photo)}
                                    style={{
                                        border: "none",
                                        background: "#fff",
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                >
                                    <div style={{ width: "100%", height: 170, background: "#e5e7eb" }}>
                                        <img
                                            src={photo.url}
                                            alt={photo.original_name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                    <div style={{ padding: "0.5rem 0.75rem" }}>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {photo.original_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                                            {photo.event_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                                            {photo.created_at} · {formatSize(photo.size)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Paginación */}
                        <div
                            style={{
                                marginTop: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                            >
                                ← Anterior
                            </button>
                            <span style={{ fontSize: 13, color: "#6b7280" }}>
                                Página {currentPage} de {lastPage}
                            </span>
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= lastPage}
                            >
                                Siguiente →
                            </button>
                        </div>
                    </>
                )}

                {/* Modal renderizado solo si modalPhoto tiene valor */}
                {modalPhoto && (
                    <div
                        // 🚨 CLIC EN EL BACKDROP CIERRA EL MODAL
                        onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.75)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 9999,
                            padding: 16,
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <header
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderBottom: "1px solid #e5e7eb",
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                                        {modalPhoto.original_name}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {modalPhoto.event_name} · {modalPhoto.created_at}
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal} // Usamos la función de cierre dedicada
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        fontSize: 22,
                                        cursor: "pointer",
                                    }}
                                >
                                    ×
                                </button>
                            </header>

                            <div style={{ padding: 12, textAlign: "center" }}>
                                <img
                                    src={modalPhoto.url}
                                    alt={modalPhoto.original_name}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "75vh",
                                        borderRadius: 12,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default AdminCustomerPhotosPage;