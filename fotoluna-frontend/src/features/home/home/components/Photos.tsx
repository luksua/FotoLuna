import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// ⚠️ IMPORTAR useAuth: Ajusta esta ruta según la ubicación real de tu contexto de autenticación
import { useAuth } from "../../../../context/useAuth";

// 1. Define la estructura de datos que esperamos de tu backend
type TCloudPhoto = {
    id: number;
    url: string; // URL pública de Contabo S3
    event_name: string; // Título del evento
    created_at: string; // Fecha de subida (en formato 'YYYY-MM-DD' o similar)
};

// ⚠️ Ajusta la URL base de tu API
const API_BASE_URL = "http://localhost:8000/api";

export default function Photos() {
    const { user } = useAuth(); // Obtener el usuario autenticado

    // --- ESTADOS DE DATOS Y API ---
    const [photos, setPhotos] = useState<TCloudPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- ESTADOS DE UI (Filtros) ---
    const [filtro, setFiltro] = useState("Evento");
    const [orden, setOrden] = useState("Más recientes");

    // ---------------------------------------------------
    // 2. Lógica de Carga de Fotos desde la API (useEffect)
    // ---------------------------------------------------
    useEffect(() => {
        const fetchMyPhotos = async () => {
            const token = localStorage.getItem("token");

            // Verificación inicial de sesión
            if (!token || !user) {
                setErrorMessage("Debes iniciar sesión para ver tus fotos.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage(null);

            try {
                // Llamada al endpoint protegido del cliente
                const response = await fetch(
                    `${API_BASE_URL}/client/my-cloud-photos`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setPhotos(data.photos || []);
                } else if (response.status === 403) {
                    // ⚠️ Error 403: Suscripción Expirada/Inválida (Tu lógica de negocio)
                    setErrorMessage(data.message || "Acceso denegado. Revisa el estado de tu suscripción.");
                } else {
                    // Otros errores
                    setErrorMessage(data.message || "Ocurrió un error al cargar tus fotos.");
                }

            } catch (err) {
                console.error("Error de conexión:", err);
                setErrorMessage("No se pudo conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyPhotos();
    }, [user]);

    // ---------------------------------------------------
    // 3. Lógica de Filtrado y Ordenamiento
    // ---------------------------------------------------

    // 3a. Aplicar ordenamiento
    const fotosOrdenadas = [...photos].sort((a, b) => {
        // Ordena por fecha
        if (orden === "Más recientes") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (orden === "Más antiguas") {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        // Ordena por nombre de evento
        if (orden === "Evento") {
            return a.event_name.localeCompare(b.event_name);
        }
        return 0;
    });

    // 3b. Aplicar filtrado
    const fotosFiltradas = fotosOrdenadas.filter(f =>
        // 'Evento' significa no filtrar, solo ordenar
        filtro === "Evento" ? true : f.event_name === filtro
    );

    // ---------------------------------------------------
    // 4. Lógica de Descarga
    // ---------------------------------------------------

    const handleDescargar = (url: string): void => {
        // Lógica de descarga real: crea un enlace temporal y simula el clic
        const link = document.createElement('a');
        link.href = url;
        // Obliga al navegador a descargar el archivo en lugar de navegar a él
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Opcional: mostrar un mensaje o spinner de descarga
    };


    // ---------------------------------------------------
    // 5. Renderizado
    // ---------------------------------------------------
    return (
        <div className="container py-5">

            {/* Título y Controles */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className=" bg-custom-2">Mis fotos</h2>

                <div className="d-flex align-items-center gap-3">
                    {/* Select de Ordenar */}
                    <div>
                        <label className="form-label me-2">Ordenar por:</label>
                        <select
                            className="form-select form-select-sm rounded-pill"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            style={{ backgroundColor: "#e8d9f4", color: "#333", border: "none" }}
                        >
                            <option>Más recientes</option>
                            <option>Más antiguas</option>
                            <option>Evento</option>
                        </select>
                    </div>

                    {/* Select de Filtrar */}
                    <div>
                        <label className="form-label me-2">Filtrar:</label>
                        <select
                            className="form-select form-select-sm rounded-pill"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            style={{ backgroundColor: "#e8d9f4", color: "#333", border: "none" }}
                        >
                            <option>Evento</option>
                            {/* Opciones de filtro generadas dinámicamente de los datos cargados */}
                            {[...new Set(photos.map(p => p.event_name))].map((event, index) => (
                                // Usamos event_name del backend como opción de filtro
                                <option key={index} value={event}>{event}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- Mensajes de Estado --- */}

            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando fotos...</span>
                    </div>
                    <p className="mt-2">Cargando tus fotos de la nube...</p>
                </div>
            )}

            {errorMessage && (
                <div className="alert alert-danger text-center" role="alert">
                    <i className="bi bi-lock-fill me-2"></i>
                    <p className="mb-1 fw-bold">{errorMessage}</p>
                    {/* ⚠️ Ajusta la ruta a tu página de planes */}
                    <a href="/client/storage-plan" className="alert-link fw-bold">
                        Revisa tu Plan de Almacenamiento aquí
                    </a>
                </div>
            )}

            {/* Mensaje de Sin Fotos (Solo si no hay error y ya cargó) */}
            {!loading && !errorMessage && photos.length === 0 && (
                <div className="alert alert-info text-center" role="alert">
                    No tienes fotos disponibles en la nube asociadas a tu cuenta.
                </div>
            )}

            {/* --- Galería (Solo si hay fotos para mostrar) --- */}
            {!loading && !errorMessage && photos.length > 0 && (
                <div className="row g-4">
                    {fotosFiltradas.map((foto) => (
                        <div key={foto.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div className="card border-0 shadow-sm position-relative">
                                <img
                                    // 🔑 USAMOS FOTO.URL DE CONTABO S3
                                    src={foto.url}
                                    alt={foto.event_name}
                                    className="card-img-top rounded-3"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body text-center">
                                    <p className="fw-semibold mb-1">{foto.event_name}</p>
                                    <small className="text-muted">{foto.created_at}</small>
                                </div>

                                {/* Botón de descarga flotante */}
                                <button
                                    className="btn btn-sm position-absolute bottom-0 end-0 m-2 rounded-pill"
                                    onClick={() => handleDescargar(foto.url)}
                                    // Usé estilos inline para imitar el botón rosa que se ve en la imagen
                                    style={{ backgroundColor: "#A474D9", color: "white", border: "none" }}
                                >
                                    <i className="bi bi-download me-1"></i> Descargar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}