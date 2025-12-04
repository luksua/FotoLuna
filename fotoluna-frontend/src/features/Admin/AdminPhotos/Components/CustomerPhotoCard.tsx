// AdminPhotos/components/CustomerPhotoCard.tsx
import React from "react";
import type { CustomerPhotoSummary, CloudPhoto } from "../Components/Types/types";
import { RecentPhotosGrid } from "./RecentPhotosGrid";

interface CustomerPhotoCardProps {
    customer: CustomerPhotoSummary;
    onViewAll: (customerId: number) => void;
    onPhotoClick: (photo: CloudPhoto, customer: CustomerPhotoSummary) => void;

    // NUEVO: controlado por el padre
    isExpanded: boolean;
    onToggleRecent: (customerId: number) => void;
}

export const CustomerPhotoCard: React.FC<CustomerPhotoCardProps> = ({
    customer,
    onViewAll,
    onPhotoClick,
    isExpanded,
    onToggleRecent,
}) => {
    const showRecent = isExpanded;

    const lastUpload = customer.lastUploadAt
        ? new Date(customer.lastUploadAt).toLocaleString()
        : "Sin subidas aún";

    return (
        <article className="ap-card">
            {/* portada: primera foto reciente o placeholder */}
            <div className="ap-card__cover">
                {customer.recentPhotos[0] ? (
                    <img
                        src={customer.recentPhotos[0].thumbnailUrl || customer.recentPhotos[0].url}
                        alt={`Portada de ${customer.customerName}`}
                    />
                ) : (
                    <div className="ap-card__cover--placeholder">Sin fotos</div>
                )}
            </div>

            <div className="ap-card__body">
                <h3 className="ap-card__title">{customer.customerName}</h3>
                <p className="ap-card__meta">
                    🖼 {customer.totalPhotos} fotos · 📅 Última subida: {lastUpload}
                </p>
            </div>

            <div className="ap-card__actions">
                <button
                    type="button"
                    className="ap-btn ap-btn--primary"
                    onClick={() => onToggleRecent(customer.customerId)}
                >
                    {showRecent ? "Ocultar fotos recientes" : "Ver fotos recientes"}
                </button>

                <button
                    type="button"
                    className="ap-btn ap-btn--secondary"
                    onClick={() => onViewAll(customer.customerId)}
                >
                    Ver todas las fotos
                </button>
            </div>

            {showRecent && (
                <div className="ap-card__gallery">
                    <RecentPhotosGrid
                        photos={customer.recentPhotos}
                        onPhotoClick={(photo) => onPhotoClick(photo, customer)}
                    />
                </div>
            )}
        </article>
    );
};
