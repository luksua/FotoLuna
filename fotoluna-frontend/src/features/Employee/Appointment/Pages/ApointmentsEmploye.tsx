// ApointmentsEmploye.tsx
import React, { useMemo, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "../Styles/apo.css";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import Calendar from "../Components/Calendar";
import AppointmentDetails from "../Components/ApointmentsDetails";
import AppointmentModal from "../Components/ApointmentsModal";

import type { Cita, CitaFormData } from "../Components/Types/types";

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

const EmployeeAppointments: React.FC = () => {
    const today = new Date();

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

    // Cuando se hace clic en un día del calendario
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        const delDia = citas.filter((c) => isSameDay(c.date, date));
        setSelectedCita(delDia[0] ?? null);
    };

    // Cuando se hace clic en una bolita de cita dentro del día
    const handleDotClick = (cita: Cita) => {
        setSelectedDate(cita.date);
        setSelectedCita(cita);
    };

    // Abrir modal para nueva cita
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

    // Cuando se selecciona una tarjeta en el panel derecho
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
        if (!form.endTime) {
            newErrors.endTime = "La hora de fin es obligatoria";
        }

        const startMinutes = timeToMinutes(form.startTime);
        const endMinutes = timeToMinutes(form.endTime);
        if (!Number.isNaN(startMinutes) && !Number.isNaN(endMinutes)) {
            if (endMinutes <= startMinutes) {
                newErrors.endTime =
                    "La hora de fin debe ser mayor que la de inicio";
            }
        }

        // Validar solapamientos con otras citas del mismo día
        if (form.date && !Number.isNaN(startMinutes) && !Number.isNaN(endMinutes)) {
            const dateObj = new Date(form.date);
            const overlapping = citas.some((cita) => {
                if (!isSameDay(cita.date, dateObj)) return false;
                // si estamos editando, ignoramos la misma cita
                if (isEditing && selectedCita && cita.id === selectedCita.id)
                    return false;

                const cStart = timeToMinutes(cita.startTime);
                const cEnd = timeToMinutes(cita.endTime);
                // hay solapamiento si: inicio < fin existente y fin > inicio existente
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSuccess("");
            return;
        }

        const dateObj = new Date(form.date);

        if (isEditing && selectedCita) {
            // Editar cita existente
            const citaActualizada: Cita = {
                ...selectedCita,
                date: dateObj,
                startTime: form.startTime,
                endTime: form.endTime,
                client: form.client.trim(),
                status: form.status,
                location: form.location.trim(),
                notes: form.notes?.trim() || "",
            };

            setCitas((prev) =>
                prev.map((c) => (c.id === selectedCita.id ? citaActualizada : c))
            );
            setSelectedCita(citaActualizada);
            setSuccess("Cita actualizada correctamente");
        } else {
            // Crear nueva cita
            const nuevaCita: Cita = {
                id: createId(),
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
            setSuccess("Cita registrada correctamente");
        }

        setSelectedDate(dateObj);
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

                        {/* Panel de detalles / lista de citas */}
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

                    {/* Modal de creación / edición */}
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
