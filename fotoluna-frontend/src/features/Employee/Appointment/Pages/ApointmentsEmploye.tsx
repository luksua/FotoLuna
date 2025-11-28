
import React, { useEffect, useMemo, useState } from "react";
import "../Styles/apo.css";
import "react-calendar/dist/Calendar.css";

import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import Calendar from "../Components/Calendar";
import AppointmentDetails from "../Components/ApointmentsDetails";
import AppointmentModal from "../Components/ApointmentsModal";

import api from "../../../../lib/api";
import type { Cita, CitaFormData, CitaStatus } from "../Components/Types/types";

// =========================================================
// 🔹 Función para comparar fechas
// =========================================================
const isSameDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

// =========================================================
// 🔹 Convertir "HH:MM" → minutos
// =========================================================
const timeToMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

// =========================================================
// 🔹 Crear ID simple
// =========================================================
const createId = () => `${Date.now()}-${Math.random()}`;

// =========================================================
// 🔹 Convertir fecha backend → Date()
// =========================================================
const parseBackendDate = (raw: any): Date => {
    if (!raw) return new Date();
    const base = raw.split(" ")[0]; // YYYY-MM-DD
    const [y, m, d] = base.split("-").map(Number);
    return new Date(y, m - 1, d);
};

// =========================================================
// 🔹 Estados FRONT → BACK
// =========================================================
export const STATUS_FRONT_TO_BACK: Record<CitaStatus, string> = {
    Pendiente: "Pending confirmation",
    Confirmada: "Scheduled",
    Cancelada: "Cancelled",
    Completada: "Completed",
};

// 🔹 Estados BACK → FRONT
export const STATUS_BACK_TO_FRONT: Record<string, CitaStatus> = {
    "Pending confirmation": "Pendiente",
    Scheduled: "Confirmada",
    Cancelled: "Cancelada",
    Completed: "Completada",
};

// =========================================================
// 🔹 Convertir estado backend → front seguro
// =========================================================
const mapStatus = (status: any): CitaStatus =>
    STATUS_BACK_TO_FRONT[String(status)] ?? "Pendiente";

