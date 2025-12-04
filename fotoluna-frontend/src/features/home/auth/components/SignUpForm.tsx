/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Cropper } from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "../../../../styles/cropper.css";
import InputLabel from "../../../../components/Home/InputLabel";
import Button from "../../../../components/Home/Button";
import "../styles/signUp.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onCancel, variant = "page" }) => {
    const [profileImage, setProfileImage] = useState("/img/imagenperfil.jpg");
    const [cropData, setCropData] = useState("");
    const cropperRef = useRef<ReactCropperElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // En modo modal, no nos importa el "next" de la URL
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

    // convierte dataURL (cropData) a File
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
            formData.append("firstNameCustomer", data.firstNameCustomer);
            formData.append("lastNameCustomer", data.lastNameCustomer);
            formData.append("phoneCustomer", data.phoneCustomer || "");
            formData.append("documentType", data.documentType || "CC");
            formData.append("documentNumber", data.documentNumber || "");
            formData.append("email", data.emailCustomer);
            formData.append("password", data.password);
            formData.append("password_confirmation", data.confirmPassword);

            if (cropData && cropData.startsWith("data:")) {
                const file = dataURLtoFile(cropData, "photo.jpg");
                formData.append("photoCustomer", file);
            }

            const res = await axios.post(`${API_BASE || ""}/api/register`, formData, {
                headers: {
                    Accept: "application/json",
                },
            });

            // Guardar token / user si vienen
            if (res.data?.access_token) {
                const token = res.data.access_token;
                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
            if (res.data?.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }

            if (onSuccess) {
                // 👉 Caso MODAL (wizard): solo cerramos el modal
                onSuccess();
            } else {
                // 👉 Caso PÁGINA normal: redirigimos
                const redirectTo = res.data?.redirect_to || next;
                navigate(redirectTo, { replace: true });
            }
        } catch (err: any) {
            console.error("❌ Register error:", err.response?.data);
            if (err.response) {
                if (err.response.status === 422) {
                    setServerErrors(err.response.data.errors || {});
                } else {
                    setServerErrors({ general: [err.response.data.message || "Error del servidor"] });
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

    // =========================================================
    // 👇 VISTA DIFERENTE SEGÚN variant
    // =========================================================

    const formBody = (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <Controller
                name="firstNameCustomer"
                control={control}
                rules={{ required: "El nombre es obligatorio" }}
                render={({ field }) => (
                    <InputLabel
                        id="firstName"
                        label="Nombres:"
                        type="text"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={errors.firstNameCustomer?.message || serverErrorFor("firstNameCustomer")}
                    />
                )}
            />

            {/* Last Name */}
            <Controller
                name="lastNameCustomer"
                control={control}
                rules={{ required: "El apellido es obligatorio" }}
                render={({ field }) => (
                    <InputLabel
                        id="lastName"
                        label="Apellidos:"
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={errors.lastNameCustomer?.message || serverErrorFor("lastNameCustomer")}
                    />
                )}
            />

            {/* Phone */}
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
                    <InputLabel
                        id="phone"
                        label="Teléfono:"
                        type="number"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={errors.phoneCustomer?.message || serverErrorFor("phoneCustomer")}
                    />
                )}
            />

            {/* Document Type */}
            <Controller
                name="documentType"
                control={control}
                rules={{ required: "Seleccione el tipo de documento" }}
                render={({ field }) => (
                    <div className="mb-3">
                        <label htmlFor="documentType" className="form-label">
                            Tipo de Documento:
                        </label>
                        <select
                            id="documentType"
                            className={`form-select ${errors.documentType || serverErrorFor("documentType") ? "is-invalid" : ""
                                }`}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                        >
                            <option value="CC">Cédula de ciudadanía (CC)</option>
                            <option value="CE">Cédula de extranjería (CE)</option>
                            <option value="PAS">Pasaporte (PAS)</option>
                        </select>
                        <div className="invalid-feedback">
                            {errors.documentType?.message || serverErrorFor("documentType")}
                        </div>
                    </div>
                )}
            />

            {/* Document Number */}
            <Controller
                name="documentNumber"
                control={control}
                rules={{ required: "El número es obligatorio" }}
                render={({ field }) => (
                    <InputLabel
                        id="documentNumber"
                        label="Número de Documento:"
                        type="number"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={errors.documentNumber?.message || serverErrorFor("documentNumber")}
                    />
                )}
            />

            {/* Email */}
            <Controller
                name="emailCustomer"
                control={control}
                rules={{ required: "El email es obligatorio" }}
                render={({ field }) => (
                    <InputLabel
                        id="emailCustomer"
                        label="Correo:"
                        type="email"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={errors.emailCustomer?.message || serverErrorFor("email")}
                    />
                )}
            />

            {/* Password */}
            <Controller
                name="password"
                control={control}
                rules={{
                    required: "Debe de escribir una contraseña",
                    minLength: { value: 8, message: "Debe tener mínimo 8 caracteres" },
                }}
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

            {/* Confirm Password */}
            <Controller
                name="confirmPassword"
                control={control}
                rules={{
                    required: "Confirma tu contraseña",
                    validate: (value: string) => {
                        if (watch("password") !== value) {
                            return "Las contraseñas no coinciden";
                        }
                    },
                }}
                render={({ field }) => (
                    <InputLabel
                        id="confirmPassword"
                        label="Confirmar Contraseña:"
                        type="password"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={
                            errors.confirmPassword?.message || serverErrorFor("password_confirmation")
                        }
                    />
                )}
            />
            <div id="emailHelp" className="form-text mb-4 text-end">
                La contraseña debe tener mínimo 8 caracteres
            </div>

            {serverErrors.general && (
                <div className="alert alert-danger">{serverErrors.general.join(" ")}</div>
            )}

            <div className="d-flex justify-content-center gap-2">
                <Button value={loading ? "Creando..." : "Crear Cuenta"} />
                {onCancel && (
                    <button
                        type="button"
                        className="btn custom-upload-btn"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );

    // ===========================
    // VARIANTE MODAL
    // ===========================
    if (variant === "modal") {
        return (
            <div className="w-100">
                <h3 className="mb-3">Crea tu cuenta</h3>
                {formBody}
            </div>
        );
    }

    // ===========================
    // VARIANTE PÁGINA COMPLETA
    // ===========================
    return (
        <div className="container">
            <div className="form-section form-section-register">
                <div className="row text-center">
                    <div className="col-lg-12 col-md-12 col-sm-12 bg-custom-2">Registro</div>
                </div>
                <div className="row bg-custom-9">
                    <div className="col-lg-6 col-md-6 col-sm-12 d-flex flex-column align-items-center part1">
                        <img
                            src={cropData ? cropData : profileImage}
                            alt="Foto Perfil Recortada"
                            className="profile-img mt-3"
                        />

                        {showModal && (
                            <>
                                <div className="modal fade show" style={{ display: "block" }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Recortar Imagen</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => setShowModal(false)}
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <Cropper
                                                    src={profileImage}
                                                    style={{ height: 300, width: "100%" }}
                                                    initialAspectRatio={1}
                                                    aspectRatio={1}
                                                    guides={true}
                                                    cropBoxResizable={false}
                                                    viewMode={1}
                                                    ref={cropperRef}
                                                    minCropBoxHeight={10}
                                                    minCropBoxWidth={10}
                                                    background={false}
                                                    responsive={true}
                                                    checkOrientation={false}
                                                />
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    className="btn custom-upload-btn"
                                                    onClick={() => {
                                                        getCropData();
                                                        setShowModal(false);
                                                    }}
                                                >
                                                    Recortar Imagen
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-backdrop fade show"></div>
                            </>
                        )}

                        <label
                            htmlFor="profileImage"
                            className="btn custom-upload-btn custom-file-upload mt-3"
                            onClick={() => setShowModal(true)}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="bi bi-camera"></i>
                        </label>
                        <input
                            type="file"
                            id="profileImage"
                            className="form-control"
                            onChange={(e) => handleImageChange(e.target.files)}
                            accept="image/*"
                            hidden
                        />
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12">
                        {formBody}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpForm;
