// Estado visible en el FRONT
export type CitaStatus =
  | "Pendiente"
  | "Confirmada"
  | "Cancelada"
  | "Completada";

// Cita ya armada para todo el frontend
export type Cita = {
  id: string;                // ID interno para React
  appointmentId: number;     // ID REAL de citas en BD

  date: Date;
  startTime: string;

  // endTime YA NO EXISTE EN TU SISTEMA
  endTime?: string;          // opcional por compatibilidad visual

  client: string;
  status: CitaStatus;
  location: string;

  notes?: string;

  // Datos del cliente
  document?: string;
  email?: string;
  phone?: string;

  // Datos extra del booking
  eventName?: string;
  packageName?: string;
};


// Datos que el FORM envía al backend
export type CitaFormData = {
  date: string;          // "2025-11-28"
  startTime: string;     // "09:00"
  // endTime YA NO SE USA
  endTime?: string;

  client: string;
  status: CitaStatus;
  location: string;
  notes?: string;
};
