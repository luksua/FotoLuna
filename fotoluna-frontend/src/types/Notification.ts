export interface NotificationData {
    title: string;
    message: string;
    booking_id?: number;
    appointment_id?: number;
    status?: string;
    // opcionalmente puedes añadir:
    priority?: 'high' | 'medium' | 'low';
    icon?: string;
}

export interface BackendNotification {
    id: string;
    type: string;
    notifiable_id: number;
    notifiable_type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UiNotification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
    date: string;
    category: 'today' | 'week' | 'older';
    icon: string;
    onClose?: () => void;
}
