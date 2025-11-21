import React from 'react';
import type { PhotoCardProps } from './types/Photo';
import '../Styles/photo/PhotoCard.css';

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete }) => {
    const getDaysRemaining = (uploadedAt: string): number => {
        const uploadDate = new Date(uploadedAt);
        const expirationDate = new Date(uploadDate);
        expirationDate.setDate(expirationDate.getDate() + 7);
        const today = new Date();
        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const daysRemaining = getDaysRemaining(photo.uploaded_at);
    const isExpiringSoon = daysRemaining <= 2;
    const isExpired = daysRemaining === 0;

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDaysText = (days: number): string => {
        if (days === 0) return 'Hoy expira';
        if (days === 1) return '1 día restante';
        return `${days} días restantes`;
    };

    // Imagen de placeholder para demostración
    const getPlaceholderImage = (name: string): string => {
        const extensions = ['.jpg', '.png', '.gif'];
        const hasExtension = extensions.some(ext => name.toLowerCase().includes(ext));

        if (hasExtension) {
            if (name.toLowerCase().includes('.gif')) return '🎬';
            if (name.toLowerCase().includes('.png')) return '🖼️';
            return '📷';
        }
        return '📸';
    };

    const handleDelete = (): void => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            onDelete(photo.id);
        }
    };

    return (
        <div className={`photo-card card h-100 shadow-sm border-0 ${isExpiringSoon ? 'expiring-soon' : ''} ${isExpired ? 'expired' : ''}`}>
            <div className="photo-image-container position-relative">
                <div className="photo-placeholder">
                    <div className="placeholder-icon display-1 text-muted">
                        {getPlaceholderImage(photo.name)}
                    </div>
                </div>

                {isExpiringSoon && !isExpired && (
                    <div className="expiring-badge bg-warning text-dark">
                        <i className="bi bi-clock me-1"></i>
                        {getDaysText(daysRemaining)}
                    </div>
                )}

                {isExpired && (
                    <div className="expiring-badge bg-danger text-white">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Expirada
                    </div>
                )}
            </div>

            <div className="card-body">
                <h6 className="card-title text-truncate" title={photo.name}>
                    {photo.name}
                </h6>
                <div className="photo-info">
                    <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(photo.uploaded_at).toLocaleDateString('es-ES')}
                    </small>
                    <small className="text-muted d-block">
                        <i className="bi bi-hdd me-1"></i>
                        {formatFileSize(photo.size)}
                    </small>
                </div>
            </div>

            <div className="card-footer bg-transparent border-top-0 pt-0">
                <button
                    className="btn btn-outline-danger btn-sm w-100"
                    onClick={handleDelete}
                >
                    <i className="bi bi-trash me-1"></i>
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default PhotoCard;