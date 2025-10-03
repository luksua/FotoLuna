import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Cropper } from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "../../../styles/cropper.css";
import InputLabel from "../../../components/Home/InputLabel";
import Button from "../../../components/Home/Button";
import "../styles/signUp.css";

type FormValues = {
    firstNameCustomer: string;
    lastNameCustomer: string;
    phoneCustomer: string;
    documentType: string;
    documentNumber: string;
    emailCustomer: string;
    password: string;
    confirmPassword: string;
    photoCustomer: FileList;
};

const SignUpForm: React.FC = () => {
    const [profileImage, setProfileImage] = useState("/img/imagenperfil.jpg");
    const [cropData, setCropData] = useState("");
    const cropperRef = useRef<ReactCropperElement>(null);
    const [showModal, setShowModal] = useState(false);

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
            documentType: "",
            documentNumber: "",
            emailCustomer: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        const formData = {
            ...data,
            photoCustomer: cropData
        };
        console.log("Datos del formulario:", formData);
    };

    const handleImageChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl); // Mostrar la imagen en el cropper
        }
    };

    const getCropData = () => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
        }
    };



    // return
    return (
        <div className="container">
            <div className=" form-section ">
                <div className="row text-center">
                    <div className="col-lg-12 col-md-12 col-sm-12 bg-custom-2">Registro</div>
                </div>
                <div className="row bg-custom-9">
                    <div className="col-lg-6 col-md-6 col-sm-12 d-flex flex-column align-items-center">

                        {/* View imagen */}
                        <img
                            src={cropData ? cropData : profileImage}
                            alt="Foto Perfil Recortada"
                            className="profile-img mt-3"
                        />

                        {/* <!-- Vertically centered modal --> */}
                        {showModal && (
                            <>
                                <div className="modal fade show" style={{ display: "block" }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Recortar Imagen</h5>
                                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                            </div>
                                            <div className="modal-body">
                                                {/* Cropper para recortar la imagen */}
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
                                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                                    Cancelar
                                                </button>
                                                <button className="btn custom-upload-btn" onClick={() => { getCropData(); setShowModal(false); }}>
                                                    Recortar Imagen
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-backdrop fade show"></div>
                            </>
                        )}

                        {/* Button Open Modal */}
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

                        {/* Form */}
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
                                        error={errors.firstNameCustomer?.message}
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
                                        error={errors.lastNameCustomer?.message}
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
                                        value: /^[0-9]+$/, // solo números
                                        message: "Solo se permiten números"
                                    }
                                }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="phone"
                                        label="Teléfono:"
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.phoneCustomer?.message}
                                    />
                                )}
                            />

                            {/* Id number */}
                            <Controller
                                name="documentNumber"
                                control={control}
                                rules={{ required: "El número es obligatorio" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="documentNumber"
                                        label="Número de Documento:"
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.documentNumber?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="emailCustomer"
                                control={control}
                                rules={{ required: "El email es obligatorio" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="emailCustomer"
                                        label="Correo:"
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.emailCustomer?.message}
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
                                        error={errors.password?.message}
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
                                        // watch is used to validate the password like an onChange
                                        if (watch('password') != value) {
                                            return "Las contraseñas no coinciden";
                                        }
                                    }
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
                                        error={errors.confirmPassword?.message}
                                    />
                                )}
                            />
                            <div id="emailHelp" className="form-text mb-4 text-end">La contraseña debe tener mínimo 8 caracteres</div>

                            <div className="d-flex justify-content-center">
                                <Button
                                    value="Crear Cuenta"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpForm;