/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import "../styles/signUp.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/useAuth";

type FormValues = {
    emailCustomer: string;
    password: string;
};

interface LoginFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    variant?: "page" | "modal";
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, variant = "page" }) => {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            emailCustomer: "",
            password: "",
        },
    });

    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";

    const serverErrorFor = (field: string) => {
        return serverErrors[field] ? serverErrors[field].join(" ") : undefined;
    };

    const quickLogin = async (role: "admin" | "empleado" | "cliente") => {
        let email = "cliente@fotoluna.com";
        const password = `${role}123`;
        if (role === "admin") email = "admin@fotoluna.com";
        if (role === "empleado") email = "empleado@fotoluna.com";

        setValue("emailCustomer", email);
        setValue("password", password);
        await onSubmit({ emailCustomer: email, password });
    };

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerErrors({});
        setLoading(true);

        try {
            const payload = {
                email: data.emailCustomer.trim(),
                password: data.password,
            };

            const res = await api.post("/login", payload);

            const token = res.data?.access_token ?? res.data?.token ?? null;
            const redirectTo = res.data?.redirect_to || next;
            const user = res.data?.user || null;

            if (user) {
                try {
                    const email =
                        user.emailCustomer ||
                        user.email ||
                        user.email_user ||
                        payload.email;

                    if (email) {
                        localStorage.setItem("user_email", email);
                    }

                    localStorage.setItem("user", JSON.stringify(user));
                } catch (e) {
                    console.warn("No se pudo guardar user en localStorage:", e);
                }
            }

            if (token) {
                await loginWithToken(token);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate(redirectTo, { replace: true });
            }
        } catch (err: any) {
            console.error("Login error:", err?.response?.status, err?.response?.data);
            if (err.response) {
                if (err.response.status === 422) {
                    setServerErrors(err.response.data.errors || {});
                } else if (err.response.data?.message) {
                    setServerErrors({ general: [err.response.data.message] });
                } else {
                    setServerErrors({ general: ["Credenciales incorrectas o error en el servidor"] });
                }
            } else {
                setServerErrors({ general: ["No se pudo conectar con el servidor"] });
            }
        } finally {
            setLoading(false);
        }
    };

    // ====== RENDER DIFERENTE SEGÚN VARIANT ======
    if (variant === "modal") {
        return (
            <div className="login-modal-wrapper">
                <div className="text-center mb-3">
                    <span className="auth-welcome-pill mb-2">
                        <i className="bi bi-stars"></i> FotoLuna
                    </span>
                    <h2 className="login-modal-title">Iniciar sesión</h2>
                    <p className="text-muted small">Ingresa para continuar con tu proceso</p>
                </div>

                {serverErrors.general && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <div>{serverErrors.general.join(" ")}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Correo */}
                    <div className="auth-field-group">
                        <label htmlFor="modalEmailCustomer" className="auth-field-label">
                            Correo electrónico:
                        </label>
                        <div className="auth-input-wrapper">
                            <i className="bi bi-envelope auth-input-icon"></i>
                            <Controller
                                name="emailCustomer"
                                control={control}
                                rules={{
                                    required: "El email es obligatorio",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "El correo debe ser una dirección válida."
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        id="modalEmailCustomer"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        value={field.value}
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
                    <div className="auth-field-group">
                        <div className="d-flex justify-content-between align-items-center">
                            <label htmlFor="modalPassword" className="auth-field-label">
                                Contraseña:
                            </label>
                            <Link to="/recuperarContrasena" className="auth-forgot-link small">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <div className="auth-input-wrapper">
                            <i className="bi bi-lock auth-input-icon"></i>
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: "Debe ingresar su contraseña" }}
                                render={({ field }) => (
                                    <input
                                        id="modalPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tu contraseña"
                                        value={field.value}
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

                    <button
                        type="submit"
                        className="auth-submit-btn mt-3"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Ingresando...</span>
                            </>
                        ) : (
                            <>
                                <span>Iniciar Sesión</span>
                                <i className="bi bi-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                {/* Accesos Rápidos Demo (1 Clic) */}
                <div className="p-2 mt-3 rounded-3" style={{ background: "rgba(182, 149, 92, 0.08)", border: "1px dashed rgba(182, 149, 92, 0.4)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small fw-semibold text-dark d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
                            <i className="bi bi-lightning-charge-fill text-warning"></i>
                            Accesos Demo (1 Clic)
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "0.62rem" }}>Demo Netlify</span>
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-dark flex-grow-1 py-1"
                            style={{ fontSize: "0.74rem" }}
                            onClick={() => quickLogin("admin")}
                            disabled={loading}
                        >
                            👑 Admin
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary flex-grow-1 py-1"
                            style={{ fontSize: "0.74rem" }}
                            onClick={() => quickLogin("empleado")}
                            disabled={loading}
                        >
                            📷 Empleado
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-success flex-grow-1 py-1"
                            style={{ fontSize: "0.74rem" }}
                            onClick={() => quickLogin("cliente")}
                            disabled={loading}
                        >
                            👤 Cliente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ====== VERSIÓN DE PÁGINA COMPLETA (/iniciarSesion) ======
    return (
        <div className="auth-page-container">
            <div className="auth-card auth-card-login">
                <div className="row g-0">
                    {/* Lateral Izquierdo: Visual & Branding */}
                    <div className="col-lg-5 col-md-5 d-none d-md-block p-0">
                        <div
                            className="auth-banner-side h-100"
                            style={{ backgroundImage: `url('/img/fotoi.jpg')` }}
                        >
                            <div className="auth-banner-overlay" />
                            <div className="auth-banner-content">
                                <div className="auth-brand-badge">
                                    <i className="bi bi-camera-fill"></i> FotoLuna
                                </div>
                                <div className="my-auto py-4">
                                    <h2 className="auth-banner-headline">
                                        Guarda cada instante que te hace sonreír
                                    </h2>
                                    <p className="auth-banner-quote">
                                        “La fotografía recuerda lo que la mente olvida.”
                                    </p>
                                    <div className="auth-banner-perks">
                                        <div className="auth-perk-item">
                                            <i className="bi bi-check-circle-fill"></i>
                                            <span>Tus sesiones y álbumes digitales en un solo lugar</span>
                                        </div>
                                        <div className="auth-perk-item">
                                            <i className="bi bi-cloud-arrow-down-fill"></i>
                                            <span>Descarga tus fotos en máxima resolución</span>
                                        </div>
                                        <div className="auth-perk-item">
                                            <i className="bi bi-shield-lock-fill"></i>
                                            <span>Acceso 100% privado y seguro</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-white-50 small">
                                    © {new Date().getFullYear()} FotoLuna Studio. Todos los derechos reservados.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lateral Derecho: Formulario */}
                    <div className="col-lg-7 col-md-7 col-sm-12 auth-form-side">
                        <div className="mb-2">
                            <span className="auth-welcome-pill">
                                <i className="bi bi-stars"></i> Bienvenido de nuevo
                            </span>
                            <h1 className="auth-title">Iniciar Sesión</h1>
                            <p className="auth-subtitle">
                                Ingresa a tu cuenta para gestionar tus citas, sesiones y fotografías
                            </p>
                        </div>

                        {serverErrors.general && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                <div>{serverErrors.general.join(" ")}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            {/* Correo Electrónico */}
                            <div className="auth-field-group">
                                <label htmlFor="pageEmailCustomer" className="auth-field-label">
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
                                                message: "El correo debe ser una dirección válida."
                                            }
                                        }}
                                        render={({ field }) => (
                                            <input
                                                id="pageEmailCustomer"
                                                type="email"
                                                placeholder="ejemplo@correo.com"
                                                value={field.value}
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
                            <div className="auth-field-group">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label htmlFor="pagePassword" className="auth-field-label mb-0">
                                        Contraseña
                                    </label>
                                    <Link to="/recuperarContrasena" className="auth-forgot-link">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <div className="auth-input-wrapper">
                                    <i className="bi bi-lock auth-input-icon"></i>
                                    <Controller
                                        name="password"
                                        control={control}
                                        rules={{ required: "La contraseña es obligatoria" }}
                                        render={({ field }) => (
                                            <input
                                                id="pagePassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Ingresa tu contraseña"
                                                value={field.value}
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
                                        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
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

                            {/* Botón Iniciar Sesión */}
                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Iniciar Sesión</span>
                                        <i className="bi bi-box-arrow-in-right"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Accesos Rápidos Demo (1 Clic) */}
                        <div className="p-3 my-3 rounded-3" style={{ background: "rgba(182, 149, 92, 0.08)", border: "1px dashed rgba(182, 149, 92, 0.4)" }}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-semibold text-dark d-flex align-items-center gap-1">
                                    <i className="bi bi-lightning-charge-fill text-warning"></i>
                                    Accesos Rápidos Demo (1 Clic)
                                </span>
                                <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "0.68rem" }}>Demo Netlify</span>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-dark flex-grow-1 py-1"
                                    style={{ fontSize: "0.78rem" }}
                                    onClick={() => quickLogin("admin")}
                                    disabled={loading}
                                >
                                    👑 Demo Admin
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary flex-grow-1 py-1"
                                    style={{ fontSize: "0.78rem" }}
                                    onClick={() => quickLogin("empleado")}
                                    disabled={loading}
                                >
                                    📷 Demo Empleado
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success flex-grow-1 py-1"
                                    style={{ fontSize: "0.78rem" }}
                                    onClick={() => quickLogin("cliente")}
                                    disabled={loading}
                                >
                                    👤 Demo Cliente
                                </button>
                            </div>
                            <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.74rem" }}>
                                Haz clic en cualquiera para ingresar instantáneamente al panel sin necesidad de escribir contraseñas.
                            </p>
                        </div>

                        <div className="auth-switch-footer">
                            ¿Aún no tienes una cuenta?
                            <Link to="/registrarse" className="auth-switch-link">
                                Regístrate gratis aquí
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