// =========================================================
// 🔹 MAPEO Backend → Front (Cita[])
// =========================================================
const mapBackendAppointments = (data: any[]): Cita[] =>
    data.map((row: any) => {
        const parsedDate = parseBackendDate(row.date);

        // --- normalizar hora a HH:MM ---
        const rawTime = row.startTime ?? "09:00";
        const startTime =
            typeof rawTime === "string" ? rawTime.slice(0, 5) : "09:00";

        const cita: Cita = {
            id: String(row.appointmentId ?? row.bookingId ?? createId()),
            appointmentId: Number(row.appointmentId),

            date: parsedDate,
            startTime,          // 👈 usamos la hora normalizada (10:00)
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
    const EMPLOYEE_ID = 1; // Temporal

    const today = new Date();
    const [citas, setCitas] = useState<Cita[]>([]);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

    const [currentMonth, setCurrentMonth] = useState(today);
    const [selectedDate, setSelectedDate] = useState<Date | null>(today);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialForm: CitaFormData = {
        date: today.toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        client: "",
        status: "Pendiente",
        location: "",
        notes: "",
    };

    const [form, setForm] = useState<CitaFormData>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState("");

    // =========================================================
    // 🔹 Cargar citas desde backend
    // =========================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/api/employee/${EMPLOYEE_ID}/appointments`);
                const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];

                const citasMap = mapBackendAppointments(raw);
                setCitas(citasMap);

                // Seleccionar cita de hoy
                const hoyCita = citasMap.find((c) => isSameDay(c.date, today)) || null;
                setSelectedCita(hoyCita);
                setSelectedDate(today);
            } catch (e) {
                console.error("Error cargando citas", e);
                setCitas([]);
            }
        };

        fetchData();
    }, []);

    // =========================================================
    // 🔹 Citas de un día
    // =========================================================
    const citasDelDia = useMemo(() => {
        if (!selectedDate) return [];
        return citas
            .filter((c) => isSameDay(c.date, selectedDate))
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    }, [citas, selectedDate]);

    // =========================================================
    // 🔹 Cambiar mes del calendario
    // =========================================================
    const handleChangeMonth = (dir: "prev" | "next") => {
        setCurrentMonth((prev) => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1));
            return d;
        });
    };

    // =========================================================
    // 🔹 Click en un día
    // =========================================================
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        const c = citas.find((x) => isSameDay(x.date, date)) || null;
        setSelectedCita(c);
    };

    const handleDotClick = (cita: Cita) => {
        setSelectedDate(cita.date);
        setSelectedCita(cita);
    };

    // =========================================================
    // 🔹 Abrir modal para registrar nueva cita
    // =========================================================
    const handleNewClick = () => {
        setIsEditing(false);
        setForm(initialForm);
        setShowModal(true);
    };

    // =========================================================
    // 🔹 Abrir modal para editar
    // =========================================================
    const handleEditClick = (cita: Cita) => {
        setIsEditing(true);
        setSelectedCita(cita);

        setForm({
            date: cita.date.toISOString().split("T")[0],
            startTime: cita.startTime,
            endTime: "",
            client: cita.client,
            status: cita.status,
            location: cita.location,
            notes: cita.notes ?? "",
        });

        setShowModal(true);
    };

    // =========================================================
    // 🔹 Change form
    // =========================================================
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setErrors((er) => ({ ...er, [e.target.name]: "" }));
    };

    // =========================================================
    // 🔹 Validar
    // =========================================================
    const validate = () => {
        const er: Record<string, string> = {};

        if (!form.date) er.date = "La fecha es obligatoria";
        if (!form.startTime) er.startTime = "La hora es obligatoria";
        if (!form.location.trim()) er.location = "La ubicación es obligatoria";

        return er;
    };

    // =========================================================
    // 🔹 GUARDAR (CREATE / UPDATE)
    // =========================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const v = validate();
        if (Object.keys(v).length) return setErrors(v);

        // ============================
        // EDITAR CITA EXISTENTE
        // ============================
        if (isEditing && selectedCita) {
            try {
                const payload = {
                    date: form.date, // YYYY-MM-DD
                    startTime: form.startTime, // HH:MM
                    place: form.location || null,
                    comment: form.notes || null,
                    status: STATUS_FRONT_TO_BACK[form.status],
                };

                // Enviar PUT al backend
                const res = await api.put(
                    `/api/employee/appointments/${selectedCita.appointmentId}`,
                    payload
                );

                // Datos devueltos por el backend
                const updated = res.data?.appointment ?? payload;

                // Normalizar hora a HH:MM
                const updatedStartTimeRaw =
                    updated.startTime ??
                    updated.appointmentTime ??
                    form.startTime;

                const updatedStartTime =
                    typeof updatedStartTimeRaw === "string"
                        ? updatedStartTimeRaw.slice(0, 5)
                        : form.startTime;

                // Construir cita actualizada
                const citaNueva: Cita = {
                    ...selectedCita,
                    date: parseBackendDate(updated.appointmentDate ?? form.date),
                    startTime: updatedStartTime,
                    location: updated.place ?? form.location,
                    notes: updated.comment ?? form.notes,
                    status: mapStatus(updated.appointmentStatus ?? payload.status),
                };

                // Actualizar lista
                setCitas((prev) =>
                    prev.map((c) =>
                        c.appointmentId === selectedCita.appointmentId ? citaNueva : c
                    )
                );

                setSelectedCita(citaNueva);
                setShowModal(false);

            } catch (err) {
                console.error("Error al actualizar", err);
            }

            return;
        }
    };


    return (
        <EmployeeLayout>
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
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onClose={() => setShowModal(false)}
                    />
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAppointments;
