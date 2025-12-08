// src/features/Employee/Photos/components/types.ts

// Tipo para la foto resumida (miniatura en la tarjeta)
export interface PhotoThumbnail {
    id: number;
    url: string;
    thumbnailUrl: string; // Se usa la misma URL firmada para la miniatura
    uploadedAt: string;
    bookingId: number | null;
}

// Tipo para el resumen del cliente (respuesta de GET /employee/photos/summary)
export interface CustomerRecentSummary {
    customerId: number;
    customerName: string; // Nombre completo
    totalRecentPhotos: number;
    lastUploadAt: string; // Fecha y hora de la última subida (en los últimos 15 días)
    recentPhotos: PhotoThumbnail[]; // Las miniaturas
}

// Tipo para la foto detallada (respuesta de GET /employee/customers/{id}/photos/recent)
// Coincide con la interfaz 'Photo' usada en PhotoCard.tsx (asumiendo que tiene estos campos)
export interface DetailedPhoto {
    id: number;
    url: string;
    name: string; // original_name en el backend
    uploaded_at: string; // created_at en el backend
    size: number;
    customerIdFK: number;
    event_name: string;
}