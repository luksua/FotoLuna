// AppointmentsEmployee.tsx
import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import "../../../features/auth/styles/apo.css";
import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";

type Cita = {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    client: string;
    status: "Pendiente" | "Confirmada" | "Cancelada" | "Completada";
    location: string;
    notes?: string;
};

type CitaFormData = {
    date: string;
    startTime: string;
    endTime: string;
    client: string;
    status: "Pendiente" | "Confirmada" | "Cancelada" | "Completada";
    location: string;
    notes?: string;
};

const initialForm: CitaFormData = {
    date: "",
    startTime: "",
    endTime: "",
    client: "",
    status: "Pendiente",
    location: "",
    notes: ""
};

const EmployeeAppointmentss = () => {
    const [form, setForm] = useState<CitaFormData>(initialForm);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState<string>("");
    const [citas, setCitas] = useState<Cita[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Obtener citas del día seleccionado
    const getCitasDelDia = (date: Date) => {
        return citas.filter(cita =>
            cita.date.getDate() === date.getDate() &&
            cita.date.getMonth() === date.getMonth() &&
            cita.date.getFullYear() === date.getFullYear()
        );
    };

    // Validación del formulario
    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.date) newErrors.date = "La fecha es requerida";
        if (!form.startTime) newErrors.startTime = "La hora de inicio es requerida";
        if (!form.endTime) newErrors.endTime = "La hora de fin es requerida";
        if (!form.client) newErrors.client = "El cliente es requerido";
        if (!form.location) newErrors.location = "La locación es requerida";

        if (form.startTime && form.endTime && form.startTime >= form.endTime) {
            newErrors.endTime = "La hora de fin debe ser mayor que la de inicio";
        }

        // Validación de traslape de citas (solo para nuevas citas)
        if (!isEditing) {
            const nuevaFecha = new Date(form.date);
            const traslape = citas.some(cita =>
                cita.date.getFullYear() === nuevaFecha.getFullYear() &&
                cita.date.getMonth() === nuevaFecha.getMonth() &&
                cita.date.getDate() === nuevaFecha.getDate() &&
                ((form.startTime < cita.endTime && form.endTime > cita.startTime))
            );
            if (traslape) {
                newErrors.startTime = "Ya existe una cita en ese rango de horas";
                newErrors.endTime = "Ya existe una cita en ese rango de horas";
            }
        }
        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
        setSuccess("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSuccess("");
            return;
        }

        if (isEditing && selectedCita) {
            // Editar cita existente
            const citaActualizada: Cita = {
                ...selectedCita,
                date: new Date(form.date),
                startTime: form.startTime,
                endTime: form.endTime,
                client: form.client,
                status: form.status,
                location: form.location,
                notes: form.notes
            };

            setCitas(citas.map(c => c.id === selectedCita.id ? citaActualizada : c));
            setSelectedCita(citaActualizada);
            setSuccess("Cita actualizada con éxito");
        } else {
            // Crear nueva cita
            const nuevaCita: Cita = {
                id: Date.now().toString(),
                date: new Date(form.date),
                startTime: form.startTime,
                endTime: form.endTime,
                client: form.client,
                status: "Pendiente",
                location: form.location,
                notes: form.notes
            };

            setCitas([...citas, nuevaCita]);
            setSelectedDate(nuevaCita.date);
            setSelectedCita(nuevaCita);
            setSuccess("Cita creada con éxito");
        }

        setTimeout(() => {
            setShowModal(false);
            setSuccess("");
            setIsEditing(false);
            setForm(initialForm);
        }, 1500);
    };

    // Cuando seleccionas un día en el calendario
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        const citasDelDia = getCitasDelDia(date);
        setSelectedCita(citasDelDia.length > 0 ? citasDelDia[0] : null);
    };

    // Abrir modal para editar
    const handleEditClick = () => {
        if (selectedCita) {
            setIsEditing(true);
            setForm({
                date: selectedCita.date.toISOString().split('T')[0],
                startTime: selectedCita.startTime,
                endTime: selectedCita.endTime,
                client: selectedCita.client,
                status: selectedCita.status,
                location: selectedCita.location,
                notes: selectedCita.notes || ""
            });
            setShowModal(true);
        }
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setForm(initialForm);
        setErrors({});
    };

    // Navegación del mes
    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    // Obtener días del mes actual
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        // Agregar días del mes anterior para completar la primera semana
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(firstDay);
            prevDate.setDate(firstDay.getDate() - (firstDayOfWeek - i));
            days.unshift(prevDate);
        }

        return days;
    };

    // Obtener semanas para el grid
    const getWeeks = () => {
        const days = getDaysInMonth(currentMonth);
        const weeks = [];

        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return weeks;
    };

    const weeks = getWeeks();

    return (
        <EmployeeLayout>
            <h3 className="bg-custom-3">Citas</h3>

            <div className="appointments-container">
                <div className="calendar-section">
                    <div className="custom-calendar">
                        {/* Header del calendario */}
                        <div className="calendar-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    ‹
                                </button>
                                <h4>
                                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </h4>
                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => navigateMonth('next')}
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        {/* Días de la semana */}
                        <div className="calendar-weekdays">
                            {["LUN", "MAR", "MIE", "JUE", "VIE", "SÁB", "DOM"].map(day => (
                                <div key={day} className="calendar-weekday">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid del calendario */}
                        <div className="calendar-grid">
                            {weeks.map((week, weekIndex) => (
                                <React.Fragment key={weekIndex}>
                                    {week.map((date, dayIndex) => {
                                        const citasDelDia = getCitasDelDia(date);
                                        const isSelected = selectedDate &&
                                            date.getDate() === selectedDate.getDate() &&
                                            date.getMonth() === selectedDate.getMonth() &&
                                            date.getFullYear() === selectedDate.getFullYear();
                                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                        const isToday = new Date().toDateString() === date.toDateString();

                                        return (
                                            <div
                                                key={date.toISOString()}
                                                className={`day-column ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''
                                                    } ${isToday ? 'today' : ''}`}
                                                onClick={() => handleDayClick(date)}
                                            >
                                                <div className="day-number">
                                                    {date.getDate()}
                                                </div>
                                                <div className="appointment-dots">
                                                    {citasDelDia.map((cita, index) => (
                                                        <div
                                                            key={cita.id}
                                                            className={`appointment-dot ${cita.status.toLowerCase()}`}
                                                            title={`${cita.client} - ${cita.startTime}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Panel de detalles de cita */}
                <div className="appointment-details">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>DATOS DE CITA</h3>
                        {selectedCita && (
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={handleEditClick}
                                title="Editar cita"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                        )}
                    </div>

                    {selectedCita ? (
                        <div className="cita-info">
                            <div className="detail-item mb-3">
                                <label className="fw-bold text-secondary">Cliente:</label>
                                <p className="mb-0">{selectedCita.client}</p>
                            </div>

                            <div className="detail-item mb-3">
                                <label className="fw-bold text-secondary">Fecha:</label>
                                <p className="mb-0">
                                    {selectedCita.date.toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="detail-item mb-3">
                                <label className="fw-bold text-secondary">Horario:</label>
                                <p className="mb-0">{selectedCita.startTime} - {selectedCita.endTime}</p>
                            </div>

                            <div className="detail-item mb-3">
                                <label className="fw-bold text-secondary">Ubicación:</label>
                                <p className="mb-0">{selectedCita.location}</p>
                            </div>

                            <div className="detail-item mb-3">
                                <label className="fw-bold text-secondary">Estado:</label>
                                <span className={`badge ${selectedCita.status === 'Pendiente' ? 'bg-warning' :
                                    selectedCita.status === 'Confirmada' ? 'bg-success' :
                                        selectedCita.status === 'Cancelada' ? 'bg-danger' : 'bg-info'
                                    }`}>
                                    {selectedCita.status}
                                </span>
                            </div>

                            {selectedCita.notes && (
                                <div className="detail-item mb-3">
                                    <label className="fw-bold text-secondary">Notas:</label>
                                    <p className="mb-0 text-muted">{selectedCita.notes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted py-4">
                            <i className="fas fa-calendar-day fa-3x mb-3"></i>
                            <p>Selecciona un día con cita para ver los detalles.</p>
                        </div>
                    )}

                    <button
                        className="open-modal-btn"
                        onClick={() => {
                            setIsEditing(false);
                            setForm({
                                ...initialForm,
                                date: selectedDate ? selectedDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
                            });
                            setShowModal(true);
                        }}
                    >
                        <i className="fas fa-plus me-2"></i>
                        Registrar nueva cita
                    </button>
                </div>
            </div>

            {/* Modal para agregar/editar citas */}
            {showModal && (
                <div className="modal-cita-backdrop" onClick={handleCloseModal}>
                    <div
                        className="modal-cita"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2>
                            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-calendar-plus'} me-2`}></i>
                            {isEditing ? 'Editar Cita' : 'Registrar Nueva Cita'}
                        </h2>

                        <form className="row g-3 needs-validation appointment-form" onSubmit={handleSubmit}>
                            <div className="col-mb-4">
                                <label htmlFor="client" className="form-label col-lg-3">Cliente: </label>
                                <input
                                    type="text"
                                    className="col-lg-9 form-control-s"
                                    placeholder="Nombre del cliente"
                                    name="client"
                                    value={form.client}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.client && <div className="text-danger small">{errors.client}</div>}
                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="date" className="form-label col-lg-3">Fecha: </label>
                                <input
                                    className="col-lg-9 form-control-s"
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.date && <div className="text-danger small">{errors.date}</div>}
                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="startTime" className="form-label col-lg-3">Hora de Inicio: </label>
                                <input
                                    className="col-lg-9 form-control-s"
                                    type="time"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.startTime && <div className="text-danger small">{errors.startTime}</div>}
                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="endTime" className="form-label col-lg-3">Hora de Fin: </label>
                                <input
                                    className="col-lg-9 form-control-s"
                                    type="time"
                                    name="endTime"
                                    value={form.endTime}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.endTime && <div className="text-danger small">{errors.endTime}</div>}
                            </div>

                            {isEditing && (
                                <div className="col-mb-4">
                                    <label htmlFor="status" className="form-label col-lg-3">Estado</label>
                                    <select
                                        className="col-lg-9 form-select-s"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Confirmada">Confirmada</option>
                                        <option value="Cancelada">Cancelada</option>
                                        <option value="Completada">Completada</option>
                                    </select>
                                </div>
                            )}

                            <div className="col-mb-4">
                                <label htmlFor="location" className="form-label col-lg-3">Localización</label>
                                <input
                                    placeholder="Localización"
                                    className="col-lg-9 form-control-s"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.location && <div className="text-danger small">{errors.location}</div>}
                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="notes" className="form-label col-lg-3">Notas</label>
                                <textarea
                                    placeholder="Notas adicionales..."
                                    className="col-lg-9 form-control-s"
                                    name="notes"
                                    rows={3}
                                    value={form.notes}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="appointment-form-buttons">
                                <button type="submit" className="accept-btn">
                                    <i className="fas fa-save me-1"></i>
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </button>
                                <button
                                    type="button"
                                    className="reject-btn"
                                    onClick={handleCloseModal}
                                >
                                    <i className="fas fa-times me-1"></i>
                                    Cancelar
                                </button>
                            </div>

                            {success && (
                                <div className="alert alert-success mt-3 text-center">
                                    <i className="fas fa-check-circle me-2"></i>
                                    {success}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
};

export default EmployeeAppointmentss;