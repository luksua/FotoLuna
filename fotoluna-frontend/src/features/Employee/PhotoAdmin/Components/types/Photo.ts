export interface Photo {
  id: number;
  name: string;
  path: string;
  size: number;
  uploaded_at: string;
  event?: EventInfo;
}

export interface EventInfo {
  name: string;
  date: string;
  time: string;
  location: string;
  linkedUsers: string[];
}

export interface Stats {
  total_photos: number;
  expiring_soon: number;
  total_size: number;
}

export interface PhotoCardProps {
  photo: Photo;
  onDelete: (photoId: number) => void;
}

export interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoDelete: (photoId: number) => void;
  loading: boolean;
  onNavigateToUpload: () => void;
}