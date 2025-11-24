// components/appointments/types.ts
export type CitaStatus = "Pendiente" | "Confirmada" | "Cancelada" | "Completada";

export type Cita = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  client: string;
  status: CitaStatus;
  location: string;
  notes?: string;
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
