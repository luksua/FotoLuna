import React from 'react';
import type { PhotoGalleryProps } from './types/Photo';
import PhotoCard from './PhotoCard';
import '../Styles/photo/PhotoGallery.css';

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    onPhotoDelete,
    loading,
    onNavigateToUpload
}) => {
    if (photos.length === 0 && !loading) {
        return (
            <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                    <div className="empty-state">
                        <i className="bi bi-camera display-1 text-muted mb-4"></i>
                        <h3 className="text-dark mb-3">No hay fotos aún</h3>
                        <p className="text-muted mb-4">
                            Comienza subiendo algunas fotos para gestionar tu galería.
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={onNavigateToUpload}
                        >
                            <i className="bi bi-cloud-arrow-up me-2"></i>
                            Subir Primera Foto
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="photo-gallery">
            {/* Header de la galería con botón */}
            <div className="gallery-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-dark">Tus Fotos ({photos.length})</h4>
                    {/* <button
                        className="btn btn-outline-primary"
                        onClick={onNavigateToUpload}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Agregar Fotos
                    </button> */}
                </div>
            </div>

            {loading && (
                <div className="text-center mb-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Actualizando...</span>
                    </div>
                    <p className="text-muted mt-2">Actualizando galería...</p>
                </div>
            )}

            <div className="row g-4">
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                        <PhotoCard
                            photo={photo}
                            onDelete={onPhotoDelete}
                        />
                    </div>
                ))}
            </div>

            {photos.length > 0 && !loading && (
                <div className="text-center mt-5">
                    <button
                        className="btn btn-primary"
                        onClick={onNavigateToUpload}
                    >
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Subir Más Fotos
                    </button>
                    <p className="text-muted small mt-2">
                        Mostrando {photos.length} foto{photos.length !== 1 ? 's' : ''} •
                        Las fotos se eliminan automáticamente después de 7 días
                    </p>
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;