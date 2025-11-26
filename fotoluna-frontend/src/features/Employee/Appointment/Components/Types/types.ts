export type CitaStatus = "Pendiente" | "Confirmada" | "Cancelada" | "Completada";

export type Cita = {
  id: string;              // lo puedes seguir usando como key
  appointmentId: number;   // 👈 NUEVO: id real de la cita en BD
  date: Date;
  startTime: string;
  endTime: string;
  client: string;
  status: CitaStatus;
  location: string;
  notes?: string;
  document?: string;
  email?: string;
  phone?: string;
  eventName?: string;
  packageName?: string;
};


export type CitaFormData = {
  date: string;
  startTime: string;
  endTime: string;
  client: string;
  status: CitaStatus;
  location: string;
  notes?: string;
};
