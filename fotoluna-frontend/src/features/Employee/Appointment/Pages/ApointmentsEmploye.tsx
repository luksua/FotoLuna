import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import "../Styles/apo.css";
import "react-calendar/dist/Calendar.css";

import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import Calendar from "../Components/Calendar";
import AppointmentDetails from "../Components/ApointmentsDetails";
import AppointmentModal from "../Components/ApointmentsModal";

import Spinner from "../Components/Spinner";
import api from "../../../../lib/api";
// Importar tipos base (asumidos)
import type { ExtendedCitaFormData, CustomerOption, EventOption } from "../Components/Types/types";
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

    // --- ESTADOS ---
    const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
    const [events, setEvents] = useState<EventOption[]>([]);
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
        appointmentDuration: 60,

        // 🔑 ASIGNACIÓN DE ID DEL EMPLEADO LOGUEADO
        // Si 'user' está disponible, toma el ID; de lo contrario, es null.
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

    //  Effekt to keep selection in sync
    useEffect(() => {
        // If there are appointments for the day, select the first one by default
        if (citasDelDia.length > 0) {
            // Avoid re-selecting if the current one is already in the list
            if (!selectedCita || !citasDelDia.some(c => c.id === selectedCita.id)) {
                setSelectedCita(citasDelDia[0]);
            }
        } else {
            // If there are no appointments, clear the selection
            setSelectedCita(null);
        }
    }, [citasDelDia, selectedCita]);

    // =========================================================
    // 🔹 Lógica de Formulario
    // =========================================================

    const validate = useCallback((isEditing: boolean) => {
        const er: Record<string, string> = {};

        if (!isEditing) {
            if (!form.customerIdFK) er.client = "Debe seleccionar un cliente.";
            if (!form.eventIdFK) er.eventIdFK = "Debe seleccionar un evento.";
        }

        if (!form.date) er.date = "La fecha es obligatoria";
        if (!form.startTime) er.startTime = "La hora es obligatoria";
        if (!form.location.trim()) er.location = "La ubicación es obligatoria";
        if (form.appointmentDuration < 15) er.appointmentDuration = "Duración mínima 15 minutos.";


        return er;
    }, [form]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        const newValue = (type === 'number' && name === 'appointmentDuration') ? Number(value) : value;

        setForm((f) => ({ ...f, [name]: newValue as any }));
        setErrors((er) => ({ ...er, [name]: "" }));
    }, []);

    const handleEditClick = useCallback((cita: Cita) => {
        setIsEditing(true);
        setSelectedCita(cita);

        // Al editar, cargamos los datos necesarios
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
            appointmentDuration: cita.appointmentDuration,
        });

        setShowModal(true);
    }, [initialForm]);

    const handleNewClick = useCallback(() => {
        setIsEditing(false);
        setForm(initialForm);
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

                const resEvents = await api.get('/api/events');
                const eventOptions = (resEvents.data || []).map((e: any) => ({
                    id: e.id,
                    name: e.eventType
                }));
                setEvents(eventOptions);

                // Set selected date to today, the effect will handle the rest
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

        const payload = {
            eventIdFK: form.eventIdFK,
            customerIdFK: form.customerIdFK,
            employeeIdFK: form.employeeIdFK,
            appointmentDate: form.date,
            appointmentTime: form.startTime + ':00',
            place: form.location || null,
            comment: form.notes || null,
            appointmentDuration: form.appointmentDuration,
        };

        if (isEditing && selectedCita) {
            // 💡 Asumimos que setIs-Loading(true) se llama antes de este bloque.
            try {
                // 🚨 PAYLOAD CORREGIDO PARA EL PUT: SOLO CAMPOS DE ACTUALIZACIÓN
                const updatePayload = {
                    // Enviamos 'date' y 'startTime' sin las claves foráneas
                    date: form.date,

                    // CORRECCIÓN: Laravel espera HH:MM, NO HH:MM:00
                    startTime: form.startTime,

                    place: form.location || null,
                    comment: form.notes || null,

                    // 'status' se envía porque es el campo principal que cambia en la edición
                    status: STATUS_FRONT_TO_BACK[form.status],

                    // appointmentDuration, eventIdFK, customerIdFK NO se envían en la actualización de la cita.
                };

                await api.put(
                    `/api/employee/appointments/${selectedCita.appointmentId}`,
                    updatePayload,
                    { headers } // Asumimos que 'headers' y 'token' están definidos
                );

                setSuccess("Cita actualizada exitosamente.");
                refreshAppointments();

            } catch (err) {
                console.error("Error al actualizar", err);

                // Manejar errores de validación si existen
                const errorData = (err as any).response?.data?.errors;
                if (errorData) {
                    setErrors(errorData);
                } else {
                    setErrors({ general: "No se pudo actualizar la cita. Error de servidor." });
                }

            } finally {
                // 🚨 Asegurar que el estado de carga siempre se desactive
                // Esto asume que tienes un estado global o local llamado setIsLoading
                // setIsLoading(false); 
            }
            return;
        }

        try {
            const res = await api.post(`/api/appointments`, payload, { headers });
            const newAppointmentData = res.data;

            const mappedNewCita: Cita = {
                id: String(newAppointmentData.appointmentId || newAppointmentData.id),
                appointmentId: newAppointmentData.appointmentId || newAppointmentData.id,
                customerIdFK: form.customerIdFK,
                employeeIdFK: form.employeeIdFK,
                eventIdFK: form.eventIdFK,
                appointmentDuration: form.appointmentDuration,
                date: parseBackendDate(newAppointmentData.appointmentDate || form.date),
                startTime: form.startTime,
                client: form.client,
                status: 'Pendiente',
                location: form.location,
                notes: form.notes,
            };

            console.log("Nueva cita creada:", mappedNewCita);

            setCitas((prevCitas) => [...prevCitas, mappedNewCita]);
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
    }, [validate, token, form, isEditing, selectedCita, refreshAppointments]);


    return (
        <EmployeeLayout>
            {isLoading && <Spinner />}
            <div className="container-fluid bg-light min-vh-100 appointments-page">
                <div className="container py-4">
                    <h3 className="fw-bold text-dark">Citas</h3>
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