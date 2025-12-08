import { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// IMPORTAR LIBRERÍAS PARA ZIP
import JSZip from "jszip";
import { saveAs } from "file-saver";
// IMPORTAR useAuth
import { useAuth } from "../../../../context/useAuth";

// Ajusta la URL base de tu API
const API_BASE_URL = "http://localhost:8000/api";

type TCloudPhoto = {
    id: number;
    url: string;
    event_name: string;
    created_at: string;
    original_name?: string;
    size?: number;
};

export default function Photos() {
    const { user } = useAuth();

    // --- ESTADOS DE DATOS Y API ---
    const [photos, setPhotos] = useState<TCloudPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- ESTADOS DE UI (Filtros y Selección) ---
    const [filtro, setFiltro] = useState("Evento");
    const [orden, setOrden] = useState("Más recientes");
    const [filterYear, setFilterYear] = useState("Todos");
    const [filterMonth, setFilterMonth] = useState("0");
    const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [photosPerPage] = useState(12); // Puedes ajustar este valor


    // --- Lógica de Carga de Fotos ---
    useEffect(() => {
        const fetchMyPhotos = async () => {
            const token = localStorage.getItem("token");
            if (!token || !user) {
                setErrorMessage("Debes iniciar sesión para ver tus fotos.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setErrorMessage(null);
            try {
                const response = await fetch(`${API_BASE_URL}/client/my-cloud-photos`, {
                    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
                });
                const data = await response.json();
                if (response.ok) {
                    setPhotos(data.photos.map((p: any) => ({ ...p })));
                } else {
                    setErrorMessage(data.message || "Ocurrió un error.");
                }
            } catch (err) {
                setErrorMessage("No se pudo conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };
        fetchMyPhotos();
    }, [user]);

    // --- Lógica de Filtrado y Ordenamiento ---
    const availableYears = useMemo(() => {
        const years = new Set(photos.map(p => new Date(p.created_at).getFullYear().toString()));
        return ["Todos", ...Array.from(years).sort((a, b) => b.localeCompare(a))];
    }, [photos]);

    const months = [
        "Todos", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const fotosFiltradas = useMemo(() => {
        return photos
            .slice() // Crear una copia para no mutar el original
            .sort((a, b) => {
                if (orden === "Más recientes") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (orden === "Más antiguas") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                if (orden === "Evento") return a.event_name.localeCompare(b.event_name);
                return 0;
            })
            .filter(f => {
                const photoDate = new Date(f.created_at);
                const yearMatch = filterYear === "Todos" || photoDate.getFullYear().toString() === filterYear;
                const monthMatch = filterMonth === "0" || (photoDate.getMonth() + 1).toString() === filterMonth;
                const eventMatch = filtro === "Evento" || f.event_name === filtro;
                return yearMatch && monthMatch && eventMatch;
            });
    }, [photos, orden, filtro, filterYear, filterMonth]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
    }, [orden, filtro, filterYear, filterMonth]);


    // --- Lógica de Paginación ---
    const totalPages = Math.ceil(fotosFiltradas.length / photosPerPage);
    const indexOfLastPhoto = currentPage * photosPerPage;
    const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
    const currentPhotos = useMemo(() => fotosFiltradas.slice(indexOfFirstPhoto, indexOfLastPhoto), [fotosFiltradas, indexOfFirstPhoto, indexOfLastPhoto]);

    // --- Lógica de Selección ---
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
        if (selectedPhotos.size === currentPhotos.length) {
            setSelectedPhotos(new Set()); // Deseleccionar todos
        } else {
            const allVisibleIds = new Set(currentPhotos.map(p => p.id));
            setSelectedPhotos(allVisibleIds); // Seleccionar todos los visibles
        }
    };

    // --- Lógica de Descarga ---
    const handleDownloadIndividualPhoto = async (photo: TCloudPhoto) => {
        try {
            const response = await fetch(photo.url);
            if (!response.ok) throw new Error(`Failed to fetch ${photo.original_name}`);
            const blob = await response.blob();
            saveAs(blob, photo.original_name || `photo-${photo.id}.jpg`);
        } catch (error) {
            console.error(`No se pudo descargar la foto: ${photo.original_name}`, error);
            alert("Ocurrió un error al descargar la foto. Por favor, inténtalo de nuevo.");
        }
    };

    const handleDownloadSelected = async () => {
        if (selectedPhotos.size === 0 || isDownloadingZip) return;
    
        setIsDownloadingZip(true);
        const zip = new JSZip();
        const photosToDownload = photos.filter(p => selectedPhotos.has(p.id));
    
        try {
            const photoPromises = photosToDownload.map(async (photo) => {
                try {
                    const response = await fetch(photo.url);
                    if (!response.ok) throw new Error(`Failed to fetch ${photo.original_name}`);
                    const blob = await response.blob();
                    // Añadir al zip con un nombre de archivo único o el original
                    zip.file(photo.original_name || `photo-${photo.id}.jpg`, blob);
                } catch (error) {
                    console.error(`No se pudo descargar la foto: ${photo.original_name}`, error);
                    // Opcional: podrías notificar al usuario sobre las fotos que fallaron
                }
            });
    
            await Promise.all(photoPromises);
    
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, `Fotoluna-Fotos-${new Date().toISOString().split('T')[0]}.zip`);
    
        } catch (error) {
            console.error("Error al crear el archivo ZIP", error);
            alert("Ocurrió un error al preparar la descarga. Por favor, inténtalo de nuevo.");
        } finally {
            setIsDownloadingZip(false);
            setSelectedPhotos(new Set()); // Limpiar selección después de descargar
        }
    };

    // --- Renderizado ---
    return (
        <div className="container py-5">
            <h2 className="bg-custom-2 mb-4">Mis fotos</h2>
            <div className="row">
                {/* Columna de Filtros (Izquierda) */}
                <div className="col-md-3">
                    <div className="d-flex flex-column gap-3 mb-4 sticky-top" style={{ top: '100px' }}> {/* sticky-top for filters */}
                        <h5>Filtros</h5>
                        {/* Controles de Orden y Filtro */}
                        <select className="form-select rounded-pill" value={orden} onChange={(e) => setOrden(e.target.value)}>
                            <option>Más recientes</option>
                            <option>Más antiguas</option>
                            <option>Evento</option>
                        </select>
                        <select className="form-select rounded-pill" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                            <option>Evento</option>
                            {[...new Set(photos.map(p => p.event_name))].map((event) => <option key={event} value={event}>{event}</option>)}
                        </select>
                        <select className="form-select rounded-pill" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                            {availableYears.map(year => <option key={year} value={year}>{year === "Todos" ? "Año" : year}</option>)}
                        </select>
                        <select className="form-select rounded-pill" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                            {months.map((month, index) => <option key={month} value={index}>{month === "Todos" ? "Mes" : month}</option>)}
                        </select>
                    </div>
                </div>

                {/* Columna de Contenido Principal (Derecha) */}
                <div className="col-md-9">


            {/* BARRA DE ACCIÓN DE SELECCIÓN */}
            {selectedPhotos.size > 0 && (
                <div className="alert alert-secondary sticky-top d-flex justify-content-between align-items-center py-2 px-3 mb-4 rounded-pill shadow-sm">
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

            {/* Mensajes de Estado */}
            {loading && <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2">Cargando...</p></div>}
            {errorMessage && <div className="alert alert-danger text-center"><i className="bi bi-lock-fill me-2"></i>{errorMessage}</div>}
            {!loading && !errorMessage && photos.length === 0 && <div className="alert alert-info text-center">No tienes fotos disponibles.</div>}
            
            {/* Botón para seleccionar todo */}
            {!loading && !errorMessage && photos.length > 0 && selectedPhotos.size === 0 && (
                 <div className="text-end mb-3">
                    <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={handleSelectAllVisible}>
                        Seleccionar todo
                    </button>
                 </div>
            )}

            {/* Galería de Fotos */}
            {!loading && !errorMessage && photos.length > 0 && (
                <div className="row g-3">
                    {currentPhotos.map((foto) => {
                        const isSelected = selectedPhotos.has(foto.id);
                        return (
                            <div key={foto.id} className="col-6 col-md-4 col-lg-3">
                                <div 
                                    className={`card border-0 shadow-sm position-relative h-100 ${isSelected ? 'border-primary border-3' : ''}`}
                                    onClick={() => handleSelectPhoto(foto.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={foto.url}
                                        alt={foto.event_name}
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
                                            className="btn btn-light btn-sm rounded-circle shadow-sm" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que se seleccione la foto al descargar
                                                handleDownloadIndividualPhoto(foto);
                                            }}
                                            title="Descargar foto"
                                        >
                                            <i className="bi bi-download"></i>
                                        </button>
                                    </div>
                                    <div className="card-body text-center p-2">
                                        <p className="fw-semibold mb-1 small">{foto.event_name}</p>
                                        <small className="text-muted">{new Date(foto.created_at).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Controles de Paginación */}
            {!loading && !errorMessage && fotosFiltradas.length > photosPerPage && (
                <nav aria-label="Page navigation example" className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link rounded-pill mx-1" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>Anterior</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <button className="page-link rounded-pill mx-1" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link rounded-pill mx-1" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Siguiente</button>
                        </li>
                    </ul>
                </nav>
            )}
                </div>
            </div>
        </div>
    );
}