import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../features/auth/styles/AppointmentsEmployee.css";
import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";

type Cita = {
    date: Date;
    startTime: string;
    endTime: string;
    client: string;
    status: string;
    location: string;
};

const initialForm = {
    date: "",
    startTime: "",
    endTime: "",
    client: "",
    status: "",
    location: "",
};


const EmployeeAppointments = () => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState<string>("");
    const [citas, setCitas] = useState<Cita[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.date) newErrors.date = "La fecha es requerida";
        if (!form.startTime) newErrors.startTime = "La hora de inicio es requerida";
        if (!form.endTime) newErrors.endTime = "La hora de fin es requerida";
        if (!form.client) newErrors.client = "El cliente es requerido";
        if (!form.status) newErrors.status = "El estado es requerido";
        if (!form.location) newErrors.location = "La locación es requerida";
        if (form.startTime && form.endTime && form.startTime >= form.endTime) {
            newErrors.endTime = "La hora de fin debe ser mayor que la de inicio";
        }
        // Validación de traslape de citas
        const nuevaFecha = new Date(form.date);
        const traslape = citas.some(c =>
            c.date.getFullYear() === nuevaFecha.getFullYear() &&
            c.date.getMonth() === nuevaFecha.getMonth() &&
            c.date.getDate() === nuevaFecha.getDate() &&
            (
                // Si el rango de horas se cruza
                (form.startTime < c.endTime && form.endTime > c.startTime)
            )
        );
        if (traslape) {
            newErrors.startTime = "Ya existe una cita en ese rango de horas";
            newErrors.endTime = "Ya existe una cita en ese rango de horas";
        }
        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        const cita: Cita = {
            date: new Date(form.date),
            startTime: form.startTime,
            endTime: form.endTime,
            client: form.client,
            status: form.status,
            location: form.location,
        };
        setCitas([...citas, cita]);
        setSuccess("Cita creada con éxito");
        setForm(initialForm);
        setSelectedDate(cita.date);
        setSelectedCita(cita);
    };

    // Cuando seleccionas un día en el calendario
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        const cita = citas.find(
            c =>
                c.date.getFullYear() === date.getFullYear() &&
                c.date.getMonth() === date.getMonth() &&
                c.date.getDate() === date.getDate()
        );
        setSelectedCita(cita || null);
    };

    // Personaliza los días del calendario
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            const cita = citas.find(
                c =>
                    c.date.getFullYear() === date.getFullYear() &&
                    c.date.getMonth() === date.getMonth() &&
                    c.date.getDate() === date.getDate()
            );
            if (cita) {
                let bg = "#b39ddb"; // Morado por defecto (Pendiente)
                if (cita.status === "Confirmada") bg = "#8be98b"; // Verde
                if (cita.status === "Cancelada") bg = "#e57373"; // Rojo
                return (
                    <div
                        style={{
                            background: bg,
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#222",
                        }}
                    >
                        {date.getDate()}
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <EmployeeLayout>
            <div className="appointments-container" style={{ display: "flex", gap: 24 }}>
                <div className="calendar-section">
                    <Calendar
                        onClickDay={handleDayClick}
                        value={selectedDate}
                        tileContent={tileContent}

                        locale="es-ES"
                    />
                    <form className="appointment-form" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
                        <h2>Registrar nueva cita</h2>
                        <div>
                            <label>Fecha:</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                            />
                            {errors.date && <span className="error">{errors.date}</span>}
                        </div>
                        <div>
                            <label>Hora de inicio:</label>
                            <input
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Hora de fin:</label>
                            <input
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Cliente:</label>
                            <input
                                type="text"
                                name="client"
                                value={form.client}
                                onChange={handleChange}
                                placeholder="Nombre del cliente"
                            />
                            {errors.client && <span className="error">{errors.client}</span>}
                        </div>
                        <div>
                            <label>Estado:</label>
                            <select name="status" value={form.status} onChange={handleChange}>
                                <option value="">Selecciona</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                            {errors.status && <span className="error">{errors.status}</span>}
                        </div>
                        <div>
                            <label>Ubicación:</label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Dirección"
                            />
                            {errors.location && <span className="error">{errors.location}</span>}
                        </div>
                        <button type="submit" className="accept-btn">Aceptar</button>
                        <button
                            type="button"
                            className="reject-btn"
                            onClick={() => setForm(initialForm)}
                        >
                            Rechazar
                        </button>
                        {success && <div className="success">{success}</div>}
                    </form>
                </div>
                <div className="appointment-details">
                    <h3>DATOS DE CITA</h3>
                    {selectedCita ? (
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                // Actualiza la cita en el array
                                setCitas(citas.map(c =>
                                    c.date.getTime() === selectedCita.date.getTime()
                                        ? selectedCita
                                        : c
                                ));
                                setSuccess("Cita actualizada");
                            }}
                        >

                            <div>
                                <label>Cliente:</label>
                                <input
                                    type="text"
                                    value={selectedCita.client}
                                    onChange={e =>
                                        setSelectedCita({ ...selectedCita, client: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label>Estado:</label>
                                <select
                                    value={selectedCita.status}
                                    onChange={e =>
                                        setSelectedCita({ ...selectedCita, status: e.target.value })
                                    }
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Confirmada">Confirmada</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                            </div>
                            <div>
                                <label>Ubicación:</label>
                                <input
                                    type="text"
                                    value={selectedCita.location}
                                    onChange={e =>
                                        setSelectedCita({ ...selectedCita, location: e.target.value })
                                    }
                                />
                            </div>
                            <button type="submit" className="accept-btn">Guardar cambios</button>
                        </form>
                    ) : (
                        <p>Selecciona un día con cita para ver los detalles.</p>
                    )}
                    {selectedDate && (
                        <div>
                            <h4>Citas para este día:</h4>
                            <ul>
                                {citas
                                    .filter(c =>
                                        c.date.getFullYear() === selectedDate.getFullYear() &&
                                        c.date.getMonth() === selectedDate.getMonth() &&
                                        c.date.getDate() === selectedDate.getDate()
                                    )
                                    .map((c, i) => (
                                        <li key={i}>
                                            {c.startTime} - {c.endTime} | {c.client} | {c.status}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAppointments;