/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import InputLabel from "../../../../components/Home/InputLabel";
import Button from "../../../../components/Home/Button";
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
    variant?: "page" | "modal"; // 👈 NUEVO
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, variant = "page" }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            emailCustomer: "",
            password: "",
        },
    });

    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";

    const serverErrorFor = (field: string) => {
        return serverErrors[field] ? serverErrors[field].join(" ") : undefined;
    };

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerErrors({});
        setLoading(true);

        try {
            const payload = {
                email: data.emailCustomer.trim(),
                password: data.password,
            };

            const res = await api.post("/api/login", payload);

            const token = res.data?.access_token;
            const redirectTo = res.data?.redirect_to || next;

            if (token) {
                await loginWithToken(token);
            } else if (res.data?.user && res.data?.token) {
                await loginWithToken(res.data.token);
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
                    setServerErrors({ general: ["Error del servidor"] });
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
        // Versión compacta para el modal
        return (
            <div className="login-modal-wrapper">
                <h2 className="login-modal-title">Inicio de sesión</h2>

                {serverErrors.general && (
                    <div className="alert alert-danger">
                        {serverErrors.general.join(" ")}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Controller
                        name="emailCustomer"
                        control={control}
                        rules={{
                            required: "El email es obligatorio",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "El correo debe ser una dirección de correo válida."
                            }
                        }}
                        render={({ field }) => (
                            <InputLabel
                                id="emailCustomer"
                                label="Correo:"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                error={errors.emailCustomer?.message || serverErrorFor("email")}
                            />
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: "Debe de escribir la contraseña" }}
                        render={({ field }) => (
                            <InputLabel
                                id="password"
                                label="Contraseña:"
                                type="password"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                error={errors.password?.message || serverErrorFor("password")}
                            />
                        )}
                    />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Link to="/recuperarContrasena" className="form-text">
                            Olvidé mi contraseña
                        </Link>
                    </div>

                    <div className="d-flex flex-column gap-2 justify-content-center">
                        <Button value={loading ? "Ingresando..." : "Iniciar Sesión"} />

                        {/* {onCancel && (
                            <button
                                type="button"
                                className="btn custom-upload-btn"
                                onClick={onCancel}
                            >
                                Cancelar
                            </button>
                        )} */}
                    </div>
                </form>
            </div>
        );
    }

    // Versión original de página
    return (
        <div className="container-sign">
            <div className="form-section form-section-login">
                <div className="row bg-custom-9">
                    <div className="col-lg-6 col-md-6 d-none d-md-block">
                        <img src="/img/fotoi.jpg" alt="Imagen de perfil" className="img-fluid rounded" />
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 py-5 ps-lg-5">
                        <h2 className="mb-4 text-center bg-custom-2">Inicio de Sesión</h2>

                        {serverErrors.general && (
                            <div className="alert alert-danger">
                                {serverErrors.general.join(" ")}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            {/* mismos campos que arriba */}
                            <Controller
                                name="emailCustomer"
                                control={control}
                                rules={{
                                    required: "El email es obligatorio",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "El correo debe ser una dirección de correo válida."
                                    }
                                }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="emailCustomer"
                                        label="Correo:"
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.emailCustomer?.message || serverErrorFor("email")}
                                    />
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: "Debe de escribir la contraseña" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="password"
                                        label="Contraseña:"
                                        type="password"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.password?.message || serverErrorFor("password")}
                                    />
                                )}
                            />

                            <Link to="/recuperarContrasena" className="form-text mb-4 text-end">
                                Olvidé mi contraseña
                            </Link>

                            <div className="d-flex justify-content-center">
                                <Button value={loading ? "Ingresando..." : "Iniciar Sesión"} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
