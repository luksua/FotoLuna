// AdminPhotos/types.ts
export interface CloudPhoto {
  id: number;
  url: string;          // URL pública o firmada desde S3
  thumbnailUrl?: string; // opcional, si tienes thumbs; si no, usa url
  uploadedAt: string;   // ISO string
  bookingId: number;
}

export interface CustomerPhotoSummary {
  customerId: number;
  customerName: string;
  totalPhotos: number;
  lastUploadAt: string;    // ISO
  recentPhotos: CloudPhoto[];
}
