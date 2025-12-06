import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoGallery from '../Components/PhotoGallery';
<<<<<<< HEAD
import type { Photo, Stats as StatsType } from "../Components/types/Photo";
=======
import type { Photo, Stats as StatsType } from "../Components/types/Photo"; 
>>>>>>> origin/luna
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Styles/photo/PhotoAdmin.css';
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";

<<<<<<< HEAD

// ⚠ Ajusta este valor si tu backend no está en localhost:8000
const API_BASE_URL = "http://localhost:8000/api";


// =========================================================
// FUNCIÓN DE AYUDA (Debe ir fuera y antes del componente)
// =========================================================
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
=======
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; 
>>>>>>> origin/luna
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unitIndex = Math.min(i, sizes.length - 1);

    return parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(2)) + ' ' + sizes[unitIndex];
};

<<<<<<< HEAD

const EmployeeAdmin: React.FC = () => {

=======
const mockPhotos: any[] = [
    {
        id: 1,
        name: 'vacaciones_playa.jpg',
        path: '/mock/images/1.jpg',
        size: 2457600,
        uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 2,
        name: 'cumpleaños_familia.png',
        path: '/mock/images/2.png',
        size: 1894321,
        uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 3,
        name: 'paisaje_montaña.gif',
        path: '/mock/images/3.gif',
        size: 3452189,
        uploaded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

const EmployeeAdmin: React.FC = () => {
>>>>>>> origin/luna
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [stats, setStats] = useState<StatsType>({
        total_photos: 0,
        expiring_soon: 0,
        total_size: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const navigate = useNavigate();

<<<<<<< HEAD
    // Calcula estadísticas basadas en las fotos
=======
>>>>>>> origin/luna
    const calculateStats = (photosArray: Photo[]): void => {
        const total_photos = photosArray.length;
        const total_size = photosArray.reduce((sum: number, photo: Photo) => sum + photo.size, 0);

        const expiring_soon = photosArray.filter((photo: Photo) => {
            const uploadDate = new Date(photo.uploaded_at);
            const expirationDate = new Date(uploadDate);
            expirationDate.setDate(expirationDate.getDate() + 7);
<<<<<<< HEAD
            const daysRemaining = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysRemaining <= 2 && daysRemaining >= 0; // Solo si expira en <= 2 días y aún no ha expirado
=======
            const daysRemaining = Math.ceil(
                (expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysRemaining <= 2;
>>>>>>> origin/luna
        }).length;

        setStats({
            total_photos,
            expiring_soon,
            total_size
        });
    };

<<<<<<< HEAD
    // =========================================================
    // 🚨 FUNCIÓN CLAVE: Cargar TODAS las fotos de la nube
    // =========================================================
    const fetchAllPhotos = async () => {
        setLoading(true);
        setFetchError(null);
=======
    useEffect(() => {
        const savedPhotos = localStorage.getItem('uploadedPhotos');
        const initialPhotos: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : mockPhotos;
>>>>>>> origin/luna

        const token = localStorage.getItem("token");
        if (!token) {
            setFetchError("Error: No se encontró el token de autenticación.");
            setLoading(false);
            return;
        }

        try {
            // Llamada al endpoint: GET /api/cloud-photos
            const response = await fetch(`${API_BASE_URL}/cloud-photos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

<<<<<<< HEAD
            const data = await response.json();

            if (!response.ok) {
                // Manejo de errores de API (ej: 401 Unauthorized, 500 Internal Server Error)
                throw new Error(data.message || "Error al cargar la galería de administración.");
            }

            // Mapear los datos de la API al formato Photo del frontend
            const mappedPhotos: Photo[] = data.photos.map((p: any) => ({
                id: p.id,
                url: p.url, // URL firmada de 5 min
                name: p.original_name, // Usamos el nombre original del archivo
                uploaded_at: p.created_at, // Usamos created_at como uploaded_at
                size: p.size,
                event_name: p.event_name, // Nombre del evento/plan asociado (viene del COALESCE)
                customerIdFK: p.customerIdFK,
            }));

            setPhotos(mappedPhotos);
            calculateStats(mappedPhotos);

        } catch (error) {
            console.error("Error fetching photos:", error);
            setFetchError(`Fallo de conexión o permisos: ${error instanceof Error ? error.message : String(error)}`);
            setPhotos([]); // Limpiar fotos en caso de error
        } finally {
            setLoading(false);
        }
    };

    // Cargar fotos al iniciar el componente Y escuchar cambios
    useEffect(() => {
        fetchAllPhotos();

        // 🚨 SOLUCIÓN DE RECARGA EN VIVO: Escuchar el evento de subida
        const handlePhotosUploaded = () => {
            console.log('Evento photosUploaded recibido. Recargando fotos...');
            // Pequeño retraso para asegurar que la navegación entre páginas se complete antes de la recarga.
            setTimeout(() => fetchAllPhotos(), 50);
        };

        window.addEventListener('photosUploaded', handlePhotosUploaded);

        // Limpiar el listener cuando el componente se desmonte
        return () => window.removeEventListener('photosUploaded', handlePhotosUploaded);
    }, []); // [user] se eliminó porque el admin/employee es estático aquí.

    // La función de eliminar debe recargar la lista para reflejar el estado actual
    // Nota: Aunque el botón de eliminar fue removido de PhotoCard, esta lógica
    // se mantiene en EmployeeAdmin en caso de que se use en otro lugar.
=======
>>>>>>> origin/luna
    const handlePhotoDelete = async (photoId: number): Promise<void> => {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // 🚨 IMPLEMENTAR RUTA DELETE EN LARAVEL
            const response = await fetch(`${API_BASE_URL}/cloud-photos/${photoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Fallo al eliminar la foto del servidor.");
            }

            // Si la eliminación es exitosa, recargamos la lista desde el servidor
            fetchAllPhotos();

        } catch (error) {
            console.error("Error deleting photo:", error);
            alert(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            // El setLoading(false) se maneja dentro de fetchAllPhotos
        }
    };

    const handleNavigateToUpload = () => {
        navigate('/employee/upload');
    };

<<<<<<< HEAD
=======
    useEffect(() => {
        const handleStorageChange = () => {
            const savedPhotos = localStorage.getItem('uploadedPhotos');
            if (savedPhotos) {
                const parsedPhotos: Photo[] = JSON.parse(savedPhotos);
                setPhotos(parsedPhotos);
                calculateStats(parsedPhotos);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
>>>>>>> origin/luna

    return (
        <EmployeeLayout>
            {/* Fondo pastel + tema citas */}
            <div className="appointments-page min-vh-100">
                <div className="container py-4">
                    {/* Header */}
<<<<<<< HEAD
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-dark mb-3">
                            Administrador de Fotos (Historial Global)
                        </h1>
                        <p className="lead text-muted">
                            Gestiona el historial completo de fotos subidas por todos los empleados.
=======
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-dark mb-1">
                            Administrador de Fotos
                        </h2>
                        <p className="appointments-panel-subtitle">
                            Gestiona tus fotos recientes · Máx. 100 · Se eliminan después de 7 días
>>>>>>> origin/luna
                        </p>
                    </div>

                    {/* Botón para subir fotos */}
                    <div className="row justify-content-center mb-4">
                        <div className="col-12 col-lg-8">
                            <div className="card border-0">
                                <div className="card-body text-center py-4">
                                    <button
                                        className="appointments-new-btn mx-auto"
                                        onClick={handleNavigateToUpload}
                                    >
                                        <i className="bi bi-cloud-arrow-up me-2"></i>
                                        Subir Nuevas Fotos
                                    </button>
                                    <p className="text-muted mt-2 mb-0">
                                        Haz clic aquí para agregar nuevas fotos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="stat-card card h-100">
                                <div className="card-body text-center p-4">
                                    <i className="bi bi-images stat-icon"></i>
                                    <h3 className="stat-number fw-bold text-dark mt-3">
                                        {stats.total_photos}
                                    </h3>
<<<<<<< HEAD
                                    <p className="stat-label text-muted mb-0">Total de Fotos</p>
=======
                                    <p className="stat-label mb-0">Fotos actuales</p>
>>>>>>> origin/luna
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="stat-card card h-100">
                                <div className="card-body text-center p-4">
                                    <i className="bi bi-clock stat-icon"></i>
                                    <h3 className="stat-number fw-bold text-dark mt-3">
                                        {stats.expiring_soon}
                                    </h3>
<<<<<<< HEAD
                                    <p className="stat-label text-muted mb-0">Próximas a Expirar (7 días)</p>
=======
                                    <p className="stat-label mb-0">Próximas a expirar</p>
>>>>>>> origin/luna
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="stat-card card h-100">
                                <div className="card-body text-center p-4">
                                    <i className="bi bi-hdd stat-icon"></i>
                                    <h3 className="stat-number fw-bold text-dark mt-3">
                                        {formatFileSize(stats.total_size)}
                                    </h3>
                                    <p className="stat-label mb-0">Espacio utilizado</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Galería de Fotos */}
                    <PhotoGallery
                        photos={photos}
                        onPhotoDelete={handlePhotoDelete}
                        loading={loading}
                        onNavigateToUpload={handleNavigateToUpload}
                    />
                    {/* Mensaje de error general */}
                    {fetchError && (
                        <div className="alert alert-danger mt-4 text-center" role="alert">
                            <i className="bi bi-x-octagon me-2"></i> {fetchError}
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAdmin;
