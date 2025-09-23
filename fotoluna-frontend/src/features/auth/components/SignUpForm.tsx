import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from 'react-hook-form';
import InputLabel from "./InputLabel";
import Button from "./Button";

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
        console.log("Datos del formulario:", data);
    };

    return (
        <div className="form-section" >
            <div className="row text-center">
                <div className="col-lg-12 col-md-12 col-sm-12 bg-custom-2">
                    Registro
                </div>
            </div>
            <div className="row bg-custom-9">
                <div className="col-lg-6 col-md-6 col-sm-12 d-flex flex-column align-items-center">
                    <img src="/img/imagenperfil.jpg" alt="Foto Perfil" id="profilePreview" className="profile-img mb-3" />
                    {/* Foto */}
                    <Controller
                        name="photoCustomer"
                        control={control}
                        rules={{ required: "La foto es obligatoria" }}
                        render={({ field }) => (
                            <div className="mb-3">
                                <label htmlFor="profileImage" className="btn custom-upload-btn custom-file-upload mb-3">
                                    Subir Imagen
                                </label>
                                <input
                                    type="file"
                                    id="profileImage"
                                    className="form-control"
                                    onChange={(e) => field.onChange(e.target.files)}
                                    onBlur={field.onBlur}
                                    accept="image/*" hidden
                                />
                            </div>
                        )}
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
                </div >
            </div >
        </div >
    );
};

export default SignUpForm;