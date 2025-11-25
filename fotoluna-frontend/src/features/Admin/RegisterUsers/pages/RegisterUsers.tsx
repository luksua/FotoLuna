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
        passwordConfirm: "",
        employeeType: "Employee",
        role: "Photographer",
        specialty: "",
        isAvailable: true,
        gender: "Female"
    });
    const [message, setMessage] = useState("");
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
            return;
        }

        if (form.password.length < 6) {
            setMessage('La contraseña debe tener al menos 6 caracteres.');
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
            formData.append('role', form.role);
            formData.append('specialty', form.specialty);
            formData.append('isAvailable', form.isAvailable ? '1' : '0');
            formData.append('gender', form.gender);

            if (form.photoEmployee) {
                formData.append('photoEmployee', form.photoEmployee as File);
            }

            const res = await fetch('/api/admin/employees', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
                setMessage(`Error: ${err.message || 'No se pudo registrar'}.`);
                return;
            }

            const data = await res.json();
            if (data && data.success) {
                setMessage('Usuario registrado correctamente');
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
                    role: 'Photographer',
                    specialty: '',
                    isAvailable: true,
                    gender: 'Female'
                });
            } else {
                setMessage('No se pudo registrar el usuario');
            }
        } catch (error: any) {
            setMessage(error?.message || 'Error en la petición');
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

                        <label>Número de Documento:</label>
                        <input type="text" name="documentNumber" value={form.documentNumber} onChange={handleChange} required className="register-input" />

                        <label>Correo:</label>
                        <input type="email" name="emailEmployee" value={form.emailEmployee} onChange={handleChange} required className="register-input" />

                        <label>Contraseña:</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    color: '#7c5e8c'
                                }}
                            >
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
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    color: '#7c5e8c'
                                }}
                            >
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

                    </div>
                    <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
                        <label>EPS:</label>
                        <input type="text" name="EPS" value={form.EPS} onChange={handleChange} required className="register-input" />

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
export default Register;