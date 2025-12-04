// AdminPhotos/components/PhotoModal.tsx
import React from "react";
import "../styles/AdminPhotos.css";
import type { CloudPhoto } from "../Components/Types/types";

interface PhotoModalProps {
    photo: CloudPhoto | null;
    isOpen: boolean;
    customerName?: string;
    onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
    photo,
    isOpen,
    customerName,
    onClose,
}) => {
    if (!isOpen || !photo) return null;

    const imageSrc = photo.thumbnailUrl || photo.url;
    const bookingLabel = photo.bookingId
        ? `Reserva #${photo.bookingId}`
        : "Sin reserva asociada";

    return (
        <div
            className="ap-modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="ap-modal ap-modal--cute" onClick={(e) => e.stopPropagation()}>
                <header className="ap-modal__header">
                    <div className="ap-modal__header-text">
                        <div className="ap-modal__chip">
                            📸 Foto de {customerName ?? "cliente"}
                        </div>
                        <div className="ap-modal__title-row">
                            <h2 className="ap-modal__title">Foto #{photo.id}</h2>
                            <span className="ap-modal__badge">{bookingLabel}</span>
                        </div>
                    </div>

                    <button
                        className="ap-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar"
                        type="button"
                    >
                        x
                    </button>
                </header>

                <div className="ap-modal__body">
                    <img src={imageSrc} alt={`Foto ${photo.id}`} />
                </div>

                <footer className="ap-modal__footer">
                    <span className="ap-pill">
                        📅 Subida: {new Date(photo.uploadedAt).toLocaleString()}
                    </span>
                    {/* Aquí luego puedes agregar botones de Descargar / Eliminar */}
                </footer>
            </div>
        </div>
    );
};
