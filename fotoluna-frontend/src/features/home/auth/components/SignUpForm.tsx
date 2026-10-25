/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Cropper } from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "../../../../styles/cropper.css";
import "../styles/signUp.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

type FormValues = {
    firstNameCustomer: string;
    lastNameCustomer: string;
    phoneCustomer: string;
    documentType: string;
    documentNumber: string;
    emailCustomer: string;
    password: string;
    confirmPassword: string;
    photoCustomer?: FileList;
};

interface SignUpFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    /** "page" = vista normal, "modal" = dentro del popup del wizard */
    variant?: "page" | "modal";
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onCancel, variant = "page" }) => {
    const [profileImage, setProfileImage] = useState("/img/imagenperfil.jpg");
    const [cropData, setCropData] = useState("");
    const cropperRef = useRef<ReactCropperElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const params = variant === "page" ? new URLSearchParams(location.search) : null;
    const next = params?.get("next") || "/";

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<FormValues>({
        defaultValues: {
            firstNameCustomer: "",
            lastNameCustomer: "",
            phoneCustomer: "",
            documentType: "CC",
            documentNumber: "",
            emailCustomer: "",
            password: "",
            confirmPassword: "",
        },
    });

    function dataURLtoFile(dataurl: string, filename = "photo.jpg") {
        const arr = dataurl.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerErrors({});
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("role", "cliente");
            formData.append("firstNameCustomer", data.firstNameCustomer.trim());
            formData.append("lastNameCustomer", data.lastNameCustomer.trim());
            formData.append("phoneCustomer", data.phoneCustomer || "");
            formData.append("documentType", data.documentType || "CC");
            formData.append("documentNumber", data.documentNumber || "");
            formData.append("email", data.emailCustomer.trim());
            formData.append("password", data.password);
            formData.append("password_confirmation", data.confirmPassword);

            if (cropData && cropData.startsWith("data:")) {
                const file = dataURLtoFile(cropData, "photo.jpg");
                formData.append("photoCustomer", file);
            }

            const res = await axios.post(`/api/register`, formData, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (res.data?.access_token) {
                const token = res.data.access_token;
                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
            if (res.data?.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }

            if (onSuccess) {
                onSuccess();
            } else {
                const redirectTo = res.data?.redirect_to || next;
                navigate(redirectTo, { replace: true });
            }
        } catch (err: any) {
            console.error("❌ Register error:", err.response?.data);
            if (err.response) {
                if (err.response.status === 422) {
                    setServerErrors(err.response.data.errors || {});
                } else {
                    setServerErrors({ general: [err.response.data.message || "Error al registrar la cuenta"] });
                }
            } else {
                setServerErrors({ general: ["No se pudo conectar con el servidor"] });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            setShowModal(true);
        }
    };

    const getCropData = () => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            setCropData(
                cropperRef.current?.cropper.getCroppedCanvas().toDataURL("image/jpeg")
            );
        }
    };

    const serverErrorFor = (field: string) => {
        return serverErrors[field] ? serverErrors[field].join(" ") : undefined;
    };

    // Modal de Cropper
    const cropperModal = showModal && (
        <>
            <div className="modal fade show" style={{ display: "block", zIndex: 1060 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header bg-light border-0 py-3 px-4">
                            <h5 className="modal-title fw-bold text-dark">
                                <i className="bi bi-crop me-2 text-purple"></i>Recortar Foto de Perfil
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body p-4 text-center">
                            <Cropper
                                src={profileImage}
                                style={{ height: 300, width: "100%" }}
                                initialAspectRatio={1}
                                aspectRatio={1}
                                guides={true}
                                cropBoxResizable={true}
                                viewMode={1}
                                ref={cropperRef}
                                minCropBoxHeight={50}
                                minCropBoxWidth={50}
                                background={false}
                                responsive={true}
                                checkOrientation={false}
                            />
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4 pt-0">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-3 px-3"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn auth-submit-btn m-0 px-4"
                                style={{ width: "auto", height: "42px" }}
                                onClick={() => {
                                    getCropData();
                                    setShowModal(false);
                                }}
                            >
                                Guardar recorte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
        </>
    );

    // ===========================
    // VARIANTE MODAL (WIZARD)
    // ===========================
    if (variant === "modal") {
        return (
            <div className="w-100 p-2">
                <div className="text-center mb-3">
                    <span className="auth-welcome-pill mb-2">
                        <i className="bi bi-person-plus-fill"></i> Registro
                    </span>
                    <h3 className="fw-bold mb-1">Crea tu cuenta</h3>
                    <p className="text-muted small">Regístrate para agendar tu cita en FotoLuna</p>
                </div>

                {cropperModal}

                {/* Avatar uploader en modal */}
                <div className="d-flex flex-column align-items-center mb-4">
                    <div className="auth-avatar-container" style={{ width: "110px", height: "110px" }}>
                        <img
                            src={cropData || profileImage}
                            alt="Foto Perfil"
                            className="auth-avatar-img"
                            style={{ width: "110px", height: "110px" }}
                        />
                        <label
                            htmlFor="profileImageModal"
                            className="auth-avatar-camera-btn"
                            title="Subir foto de perfil"
                        >
                            <i className="bi bi-camera"></i>
                        </label>
                        <input
                            type="file"
                            id="profileImageModal"
                            onChange={(e) => handleImageChange(e.target.files)}
                            accept="image/*"
                            hidden
                        />
                    </div>
                    <span className="auth-avatar-hint mb-0">Foto opcional</span>
                </div>

                {serverErrors.general && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <div>{serverErrors.general.join(" ")}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row g-2">
                        {/* Nombres */}
                        <div className="col-md-6 auth-field-group">
                            <label className="auth-field-label">Nombres:</label>
                            <div className="auth-input-wrapper">
                                <i className="bi bi-person auth-input-icon"></i>
                                <Controller
                                    name="firstNameCustomer"
                                    control={control}
                                    rules={{ required: "El nombre es obligatorio" }}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Nombres"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className={`form-control auth-input ${(errors.firstNameCustomer || serverErrorFor("firstNameCustomer")) ? "is-invalid" : ""}`}
                                        />
                                    )}
                                />
                            </div>
                            {(errors.firstNameCustomer?.message || serverErrorFor("firstNameCustomer")) && (
                                <span className="auth-error-feedback">
                                    {errors.firstNameCustomer?.message || serverErrorFor("firstNameCustomer")}
                                </span>
                            )}
                        </div>

                        {/* Apellidos */}
                        <div className="col-md-6 auth-field-group">
                            <label className="auth-field-label">Apellidos:</label>
                            <div className="auth-input-wrapper">
                                <i className="bi bi-person auth-input-icon"></i>
                                <Controller
                                    name="lastNameCustomer"
                                    control={control}
                                    rules={{ required: "El apellido es obligatorio" }}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Apellidos"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className={`form-control auth-input ${(errors.lastNameCustomer || serverErrorFor("lastNameCustomer")) ? "is-invalid" : ""}`}
                                        />
                                    )}
                                />
                            </div>
                            {(errors.lastNameCustomer?.message || serverErrorFor("lastNameCustomer")) && (
                                <span className="auth-error-feedback">
                                    {errors.lastNameCustomer?.message || serverErrorFor("lastNameCustomer")}
                                </span>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div className="col-md-6 auth-field-group">
                            <label className="auth-field-label">Teléfono:</label>
                            <div className="auth-input-wrapper">
                                <i className="bi bi-telephone auth-input-icon"></i>
                                <Controller
                                    name="phoneCustomer"
                                    control={control}
                                    rules={{
                                        required: "El teléfono es obligatorio",
                                        pattern: { value: /^[0-9]+$/, message: "Solo números" },
                                    }}
                                    render={({ field }) => (
                                        <input
                                            type="tel"
                                            placeholder="300 123 4567"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className={`form-control auth-input ${(errors.phoneCustomer || serverErrorFor("phoneCustomer")) ? "is-invalid" : ""}`}
                                        />
                                    )}
                                />
                            </div>
                            {(errors.phoneCustomer?.message || serverErrorFor("phoneCustomer")) && (
                                <span className="auth-error-feedback">
                                    {errors.phoneCustomer?.message || serverErrorFor("phoneCustomer")}
                                </span>
                            )}
                        </div>

                        {/* Correo */}
                        <div className="col-md-6 auth-field-group">
                            <label className="auth-field-label">Correo electrónico:</label>
                            <div className="auth-input-wrapper">
                                <i className="bi bi-envelope auth-input-icon"></i>
                                <Controller
                                    name="emailCustomer"
                                    control={control}
                                    rules={{
                                        required: "El email es obligatorio",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo no válido" },
                                    }}
                                    render={({ field }) => (
                                        <input
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className={`form-control auth-input ${(errors.emailCustomer || serverErrorFor("email")) ? "is-invalid" : ""}`}
                                        />
                                    )}
                                />
                            </div>
                            {(errors.emailCustomer?.message || serverErrorFor("email")) && (
                                <span className="auth-error-feedback">
                                    {errors.emailCustomer?.message || serverErrorFor("email")}
                                </span>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="col-md-6 auth-field-group">
                            <label className="auth-field-label">Contraseña:</label>
                            <div className="auth-input-wrapper">
                                <i className="bi bi-lock auth-input-icon"></i>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: "La contraseña es obligatoria",
                                        minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                    }}
                                    render={({ field }) => (
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 8 caracteres"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className={`form-control auth-input ${(errors.password || serverErrorFor("password")) ? "is-invalid" : ""}`}
                                        />
                                    )}
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                            {(errors.password?.message || serverErrorFor("password")) && (
                                <span className="auth-error-feedback">
                                    {errors.password?.message || serverErrorFor("password")}
                                </span>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="col-md-6 auth-field-group">
                            <label className="auth-field-label">Confirmar Contraseña:</label>
                            <div className="auth-input-wrapper">
                                <i className="bi bi-shield-lock auth-input-icon"></i>
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    rules={{
                                        required: "Confirma tu contraseña",
                                        validate: (value: string) => {
                                            if (watch("password") !== value) {
                                                return "Las contraseñas no coinciden";
                                            }
                                            return true;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Repite la contraseña"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className={`form-control auth-input ${(errors.confirmPassword || serverErrorFor("password_confirmation")) ? "is-invalid" : ""}`}
                                        />
                                    )}
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                            {(errors.confirmPassword?.message || serverErrorFor("password_confirmation")) && (
                                <span className="auth-error-feedback">
                                    {errors.confirmPassword?.message || serverErrorFor("password_confirmation")}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Creando cuenta...</span>
                                </>
                            ) : (
                                <>
                                    <span>Crear Cuenta</span>
                                    <i className="bi bi-arrow-right"></i>
                                </>
                            )}
                        </button>
                        {onCancel && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-3 rounded-3"
                                onClick={onCancel}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    // ===========================
    // VARIANTE PÁGINA COMPLETA (/registrarse)
    // ===========================
    return (
        <div className="auth-page-container">
            <div className="auth-card auth-card-signup">
                {cropperModal}
                <div className="row g-0">
                    {/* Lateral Izquierdo: Avatar & Beneficios */}
                    <div className="col-lg-4 col-md-5 auth-register-left">
                        <div className="text-center w-100">
                            <span className="auth-welcome-pill mb-3">
                                <i className="bi bi-camera"></i> Foto de Perfil
                            </span>
                            <div className="auth-avatar-container mx-auto">
                                <img
                                    src={cropData || profileImage}
                                    alt="Foto Perfil"
                                    className="auth-avatar-img"
                                />
                                <label
                                    htmlFor="profileImagePage"
                                    className="auth-avatar-camera-btn"
                                    title="Subir o cambiar foto"
                                >
                                    <i className="bi bi-camera-fill"></i>
                                </label>
                                <input
                                    type="file"
                                    id="profileImagePage"
                                    onChange={(e) => handleImageChange(e.target.files)}
                                    accept="image/*"
                                    hidden
                                />
                            </div>
                            <h4 className="auth-avatar-label">Sube tu fotografía</h4>
                            <p className="auth-avatar-hint">
                                Formato JPG o PNG. Tamaño máximo 5MB (Opcional).
                            </p>
                        </div>

                        {/* Beneficios de registrarse */}
                        <div className="auth-perks-box mt-auto w-100">
                            <div className="auth-perks-box-title">
                                <i className="bi bi-shield-check"></i> Beneficios de tu cuenta
                            </div>
                            <div className="auth-perks-box-item">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>Agenda y gestiona tus citas fotográficas 24/7</span>
                            </div>
                            <div className="auth-perks-box-item">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>Acceso privado a tu galería de fotos en alta resolución</span>
                            </div>
                            <div className="auth-perks-box-item">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>Recordatorios por correo y notificaciones en tiempo real</span>
                            </div>
                        </div>
                    </div>

                    {/* Lateral Derecho: Formulario Completo */}
                    <div className="col-lg-8 col-md-7 col-sm-12 auth-form-side">
                        <div className="mb-2">
                            <span className="auth-welcome-pill">
                                <i className="bi bi-person-plus-fill"></i> Registro
                            </span>
                            <h1 className="auth-title">Crea tu Cuenta</h1>
                            <p className="auth-subtitle">
                                Completa tus datos para disfrutar de todos los servicios fotográficos de FotoLuna
                            </p>
                        </div>

                        {serverErrors.general && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                <div>{serverErrors.general.join(" ")}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <div className="row g-3">
                                {/* Nombres */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regFirstName" className="auth-field-label">
                                        Nombres
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-person auth-input-icon"></i>
                                        <Controller
                                            name="firstNameCustomer"
                                            control={control}
                                            rules={{ required: "El nombre es obligatorio" }}
                                            render={({ field }) => (
                                                <input
                                                    id="regFirstName"
                                                    type="text"
                                                    placeholder="Ej: Sofia"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.firstNameCustomer || serverErrorFor("firstNameCustomer")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {(errors.firstNameCustomer?.message || serverErrorFor("firstNameCustomer")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.firstNameCustomer?.message || serverErrorFor("firstNameCustomer")}
                                        </span>
                                    )}
                                </div>

                                {/* Apellidos */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regLastName" className="auth-field-label">
                                        Apellidos
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-person auth-input-icon"></i>
                                        <Controller
                                            name="lastNameCustomer"
                                            control={control}
                                            rules={{ required: "El apellido es obligatorio" }}
                                            render={({ field }) => (
                                                <input
                                                    id="regLastName"
                                                    type="text"
                                                    placeholder="Ej: Ospina"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.lastNameCustomer || serverErrorFor("lastNameCustomer")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {(errors.lastNameCustomer?.message || serverErrorFor("lastNameCustomer")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.lastNameCustomer?.message || serverErrorFor("lastNameCustomer")}
                                        </span>
                                    )}
                                </div>

                                {/* Tipo de Documento */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regDocType" className="auth-field-label">
                                        Tipo de Documento
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-card-heading auth-input-icon"></i>
                                        <Controller
                                            name="documentType"
                                            control={control}
                                            rules={{ required: "Seleccione el tipo de documento" }}
                                            render={({ field }) => (
                                                <select
                                                    id="regDocType"
                                                    className={`form-select auth-select ${(errors.documentType || serverErrorFor("documentType")) ? "is-invalid" : ""}`}
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                >
                                                    <option value="CC">Cédula de ciudadanía (CC)</option>
                                                    <option value="CE">Cédula de extranjería (CE)</option>
                                                    <option value="PAS">Pasaporte (PAS)</option>
                                                </select>
                                            )}
                                        />
                                    </div>
                                    {(errors.documentType?.message || serverErrorFor("documentType")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.documentType?.message || serverErrorFor("documentType")}
                                        </span>
                                    )}
                                </div>

                                {/* Número de Documento */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regDocNum" className="auth-field-label">
                                        Número de Documento
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-card-text auth-input-icon"></i>
                                        <Controller
                                            name="documentNumber"
                                            control={control}
                                            rules={{ required: "El número de documento es obligatorio" }}
                                            render={({ field }) => (
                                                <input
                                                    id="regDocNum"
                                                    type="text"
                                                    placeholder="Ej: 1020304050"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.documentNumber || serverErrorFor("documentNumber")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {(errors.documentNumber?.message || serverErrorFor("documentNumber")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.documentNumber?.message || serverErrorFor("documentNumber")}
                                        </span>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regPhone" className="auth-field-label">
                                        Teléfono celular
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-telephone auth-input-icon"></i>
                                        <Controller
                                            name="phoneCustomer"
                                            control={control}
                                            rules={{
                                                required: "El número de teléfono es obligatorio",
                                                pattern: {
                                                    value: /^[0-9]+$/,
                                                    message: "Solo se permiten números",
                                                },
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    id="regPhone"
                                                    type="tel"
                                                    placeholder="Ej: 3001234567"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.phoneCustomer || serverErrorFor("phoneCustomer")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {(errors.phoneCustomer?.message || serverErrorFor("phoneCustomer")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.phoneCustomer?.message || serverErrorFor("phoneCustomer")}
                                        </span>
                                    )}
                                </div>

                                {/* Correo */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regEmail" className="auth-field-label">
                                        Correo electrónico
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-envelope auth-input-icon"></i>
                                        <Controller
                                            name="emailCustomer"
                                            control={control}
                                            rules={{
                                                required: "El correo es obligatorio",
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Correo no válido",
                                                },
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    id="regEmail"
                                                    type="email"
                                                    placeholder="ejemplo@correo.com"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.emailCustomer || serverErrorFor("email")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {(errors.emailCustomer?.message || serverErrorFor("email")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.emailCustomer?.message || serverErrorFor("email")}
                                        </span>
                                    )}
                                </div>

                                {/* Contraseña */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regPassword" className="auth-field-label">
                                        Contraseña
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-lock auth-input-icon"></i>
                                        <Controller
                                            name="password"
                                            control={control}
                                            rules={{
                                                required: "Debe escribir una contraseña",
                                                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    id="regPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Mínimo 8 caracteres"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.password || serverErrorFor("password")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Ocultar" : "Mostrar"}
                                        >
                                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>
                                    {(errors.password?.message || serverErrorFor("password")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.password?.message || serverErrorFor("password")}
                                        </span>
                                    )}
                                </div>

                                {/* Confirmar Contraseña */}
                                <div className="col-md-6 auth-field-group mb-2">
                                    <label htmlFor="regConfirmPassword" className="auth-field-label">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <i className="bi bi-shield-lock auth-input-icon"></i>
                                        <Controller
                                            name="confirmPassword"
                                            control={control}
                                            rules={{
                                                required: "Confirma tu contraseña",
                                                validate: (value: string) => {
                                                    if (watch("password") !== value) {
                                                        return "Las contraseñas no coinciden";
                                                    }
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    id="regConfirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Repite tu contraseña"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    className={`form-control auth-input ${(errors.confirmPassword || serverErrorFor("password_confirmation")) ? "is-invalid" : ""}`}
                                                />
                                            )}
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}
                                        >
                                            <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>
                                    {(errors.confirmPassword?.message || serverErrorFor("password_confirmation")) && (
                                        <span className="auth-error-feedback">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.confirmPassword?.message || serverErrorFor("password_confirmation")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Botón Registrarse */}
                            <button
                                type="submit"
                                className="auth-submit-btn mt-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span>Creando tu cuenta...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Registrarse en FotoLuna</span>
                                        <i className="bi bi-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-switch-footer">
                            ¿Ya tienes una cuenta registrada?
                            <Link to="/iniciarSesion" className="auth-switch-link">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpForm;
