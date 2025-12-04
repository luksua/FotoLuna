// src/Components/ClientGallery.tsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
// 🛑 CORRECCIÓN: Se eliminó 'Button' (no se usa) y se mantuvo solo lo necesario.
// El modal usa Dropdown, Form, Pagination, Spinner.
import { Dropdown, Form, Pagination, Spinner } from "react-bootstrap";

// ✅ CORRECCIÓN 1: 'Client' es solo un tipo, se usa 'import type' (Error 1484)


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
    const [orderBy, setOrderBy] = useState("created_at"); // 'created_at' o 'event_name'
    const [eventFilter, setEventFilter] = useState("Todos");
    const photosPerPage = 20; // Tamaño fijo para la paginación

    // Nota: El backend de la app cliente usa /client/my-cloud-photos, que no acepta ID.
    // Esto asume que el token del cliente está activo y que el cliente puede
    // ver todas sus fotos si tiene suscripción.

    const fetchPhotos = useCallback(async () => {
        if (!clientId) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            // 🚨 NOTA IMPORTANTE: La ruta del cliente '/api/client/my-cloud-photos'
            // solo funciona si el usuario *autenticado* es el cliente.
            // Para el panel de empleado, necesitarías un nuevo endpoint
            // como: '/api/employee/customers/{id}/cloud-photos'
            // que acepte el 'clientId' y aplique las reglas de visibilidad.

            // Por ahora, usaremos la ruta del cliente y asumiremos que el empleado
            // puede simular el acceso (o que se creará la ruta de empleado).

            const response = await axios.get(`${API_URL}/employee/customers/${clientId}/cloud-photos`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                params: {
                    page: page,
                    per_page: photosPerPage,
                    order_by: orderBy,
                    event: eventFilter !== "Todos" ? eventFilter : undefined,
                },
            });

            // Asumo que la respuesta tendría una estructura de paginación:
            // response.data.photos.data, response.data.photos.last_page, etc.

            setPhotos(response.data.photos || []); // Ajustar según la API real
            setTotalPages(response.data.last_page || 1); // Ajustar según la API real

        } catch (err: any) {
            console.error("Error cargando fotos del cliente", err);
            // El backend retorna 403 si no hay suscripción activa.
            if (err.response && err.response.status === 403) {
                setError("El plan de almacenamiento del cliente no está activo. Acceso denegado.");
            } else {
                setError("No se pudieron cargar las fotos del cliente.");
            }
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    }, [clientId, page, orderBy, eventFilter]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // Opciones de eventos únicas para el filtro
    const eventOptions = [...new Set(photos.map(p => p.event_name))];


    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="secondary" /> <p>Cargando galería...</p></div>;

    if (error) return <p className="text-danger text-center p-5">{error}</p>;

    if (photos.length === 0) return <p className="text-muted text-center p-5">No hay fotos disponibles para este cliente o su suscripción no está activa.</p>;

    return (
        <div className="p-3">
            {/* Controles de Filtro y Ordenación */}
            <div className="d-flex justify-content-start align-items-center mb-4 gap-3">
                <p className="mb-0 fw-bold">Ordenar por:</p>
                <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic-order">
                        {orderBy === "created_at" ? "Más Recientes" : "Evento"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setOrderBy("created_at")}>Más Recientes</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderBy("event_name")}>Evento</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <p className="mb-0 fw-bold">Filtrar por Evento:</p>
                <Form.Select
                    size="sm"
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    style={{ minWidth: "150px" }}
                >
                    <option>Todos</option>
                    {eventOptions.map(e => <option key={e} value={e}>{e}</option>)}
                </Form.Select>
            </div>


            {/* Galería de Miniaturas */}
            <div className="d-flex flex-wrap justify-content-start gap-3">
                {photos.map((photo) => (
                    <div key={photo.id} className="text-center" style={{ width: "150px" }}>
                        <img
                            src={photo.url}
                            alt={photo.original_name}
                            style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: "2px solid #b47bd3",
                            }}
                            onClick={() => window.open(photo.url, "_blank")}
                        />
                        <small className="d-block text-muted mt-1 text-truncate">{photo.event_name}</small>
                        <small className="d-block text-muted">{photo.created_at}</small>
                    </div>
                ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination size="sm">
                        <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                    </Pagination>
                </div>
            )}
        </div>
    );
}

export default ClientGallery;