/* eslint-disable @typescript-eslint/no-explicit-any */
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import { useState } from "react";
import "../styles/RegisterUsers.css";

// Definición de la URL base (asumiendo que está en tu .env o similar)
// const API_BASE = "http://127.0.0.1:8000"; // Ajustar si usas VITE_API_URL

// 🚨 Definición de un tipo para el estado del formulario (mejor práctica)
// interface RegisterForm {
//     firstNameEmployee: string;
//     lastNameEmployee: string;
//     phoneEmployee: string;
//     EPS: string;
//     documentType: string;
//     documentNumber: string;
//     emailEmployee: string;
//     address: string;
//     photoEmployee: File | null; // El tipo debe ser File
//     password: string;
//     employeeType: string;
//     role: string;
//     specialty: string;
//     isAvailable: boolean;
//     gender: string;
//     // Campo que Laravel espera para confirmar el password
//     password_confirmation: string;
// }


const Register = () => {
    // 🚨 CORRECCIÓN TS6133: 'setIsSubmitting' no estaba definido.
    // const [isSubmitting, setIsSubmitting] = useState(false);

    // 🚨 Añadimos confirmación de contraseña al estado
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
        passwordConfirm: "",
        employeeType: "Employee",
        specialty: "",
        isAvailable: true,
        gender: "Female",
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.password !== form.passwordConfirm) {
            setMessage('Las contraseñas no coinciden.');
            setMessageType('error');
            return;
        }

        if (form.password.length < 8) {
            setMessage('La contraseña debe tener al menos 8 caracteres.');
            setMessageType('error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('firstNameEmployee', form.firstNameEmployee);
            formData.append('lastNameEmployee', form.lastNameEmployee);
            formData.append('phoneEmployee', form.phoneEmployee);
            formData.append('EPS', form.EPS);
            formData.append('documentType', form.documentType);
            formData.append('documentNumber', form.documentNumber);
            formData.append('emailEmployee', form.emailEmployee);
            formData.append('address', form.address);
            formData.append('password', form.password);
            formData.append('password_confirmation', form.passwordConfirm);
            formData.append('employeeType', form.employeeType);
            formData.append('specialty', form.specialty);
            formData.append('isAvailable', form.isAvailable ? '1' : '0');
            formData.append('gender', form.gender);

            if (form.photoEmployee) {
                formData.append('photoEmployee', form.photoEmployee as File);
            }

            const token = localStorage.getItem('token');
            const headers: Record<string, string> = {
                'Accept': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/admin/employees', {
                method: 'POST',
                headers,
                body: formData,
            });

            let data: any = null;
            try {
                data = await res.json();
            } catch (err) {
                console.log(Error, err);
                const text = await res.text();
                setMessage(`Respuesta inesperada del servidor: ${res.status} - ${text}`);
                setMessageType('error');
                return;
            }

            if (!res.ok) {
                // Manejar errores de validación
                if (data.errors) {
                    const errorMessages = Object.values(data.errors)
                        .map((msgs: any) => Array.isArray(msgs) ? msgs[0] : msgs)
                        .join('\n');
                    setMessage(errorMessages);
                } else {
                    setMessage(data.message || 'No se pudo registrar el usuario.');
                }
                setMessageType('error');
                return;
            }

            if (data && data.success) {
                setMessage('Usuario registrado correctamente');
                setMessageType('success');
                setForm({
                    firstNameEmployee: '',
                    lastNameEmployee: '',
                    phoneEmployee: '',
                    EPS: '',
                    documentType: '',
                    documentNumber: '',
                    emailEmployee: '',
                    address: '',
                    photoEmployee: null,
                    password: '',
                    passwordConfirm: '',
                    employeeType: 'Employee',
                    specialty: '',
                    isAvailable: true,
                    gender: 'Female'
                });
            } else {
                setMessage(data.message || 'No se pudo registrar el usuario');
                setMessageType('error');
            }
        } catch (error: any) {
            setMessage(error?.message || 'Error en la petición');
            setMessageType('error');
        }
    };


    return (
        <HomeLayout>
            <div className="admin-home-container register-container">
                <h1 className="register-title">Registrar Usuarios</h1>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-col">

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

                        <label>Número de Documento:</label>
                        <input type="text" name="documentNumber" value={form.documentNumber} onChange={handleChange} required className="register-input" />

                        <label>Correo:</label>
                        {/* 🚨 CORRECCIÓN: Laravel espera 'email' para la tabla users, pero usaremos emailEmployee en el form */}
                        <input type="email" name="emailEmployee" value={form.emailEmployee} onChange={handleChange} required className="register-input" />

                        <label>Contraseña:</label>
                        <div className="password-field-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={form.password} 
                                onChange={handleChange} 
                                required 
                                className="register-input"
                                style={{ flex: 1, paddingRight: 40 }}
                            />
                            <button
                                type="button"
                                className="password-toggle-button"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>

                        <label>Confirmar Contraseña:</label>
                        <div className="password-field-wrapper">
                            <input 
                                type={showPasswordConfirm ? "text" : "password"} 
                                name="passwordConfirm" 
                                value={form.passwordConfirm} 
                                onChange={handleChange} 
                                required 
                                className="register-input"
                                style={{ flex: 1, paddingRight: 40 }}
                            />
                            <button
                                type="button"
                                className="password-toggle-button"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                {showPasswordConfirm ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>

                        <label>Foto:</label>

                        <div className="register-filebox">
                            <input type="file" name="photoEmployee" accept="image/*" onChange={handleChange} style={{ display: "none" }} id="photoEmployee" />
                            <label htmlFor="photoEmployee" className="register-filelabel">Elegir archivo</label>
                            {form.photoEmployee && <span style={{ marginLeft: 8 }}>{(form.photoEmployee as File).name}</span>}
                        </div>
                        {/* Campo de confirmación de contraseña AÑADIDO */}
                        {/* <label>Confirmar Contraseña:</label>
                        <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required className="register-input" /> */}


                    </div>
                    <div className="register-col">
                        <label>EPS:</label>
                        <input type="text" name="EPS" value={form.EPS} onChange={handleChange} required className="register-input" />

                        <label>Dirección:</label>
                        <input type="text" name="address" value={form.address} onChange={handleChange} required className="register-input" />

                        <label>Rol:</label>
                        <select name="employeeType" value={form.employeeType} onChange={handleChange} className="register-select">
                            <option value="Employee">Empleado</option>
                            <option value="Admin">Administrador</option>
                        </select>

                        <label>Especialidad:</label>
                        <select name="specialty" value={form.specialty} onChange={handleChange} required className="register-select">
                            <option value="">Seleccione una especialidad</option>
                            <option value="Social">Social</option>
                            <option value="Familia">Familia</option>
                            <option value="Retratos">Retratos</option>
                            <option value="Infantil">Infantil</option>
                            <option value="Parejas">Parejas</option>
                            <option value="Exteriores">Exteriores</option>
                        </select>

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
                        <button type="submit" className="register-submit">
                            Aceptar
                        </button>
                    </div>
                </form>
                {message && <p className={`register-message ${messageType}`}>{message}</p>}
            </div>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>

        </HomeLayout>
    );
};

export default Register;