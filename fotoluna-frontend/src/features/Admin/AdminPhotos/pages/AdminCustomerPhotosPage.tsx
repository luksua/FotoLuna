import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import "../styles/AdminPhotos.css";

import "../styles/AdminCustomerPhotosPage.css";
import axios from "axios"; // Necesario para la llamada de detalle del cliente
import JSZip from "jszip";
import { saveAs } from "file-saver";

// 1. ✅ URL base del servidor (sin /api)
const API_SERVER_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface PhotoItem {
    id: number;
    url: string;
    event_name: string;
    created_at: string;
    original_name: string;
    size: number;
    employee_name?: string; // Nuevo campo para el nombre del empleado
}

interface ApiResponse {
    message: string;
    photos: PhotoItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface CustomerDetails {
    fullName: string;
}

type OrderBy = "recent" | "event" | "name" | "size";

const PER_PAGE = 24;

// Opciones fijas para el filtro de mes
const monthOptions = [
    { value: "Todos", label: "Todos" },
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
];

const AdminCustomerPhotosPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();

    const [customerName, setCustomerName] = useState<string | null>(null);
    const [customerLoading, setCustomerLoading] = useState(false);

    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [modalPhoto, setModalPhoto] = useState<PhotoItem | null>(null);
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set()); // Nuevo estado para las fotos seleccionadas

    // filtros existentes
    const [eventFilter, setEventFilter] = useState<string>("Todos");
    const [orderBy, setOrderBy] = useState<OrderBy>("recent");
    const [availableEvents, setAvailableEvents] = useState<string[]>([]);

    // 🔹 filtros: mes y año
    const [monthFilter, setMonthFilter] = useState<string>("Todos");
    const [yearFilter, setYearFilter] = useState<string>("Todos");
    const [availableYears, setAvailableYears] = useState<string[]>(["Todos"]);

    // ----------------------------------------------------
    // FUNCIÓN PARA OBTENER DETALLES DEL CLIENTE (NOMBRE)
    // ----------------------------------------------------
    const fetchCustomerDetails = useCallback(async () => {
        if (!customerId) return;

        setCustomerLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay sesión activa.");

            const res = await axios.get<CustomerDetails>(
                `${API_SERVER_URL}/api/customers/${customerId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCustomerName(res.data.fullName || `Cliente #${customerId}`);
        } catch (error) {
            console.error("Error al obtener nombre del cliente:", error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage =
                axiosError.response?.data?.message ||
                `Error al cargar nombre del Cliente #${customerId}`;
            setCustomerName(errorMessage);
        } finally {
            setCustomerLoading(false);
        }
    }, [customerId]);

    // ----------------------------------------------------
    // FUNCIÓN PARA OBTENER FOTOS
    // ----------------------------------------------------
    const fetchPhotos = useCallback(
        async (page = 1) => {
            if (!customerId) return;

            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) throw new Error("No hay sesión activa. Inicia sesión de nuevo.");

                const params = new URLSearchParams();
                params.append("page", page.toString());
                params.append("per_page", PER_PAGE.toString());

                if (eventFilter && eventFilter !== "Todos") {
                    params.append("event", eventFilter);
                }

                if (orderBy === "event") {
                    params.append("order_by", "event_name");
                } else {
                    params.append("order_by", "created_at");
                }

                // Añadir filtros de mes y año al request del API
                if (monthFilter !== "Todos") {
                    params.append("month", monthFilter);
                }
                if (yearFilter !== "Todos") {
                    params.append("year", yearFilter);
                }

                const url = `${API_SERVER_URL}/api/employee/customers/${customerId}/cloud-photos?${params.toString()}`;

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                if (res.status === 401 || res.status === 403) {
                    const errorData = await res.json();
                    throw new Error(
                        errorData.message ||
                        "Acceso denegado. Suscripción inactiva o sin permisos."
                    );
                }

                if (!res.ok) {
                    throw new Error("Error al cargar las fotos: " + res.statusText);
                }

                const data: ApiResponse = await res.json();

                // construir lista de eventos (solo en la primera página)
                const eventsSet = new Set<string>();
                data.photos.forEach((p) => { // Use data.photos here
                    if (p.event_name) eventsSet.add(p.event_name);
                });
                if (page === 1) {
                    setAvailableEvents(["Todos", ...Array.from(eventsSet).sort()]);
                }

                // construir lista de años disponibles
                const yearsSet = new Set<string>();
                data.photos.forEach((p) => { // Use data.photos here
                    const y = new Date(p.created_at).getFullYear().toString();
                    yearsSet.add(y);
                });
                setAvailableYears([
                    "Todos",
                    ...Array.from(yearsSet).sort((a, b) => Number(b) - Number(a)),
                ]);

                let sortedPhotos = [...data.photos]; // Start with data.photos for sorting

                if (orderBy === "name") {
                    sortedPhotos.sort((a, b) =>
                        (a.original_name || "").localeCompare(b.original_name || "")
                    );
                } else if (orderBy === "size") {
                    sortedPhotos.sort((a, b) => b.size - a.size);
                }

                setPhotos(sortedPhotos);
                setCurrentPage(data.current_page);
                setLastPage(data.last_page);
                setTotal(data.total);
            } catch (err: any) {
                console.error(err);
                setError(err.message ?? "Error al cargar las fotos del cliente.");
            } finally {
                setLoading(false);
            }
        },
        [customerId, eventFilter, orderBy, monthFilter, yearFilter] // Incluir los nuevos filtros en las dependencias
    );

    // USE EFFECT PRINCIPAL
    // ----------------------------------------------------
    useEffect(() => {
        fetchCustomerDetails();
        fetchPhotos(1);
    }, [customerId, eventFilter, orderBy, monthFilter, yearFilter, fetchCustomerDetails, fetchPhotos]);

    // ----------------------------------------------------
    // HELPERS
    // ----------------------------------------------------
    const handlePageChange = (page: number) => {
        if (page < 1 || page > lastPage) return;
        fetchPhotos(page);
    };

    const formatSize = (bytes: number) => {
        if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        if (bytes > 1024) return (bytes / 1024).toFixed(1) + " KB";
        return bytes + " B";
    };

    const handleSelectPhoto = (photoId: number) => {
        setSelectedPhotos(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(photoId)) {
                newSelected.delete(photoId);
            } else {
                newSelected.add(photoId);
            }
            return newSelected;
        });
    };

    const handleSelectAllVisible = () => {
        if (selectedPhotos.size === photos.length) { // Assuming 'photos' are the currently visible ones after filters and pagination
            setSelectedPhotos(new Set()); // Deseleccionar todos
        } else {
            const allVisibleIds = new Set(photos.map(p => p.id));
            setSelectedPhotos(allVisibleIds); // Seleccionar todos los visibles
        }
    };

    // 💡 FUNCIÓN DE DESCARGA INDIVIDUAL ROBUSTA (Igual a la de empleado)
    const handleDownload = async (photo: PhotoItem) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No hay token de autenticación.");
            }
            // Llama al endpoint de descarga del backend para forzar el Content-Disposition: attachment
            const res = await fetch(`${API_SERVER_URL}/api/cloud-photos/${photo.id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`No se pudo obtener la imagen. Estado: ${res.status}`);

            // Usar saveAs para forzar la descarga del blob
            saveAs(await res.blob(), photo.original_name || `foto-${photo.id}.jpg`);

        } catch (error) {
            console.error("Error al descargar la foto:", error);
            alert("Error al descargar la foto. Por favor, revisa la consola para más detalles.");
        }
    };

    const handleDownloadSelected = async () => {
        if (selectedPhotos.size === 0 || isDownloadingZip) return;

        setIsDownloadingZip(true);
        const zip = new JSZip();
        const photosToDownload = photos.filter(p => selectedPhotos.has(p.id));

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No hay token de autenticación.");
            }

            const photoPromises = photosToDownload.map(async (photo) => {
                try {
                    // Usar el endpoint de descarga del backend también para el ZIP
                    const response = await fetch(`${API_SERVER_URL}/api/cloud-photos/${photo.id}/download`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!response.ok) throw new Error(`Failed to fetch ${photo.original_name}`);
                    const blob = await response.blob();
                    zip.file(photo.original_name || `photo-${photo.id}.jpg`, blob);
                } catch (error) {
                    console.error(`No se pudo descargar la foto: ${photo.original_name}`, error);
                }
            });

            await Promise.all(photoPromises);

            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, `Fotoluna-Fotos-${customerName?.replace(/\s/g, '-') || 'Cliente'}-${new Date().toISOString().split('T')[0]}.zip`);

        } catch (error) {
            console.error("Error al crear el archivo ZIP", error);
            alert("Ocurrió un error al preparar la descarga. Por favor, inténtalo de nuevo.");
        } finally {
            setIsDownloadingZip(false);
            setSelectedPhotos(new Set()); // Clear selection after download
        }
    };

    const pageTitle = customerLoading
        ? `Cargando detalles del cliente...`
        : customerName
            ? `Galería de fotos de ${customerName}`
            : `Galería del cliente #${customerId}`;

    return (
        <HomeLayout>
            <div className="acp-page">
                {/* Botón para volver a la vista principal de Admin Photos */}
                <div className="acp-header-row">
                    <button
                        onClick={() => navigate("/AdminPhotos")}
                        className="acp-back-btn"
                        type="button"
                    >
                        ← Volver a Fotos en la nube
                    </button>

                    <div>
                        <h1 className="acp-title">{pageTitle}</h1>
                        <p className="acp-subtitle">
                            {total} fotos en total · Página {currentPage} de {lastPage}
                        </p>
                    </div>
                </div>

                {/* 🎨 BLOQUE DE FILTROS HORIZONTALES (CORREGIDO) 🎨 */}
                <div className="row mt-4 mb-4">
                    <div className="col-12">
                        <h5>Filtros</h5>
                        <div className="d-flex flex-wrap gap-3 align-items-center">

                            {/* Ordenar por */}
                            <select
                                className="form-select rounded-pill"
                                style={{ width: "auto" }}
                                value={orderBy}
                                onChange={(e) => setOrderBy(e.target.value as OrderBy)}
                            >
                                <option value="recent">Ordenar: Más recientes</option>
                                <option value="event">Ordenar: Evento</option>
                                <option value="name">Ordenar: Nombre de archivo</option>
                                <option value="size">Ordenar: Tamaño</option>
                            </select>

                            {/* Filtro por Evento */}
                            <select
                                className="form-select rounded-pill"
                                style={{ width: "auto" }}
                                value={eventFilter}
                                onChange={(e) => setEventFilter(e.target.value)}
                            >
                                {availableEvents.map((ev) => (
                                    <option key={ev} value={ev}>
                                        Evento: {ev}
                                    </option>
                                ))}
                            </select>

                            {/* Filtro por Mes */}
                            <select
                                className="form-select rounded-pill"
                                style={{ width: "auto" }}
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                            >
                                {monthOptions.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        Mes: {m.label}
                                    </option>
                                ))}
                            </select>

                            {/* Filtro por Año */}
                            <select
                                className="form-select rounded-pill"
                                style={{ width: "auto" }}
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>
                                        Año: {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Columna de Contenido Principal (Ahora ocupa col-12) */}
                    <div className="col-12">
                        {/* BARRA DE ACCIÓN DE SELECCIÓN */}
                        {selectedPhotos.size > 0 && (
                            <div className="alert alert-secondary sticky-top d-flex justify-content-between align-items-center py-2 px-3 mb-4 rounded-pill shadow-sm" style={{ top: '100px', zIndex: 100 }}>
                                <div className="d-flex align-items-center gap-3">
                                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => setSelectedPhotos(new Set())} style={{ width: '35px', height: '35px' }}>
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                    <span className="fw-bold">{selectedPhotos.size} seleccionada(s)</span>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-primary rounded-pill" onClick={handleDownloadSelected} disabled={isDownloadingZip}>
                                        {isDownloadingZip ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                <span>Comprimiendo...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-download me-2"></i>
                                                <span>Descargar ZIP</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Botón para seleccionar todo (solo visible si no hay selección activa) */}
                        {!loading && !error && photos.length > 0 && selectedPhotos.size === 0 && (
                            <div className="text-end mb-3">
                                <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => {
                                    const allPhotoIds = new Set(photos.map(p => p.id));
                                    setSelectedPhotos(allPhotoIds);
                                }}>
                                    Seleccionar todo
                                </button>
                            </div>
                        )}
                        {/* Mensajes de Estado */}
                        {(loading || customerLoading) && <p>Cargando fotos...</p>}
                        {error && <p className="acp-error">{error}</p>}


                        {!loading && !error && photos.length === 0 && (
                            <p>No se encontraron fotos para este cliente con estos filtros.</p>
                        )}

                        {!loading && !error && photos.length > 0 && (
                            <>
                                {/* GRID de cards */}
                                <div className="row g-3">
                                    {photos.map((photo) => {
                                        const isSelected = selectedPhotos.has(photo.id);
                                        const fechaCorta = new Date(photo.created_at)
                                            .toISOString()
                                            .slice(0, 10);

                                        return (
                                            <div key={photo.id} className="col-6 col-md-4 col-lg-3">
                                                <div
                                                    className={`card border-0 shadow-sm position-relative h-100 ${isSelected ? 'border-primary border-3' : ''}`}
                                                    onClick={() => handleSelectPhoto(photo.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.original_name}
                                                        className="card-img-top rounded-3"
                                                        style={{ height: "200px", objectFit: "cover" }}
                                                    />
                                                    {isSelected && (
                                                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded-3 d-flex justify-content-center align-items-center">
                                                            <i className="bi bi-check-circle-fill text-white fs-1"></i>
                                                        </div>
                                                    )}
                                                    <div className="position-absolute top-0 end-0 m-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-sm rounded-circle shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Evita que se seleccione la foto al descargar
                                                                handleDownload(photo); // AHORA ES ASÍNCRONA
                                                            }}
                                                            title="Descargar foto"
                                                        >
                                                            <i className="bi bi-arrow-down-circle-fill"></i>
                                                        </button>
                                                    </div>
                                                    <div className="position-absolute top-0 start-0 m-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-sm rounded-circle shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Evita que se seleccione la foto al ver
                                                                setModalPhoto(photo);
                                                            }}
                                                            title="Ver foto"
                                                        >
                                                            <i className="bi bi-search-heart-fill"></i>
                                                        </button>
                                                    </div>
                                                    <div className="card-body text-center p-2">
                                                        <p className="fw-semibold mb-1 small">{photo.event_name || "Foto individual"}</p>
                                                        {photo.employee_name && (
                                                            <p className="small text-muted mb-1">Subido por: {photo.employee_name}</p>
                                                        )}
                                                        <small className="text-muted">{fechaCorta}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* paginación mejorada */}
                                <nav aria-label="Page navigation" className="mt-4">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link rounded-pill mx-1"
                                                onClick={() => handlePageChange(1)}
                                            >
                                                ⏮
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link rounded-pill mx-1"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                ← Anterior
                                            </button>
                                        </li>

                                        <li className="page-item disabled">
                                            <span className="page-link rounded-pill mx-1">
                                                Página {currentPage} de {lastPage}
                                            </span>
                                        </li>

                                        <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link rounded-pill mx-1"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Siguiente →
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link rounded-pill mx-1"
                                                onClick={() => handlePageChange(lastPage)}
                                            >
                                                ⏭
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </>
                        )}
                    </div>
                </div>

                {/* Modal (mismo fondo cute que ya tenías) */}
                {modalPhoto && (
                    <div
                        className="ap-modal-backdrop"
                        onClick={(e) => e.target === e.currentTarget && setModalPhoto(null)}
                    >
                        <div className="ap-modal ap-modal--cute">
                            <header className="ap-modal__header">
                                <div className="ap-modal__header-text">
                                    <div className="ap-modal__chip">
                                        📸 {modalPhoto.original_name}
                                    </div>
                                    <div className="ap-modal__title-row">
                                        <h2 className="ap-modal__title">Foto #{modalPhoto.id}</h2>
                                        <span className="ap-modal__badge">
                                            {modalPhoto.event_name}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="ap-modal__close"
                                    onClick={() => setModalPhoto(null)}
                                    type="button"
                                >
                                    ×
                                </button>
                            </header>
                            <div className="ap-modal__body">
                                <img src={modalPhoto.url} alt={modalPhoto.original_name} />
                            </div>
                            <footer className="ap-modal__footer">
                                <span className="ap-pill">
                                    📅 {modalPhoto.created_at} · {formatSize(modalPhoto.size)}
                                </span>
                                {modalPhoto.employee_name && (
                                    <span className="ap-pill ms-2">
                                        Subido por: {modalPhoto.employee_name}
                                    </span>
                                )}
                                {/* 💡 BOTÓN DE DESCARGA AGREGADO AL MODAL */}
                                <button className="ap-pill ms-2" onClick={() => handleDownload(modalPhoto)} title="Descargar foto">
                                    <i className="bi bi-download me-1"></i> Descargar
                                </button>
                            </footer>
                        </div>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default AdminCustomerPhotosPage;