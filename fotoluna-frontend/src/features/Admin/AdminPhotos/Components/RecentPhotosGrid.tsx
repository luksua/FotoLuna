// AdminPhotos/components/RecentPhotosGrid.tsx
import React from "react";
import type { CloudPhoto } from "../Components/Types/types";

interface RecentPhotosGridProps {
    photos: CloudPhoto[];
    onPhotoClick: (photo: CloudPhoto) => void;
}

export const RecentPhotosGrid: React.FC<RecentPhotosGridProps> = ({
    photos,
    onPhotoClick,
}) => {
    if (!photos.length) {
        return <p className="ap-empty-text">Este cliente aún no tiene fotos.</p>;
    }

    return (
        <div className="ap-gallery">
            <div className="ap-gallery__label">
                <span>Fotos recientes</span>
                <span className="ap-gallery__hint">Click en una foto para ampliar</span>
            </div>

            <div className="ap-gallery__grid">
                {photos.slice(0, 9).map((photo) => {
                    const src = photo.thumbnailUrl || photo.url;
                    return (
                        <button
                            key={photo.id}
                            className="ap-thumb"
                            type="button"
                            onClick={() => onPhotoClick(photo)}
                        >
                            <img src={src} alt={`Foto ${photo.id}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
