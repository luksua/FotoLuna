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
    status: "Pendiente",
    location: "",
};


const EmployeeAppointments = () => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState<string>("");
    const [citas, setCitas] = useState<Cita[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [errorModal, setErrorModal] = useState<string[]>([]);

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
        }

        const cita: Cita = {
            date: new Date(form.date),
            startTime: form.startTime,
            endTime: form.endTime,
            client: form.client,
            status: "Pendiente", // <-- fuerza el estado
            location: form.location,
        };
        setCitas([...citas, cita]);
        setSuccess("Cita creada con éxito");
        setTimeout(() => {
            setShowModal(false);
            setSuccess("");
        }, 1000);
        setForm(initialForm);
        setSelectedDate(cita.date);
        setSelectedCita(cita);
        setShowModal(false); // <-- CIERRA EL MODAL AL GUARDAR
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
                            backgroundColor: bg,
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            margin: "0 auto"
                        }}
                    >
                        {date.getDate()}
                    </div>
                );
            }
        }
        return null;
    };

    const getDaysForColumn = (colIdx: number) => {
        const startOfWeek = new Date(selectedDate!);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + colIdx + 1);
        return Array.from({ length: 5 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return { date: d };
        });
    };

    return (
        <EmployeeLayout>
            <h3 className="bg-custom-3">Citas</h3>
            <hr />
            <div className="appointments-container" style={{ display: "flex", gap: 24 }}>
                <div className="calendar-section">
                    <div className="custom-calendar">
                        <div className="calendar-grid">
                            {["LUN", "MAR", "MIE", "JUE", "VIE", "SÁB", "DOM"].map((day, colIdx) => (
                                <div className="day-column" key={day}>
                                    <div className="day-header">{day}</div>
                                    {getDaysForColumn(colIdx).map(dateObj => {
                                        const cita = citas.find(
                                            c =>
                                                c.date.getFullYear() === dateObj.date.getFullYear() &&
                                                c.date.getMonth() === dateObj.date.getMonth() &&
                                                c.date.getDate() === dateObj.date.getDate()
                                        );
                                        const isSelected =
                                            selectedDate &&
                                            dateObj.date.getFullYear() === selectedDate.getFullYear() &&
                                            dateObj.date.getMonth() === selectedDate.getMonth() &&
                                            dateObj.date.getDate() === selectedDate.getDate();

                                        return (
                                            <span
                                                key={dateObj.date.toISOString()}
                                                className={
                                                    "day-number" +
                                                    (cita ? " has-appointment" : "") +
                                                    (isSelected ? " active" : "")
                                                }
                                                style={{
                                                    background: isSelected ? "#4361ee" : "transparent",
                                                    color: isSelected ? "#fff" : "#212529",
                                                    position: "relative",
                                                    fontWeight: isSelected ? "bold" : "normal",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleDayClick(dateObj.date)}
                                            >
                                                {dateObj.date.getDate()}
                                                {cita && (
                                                    <span
                                                        style={{
                                                            position: "absolute",
                                                            top: 6,
                                                            right: 6,
                                                            width: 10,
                                                            height: 10,
                                                            background: "#f72585",
                                                            borderRadius: "50%",
                                                            display: "inline-block",
                                                        }}
                                                    ></span>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

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
                                            {c.startTime} - {c.endTime} | {c.client} | {c.status} | {c.location}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                    <button
                        className="open-modal-btn"
                        onClick={() => {
                            setShowModal(true);
                            if (selectedDate) {
                                setForm(f => ({
                                    ...f,
                                    date: selectedDate.toISOString().slice(0, 10)
                                }));
                            }
                        }}
                    >
                        Registrar nueva cita
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="modal-cita-backdrop" onClick={() => setShowModal(false)}>
                    <div
                        className="modal-cita"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2>Registrar nueva cita</h2>

                        <form className="row g-3 needs-validation appointment-form" onSubmit={handleSubmit}>
                            <div className="col-mb-4">

                                <label htmlFor="validationCustom01" className="form-label col-lg-3">Cliente: </label>
                                <input type="text"
                                    className="col-lg-9 form-control-s"
                                    placeholder="Nombre del cliente"
                                    name="client"
                                    value={form.client}
                                    onChange={handleChange} required
                                />

                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="validationCustom01" className="form-label col-lg-3">Fecha: </label>
                                <input
                                    className="col-lg-9 form-control-s"
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange} required />

                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="validationCustom01" className="form-label col-lg-3">Hora de Inicio: </label>
                                <input
                                    className="col-lg-9 form-control-s"
                                    type="time"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange} required />

                                <div className="valid-feedback">
                                    Looks good!
                                </div>
                            </div>
                            <div className="col-mb-4">
                                <label htmlFor="validationCustom01" className="form-label col-lg-3">Hora de Fin: </label>
                                <input
                                    className="col-lg-9 form-control-s"
                                    type="time"
                                    name="endTime"
                                    value={form.endTime}
                                    onChange={handleChange} required />

                                <div className="valid-feedback">
                                    Looks good!
                                </div>
                            </div>


                            <div className="col-mb-4">
                                <label htmlFor="validationCustom01" className="form-label col-lg-3">Estado</label>
                                <select
                                    className="col-lg-9 form-select-s"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="Pendiente">Pendiente</option>

                                </select>
                                <div className="valid-feedback">
                                    Looks good!
                                </div>
                            </div>

                            <div className="col-mb-4">
                                <label htmlFor="validationCustom01" className="form-label col-lg-3">Localización</label>
                                <input
                                    placeholder="Localizacion"
                                    className="col-lg-9 form-select-s"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                />

                                <div className="valid-feedback">
                                    Looks good!
                                </div>
                            </div>





                            <div className="appointment-form-buttons">
                                <button type="submit" className="accept-btn">Aceptar</button>
                                <button
                                    type="button"
                                    className="reject-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                {success && <div className="success">{success}</div>}
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
};

export default EmployeeAppointments;