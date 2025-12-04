import React, { useState } from 'react';
import type { PhotoCardProps } from './types/Photo';
import '../Styles/photo/PhotoCard.css';

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {

    const getDaysText = (days: number): string => {
        if (days === 1) return '1 día restante';
        if (days === 0) return 'Hoy expira';
        return `${days} días restantes`;
    };

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
    const isExpired = daysRemaining < 0;
    const daysText = daysRemaining === 0 ? 'Expirada hoy' : getDaysText(daysRemaining);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const [imageError, setImageError] = useState(false);

    // Imagen de fallback para URLs rotas o que contienen el error de firma
    const getFallbackContent = (name: string): React.ReactNode => {
        if (photo.url && photo.url.startsWith('S3_SIGNING_ERROR')) {
            return (
                <div className="placeholder-icon display-6 text-danger px-3">
                    <i className="bi bi-exclamation-octagon me-2"></i> Error de firma S3.
                </div>
            );
        }

        const extensions = ['.jpg', '.png', '.gif', '.jpeg'];
        const hasExtension = extensions.some(ext => name.toLowerCase().includes(ext));

        if (hasExtension) {
            if (name.toLowerCase().includes('.gif')) return <div className="placeholder-icon display-1 text-muted">🎬</div>;
            if (name.toLowerCase().includes('.png')) return <div className="placeholder-icon display-1 text-muted">🖼️</div>;
            return <div className="placeholder-icon display-1 text-muted">📷</div>;
        }
        return <div className="placeholder-icon display-1 text-muted">📸</div>;
    };

    // Eliminamos la función handleDelete

    const handleDownload = (): void => {
        if (!photo.url || photo.url.startsWith('S3_SIGNING_ERROR')) {
            alert("No se puede descargar. La URL de la imagen es inválida.");
            return;
        }
        const link = document.createElement('a');
        link.href = photo.url;
        link.setAttribute('download', photo.name || `foto-${photo.id}.jpg`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className={`photo-card card h-100 shadow-sm border-0 ${isExpiringSoon ? 'expiring-soon' : ''} ${isExpired ? 'expired' : ''}`}>
            {/* 🚨 Contenedor de Imagen con Aspect Ratio Fijo */}
            <div className="photo-image-container position-relative" style={{ aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                {photo.url && !imageError && !photo.url.startsWith('S3_SIGNING_ERROR') ? (
                    <img
                        src={photo.url}
                        alt={photo.name}
                        className="photo-image-content"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Asegura que ocupe todo el contenedor
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="photo-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {getFallbackContent(photo.name)}
                    </div>
                )}
                {isExpiringSoon && !isExpired && (
                    <div className={`expiring-badge bg-warning text-dark ${daysRemaining === 0 ? 'bg-danger text-white' : ''}`}>
                        <i className="bi bi-clock me-1"></i>
                        {daysText}
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
                <span className="badge bg-primary mb-2" title="Evento/Plan Asociado">
                    <i className="bi bi-tag me-1"></i> {photo.event_name}
                </span>

                <h6 className="card-title text-truncate" title={photo.name}>
                    {photo.name}
                </h6>

                <div className="photo-info">
                    {photo.customerIdFK && (
                        <small className="text-muted d-block mb-1">
                            <i className="bi bi-person me-1"></i> Cliente ID: {photo.customerIdFK}
                        </small>
                    )}
                    <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar me-1"></i>
                        Subida: {new Date(photo.uploaded_at).toLocaleDateString('es-ES')}
                    </small>
                    <small className="text-muted d-block">
                        <i className="bi bi-hdd me-1"></i>
                        {formatFileSize(photo.size)}
                    </small>
                </div>
            </div>

            <div className="card-footer bg-transparent border-top-0 pt-0 d-flex gap-2">
                <button
                    // Ocupa el 100% del espacio del footer
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={handleDownload}
                    disabled={!photo.url || photo.url.startsWith('S3_SIGNING_ERROR')}
                >
                    <i className="bi bi-download me-1"></i> Descargar
                </button>
                {/* Botón de Eliminar removido */}
            </div>
        </div>
    );
};

export default PhotoCard;