import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
// Las siguientes importaciones fallan en el entorno de compilación, 
// pero se mantienen ya que son necesarias en su proyecto original.
import "../Styles/apo.css";
import "react-calendar/dist/Calendar.css";

import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import Calendar from "../Components/Calendar";
import AppointmentDetails from "../Components/ApointmentsDetails";
import AppointmentModal from "../Components/ApointmentsModal";

import Spinner from "../Components/Spinner";
import api from "../../../../lib/api";
// Importar tipos base (asumidos)
import type { ExtendedCitaFormData, CustomerOption, EventOption, DocumentTypeOption } from "../Components/Types/types";
import type { Cita, CitaStatus } from "../Components/Types/types";
import { useAuth } from "../../../../context/useAuth";



// =========================================================
// 🔹 FUNCIONES HELPER (DECLARADAS AL INICIO)
// =========================================================
const isSameDay = (utcDate: Date, localDate: Date): boolean => {
    // Create a new Date object representing midnight UTC for the local date's year, month, and day
    const localDateAsUTC = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
    // Compare the timestamps
    return utcDate.getTime() === localDateAsUTC.getTime();
};

const timeToMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

const createId = () => `${Date.now()}-${Math.random()}`;

const parseBackendDate = (raw: any): Date => {
    if (!raw) return new Date();

    // 1. Tomar solo la parte de la fecha (ej: "2025-11-25")
    const base = String(raw).split(" ")[0];

    // 2. Extraer Y, M, D
    const [y, m, d] = base.split("-").map(Number);

    // 3. 🔑 ANCLAR A UTC: Esto garantiza que el objeto Date representa
    // el día exacto de la DB, independientemente de la zona horaria del usuario.
    // Restamos 1 al mes (m - 1).
    return new Date(Date.UTC(y, m - 1, d));
};

export const STATUS_FRONT_TO_BACK: Record<CitaStatus, string> = {
    Pendiente: "Pending confirmation",
    Confirmada: "Scheduled",
    Cancelada: "Cancelled",
    Completada: "Completed",
};

export const STATUS_BACK_TO_FRONT: Record<string, CitaStatus> = {
    "Pending confirmation": "Pendiente",
    Scheduled: "Confirmada",
    Cancelled: "Cancelada",
    Completed: "Completada",
};

const mapStatus = (status: any): CitaStatus => {
    const key = String(status) as keyof typeof STATUS_BACK_TO_FRONT;
    return STATUS_BACK_TO_FRONT[key] ?? "Pendiente";
}

