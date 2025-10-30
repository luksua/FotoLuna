import { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../../../components/Home/Button";
import "../styles/account.css"

interface ProfileForm {
    nombre: string;
    apellido: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const [form, setForm] = useState<ProfileForm>({
        nombre: "Ana",
        apellido: "Rodriguez",
        email: "ana.rodriguez@example.com",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [preview, setPreview] = useState(
        "https://via.placeholder.com/120?text=Perfil"
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setForm({ ...form, [e.target.name]: e.target.value } as ProfileForm);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        alert("Cambios guardados (modo demo)");
    };

    return (
        <div className="container py-5">
            <h1 className="fw-bold mb-2">Perfil</h1>
            <p className="text-muted mb-4">
                Visualiza y edita tu información personal.
            </p>

            <form onSubmit={handleSubmit} className="bg-white border rounded-4 shadow-sm p-4 mb-4">
                <h5 className="fw-semibold mb-3">Información Personal</h5>
                <div className="row g-3 mb-3">
                    {/* Imagen de perfil */}
                    <div className="d-flex flex-column align-items-center mb-4 position-relative">
                        <div className="position-relative">
                            <img
                                src={preview}
                                alt="Imagen de perfil"
                                className="rounded-circle border"
                                style={{
                                    width: "130px",
                                    height: "130px",
                                    objectFit: "cover",
                                }}
                            />

                            {/* Botón de editar imagen */}
                            <label
                                htmlFor="profileImage"
                                className="edit-button position-absolute bottom-0 end-0 text-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    cursor: "pointer",
                                    transform: "translate(20%, 20%)",
                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                }}
                            >
                                <i className="bi bi-pencil-square"></i>
                            </label>

                            {/* Input oculto */}
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="d-none"
                            />
                        </div>

                        <small className="text-muted mt-2">
                            Formatos permitidos: JPG, PNG. Máx. 2MB
                        </small>
                    </div>

                    {/* Campos de texto */}
                    <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Apellido</label>
                        <input
                            type="text"
                            name="apellido"
                            value={form.apellido}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
            </form>

            <form onSubmit={handleSubmit} className="bg-white border rounded-4 shadow-sm p-4">
                <h5 className="fw-semibold mb-3">Cambiar Contraseña</h5>
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <label className="form-label">Contraseña Actual</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={form.currentPassword}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                    <Button
                        value="Guardar Cambios"
                    />
                </div>
            </form>
        </div>
    );
}
