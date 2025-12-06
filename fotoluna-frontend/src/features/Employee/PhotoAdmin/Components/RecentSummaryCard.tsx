// src/features/Employee/Photos/components/RecentSummaryCard.tsx

import React from "react";
import type { CustomerRecentSummary, PhotoThumbnail } from "./types/Photo";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface RecentSummaryCardProps {
    customer: CustomerRecentSummary;
    onViewPhotos: (customerId: number) => void;
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
    <div className="d-flex flex-wrap gap-1 mt-3 border p-1 rounded bg-light">
        {photos.map((photo) => (
            <div key={photo.id} style={{ width: '45px', height: '45px', overflow: 'hidden' }}>
                <img
                    src={photo.url || photo.thumbnailUrl}
                    alt={photo.id.toString()}
                    className="w-100 h-100 object-fit-cover rounded"
                    title={`Subida: ${formatDateTime(photo.uploadedAt)}`}
                />
            </div>
        ))}
    </div>
);


export const RecentSummaryCard: React.FC<RecentSummaryCardProps> = ({
    customer,
    onViewPhotos,
}) => {
    const total = customer.totalRecentPhotos;
    const lastUpload = formatDateTime(customer.lastUploadAt);
    const coverPhotoUrl = customer.recentPhotos[0]?.url || 'https://placehold.co/400x200/BDB7D3/ffffff?text=FOTO+LUNA';

    return (
        <article className="card shadow-sm h-100 border-0 overflow-hidden" style={{ maxWidth: '350px' }}>
            {/* Portada */}
            <div className="position-relative" style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                <img
                    src={coverPhotoUrl}
                    alt={`Portada de ${customer.customerName}`}
                    className="w-100 h-100 object-fit-cover"
                    // Fallback visual si la imagen falla
                    onError={(e: any) => e.target.src = 'https://placehold.co/400x200/BDB7D3/ffffff?text=FOTO+LUNA'}
                />
                <div className="position-absolute top-0 end-0 m-2 badge bg-dark opacity-75">
                    {total} fotos recientes
                </div>
            </div>

            <div className="card-body">
                <h3 className="card-title text-purple-700 fw-bold">{customer.customerName}</h3>
                <p className="card-text text-muted mb-3">
                    <i className="bi bi-calendar me-1"></i>
                    Última subida: {lastUpload}
                </p>

                {/* Mini-Galería */}
                {customer.recentPhotos.length > 0 && (
                    <PhotoGrid photos={customer.recentPhotos} />
                )}

                {/* Acciones */}
                <div className="mt-4 d-grid">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onViewPhotos(customer.customerId)}
                        style={{ backgroundColor: '#8c2db0', borderColor: '#8c2db0' }}
                    >
                        Ver {total} fotos
                    </button>
                </div>
            </div>
        </article>
    );
};