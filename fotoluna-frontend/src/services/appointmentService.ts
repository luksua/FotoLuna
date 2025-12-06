import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export interface AdminAppointment {
    id: number;              // vamos a mapear desde appointmentId
    date: string;            // '2025-11-06'
    time: string;            // '08:00'
    clientName?: string;
    eventName?: string;
    employeeName?: string;
    employeeId?: number;
    status?: string;         // puede venir después del backend
}

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        }
    };
};

// 🔹 IMPORTANTE: usar response.data.data del paginador
export const getAppointments = async (): Promise<AdminAppointment[]> => {
    try {
        const response = await axios.get<{
            current_page: number;
            data: any[];    // objetos con appointmentId, bookingId, date, time, place, ...
            total: number;
        }>(
            `${API_BASE_URL}/api/admin/appointments`,
            getAuthHeaders()
        );

        const raw = response.data.data ?? [];

        // mapeamos al shape que usa el front
        const appointments: AdminAppointment[] = raw.map((a: any) => ({
            id: a.appointmentId,
            date: a.date,
            time: a.time,
            clientName: a.clientName ?? '',
            eventName: a.eventName,
            employeeName: a.employeeName,
            employeeId: a.employeeId,
            status: a.status, // si no viene, quedará undefined
        }));

        console.log("Appointments mapeadas:", appointments);
        return appointments;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
};

export const getPendingAppointmentsCount = async (): Promise<number> => {
    try {
        const appointments = await getAppointments();
        // Si el backend aún no manda status, esto dará 0 (lógico)
        return appointments.filter(a =>
            a.status === 'Scheduled' || a.status === 'Pending_assignment'
        ).length;
    } catch (error) {
        console.error('Error counting pending appointments:', error);
        return 0;
    }
};

export const getCancelledAppointmentsCount = async (): Promise<number> => {
    try {
        const appointments = await getAppointments();
        return appointments.filter(a => a.status === 'Cancelled').length;
    } catch (error) {
        console.error('Error counting cancelled appointments:', error);
        return 0;
    }
};

export const getBookedPackagesCount = async (): Promise<number> => {
    try {
        const response = await axios.get<{ success: boolean; data: { total: number } }>(
            `${API_BASE_URL}/api/admin/packages/count-booked`,
            getAuthHeaders()
        );
        return response.data.data.total || 0;
    } catch (error) {
        console.error('Error getting booked packages count:', error);
        return 0;
    }
};

export interface SalesMonth {
    mes: string;
    ventas: number;
}

export const getSalesByMonth = async (): Promise<SalesMonth[]> => {
    try {
        const response = await axios.get<{ success: boolean; data: SalesMonth[]; year: number }>(
            `${API_BASE_URL}/api/admin/sales/by-month`,
            getAuthHeaders()
        );
        return response.data.data || [];
    } catch (error) {
        console.error('Error getting sales by month:', error);
        return [];
    }
};

// 🔹 Cita más cercana
export const getNextAppointment = async (): Promise<AdminAppointment | null> => {
    try {
        const response = await axios.get<{
            success: boolean;
            data: any | null;
        }>(
            `${API_BASE_URL}/api/admin/appointments/next`,
            getAuthHeaders()
        );

        const a = response.data.data;
        if (!a) return null;

        const appointment: AdminAppointment = {
            id: a.appointmentId,
            date: a.date,
            time: a.time,
            clientName: a.clientName ?? '',
            eventName: a.eventName,
            employeeName: a.employeeName,
            employeeId: a.employeeId,
            status: a.status,
        };

        return appointment;
    } catch (error) {
        console.error('Error getting next appointment:', error);
        return null;
    }
};

