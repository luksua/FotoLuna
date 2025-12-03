import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export interface AdminAppointment {
    id: number;
    date: string;
    time: string;
    clientName: string;
    eventName?: string;
    employeeName?: string;
    employeeId?: number;
    status: string;
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

export const getAppointments = async (): Promise<AdminAppointment[]> => {
    try {
        const response = await axios.get<AdminAppointment[]>(
            `${API_BASE_URL}/api/admin/appointments`,
            getAuthHeaders()
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
};

export const getPendingAppointmentsCount = async (): Promise<number> => {
    try {
        const appointments = await getAppointments();
        // Contar citas con estado "Scheduled" o "Pending_assignment"
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
        // Contar citas con estado "Cancelled"
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

export const getNextAppointment = async (): Promise<AdminAppointment | null> => {
    try {
        const appointments = await getAppointments();
        if (appointments.length === 0) return null;

        // Obtener la fecha de hoy al inicio del día (considerando zona horaria local)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Parsear fechas de forma segura (formato YYYY-MM-DD)
        const parseDate = (dateStr: string) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day, 0, 0, 0, 0);
            return date;
        };

        // Filtrar citas que sean en el futuro (hoy o después)
        const futureAppointments = appointments.filter(a => {
            const appointmentDate = parseDate(a.date);
            return appointmentDate >= today;
        });

        if (futureAppointments.length === 0) return null;

        // Ordenar por fecha más cercana (incluyendo hora)
        futureAppointments.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            
            const [yearA, monthA, dayA] = a.date.split('-').map(Number);
            const [yearB, monthB, dayB] = b.date.split('-').map(Number);
            
            const dateA = new Date(yearA, monthA - 1, dayA, timeA[0], timeA[1], 0);
            const dateB = new Date(yearB, monthB - 1, dayB, timeB[0], timeB[1], 0);
            
            return dateA.getTime() - dateB.getTime();
        });

        return futureAppointments[0];
    } catch (error) {
        console.error('Error getting next appointment:', error);
        return null;
    }
};
