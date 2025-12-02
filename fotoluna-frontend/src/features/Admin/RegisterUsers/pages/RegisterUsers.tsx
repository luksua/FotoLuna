import HomeLayout from "../../../../layouts/HomeAdminLayout";
import { useState } from "react";
import axios from "axios"; // 👈 NECESARIO PARA ENVIAR DATOS
import "../styles/RegisterUsers.css";

// Definición de la URL base (asumiendo que está en tu .env o similar)
const API_BASE = "http://127.0.0.1:8000"; // Ajustar si usas VITE_API_URL

// 🚨 Definición de un tipo para el estado del formulario (mejor práctica)
interface RegisterForm {
    firstNameEmployee: string;
    lastNameEmployee: string;
    phoneEmployee: string;
    EPS: string;
    documentType: string;
    documentNumber: string;
    emailEmployee: string;
    address: string;
    photoEmployee: File | null; // El tipo debe ser File
    password: string;
    employeeType: string;
    role: string;
    specialty: string;
    isAvailable: boolean;
    gender: string;
    // Campo que Laravel espera para confirmar el password
    password_confirmation: string;
}


const Register = () => {
    // 🚨 CORRECCIÓN TS6133: 'setIsSubmitting' no estaba definido.
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🚨 Añadimos confirmación de contraseña al estado
    const [form, setForm] = useState<RegisterForm>({
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
        gender: "Female",
        password_confirmation: "" // Inicializar el campo de confirmación
    });
    const [message, setMessage] = useState("");
    const [serverErrors, setServerErrors] = useState<string>(""); // Para mostrar errores del servidor

    // 🚨 CORRECCIÓN TS6133: 'setActiveItem' no es necesario aquí, está en el Layout.

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

    // 🚨 LÓGICA CORREGIDA PARA REGISTRO DE EMPLEADO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerErrors("");
        setMessage("");

        // 🚨 Validación mínima del frontend
        if (form.password !== form.password_confirmation) {
            setServerErrors("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1) Armar el FormData
            const formData = new FormData();

            // Añadir campos del formulario al FormData
            // NOTA: Laravel espera 'email' y 'password' en la tabla users
            formData.append("role", form.role.toLowerCase() === "administrador" ? "admin" : "empleado"); // Mapear a los roles de Laravel

            // Campos de User
            formData.append("name", `${form.firstNameEmployee} ${form.lastNameEmployee}`);
            formData.append("email", form.emailEmployee);
            formData.append("password", form.password);
            formData.append("password_confirmation", form.password_confirmation);

            // Campos de Employee
            formData.append("firstNameEmployee", form.firstNameEmployee);
            formData.append("lastNameEmployee", form.lastNameEmployee);
            formData.append("phoneEmployee", form.phoneEmployee);
            formData.append("EPS", form.EPS);
            formData.append("documentType", form.documentType);
            formData.append("documentNumber", form.documentNumber);
            formData.append("address", form.address);
            formData.append("employeeType", form.employeeType);
            formData.append("gender", form.gender);

            // Campos adicionales de Empleado
            formData.append("specialty", form.specialty);
            formData.append("isAvailable", String(form.isAvailable));

            // Foto
            if (form.photoEmployee) {
                formData.append("photoEmployee", form.photoEmployee);
            }

            // 2) Hacer el POST al endpoint de registro
            await axios.post(`${API_BASE}/api/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                }
            });

            // 3) Éxito
            setMessage("¡Empleado/Administrador registrado exitosamente!");
            setServerErrors(""); // Limpiar errores
            // Puedes resetear el form aquí si lo deseas

        } catch (error: any) {
            console.error("Error al registrar empleado:", error);

            if (error.response && error.response.status === 422) {
                // Manejar error 422: Validar errores específicos de Laravel
                const errors = error.response.data.errors;
                let errorMsg = "Error de validación: ";

                // Mapear errores de Laravel (ej. 'email' ya existe)
                if (errors) {
                    // Muestra el primer error de cada campo
                    Object.keys(errors).forEach(key => {
                        errorMsg += `${key}: ${errors[key][0]} `;
                    });
                }
                setServerErrors(errorMsg.trim());
            } else {
                setServerErrors("Error de conexión o servidor interno.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <HomeLayout>
            <div className="admin-home-container" style={{ maxWidth: 700, margin: "0 auto", padding: 24, background: "#f5f5f8ff", borderRadius: 12 }}>

                {/* 🚨 Cambiar handleSubmit para que acepte el evento */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>

                    {/* ... (Controles del formulario) ... */}

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
                        {/* 🚨 CORRECCIÓN: Laravel espera 'email' para la tabla users, pero usaremos emailEmployee en el form */}
                        <input type="email" name="emailEmployee" value={form.emailEmployee} onChange={handleChange} required className="register-input" />

                        <label>Foto:</label>

                        <div className="register-filebox">
                            <input type="file" name="photoEmployee" accept="image/*" onChange={handleChange} style={{ display: "none" }} id="photoEmployee" />
                            <label htmlFor="photoEmployee" className="register-filelabel">Elegir archivo</label>
                            {form.photoEmployee && <span style={{ marginLeft: 8 }}>{(form.photoEmployee as File).name}</span>}
                        </div>
                        {/* Campo de confirmación de contraseña AÑADIDO */}
                        <label>Confirmar Contraseña:</label>
                        <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required className="register-input" />


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

                    {serverErrors && (
                        <p style={{ color: 'red', width: '100%', textAlign: 'center', marginTop: 12 }}>
                            {serverErrors}
                        </p>
                    )}

                    <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 24 }}>
                        <button type="submit" disabled={isSubmitting} style={{ padding: "12px 40px", fontSize: 18, background: "#d1a3e2", color: "#fff", border: "none", borderRadius: 24, fontWeight: "bold" }}>
                            {isSubmitting ? 'Registrando...' : 'Aceptar'}
                        </button>
                    </div>
                </form>

                {message && <p style={{ color: "#a36fc2", marginTop: 16, textAlign: "center" }}>{message}</p>}
            </div>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>

        </HomeLayout>
    );
};

export default Register;