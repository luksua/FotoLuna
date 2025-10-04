import Button from "../../../components/Home/Button";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import SelectLabel from "../../../components/Home/Select";
import InputLabel from "../../../components/Home/InputLabel";

type FormValues = {
    event: string;
    time: string;
    date: string;
    place: string;
    comment: string;
}

const AppointmentForm = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            event: "",
            time: "",
            date: "",
            place: "",
            comment: "",
        },
    });

    const eventOptions = [
        { value: "boda", label: "Boda" },
        { value: "cumple", label: "Cumpleaños" },
        { value: "graduacion", label: "Graduación" },
    ];

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Datos del formulario:", data);
    };

    return (
        <div className="container-fluid py-4">
            <div className="form-section">
                <div className="row bg-custom-9">
                    <h2 className="mb-4 text-center bg-custom-2">Agendar Cita</h2>

                    {/* Columna Formulario */}
                    <div className="col-lg-7 col-md-6 col-sm-12 py-4 px-3 px-lg-5">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Event */}
                            <Controller
                                name="event"
                                control={control}
                                rules={{ required: "El evento es obligatorio" }}
                                render={({ field }) => (
                                    <SelectLabel
                                        id="event"
                                        label="Evento:"
                                        value={field.value}
                                        options={eventOptions}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.event?.message}
                                    />
                                )}
                            />

                            {/* Time */}
                            <Controller
                                name="time"
                                control={control}
                                rules={{ required: "La hora es obligatoria" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="time"
                                        label="Hora:"
                                        type="time"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.time?.message}
                                    />
                                )}
                            />

                            {/* Date */}
                            <Controller
                                name="date"
                                control={control}
                                rules={{ required: "La fecha es obligatoria" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="date"
                                        label="Fecha:"
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.date?.message}
                                    />
                                )}
                            />

                            {/* Place */}
                            <Controller
                                name="place"
                                control={control}
                                rules={{ required: "El lugar es obligatorio" }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="place"
                                        label="Lugar:"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.place?.message}
                                    />
                                )}
                            />

                            {/* Comment */}
                            <Controller
                                name="comment"
                                control={control}
                                render={({ field }) => (
                                    <InputLabel
                                        id="comment"
                                        label="Comentario:"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.comment?.message}
                                    />
                                )}
                            />

                            {/* Botones */}
                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
                                <Button value="Aceptar" />
                                <Button
                                    value="Cancelar"
                                    className="btn custom2-upload-btn"
                                    to="/citas"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Columna Imagen */}
                    <div className="col-lg-5 col-md-6 col-12 d-flex justify-content-center mt-4 mt-md-0">
                        <img
                            src="/img/citas.jpg"
                            alt="Cita"
                            className="img-fluid rounded"
                            style={{ maxWidth: "100%", height: "auto", objectFit: "cover" }}
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AppointmentForm;