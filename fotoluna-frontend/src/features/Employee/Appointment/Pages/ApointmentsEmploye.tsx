/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "../Styles/apo.css";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import Calendar from "../Components/Calendar";
import AppointmentDetails from "../Components/ApointmentsDetails";
import AppointmentModal from "../Components/ApointmentsModal";

import type { Cita, CitaFormData, CitaStatus } from "../Components/Types/types";
import api from "../../../../lib/api";

// Utilidad para comparar si dos fechas caen en el mismo día (ignorando hora)
const isSameDay = (a: Date, b: Date): boolean => {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

// Convierte "HH:MM" a minutos desde medianoche
const timeToMinutes = (time: string): number => {
    const [hStr, mStr] = time.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
};

// Genera un ID simple para nuevas citas (en un proyecto real podría venir del backend)
const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Corrige el tema de zonas horarias y soporta null / "YYYY-MM-DD HH:MM:SS"
const parseYMDToLocalDate = (raw: unknown): Date => {
    if (typeof raw !== "string" || raw.trim() === "") {
        console.warn("Fecha inválida en cita del backend:", raw);
        return new Date();
    }

    const [ymd] = raw.split(" ");

    const parts = ymd.split("-");
    if (parts.length !== 3) {
        console.warn("Formato de fecha inesperado en cita del backend:", raw);
        return new Date();
    }

    const [yearStr, monthStr, dayStr] = parts;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JS: 0 = enero
    const day = parseInt(dayStr, 10);

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        console.warn("No se pudo parsear la fecha de la cita:", raw);
        return new Date();
    }

    return new Date(year, month, day);
};

// Mapea el status del backend al tipo CitaStatus (en español)
const mapStatus = (status?: string | null): CitaStatus => {
    const s = (status ?? "").toLowerCase();
    if (s.startsWith("confirm")) return "Confirmada";
    if (s.startsWith("cancel")) return "Cancelada";
    if (s.startsWith("complet")) return "Completada";
    return "Pendiente";
};

