// =========================================================
// INTERFACES AUXILIARES (DEBEN SER EXPORTADAS)
// =========================================================
export interface CustomerOption {
id: number;
name: string;
// Añade otras propiedades que necesites mostrar en el dropdown
documentNumber?: string;
}

// 🟢 INTERFAZ DE TIPO DE DOCUMENTO (Lista global de la BD)
export interface DocumentTypeOption {
id: number;
name: string;
// Si la API devuelve más campos, agrégalos aquí (ej: price, slug)
}

// 🟢 INTERFAZ DE PAQUETE: Usada en la lista anidada del Evento
export interface PackageOption {
id: number;
name: string;
// Clave para la lógica de habilitación en el frontend
documentTypeIdFK: number | null;
}

// 🟢 INTERFAZ DE EVENTO: Incluye los paquetes/documentos
export interface EventOption {
id: number;
name: string;
packages: PackageOption[]; // <-- AÑADIDO
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
packageIdFK: number | null;      // <-- AÑADIDO
documentTypeIdFK: number | null; // <-- AÑADIDO
appointmentDuration: number;
employeeIdFK: number | null;
};

// =========================================================
// 4. VISTA DE CALENDARIO
// =========================================================
export type CalendarView = "day" | "week" | "month";