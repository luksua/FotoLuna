import "../styles/contact.css";
import Button from "../../../../components/Home/Button";
import InputLabel from "../../../../components/Home/InputLabel";
import Select from "../../../../components/Home/Select";
import Textarea from "../../../../components/Home/Textarea";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    select: string;
    message: string;
};

const Contact = () => {

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            select: "",
            message: "",
        },
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Datos del formulario:", data);
    };

    return (
        <div className="bg-custom-2">
            {/* MAPA con overlay dentro */}
            <div className="map-wrapper">
                <iframe
                    title="Ubicación - FotoLuna"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248.61459725476792!2d-75.21587023397399!3d4.4420617413971915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38c4f02ac49f57%3A0x4d7fc43a0abcf963!2sCra%209A%20%23%2037-20%2C%20Ibagu%C3%A9%2C%20Tolima!5e0!3m2!1ses-419!2sco!4v1759246557627!5m2!1ses-419!2sco"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
                {/* Overlay */}
                <div className="overlay"></div>
            </div>

            {/* Contenedor con formulario + info */}
            <div className="contact-overlay">
                <div className="contact-form">
                    <h2 className="bg-custom-2">¡Habla con Nosotros!</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <Controller
                                name="firstName"
                                control={control}
                                rules={{ required: "El Nombre es obligatorio" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="firstName"
                                        label="Nombre:"
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.firstName?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{ required: "El Apellido es obligatorio" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="lastName"
                                        label="Apellido"
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.lastName?.message}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: "El Email es obligatorio" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="email"
                                        label="Correo"
                                        type="email"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={errors.email?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="select"
                                control={control}
                                rules={{ required: "Debe seleccionar una opción" }}
                                render={({ field }) => (
                                    <Select
                                        id="select"
                                        option="Seleccione una opcion"
                                        value={field.value}
                                        label="¿Qué estás buscando?"
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.select?.message}
                                        options={[
                                            { value: "1", label: "Resolver dudas" },
                                            { value: "2", label: "Reservar" },
                                            { value: "3", label: "Asistencia" },
                                        ]}
                                    />
                                )}
                            />
                        </div>
                        <Controller
                            name="message"
                            control={control}
                            rules={{ required: "El mensaje no puede estar vacío" }}
                            render={({ field }) => (
                                <Textarea
                                    id="message"
                                    label="Mensaje"
                                    value={field.value}
                                    rows={5}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    textareaRef={field.ref}
                                    error={errors.message?.message}
                                />
                            )}
                        />
                        <div>
                            <Button
                                value="Enviar"
                            />
                        </div>
                    </form>
                </div>

                <div className="contact-info bg-custom-2" >
                    <h3>Info de Contacto</h3>
                    <p>Cra 9A #37-20, Ibagué, Tolima</p>
                    <p>+57 320 6706877</p>
                    <p>info@fotoluna.com</p>
                    <div className="social-icons">
                        <i className="fab fa-facebook-f"></i>
                        <i className="fab fa-linkedin-in"></i>
                        <i className="fab fa-twitter"></i>
                        <i className="fab fa-instagram"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;