const EmployeeAppointments: React.FC = () => {
    const today = new Date();

    // Por ahora fijo (el que usaste en Thunder); luego se puede sacar del usuario logueado
    const EMPLOYEE_ID = 1;

    const [citas, setCitas] = useState<Cita[]>([]);
    const [currentMonth, setCurrentMonth] = useState<Date>(today);
    const [selectedDate, setSelectedDate] = useState<Date | null>(today);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<CitaFormData>({
        date: today.toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        client: "",
        status: "Pendiente",
        location: "",
        notes: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState("");

    // ================== CARGAR CITAS DEL BACKEND ==================
    useEffect(() => {
        const fetchEmployeeAppointments = async () => {
            try {
                const res = await api.get(
                    `/api/employee/${EMPLOYEE_ID}/appointments`
                );

                console.log("RES EMPLOYEE APPOINTMENTS", res.data);

                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data ?? [];

                const citasFromApi: Cita[] = data.map((row: any) => ({
                    // id solo para React (key)
                    id: String(row.appointmentId ?? row.bookingId),
                    // este es el que usa el PUT
                    appointmentId: Number(row.appointmentId),
                    date: parseYMDToLocalDate(row.date),
                    startTime: row.startTime,
                    endTime: row.endTime ?? "",
                    client: row.clientName ?? "",
                    status: mapStatus(row.status),
                    location: row.place ?? "",
                    notes: row.comment ?? "",
                    document: row.clientDocument ?? "",
                    email: row.clientEmail ?? "",
                    phone: row.clientPhone ?? "",
                    eventName: row.eventName ?? "",
                    packageName: row.packageName ?? "",
                }));

                console.log("CITAS MAPEADAS", citasFromApi);

                setCitas(citasFromApi);

                if (citasFromApi.length > 0) {
                    const hoy = new Date();
                    const hoyCitas = citasFromApi.filter((c) =>
                        isSameDay(c.date, hoy)
                    );
                    if (hoyCitas.length > 0) {
                        setSelectedDate(hoy);
                        setSelectedCita(hoyCitas[0]);
                    }
                }
            } catch (error) {
                console.error("Error cargando citas del empleado", error);
            }
        };

        fetchEmployeeAppointments();
    }, [EMPLOYEE_ID]);
    // ================================================================

    // Citas del día seleccionado, ordenadas por hora
    const citasDelDia = useMemo(() => {
        if (!selectedDate) return [];
        return citas
            .filter((c) => isSameDay(c.date, selectedDate))
            .sort(
                (a, b) =>
                    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
            );
    }, [citas, selectedDate]);

    // Navegación de meses para el calendario
    const handleChangeMonth = (direction: "prev" | "next") => {
        setCurrentMonth((prev) => {
            const d = new Date(prev);
            d.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
            return d;
        });
    };

    // Click en un día del calendario
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        const delDia = citas.filter((c) => isSameDay(c.date, date));
        setSelectedCita(delDia[0] ?? null);
    };

    // Click en un punto de cita del calendario
    const handleDotClick = (cita: Cita) => {
        setSelectedDate(cita.date);
        setSelectedCita(cita);
    };

    // Nueva cita (solo en memoria de momento)
    const handleNewClick = () => {
        const baseDate = selectedDate ?? new Date();
        setIsEditing(false);
        setSelectedCita(null);
        setForm({
            date: baseDate.toISOString().split("T")[0],
            startTime: "",
            endTime: "",
            client: "",
            status: "Pendiente",
            location: "",
            notes: "",
        });
        setErrors({});
        setSuccess("");
        setShowModal(true);
    };

    const handleSelectCita = (cita: Cita) => {
        setSelectedCita(cita);
    };

    // Editar cita desde el panel derecho
    const handleEditClick = (cita: Cita) => {
        setIsEditing(true);
        setSelectedCita(cita);
        setForm({
            date: cita.date.toISOString().split("T")[0],
            startTime: cita.startTime,
            endTime: cita.endTime,
            client: cita.client,
            status: cita.status,
            location: cita.location,
            notes: cita.notes ?? "",
        });
        setErrors({});
        setSuccess("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setErrors({});
        setSuccess("");
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setSuccess("");
    };

    // Validación de formulario
    const validate = (): { [key: string]: string } => {
        const newErrors: { [key: string]: string } = {};

        if (!form.client.trim()) {
            newErrors.client = "El nombre del cliente es obligatorio";
        }
        if (!form.date) {
            newErrors.date = "La fecha es obligatoria";
        }
        if (!form.startTime) {
            newErrors.startTime = "La hora de inicio es obligatoria";
        }

        const startMinutes = timeToMinutes(form.startTime);
        const hasEndTime = !!form.endTime;
        const endMinutes = hasEndTime ? timeToMinutes(form.endTime) : NaN;

        // Solo validamos orden si hay hora fin
        if (
            hasEndTime &&
            !Number.isNaN(startMinutes) &&
            !Number.isNaN(endMinutes)
        ) {
            if (endMinutes <= startMinutes) {
                newErrors.endTime =
                    "La hora de fin debe ser mayor que la de inicio";
            }
        }

        // Validar solapamientos SOLO si hay hora de fin
        if (
            hasEndTime &&
            form.date &&
            !Number.isNaN(startMinutes) &&
            !Number.isNaN(endMinutes)
        ) {
            const dateObj = parseYMDToLocalDate(form.date);

            const overlapping = citas.some((cita) => {
                if (!isSameDay(cita.date, dateObj)) return false;
                if (isEditing && selectedCita && cita.id === selectedCita.id)
                    return false;

                const cStart = timeToMinutes(cita.startTime);
                const cEnd = timeToMinutes(cita.endTime);
                if (Number.isNaN(cStart) || Number.isNaN(cEnd)) return false;

                return startMinutes < cEnd && endMinutes > cStart;
            });

            if (overlapping) {
                newErrors.startTime = "Ya existe una cita en ese rango de horas";
                newErrors.endTime = "Ya existe una cita en ese rango de horas";
            }
        }

        if (!form.location.trim()) {
            newErrors.location = "La ubicación es obligatoria";
        }

        return newErrors;
    };

    // Guardar (editar o crear)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSuccess("");
            return;
        }

        const dateObj = parseYMDToLocalDate(form.date);

        // EDITAR cita existente
        if (isEditing && selectedCita) {
            try {
                const payload = {
                    appointmentDate: form.date, // "YYYY-MM-DD"
                    appointmentTime: form.startTime,
                    place: form.location || null,
                    comment: form.notes || null,
                    appointmentStatus:
                        form.status === "Confirmada"
                            ? "Scheduled"
                            : form.status === "Completada"
                                ? "Completed"
                                : form.status === "Cancelada"
                                    ? "Cancelled"
                                    : "Pending confirmation",
                };

                const res = await api.put(
                    `/api/employee/appointments/${selectedCita.appointmentId}`,
                    payload
                );

                const updated = res.data?.appointment ?? {};

                const citaActualizada: Cita = {
                    ...selectedCita,
                    date: parseYMDToLocalDate(
                        updated.appointmentDate ?? form.date
                    ),
                    startTime: updated.appointmentTime ?? form.startTime,
                    endTime: selectedCita.endTime,
                    location: updated.place ?? form.location,
                    notes: updated.comment ?? form.notes,
                    status: form.status,
                };

                setCitas((prev) =>
                    prev.map((c) =>
                        c.appointmentId === selectedCita.appointmentId
                            ? citaActualizada
                            : c
                    )
                );

                setSelectedCita(citaActualizada);
                setSelectedDate(dateObj);
                setSuccess("Cita actualizada correctamente");
                setShowModal(false);
            } catch (err: any) {
                console.error("Error actualizando cita del empleado", err);
                setErrors({
                    general:
                        err?.response?.data?.message ||
                        "Error al actualizar la cita",
                });
            }

            return;
        }

        // CREAR cita nueva (solo en memoria por ahora)
        const nuevaCita: Cita = {
            id: createId(),
            appointmentId: Date.now(),
            date: dateObj,
            startTime: form.startTime,
            endTime: form.endTime,
            client: form.client.trim(),
            status: form.status,
            location: form.location.trim(),
            notes: form.notes?.trim() || "",
        };

        setCitas((prev) => [...prev, nuevaCita]);
        setSelectedCita(nuevaCita);
        setSelectedDate(dateObj);
        setSuccess("Cita registrada correctamente");
        setShowModal(false);
    };

    return (
        <EmployeeLayout>
            <div className="container-fluid bg-light min-vh-100 appointments-page">
                <div className="container py-4">
                    <div className="text-start mb-3">
                        <h3 className="fw-bold text-dark">Citas</h3>
                        <hr />
                    </div>

                    <div className="row g-4">
                        {/* Calendario */}
                        <div className="col-12 col-lg-8">
                            <div className="card shadow-sm border-0 p-3">
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

                        {/* Panel derecho */}
                        <div className="col-12 col-lg-4">
                            <div className="card shadow-sm border-0 p-3 h-100">
                                <AppointmentDetails
                                    citasDelDia={citasDelDia}
                                    selectedCita={selectedCita}
                                    selectedDate={selectedDate}
                                    onSelectCita={handleSelectCita}
                                    onEditClick={handleEditClick}
                                    onNewClick={handleNewClick}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal */}
                    <AppointmentModal
                        show={showModal}
                        isEditing={isEditing}
                        form={form}
                        errors={errors}
                        success={success}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onClose={handleCloseModal}
                    />
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAppointments;
