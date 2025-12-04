// src/Components/types/Photo.ts (Asegúrate de que este archivo refleje la realidad de tu API)

export interface Photo {
  id: number;
  // 🚨 Nueva URL firmada de la nube (Contiene la firma y expira en 7 días)
  url: string;
  // 🚨 El nombre que viene del backend (Evento, Plan, o 'Foto Individual')
  name: string;
  // 🚨 Se utiliza la fecha de subida del backend
  uploaded_at: string;
  // Tamaño en bytes
  size: number;
  // Opcional: ID del cliente
  customerIdFK?: number;
  // Opcional: Nombre del Evento (si lo quieres como campo separado)
  event_name: string;
}

export interface Stats {
  total_photos: number;
  expiring_soon: number;
  total_size: number;
}

export interface PhotoCardProps {
  photo: Photo;
  onDelete?: (photoId: number) => void;
}

export interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoDelete: (photoId: number) => Promise<void>;
  loading: boolean;
  onNavigateToUpload: () => void;
}