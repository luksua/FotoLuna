// src/features/Employee/Appointment/Components/Types/types.ts

// =========================================================
// INTERFACES AUXILIARES (DEBEN SER EXPORTADAS)
// =========================================================
export interface CustomerOption { 
    id: number; 
    name: string; 
    // Añade otras propiedades que necesites mostrar en el dropdown
    documentNumber?: string;
}

export interface EventOption {
    id: number;
    name: string;
}

// =========================================================
// 1. ESTADO DE CITA (BASE)
// =========================================================
export type CitaStatus =
  | "Pendiente"
  | "Confirmada"
  | "Cancelada"
  | "Completada";

// Cita ya armada para todo el frontend
export type Cita = {
    id: string; 
    appointmentId: number; 

    // Claves FK
    customerIdFK: number | null;
    eventIdFK: number | null;
    appointmentDuration: number;
    employeeIdFK?: number | null; 

    date: Date;
    startTime: string;

    endTime?: string;
    client: string; 
    status: CitaStatus;
    location: string;
    notes?: string;

    // Datos del cliente (para detalles)
    document?: string;
    email?: string;
    phone?: string;

    // Datos extra del booking/evento
    eventName?: string;
    packageName?: string;
};

// =========================================================
// 2. DATOS QUE EL FORMULARIO BASE ENVÍA AL BACKEND
// =========================================================
export type CitaFormData = {
    date: string; 
    startTime: string; 
    endTime?: string;

    client: string; 
    status: CitaStatus;
    location: string;
    notes?: string;
};

// =========================================================
// 3. TIPO EXTENDIDO FINAL (Payload para POST /api/appointments)
// =========================================================
export type ExtendedCitaFormData = CitaFormData & {
    customerIdFK: number | null;
    eventIdFK: number | null;
    appointmentDuration: number;
    employeeIdFK: number | null; 
};

// =========================================================
// 4. VISTA DE CALENDARIO
// =========================================================
export type CalendarView = "day" | "week" | "month";