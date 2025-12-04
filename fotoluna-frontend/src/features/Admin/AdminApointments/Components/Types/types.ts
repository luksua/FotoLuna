// src/types/adminAppointments.ts

// Estado de disponibilidad que usas en la UX
export type AvailabilityStatus = "free" | "partial" | "busy" | "unknown";

// Cita que devuelve GET /api/admin/appointments
export interface AdminAppointment {
    appointmentId: number;
    bookingId: number | null;
    date: string;          // "2025-11-25"
    time: string;          // "10:00"
    place?: string | null;
    comment?: string | null;
    status: string;        // "Pending_assignment", "Scheduled", etc.

    clientName: string;
    clientEmail?: string | null;
    clientDocument?: string | null;

    eventName?: string | null;

    employeeId: number | null;
    employeeName: string | null;
}

// Cita × empleado del día (para ver mini resumen si quieres)
export interface EmployeeDayAppointment {
    time: string;   // "10:00"
    status: string; // "Scheduled", "Pending confirmation", etc.
}

// Empleado candidato que devuelve /candidates
export interface CandidateEmployee {
    employeeId: number;
    name: string;
    available: boolean;
    availabilityStatus: AvailabilityStatus;
    dayAppointmentsCount: number;
    citasDelDia: EmployeeDayAppointment[];
    score?: number | null;
}

// Respuesta de GET /api/admin/appointments/{id}/candidates
export interface CandidatesResponse {
    appointment: {
        id: number;
        date: string;
        time: string;
        status: string;
    };
    suggestedEmployee: CandidateEmployee | null;
    employees: CandidateEmployee[];
}

// Props del modal de asignación
export interface AssignPhotographerModalProps {
    show: boolean;
    onClose: () => void;
    appointment: AdminAppointment;
    onAssigned: () => void;              // callback cuando se asignó alguien bien
    apiBaseUrl: string;
    getAuthHeaders: () => Record<string, string>;
}

export interface AdminAppointmentsResponse {
    data: AdminAppointment[];  // registros de la página actual
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
