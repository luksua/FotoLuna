// src/types/Notification.ts
export interface NotificationData {
  title: string;
  message: string;
  booking_id?: number;
  appointment_id?: number;
  status?: string;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_id: number;
  notifiable_type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}
