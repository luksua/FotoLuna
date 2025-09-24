import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import InputLabel from "./InputLabel";
import Button from "./Button";
// import "../styles/signUp.css";

type FormValues = {
    emailCustomer: string;
    password: string;
};

const ForgotPasswordForm: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            emailCustomer: "",
            password: ""
        },
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Datos del formulario:", data);
    };

    return (
        <div className="form-section">
            <div className="row bg-custom-9">
                <div className="col-lg-6 col-md-6 d-none d-md-block">
                    <img src="/img/fotoi.jpg" alt="Imagen de perfil" className="img-fluid rounded" />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 py-5 ps-lg-5">
                    <h2 className="mb-4 text-center bg-custom-2">Inicio de Sesión</h2>
                    {/* Formulario */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
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
                                required: "Debe de escribir la contraseña",
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

                        <a className="form-text mb-4 text-end" href="">Olvidé mi contraseña</a>

                        <div className="d-flex justify-content-center">
                            <Button
                                value="Iniciar Sesión"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
};

export default ForgotPasswordForm;
