// src/services/homeEmployeeService.ts
import axios from 'axios';
import { useAuth } from '../context/useAuth'; // Para obtener el ID del empleado

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No se encontró el token de autenticación.");
    }
    return {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        }
    };
};

// --- Interfaces ---

export interface EmployeeAppointment {
    appointmentId: number;
    bookingId: number;
    date: string;
    startTime: string;
    place: string;
    comment: string;
    status: string;
    clientName: string;
    clientDocument: string;
    clientEmail: string;
    needsAssignment: boolean;
}

export interface RecentPhoto {
    id: number;
    url: string;
    thumbnailUrl: string;
    uploadedAt: string; // ISO date string
    bookingId: number;
}

export interface PhotoSummary {
    customerId: number;
    customerName: string;
    totalRecentPhotos: number;
    lastUploadAt: string; // ISO date string
    recentPhotos: RecentPhoto[];
}

export interface Customer {
    id: number;
    fullName: string;
    documentNumber: string;
    createdAt: string; // ISO date string
    photoUrl: string | null;
    employee: {
        id: number;
        name: string;
        photo_url: string | null;
    };
    hasAppointments: boolean;
}

export interface Installment {
  id: number | null;
  amount: number;
  due_date: string;
  paid: boolean;
  paid_at?: string | null;
  status: string;
  is_overdue?: boolean;
  receipt_path?: string | null;
}

export interface Payment {
  id: number;
  booking_id: number;
  appointment_id?: number;

  date: string;
  clientName: string;
  clientCedula: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  installment: {
    current: number;
    total: number;
  };
  installmentAmount: number;
  totalAmount: number;
  status: string; // Changed from PaymentStatus to string for simplicity, as PaymentStatus is not defined here
  dueDate: string | null;

  installments?: Installment[];
}

// --- Funciones del Servicio ---

/**
 * Obtiene la lista de citas para un empleado específico.
 * El ID del empleado se obtiene del contexto de autenticación.
 */
export const getEmployeeAppointments = async (employeeId: number): Promise<EmployeeAppointment[]> => {
    try {
        // La ruta del backend es /api/employee/{employee}/appointments
        const response = await axios.get<EmployeeAppointment[]>(
            `${API_BASE_URL}/api/employee/${employeeId}/appointments`,
            getAuthHeaders()
        );
        // Devolvemos response.data si es un array, o un array vacío si no lo es
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error al obtener citas para el empleado ${employeeId}:`, error);
        return [];
    }
};

/**
 * Obtiene el resumen de fotos subidas por el empleado.
 */
export const getEmployeePhotoSummary = async (): Promise<PhotoSummary[]> => {
    try {
        // La ruta es /api/employee/photos/summary
        const response = await axios.get<PhotoSummary[]>(
            `${API_BASE_URL}/api/employee/photos/summary`,
            getAuthHeaders()
        );
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error al obtener el resumen de fotos:', error);
        return [];
    }
};

/**
 * Obtiene la lista de todos los clientes.
 */
export const getCustomers = async (): Promise<Customer[]> => {
    try {
        // La ruta es /api/customers
        const response = await axios.get<{ data: Customer[] }>( // Updated generic type
            `${API_BASE_URL}/api/customers`,
            getAuthHeaders()
        );
        // Devolvemos response.data.data si es un array, o un array vacío si no lo es
        return Array.isArray(response.data.data) ? response.data.data : []; // Access nested data
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        // Log the full error object for more details
        if (axios.isAxiosError(error)) {
            console.error('Axios Error Details:', error.response?.data, error.message);
        } else {
            console.error('Unknown Error:', error);
        }
        return [];
    }
};

/**
 * Obtiene la lista de pagos para el empleado autenticado.
 */
export const getEmployeePayments = async (): Promise<Payment[]> => {
    try {
        const response = await axios.get<{ data: Payment[] }>(
            `${API_BASE_URL}/employee/payments`,
            getAuthHeaders()
        );
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error al obtener los pagos del empleado:', error);
        if (axios.isAxiosError(error)) {
            console.error('Axios Error Details:', error.response?.data, error.message);
        } else {
            console.error('Unknown Error:', error);
        }
        return [];
    }
};