const mapBackendAppointments = (data: any[]): Cita[] =>
    data.map((row: any) => {
        const parsedDate = parseBackendDate(row.date);
        const rawTime = row.startTime ?? "09:00";
        const startTime =
            typeof rawTime === "string" ? rawTime.slice(0, 5) : "09:00";

        const cita: Cita = {
            id: String(row.appointmentId ?? row.bookingId ?? createId()),
            appointmentId: Number(row.appointmentId),
            customerIdFK: row.customerId,
            eventIdFK: row.eventId,
            appointmentDuration: row.duration,
            date: parsedDate,
            startTime,
            endTime: "",
            client: row.clientName ?? "",
            status: mapStatus(row.status),
            location: row.place ?? "",
            notes: row.comment ?? "",
            document: row.clientDocument ?? "",
            email: row.clientEmail ?? "",
            phone: row.clientPhone ?? "",
            eventName: row.eventName ?? "",
            packageName: row.packageName ?? "",
        };
        return cita;
    });


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
const EmployeeAppointments: React.FC = () => {
    const { user, token, loading: authLoading } = useAuth();
    const EMPLOYEE_ID = user?.id;
    // 🔑 ID del evento "Documento" es 6, basado en tu tabla de Eventos
    const DOCUMENT_EVENT_ID = 6;

    // --- ESTADOS ---
    const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
    const [events, setEvents] = useState<EventOption[]>([]);
    // 🟢 ESTADO: Lista completa de tipos de documento de la BD
    const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);

    const searchClientTimeout = useRef<NodeJS.Timeout | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [citas, setCitas] = useState<Cita[]>([]);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialForm: ExtendedCitaFormData = useMemo(() => ({
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        client: "",
        status: "Pendiente",
        location: "",
        notes: "",
        customerIdFK: null,
        eventIdFK: null,
        packageIdFK: null,
        documentTypeIdFK: null,
        appointmentDuration: 60,
        employeeIdFK: user?.id ?? null,

    }), [user]);

    const [form, setForm] = useState<ExtendedCitaFormData>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState("");


    // =========================================================
    // 🔹 Lógica de Navegación/Selección
    // =========================================================

    const handleDayClick = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const handleDotClick = useCallback((cita: Cita) => {
        setSelectedDate(cita.date);
        setSelectedCita(cita);
    }, []);

    const handleChangeMonth = useCallback((dir: "prev" | "next") => {
        setCurrentMonth((prev) => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1));
            return d;
        });
    }, []);

    const citasDelDia = useMemo(() => {
        if (!selectedDate) return [];
        return citas
            .filter((c) => isSameDay(c.date, selectedDate))
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    }, [citas, selectedDate]);

    //  Effekt to keep selection in sync
    useEffect(() => {
        if (citasDelDia.length > 0) {
            if (!selectedCita || !citasDelDia.some(c => c.id === selectedCita.id)) {
                setSelectedCita(citasDelDia[0]);
            }
        } else {
            setSelectedCita(null);
        }
    }, [citasDelDia, selectedCita]);


    // =========================================================
    // 🔹 Lógica para Paquetes (Lógica de Sustitución)
    // =========================================================

    // 🔑 LÓGICA CRÍTICA: Filtra o sustituye los paquetes en función del Evento seleccionado.
    const packagesForSelectedEvent = useMemo(() => {
        if (form.eventIdFK === null) return [];

        // 1. CASO ESPECIAL: Evento "Documento" (ID 6)
        if (form.eventIdFK === DOCUMENT_EVENT_ID) {
            // Usa la lista de Document Types como si fueran Paquetes
            return documentTypes.map(d => ({
                id: d.id,
                name: d.name,
                // documentTypeIdFK es la clave que usa el modal para determinar si el campo 'Tipo Documento' debe mostrarse
                documentTypeIdFK: d.id,
            }));
        }

        // 2. CASO ESTÁNDAR: Eventos normales 
        const selectedEvent = events.find(e => e.id === form.eventIdFK);
        return selectedEvent?.packages || [];

    }, [form.eventIdFK, events, documentTypes, DOCUMENT_EVENT_ID]);


    // =========================================================
    // 🔹 Lógica de Formulario
    // =========================================================

    const validate = useCallback((isEditing: boolean) => {
        const er: Record<string, string> = {};

        if (!isEditing) {
            if (!form.customerIdFK) er.client = "Debe seleccionar un cliente.";
            if (!form.eventIdFK) er.eventIdFK = "Debe seleccionar un evento.";

            // Validar paquete si no estamos editando
            if (!form.packageIdFK) {
                er.packageIdFK = form.eventIdFK === DOCUMENT_EVENT_ID
                    ? "Debe seleccionar un tipo de documento."
                    : "Debe seleccionar un paquete.";
            }

            // Validar que el campo documentTypeIdFK esté lleno si el paquete lo exige 
            const pkg = packagesForSelectedEvent.find(p => p.id === form.packageIdFK);
            if (pkg?.documentTypeIdFK !== null && !form.documentTypeIdFK) {
                if (form.eventIdFK !== DOCUMENT_EVENT_ID) {
                    er.documentTypeIdFK = "El paquete requiere un tipo de documento.";
                }
            }
        }

        if (!form.date) er.date = "La fecha es obligatoria";
        if (!form.startTime) er.startTime = "La hora es obligatoria";
        if (!form.location.trim()) er.location = "La ubicación es obligatoria";
        if (form.appointmentDuration < 15) er.appointmentDuration = "Duración mínima 15 minutos.";


        return er;
    }, [form, DOCUMENT_EVENT_ID, packagesForSelectedEvent]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const key = name as keyof ExtendedCitaFormData;

        setForm((f) => {
            let parsedValue: string | number | null;

            // 1. Manejo de valores numéricos (IDs y Duration)
            if (key === 'appointmentDuration') {
                // Se asegura que la duración sea un número
                parsedValue = Number(value);
            } else if (key === 'eventIdFK' || key === 'packageIdFK' || key === 'documentTypeIdFK' || key === 'customerIdFK' || key === 'employeeIdFK') {
                // Se asegura que los IDs sean números o null (si el string es vacío)
                parsedValue = value ? Number(value) : null;
            } else {
                // 2. Manejo de valores de texto y otros (status, client, location, notes, date, startTime, endTime)
                // Se asigna directamente el string.
                parsedValue = value;
            }
            
            // 3. Creación inmutable del nuevo formulario con el valor actualizado
            let newForm: ExtendedCitaFormData = {
                ...f, 
                // Usamos 'as any' solo para satisfacer al índice dinámico de TypeScript
                // ya que el valor de parsedValue ya fue correctamente tipado previamente.
                [key]: parsedValue as any, 
            };
            
            // 4. Lógica CLAVE de Limpieza: (Se mantiene la lógica de negocio)
            if (key === 'eventIdFK') {
                newForm.packageIdFK = null;
                newForm.documentTypeIdFK = null;
            }

            if (key === 'packageIdFK') {
                newForm.documentTypeIdFK = null;
            }
            
            return newForm;
        });
        
        setErrors((er) => ({ ...er, [name]: "" }));
    }, []);

    const handleEditClick = useCallback((cita: Cita) => {
        setIsEditing(true);
        setSelectedCita(cita);

        // 🔑 Al editar, NO cargar las FKs de Paquete/Documento
        setForm({
            ...initialForm,
            date: cita.date.toISOString().split("T")[0],
            startTime: cita.startTime,
            client: cita.client,
            status: cita.status,
            location: cita.location,
            notes: cita.notes ?? "",
            customerIdFK: cita.customerIdFK,
            eventIdFK: cita.eventIdFK,
            packageIdFK: null,
            documentTypeIdFK: null,
            appointmentDuration: cita.appointmentDuration,
        });

        setShowModal(true);
    }, [initialForm]);

    const handleNewClick = useCallback(() => {
        setIsEditing(false);
        // 🔑 Limpieza explícita de FKs al crear nueva cita
        setForm({ ...initialForm, eventIdFK: null, packageIdFK: null, documentTypeIdFK: null });
        setCustomerOptions([]);
        setShowModal(true);
    }, [initialForm]);

    // ... (Lógica de Búsqueda y Selección de Clientes)

    const handleSearchClient = useCallback((query: string) => {
        if (searchClientTimeout.current) {
            clearTimeout(searchClientTimeout.current);
        }

        if (query.length < 1) {
            setCustomerOptions([]);
            return;
        }

        searchClientTimeout.current = setTimeout(async () => {
            try {
                // 🚨 El endpoint DEBE usar el token y la query
                const res = await api.get(`/api/customers/search?query=${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // 🚨 Mapeo de la respuesta: Asumiendo que Laravel devuelve el array directamente (no res.data.data)
                const options = (res.data || []).map((c: any) => ({
                    id: c.id,
                    name: `${c.name} (Doc: ${c.documentNumber})`, // Usamos la estructura de tu JSON
                }));

                setCustomerOptions(options);
            } catch (e) {
                console.error("Error buscando clientes", e);
                // ...
            }
        }, 300);
    }, [token]);

    const handleClientSelect = useCallback((id: number, name: string) => {
        setCustomerOptions([]);
        setForm(f => ({ ...f, customerIdFK: id, client: name }));
        setErrors(er => ({ ...er, client: "" }));
    }, []);

    // ... (Lógica de Carga y Envío)

    const refreshAppointments = useCallback(() => {
        if (!EMPLOYEE_ID || !token || authLoading) return;

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const resCitas = await api.get(`/api/employee/${EMPLOYEE_ID}/appointments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const citasMap = mapBackendAppointments(resCitas.data || []);
                setCitas(citasMap);

                // 🔑 RUTA CLAVE: Obtiene Eventos (con Paquetes o Tipos de Documento anidados)
                const resEvents = await api.get('/api/events-with-packages');
                const eventOptions = (resEvents.data || []).map((e: any) => ({
                    id: e.id,
                    name: e.name || e.eventType,
                    packages: e.packages || [],
                }));
                setEvents(eventOptions);

                // 🟢 CARGA TIPOS DE DOCUMENTO (Lista global para el select secundario del modal)
                const resDocTypes = await api.get('/api/document-types');
                const docTypeOptions = (resDocTypes.data.data || resDocTypes.data || []).map((d: any) => ({
                    id: d.id,
                    name: d.name
                }));
                setDocumentTypes(docTypeOptions);

                setSelectedDate(new Date());

            } catch (e) {
                console.error("Error cargando datos iniciales", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [EMPLOYEE_ID, token, authLoading]);

    useEffect(() => {
        refreshAppointments();
    }, [refreshAppointments]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const v = validate(isEditing);
        if (Object.keys(v).length) return setErrors(v);

        setIsLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };

        let finalPackageIdFK = form.packageIdFK;
        let finalDocumentTypeIdFK = form.documentTypeIdFK;

        if (form.eventIdFK === DOCUMENT_EVENT_ID) {
            // 🔑 CASO ESPECIAL: Evento Documento (ID 6). 
            // El packageIdFK es el documentTypeIdFK seleccionado.
            finalPackageIdFK = form.packageIdFK; // ID del documento
            finalDocumentTypeIdFK = form.packageIdFK; // Usamos el mismo ID para documentTypeIdFK en el Booking
        }

        const payload = {
            eventIdFK: form.eventIdFK,
            customerIdFK: form.customerIdFK,
            employeeIdFK: form.employeeIdFK,

            // 🔑 USAMOS LAS VARIABLES FINALES PARA LA DB
            packageIdFK: finalPackageIdFK,
            documentTypeIdFK: finalDocumentTypeIdFK,

            appointmentDate: form.date,
            appointmentTime: form.startTime + ':00',
            place: form.location || null,
            comment: form.notes || null,
            appointmentDuration: form.appointmentDuration,
        };

        if (isEditing && selectedCita) {
            // ... (Lógica PUT - No se envían FKs de paquete/documento)
            try {
                const updatePayload = {
                    date: form.date,
                    startTime: form.startTime,
                    place: form.location || null,
                    comment: form.notes || null,
                    status: STATUS_FRONT_TO_BACK[form.status],
                };

                await api.put(
                    `/api/employee/appointments/${selectedCita.appointmentId}`,
                    updatePayload,
                    { headers }
                );

                setSuccess("Cita actualizada exitosamente.");
                refreshAppointments();

            } catch (err) {
                const errorData = (err as any).response?.data?.errors;
                if (errorData) {
                    setErrors(errorData);
                } else {
                    setErrors({ general: "No se pudo actualizar la cita. Error de servidor." });
                }
            } finally {
                setIsLoading(false);
            }
            return;
        }

        try {
            // ✅ CORRECCIÓN: Se elimina el nombre de la variable de respuesta
            // para evitar el warning '6133' de variable no leída.
            await api.post(`/api/appointments`, payload, { headers }); 

            setSuccess("Cita creada exitosamente. Recargando citas...");
            setTimeout(() => {
                setShowModal(false);
                refreshAppointments();
            }, 1000);

        } catch (err: any) {
            console.error("Error al crear cita:", err.response?.data?.errors ?? err);
            setErrors(err.response?.data?.errors ?? {});
            setSuccess("");
        } finally {
            setIsLoading(false);
        }
    }, [validate, token, form, isEditing, selectedCita, refreshAppointments, DOCUMENT_EVENT_ID]);


    return (
        <EmployeeLayout>
            {isLoading && <Spinner />}
            <div className="container-fluid bg-light min-vh-100 appointments-page">
                <div className="container py-4">
                    <h2 className="text-dark">Citas</h2>
                    <hr />

                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card shadow-sm p-3">
                                <Calendar
                                    currentMonth={currentMonth}
                                    selectedDate={selectedDate}
                                    citas={citas}
                                    onChangeMonth={handleChangeMonth}
                                    onDayClick={handleDayClick}
                                    onDotClick={handleDotClick}
                                />
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card shadow-sm p-3 h-100">
                                <AppointmentDetails
                                    citasDelDia={citasDelDia}
                                    selectedCita={selectedCita}
                                    selectedDate={selectedDate}
                                    onSelectCita={setSelectedCita}
                                    onEditClick={handleEditClick}
                                    onNewClick={handleNewClick}
                                />
                            </div>
                        </div>
                    </div>

                    <AppointmentModal
                        show={showModal}
                        isEditing={isEditing}
                        form={form}
                        errors={errors}
                        success={success}

                        customers={customerOptions}
                        events={events}
                        packages={packagesForSelectedEvent} // 🔑 Lista unificada
                        documentTypes={documentTypes} // 🟢 Lista global de Document Types
                        onClientSelect={handleClientSelect}
                        onSearchClient={handleSearchClient}

                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onClose={() => {
                            setShowModal(false);
                            setSuccess("");
                        }}
                    />
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAppointments;