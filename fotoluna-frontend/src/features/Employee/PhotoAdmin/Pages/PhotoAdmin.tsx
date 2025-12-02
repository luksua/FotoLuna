import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoGallery from '../Components/PhotoGallery';
// 🚨 Nota: Asegúrate de que Photo y StatsType están definidos en este archivo o en '../Components/types/Photo'
import type { Photo, Stats as StatsType } from "../Components/types/Photo"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Styles/photo/PhotoAdmin.css';
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";


// =========================================================
// 🚨 DEFINICIÓN 1: FUNCIÓN DE AYUDA (Debe ir fuera y antes del componente)
// =========================================================
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    // Ampliado para evitar errores con archivos mayores a 1MB
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; 
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unitIndex = Math.min(i, sizes.length - 1);
    
    return parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(2)) + ' ' + sizes[unitIndex];
};


// =========================================================
// 🚨 DEFINICIÓN 2: DATOS MOCK (Debe ir fuera del componente)
// =========================================================
const mockPhotos: any[] = [ // Usamos 'any[]' temporalmente si Photo no está en el scope
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
    // 🚨 Usamos Photo[] y StatsType si fueron importados, o any si no
    const [photos, setPhotos] = useState<Photo[]>([]); 
    const [stats, setStats] = useState<StatsType>({
        total_photos: 0,
        expiring_soon: 0,
        total_size: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // Calcular estadísticas basadas en las fotos
    const calculateStats = (photosArray: Photo[]): void => {
        const total_photos = photosArray.length;
        const total_size = photosArray.reduce((sum: number, photo: Photo) => sum + photo.size, 0);

        const expiring_soon = photosArray.filter((photo: Photo) => {
            const uploadDate = new Date(photo.uploaded_at);
            const expirationDate = new Date(uploadDate);
            expirationDate.setDate(expirationDate.getDate() + 7);
            const daysRemaining = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysRemaining <= 2;
        }).length;

        setStats({
            total_photos,
            expiring_soon,
            total_size
        });
    };

    // Cargar fotos desde localStorage al iniciar
    useEffect(() => {
        const savedPhotos = localStorage.getItem('uploadedPhotos');
        
        // 🚨 CORRECCIÓN: Usar mockPhotos si savedPhotos es nulo
        const initialPhotos: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : mockPhotos; 

        const timer = setTimeout(() => {
            setPhotos(initialPhotos);
            calculateStats(initialPhotos);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Manejar eliminación de foto
    const handlePhotoDelete = async (photoId: number): Promise<void> => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const updatedPhotos = photos.filter((photo: Photo) => photo.id !== photoId);
        setPhotos(updatedPhotos);
        calculateStats(updatedPhotos);

        localStorage.setItem('uploadedPhotos', JSON.stringify(updatedPhotos));
        setLoading(false);
    };

    // Navegar a la página de upload
    const handleNavigateToUpload = () => {
        navigate('/employee/upload'); 
    };

    // Escuchar cambios en localStorage para fotos nuevas
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

    return (
        <EmployeeLayout>
            <div className="container-fluid bg-light min-vh-100">
                <div className="container py-4">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-dark mb-3">
                            Administrador de Fotos
                        </h1>
                        <p className="lead text-muted">
                            Gestiona tus fotos más recientes - Máximo 100 fotos • Se eliminan automáticamente después de 7 días
                        </p>
                    </div>

                    {/* Botón para subir fotos */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-12 col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-4">
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleNavigateToUpload}
                                    >
                                        <i className="bi bi-cloud-arrow-up me-2"></i>
                                        Subir Nuevas Fotos
                                    </button>
                                    <p className="text-muted mt-2 mb-0">
                                        Haz clic aquí para agregar nuevas fotos a tu galería
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="stat-card card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                    <i className="bi bi-images stat-icon text-primary"></i>
                                    <h3 className="stat-number fw-bold text-dark mt-3">
                                        {stats.total_photos}/100 
                                    </h3>
                                    <p className="stat-label text-muted mb-0">Fotos Actuales</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="stat-card card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                    <i className="bi bi-clock stat-icon text-warning"></i>
                                    <h3 className="stat-number fw-bold text-dark mt-3">
                                        {stats.expiring_soon}
                                    </h3>
                                    <p className="stat-label text-muted mb-0">Próximas a Expirar</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="stat-card card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                    <i className="bi bi-hdd stat-icon text-info"></i>
                                    <h3 className="stat-number fw-bold text-dark mt-3">
                                        {formatFileSize(stats.total_size)}
                                    </h3>
                                    <p className="stat-label text-muted mb-0">Espacio Utilizado</p>
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
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAdmin;