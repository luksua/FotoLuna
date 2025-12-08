// src/Components/ClientGallery.tsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
// Quitamos Dropdown y Form porque usaremos estilos personalizados más limpios
import { Pagination, Spinner } from "react-bootstrap";

const API_URL = "http://localhost:8000/api";

interface Photo {
    id: number;
    url: string;
    event_name: string;
    created_at: string;
    original_name: string;
}

interface ClientGalleryProps {
    clientId: number | null;
}

const ClientGallery: React.FC<ClientGalleryProps> = ({ clientId }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [orderBy, setOrderBy] = useState("created_at");
    const [eventFilter, setEventFilter] = useState("Todos");
    const photosPerPage = 20;

    const fetchPhotos = useCallback(async () => {
        if (!clientId) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_URL}/employee/customers/${clientId}/cloud-photos`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                params: {
                    page: page,
                    per_page: photosPerPage,
                    order_by: orderBy,
                    event: eventFilter !== "Todos" ? eventFilter : undefined,
                },
            });

            // Ajusta esto según la estructura real de tu respuesta API (ej: response.data.photos.data)
            const photosData = response.data.photos.data || response.data.photos || [];
            const lastPage = response.data.photos.last_page || response.data.last_page || 1;

            setPhotos(photosData);
            setTotalPages(lastPage);

        } catch (err: any) {
            console.error("Error cargando fotos del cliente", err);
            if (err.response && err.response.status === 403) {
                setError("El plan de almacenamiento del cliente no está activo.");
            } else {
                setError("No se pudieron cargar las fotos.");
            }
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    }, [clientId, page, orderBy, eventFilter]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // Opciones de eventos únicas
    const eventOptions = [...new Set(photos.map(p => p.event_name))];

    if (loading && photos.length === 0) return (
        <div className="text-center p-5">
            <Spinner animation="border" variant="secondary" />
            <p className="mt-3 text-muted">Cargando galería...</p>
        </div>
    );

    if (error) return (
        <div className="text-center p-5">
            <i className="bi bi-exclamation-circle text-danger display-4"></i>
            <p className="text-danger mt-3">{error}</p>
        </div>
    );

    if (photos.length === 0 && !loading) return (
        <div className="text-center p-5 text-muted opacity-50">
            <i className="bi bi-images display-4"></i>
            <p className="mt-3">No hay fotos disponibles para este cliente.</p>
        </div>
    );

    return (
        <div className="client-gallery-container">
            {/* --- CONTROLES DE FILTRADO (Estilo Dashboard) --- */}
            <div className="gallery-controls">

                {/* Grupo Ordenar */}
                <div className="gallery-control-group">
                    <label className="gallery-control-label">Ordenar por:</label>
                    <select
                        className="gallery-select"
                        value={orderBy}
                        onChange={(e) => setOrderBy(e.target.value)}
                    >
                        <option value="created_at">Más Recientes</option>
                        <option value="event_name">Evento (A-Z)</option>
                    </select>
                </div>

                {/* Grupo Filtrar */}
                <div className="gallery-control-group">
                    <label className="gallery-control-label">Filtrar por Evento:</label>
                    <select
                        className="gallery-select"
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                    >
                        <option value="Todos">Todos</option>
                        {eventOptions.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </div>

            {/* --- GRID DE FOTOS MODERNAS --- */}
            <div className="photo-grid">
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="photo-card"
                        onClick={() => window.open(photo.url, "_blank")}
                        title="Clic para ver en tamaño completo"
                    >
                        {/* Wrapper para mantener aspecto cuadrado 1:1 y efecto zoom */}
                        <div className="photo-img-wrapper">
                            <img
                                src={photo.url}
                                alt={photo.original_name}
                                className="photo-img"
                                loading="lazy" // Carga diferida para mejor rendimiento
                            />
                        </div>

                        {/* Detalles inferiores */}
                        <div className="photo-details">
                            <div className="photo-event">
                                {photo.event_name || "Sin evento"}
                            </div>
                            <div className="photo-date">
                                {new Date(photo.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- PAGINACIÓN --- */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination size="sm">
                        <Pagination.Prev
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        />
                        {/* Lógica simple de paginación (muestra todos los números) */}
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === page}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
}

export default ClientGallery;