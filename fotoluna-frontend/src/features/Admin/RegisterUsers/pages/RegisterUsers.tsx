import HomeLayout from "../../../../layouts/HomeAdminLayout";
import { useState } from "react";
import "../styles/RegisterUsers.css";

const Register = () => {
    const [form, setForm] = useState({
        firstNameEmployee: "",
        lastNameEmployee: "",
        phoneEmployee: "",
        EPS: "",
        documentType: "",
        documentNumber: "",
        emailEmployee: "",
        address: "",
        photoEmployee: null,
        password: "",
        employeeType: "Employee",
        role: "Photographer",
        specialty: "",
        isAvailable: true,
        gender: "Female"
    });
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name } = target;
        if (target.type === "file") {
            setForm({ ...form, [name]: target.files && target.files[0] });
            return;
        }
        if (target.type === "checkbox") {
            setForm({ ...form, [name]: target.checked });
            return;
        }
        setForm({ ...form, [name]: target.value });
    };

    const handleSubmit = async () => {
        if (!selectedCita) return;

        try {
            setIsSubmitting(true);

            // 1) Armar el payload tal y como lo espera el backend
            const payload = {
                date: form.date,           // "2025-11-30" (formato YYYY-MM-DD)
                startTime: form.startTime, // "09:00"
                place: form.location || null,
                comment: form.notes || null,
                status:
                    STATUS_FRONT_TO_BACK[form.status] ?? selectedCita.status,
            };

            // 2) Hacer el PUT al endpoint del empleado
            const res = await api.put(
                `/api/employee/appointments/${selectedCita.appointmentId}`,
                payload
            );

            const updated = res.data?.appointment ?? {};

            // 3) Actualizar la cita en el estado del frontend
            const citaActualizada: CitaEmpleado = {
                ...selectedCita,
                date: parseYMDToLocalDate(updated.appointmentDate ?? payload.date),
                startTime: updated.appointmentTime ?? payload.startTime,
                endTime: updated.endTime ?? null,
                location: updated.place ?? payload.place ?? "",
                notes: updated.comment ?? payload.comment ?? "",
                status: updated.appointmentStatus ?? payload.status,
            };

            setCitas((prev) =>
                prev.map((c) =>
                    c.appointmentId === selectedCita.appointmentId ? citaActualizada : c
                )
            );

            setSelectedCita(citaActualizada);
            setShowEditModal(false);
        } catch (error) {
            console.error("Error actualizando cita del empleado", error);
            alert("No se pudo actualizar la cita (revisa la consola / Network).");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <HomeLayout>
            <div className="admin-home-container" style={{ maxWidth: 700, margin: "0 auto", padding: 24, background: "#f5f5f8ff", borderRadius: 12 }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
                    <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>

                        <label>Nombre:</label>
                        <input type="text" name="firstNameEmployee" value={form.firstNameEmployee} onChange={handleChange} required className="register-input" />

                        <label>Apellido:</label>
                        <input type="text" name="lastNameEmployee" value={form.lastNameEmployee} onChange={handleChange} required className="register-input" />

                        <label>Teléfono:</label>
                        <input type="text" name="phoneEmployee" value={form.phoneEmployee} onChange={handleChange} required className="register-input" />

                        <label>Tipo de Documento:</label>
                        <select
                            name="documentType"
                            value={form.documentType}
                            onChange={handleChange}
                            required
                            className="register-select">
                            <option value="">Seleccione un tipo</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PAS">Pasaporte</option>
                        </select>

                        <label>Correo:</label>
                        <input type="email" name="emailEmployee" value={form.emailEmployee} onChange={handleChange} required className="register-input" />

                        <label>Foto:</label>

                        <div className="register-filebox">
                            <input type="file" name="photoEmployee" accept="image/*" onChange={handleChange} style={{ display: "none" }} id="photoEmployee" />
                            <label htmlFor="photoEmployee" className="register-filelabel">Elegir archivo</label>
                            {form.photoEmployee && <span style={{ marginLeft: 8 }}>{(form.photoEmployee as File).name}</span>}
                        </div>

                    </div>
                    <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
                        <label>EPS:</label>
                        <input type="text" name="EPS" value={form.EPS} onChange={handleChange} required className="register-input" />

                        <label>Número de Documento:</label>
                        <input type="text" name="documentNumber" value={form.documentNumber} onChange={handleChange} required className="register-input" />

                        <label>Contraseña:</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} required className="register-input" />

                        <label>Dirección:</label>
                        <input type="text" name="address" value={form.address} onChange={handleChange} required className="register-input" />

                        <label>Tipo de empleado:</label>
                        <select name="employeeType" value={form.employeeType} onChange={handleChange} className="register-select">
                            <option value="Employee">Empleado</option>
                            <option value="Admin">Administrador</option>
                        </select>

                        <label>Rol:</label>
                        <select name="role" value={form.role} onChange={handleChange} className="register-select">
                            <option value="Photographer">Fotógrafo</option>
                            <option value="Assistant">Asistente</option>
                            <option value="Admin">Administrador</option>
                            <option value="Other">Otro</option>
                        </select>

                        <label>Especialidad:</label>
                        <input type="text" name="specialty" value={form.specialty} onChange={handleChange} className="register-input" />

                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} /> Disponible
                        </label>

                        <label>Género:</label>
                        <select name="gender" value={form.gender} onChange={handleChange} className="register-select">
                            <option value="Female">Mujer</option>
                            <option value="Male">Hombre</option>
                            <option value="Other">Otro</option>
                        </select>

                    </div>

                    <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 24 }}>
                        <button type="submit" style={{ padding: "12px 40px", fontSize: 18, background: "#d1a3e2", color: "#fff", border: "none", borderRadius: 24, fontWeight: "bold" }}>
                            Aceptar
                        </button>
                    </div>
                </form>
                {message && <p style={{ color: "#a36fc2", marginTop: 16, textAlign: "center" }}>{message}</p>}
            </div>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>

        </HomeLayout>
    );
};

// estilos movidos a src/features/Admin/RegisterUsers/styles/RegisterUsers.css



export default Register;