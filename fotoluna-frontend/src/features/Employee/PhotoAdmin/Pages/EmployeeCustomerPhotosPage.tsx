
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import "bootstrap-icons/font/bootstrap-icons.css"; // Importar estilos de iconos
import "../styles/EmployeePhotos.css";
import "../styles/EmployeeCustomerPhotosPage.css";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const API_SERVER_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// --- Interfaces y Tipos ---
interface PhotoItem {
    id: number;
    url: string;
    event_name: string;
    created_at: string;
    original_name: string;
    size: number;
    employee_name?: string; // ⬅️ NUEVO: Nombre del empleado que subió la foto
}
interface ApiResponse { message: string; photos: PhotoItem[]; current_page: number; last_page: number; total: number; }
interface CustomerDetails { fullName: string; }
type OrderBy = "recent" | "event" | "name" | "size";

const PER_PAGE = 24;
const monthOptions = [
    { value: "Todos", label: "Todos" }, { value: "01", label: "Enero" }, { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" }, { value: "04", label: "Abril" }, { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" }, { value: "07", label: "Julio" }, { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" }, { value: "10", label: "Octubre" }, { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
];

const EmployeeCustomerPhotosPage: React.FC = () => {
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
    const [filters, setFilters] = useState({
        event: "Todos",
        orderBy: "recent" as OrderBy,
        month: "Todos",
        year: "Todos",
    });
    const [available, setAvailable] = useState({ events: [] as string[], years: [] as string[] });
    const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);

    const fetchCustomerDetails = useCallback(async () => {
        if (!customerId) return;
        setCustomerLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay sesión activa.");
            const res = await axios.get<CustomerDetails>(`${API_SERVER_URL}/api/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
            setCustomerName(res.data.fullName || `Cliente #${customerId}`);
        } catch (error) { setCustomerName(`Error al cargar nombre del Cliente #${customerId}`); }
        finally { setCustomerLoading(false); }
    }, [customerId]);

    const fetchPhotos = useCallback(async (page = 1) => {
        if (!customerId) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay sesión activa.");
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: PER_PAGE.toString(),
                order_by: filters.orderBy === "event" ? "event_name" : "created_at",
            });
            if (filters.event && filters.event !== "Todos") params.append("event", filters.event);
            const res = await fetch(`${API_SERVER_URL}/api/employee/customers/${customerId}/cloud-photos?${params.toString()}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
            if (!res.ok) throw new Error("Error al cargar las fotos.");
            const data: ApiResponse = await res.json();
            let list = [...data.photos];
            if (filters.orderBy === "name") list.sort((a, b) => (a.original_name || "").localeCompare(b.original_name || ""));
            else if (filters.orderBy === "size") list.sort((a, b) => b.size - a.size);
            if (page === 1) {
                setAvailable({
                    events: ["Todos", ...Array.from(new Set(list.map(p => p.event_name).filter(Boolean))).sort()],
                    years: ["Todos", ...Array.from(new Set(list.map(p => new Date(p.created_at).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a))],
                });
            }
            setPhotos(list);
            setCurrentPage(data.current_page);
            setLastPage(data.last_page);
            setTotal(data.total);
        } catch (err: any) { setError(err.message ?? "Error desconocido."); }
        finally { setLoading(false); }
    }, [customerId, filters.event, filters.orderBy]);

    useEffect(() => { fetchCustomerDetails(); fetchPhotos(1); }, [customerId, filters.event, filters.orderBy, fetchCustomerDetails, fetchPhotos]);
    useEffect(() => { setSelectedPhotos(new Set()); }, [photos]);

    const handlePageChange = (page: number) => { if (page >= 1 && page <= lastPage) fetchPhotos(page); };
    const formatSize = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`);
    const getDaysRemaining = (dateStr: string) => {
        const uploadDate = new Date(dateStr);
        const today = new Date();
        const diffTime = today.getTime() - uploadDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return 15 - diffDays;
    };

    const filteredPhotos = photos
        .filter(p => getDaysRemaining(p.created_at) >= 0)
        .filter(p => (filters.month === "Todos" || (new Date(p.created_at).getMonth() + 1).toString().padStart(2, '0') === filters.month) && (filters.year === "Todos" || new Date(p.created_at).getFullYear().toString() === filters.year));

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSelectPhoto = (photoId: number) => {
        setSelectedPhotos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(photoId)) newSet.delete(photoId); else newSet.add(photoId);
            return newSet;
        });
    };
    const handleSelectAllVisible = () => setSelectedPhotos(selectedPhotos.size === filteredPhotos.length ? new Set() : new Set(filteredPhotos.map(p => p.id)));
    const handleDownloadSingle = async (e: React.MouseEvent, photo: PhotoItem) => {
        e.stopPropagation();
        try {
            const res = await fetch(photo.url);
            if (!res.ok) throw new Error('No se pudo obtener la imagen.');
            saveAs(await res.blob(), photo.original_name || `foto-${photo.id}.jpg`);
        } catch (error) { alert("Error al descargar la foto."); }
    };
    const handleDownloadSelected = async () => {
        if (selectedPhotos.size === 0 || isDownloadingZip) return;
        setIsDownloadingZip(true);
        const zip = new JSZip();
        const photosToDownload = photos.filter(p => selectedPhotos.has(p.id));
        try {
            await Promise.all(photosToDownload.map(async photo => {
                const res = await fetch(photo.url);
                if (res.ok) zip.file(photo.original_name || `photo-${photo.id}.jpg`, await res.blob());
            }));
            const customerNameFile = customerName ? customerName.replace(/\s+/g, '_') : `cliente_${customerId}`;
            saveAs(await zip.generateAsync({ type: "blob" }), `Fotoluna_${customerNameFile}.zip`);
        } catch (error) { alert("Ocurrió un error al crear el archivo ZIP."); }
        finally { setIsDownloadingZip(false); setSelectedPhotos(new Set()); }
    };

    const pageTitle = customerLoading ? `Cargando...` : customerName ? `Galería de ${customerName}` : `Galería del cliente #${customerId}`;

    return (
        <EmployeeLayout>
             <style>{`
                .acp-card { transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; cursor: pointer; overflow: hidden; display: flex; flex-direction: column; }
                .acp-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                .acp-card__img-wrapper { height: 200px; background-size: cover; background-position: center; transition: transform 0.3s ease; }
                .acp-card:hover .acp-card__img-wrapper { transform: scale(1.05); }
                .acp-card__body { flex-grow: 1; display: flex; flex-direction: column; }
                .acp-card__overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s ease; }
                .acp-card:hover .acp-card__overlay { opacity: 1; }
                .acp-card--selected .acp-card__overlay { background: rgba(0, 123, 255, 0.4); opacity: 1; }
                .acp-card__selection-marker { position: absolute; top: 10px; left: 10px; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.4); border: 2px solid white; color: white; font-size: 1.1rem; opacity: 0; transition: all 0.3s ease; display: flex; justify-content: center; align-items: center; }
                .acp-card:hover .acp-card__selection-marker, .acp-card--selected .acp-card__selection-marker { opacity: 1; }
                .acp-card--selected .acp-card__selection-marker { background: #007bff; border-color: #007bff; }
                .acp-card__actions { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px; opacity: 0; transition: all 0.3s ease; transform: translateY(10px); }
                .acp-card:hover .acp-card__actions { opacity: 1; transform: translateY(0); }
                .acp-card--selected .acp-card__actions { display: none; }
                .acp-card__actions button { background: rgba(0,0,0,0.6); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: background 0.2s; }
                .acp-card__actions button i { font-size: 1.1rem; }
                .acp-card__actions button:hover { background: #007bff; }
                .acp-card__uploader { margin-top: auto; padding-top: 8px; border-top: 1px solid #eee; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #6c757d; }
                .acp-card__uploader i { font-size: 0.9rem; }
            `}</style>

            <div className="acp-page">
                <div className="acp-header-row">
                    <button onClick={() => navigate("/employee/photos")} className="acp-back-btn">← Volver</button>
                    <div><h1 className="acp-title">{pageTitle}</h1><p className="acp-subtitle">{total} fotos · Página {currentPage}/{lastPage}</p></div>
                </div>

                <div className="acp-toolbar">
                    <div className="acp-toolbar__group">
                        <label className="acp-label">Ordenar:<select name="orderBy" className="acp-select" value={filters.orderBy} onChange={handleFilterChange}>
                            <option value="recent">Recientes</option><option value="event">Evento</option><option value="name">Nombre</option><option value="size">Tamaño</option></select></label>
                        <label className="acp-label">Evento:<select name="event" className="acp-select" value={filters.event} onChange={handleFilterChange}>{available.events.map(ev => <option key={ev} value={ev}>{ev}</option>)}</select></label>
                        <label className="acp-label">Mes:<select name="month" className="acp-select" value={filters.month} onChange={handleFilterChange}>{monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
                        <label className="acp-label">Año:<select name="year" className="acp-select" value={filters.year} onChange={handleFilterChange}>{available.years.map(y => <option key={y} value={y}>{y}</option>)}</select></label>
                    </div>
                </div>

                {selectedPhotos.size > 0 && (
                    <div className="acp-selection-bar">
                        <span>{selectedPhotos.size} foto(s) seleccionada(s)</span>
                        <div className="acp-selection-bar__actions">
                            <button onClick={handleDownloadSelected} className="acp-download-btn" disabled={isDownloadingZip}>{isDownloadingZip ? "Comprimiendo..." : "Descargar ZIP"}</button>
                            <button onClick={() => setSelectedPhotos(new Set())} className="acp-back-btn">Cancelar</button>
                        </div>
                    </div>
                )}
                {filteredPhotos.length > 0 && selectedPhotos.size === 0 && (<div style={{ textAlign: 'right', marginBottom: '1rem' }}><button onClick={handleSelectAllVisible} className="acp-page-btn">Seleccionar todo</button></div>)}

                {loading && <p>Cargando...</p>}
                {error && <p className="acp-error">{error}</p>}
                {!loading && !error && filteredPhotos.length === 0 && <p>No se encontraron fotos.</p>}

                {!loading && !error && filteredPhotos.length > 0 && (
                    <>
                        <div className="acp-grid">
                            {filteredPhotos.map((photo) => {
                                const isSelected = selectedPhotos.has(photo.id);
                                const daysRemaining = getDaysRemaining(photo.created_at);
                                return (
                                    <div key={photo.id} className={`acp-card ${isSelected ? 'acp-card--selected' : ''}`} onClick={() => handleSelectPhoto(photo.id)}>
                                        <div className="acp-card__img-wrapper" style={{ backgroundImage: `url(${photo.url})` }}>
                                            <div className="acp-card__overlay"></div>
                                            <div className="acp-card__selection-marker">{isSelected && <i className="bi bi-check-lg"></i>}</div>
                                            <div className="acp-card__actions">
                                                <button title="Ver" onClick={(e) => { e.stopPropagation(); setModalPhoto(photo); }}><i className="bi bi-search-heart-fill"></i></button>
                                                <button title="Descargar" onClick={(e) => handleDownloadSingle(e, photo)}><i className="bi bi-arrow-down-circle-fill"></i></button>
                                            </div>
                                        </div>
                                        <div className="acp-card__body">
                                            <div className="acp-card__event">{photo.event_name || "Individual"}</div>
                                            <div className="acp-card__date">{new Date(photo.created_at).toLocaleDateString()}</div>
                                            <div className="acp-card__uploader">
                                                <i className="bi bi-person-fill"></i>
                                                <span>{customerName}</span>
                                            </div>
                                            <div className="acp-card__uploader" style={{ color: daysRemaining < 5 ? 'red' : 'green' }}>
                                                <i className="bi bi-hourglass-split"></i>
                                                <span>Quedan {daysRemaining} día(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="acp-pagination">
                            <button onClick={() => handlePageChange(1)} disabled={currentPage <= 1}>⏮</button>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>←</button>
                            <span>Página {currentPage} de {lastPage}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= lastPage}>→</button>
                            <button onClick={() => handlePageChange(lastPage)} disabled={currentPage >= lastPage}>⏭</button>
                        </div>
                    </>
                )}
                {modalPhoto && (
                    <div className="ap-modal-backdrop" onClick={() => setModalPhoto(null)}>
                        <div className="ap-modal ap-modal--cute" onClick={e => e.stopPropagation()}>
                            <header className="ap-modal__header"><h2 className="ap-modal__title">{modalPhoto.original_name}</h2><button className="ap-modal__close" onClick={() => setModalPhoto(null)}>×</button></header>
                            <div className="ap-modal__body"><img src={modalPhoto.url} alt={modalPhoto.original_name} /></div>
                            <footer className="ap-modal__footer">
                                <span className="ap-pill">📅 {new Date(modalPhoto.created_at).toLocaleString()}</span>
                                <span className="ap-pill">📦 {formatSize(modalPhoto.size)}</span>
                                <span className="ap-pill">🎉 {modalPhoto.event_name}</span>
                            </footer>
                        </div>
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeCustomerPhotosPage;
