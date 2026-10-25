// src/features/Employee/Photos/components/RecentSummaryCard.tsx

import React from "react";
import type { CustomerRecentSummary, PhotoThumbnail } from "./types/Photo";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface RecentSummaryCardProps {
    customer: CustomerRecentSummary;
    onViewRecent: (customerId: number) => void;
}

// Función auxiliar para formatear la fecha/hora
const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Componente simple para el grid de miniaturas
const PhotoGrid: React.FC<{ photos: PhotoThumbnail[] }> = ({ photos }) => (
    <div className="emp-photo-grid-preview">
        {photos.slice(0, 5).map((photo) => (
            <div key={photo.id} className="emp-photo-thumb-wrap">
                <img
                    src={photo.url || photo.thumbnailUrl}
                    alt={photo.id.toString()}
                    className="emp-photo-thumb-img"
                    title={`Subida: ${formatDateTime(photo.uploadedAt)}`}
                />
            </div>
        ))}
        {photos.length > 5 && (
            <div className="emp-photo-thumb-more">
                +{photos.length - 5}
            </div>
        )}
    </div>
);


export const RecentSummaryCard: React.FC<RecentSummaryCardProps> = ({
    customer,
    onViewRecent,
}) => {
    const total = customer.totalRecentPhotos;
    const lastUpload = formatDateTime(customer.lastUploadAt);
    const coverPhotoUrl = customer.recentPhotos[0]?.url || 'https://placehold.co/400x200/BDB7D3/ffffff?text=FOTO+LUNA';

    return (
        <article className="emp-summary-card">
            {/* Portada */}
            <div className="emp-summary-cover">
                <img
                    src={coverPhotoUrl}
                    alt={`Portada de ${customer.customerName}`}
                    onError={(e: any) => e.target.src = 'https://placehold.co/400x200/BDB7D3/ffffff?text=FOTO+LUNA'}
                />
                <div className="emp-cover-badge">
                    <i className="bi bi-image me-1"></i>
                    {total} {total === 1 ? 'foto' : 'fotos'}
                </div>
            </div>

            <div className="emp-summary-body">
                <div className="emp-customer-info">
                    <div className="emp-customer-avatar">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div>
                        <h3 className="emp-customer-name" title={customer.customerName}>{customer.customerName}</h3>
                        <p className="emp-customer-date">
                            <i className="bi bi-clock-history me-1"></i>
                            {lastUpload}
                        </p>
                    </div>
                </div>

                {/* Mini-Galería */}
                {customer.recentPhotos.length > 0 && (
                    <PhotoGrid photos={customer.recentPhotos} />
                )}

                {/* Acciones */}
                <button
                    type="button"
                    className="emp-summary-action-btn"
                    onClick={() => onViewRecent(customer.customerId)}
                >
                    <span>Ver {total} fotos</span>
                    <i className="bi bi-arrow-right"></i>
                </button>
            </div>
        </article>
    );
};