/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react"; // 👈 SINTAXIS CORREGIDA: Se eliminó el '=> "react"'
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "react-date-range";
import axios from "axios";
import Button from "../../../../components/Home/Button";
import SelectLabel from "../../../../components/Home/Select";
import InputLabel from "../../../../components/Home/InputLabel";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/appointmentCalendar.css";
import "../styles/appointment.css";
import Login from "../../auth/components/LoginForm";
import Register from "../../auth/components/SignUpForm";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type Event = {
    id: number;
    eventType: string;
    category: string;
    // ... otros campos del evento
};

type FormValues = {
    eventIdFK: string;
    appointmentDate: string;
    appointmentTime: string;
    place: string;
    comment?: string;
    customerIdFK?: number | string; // Añadido para mejor tipado, aunque lo inyectamos después
};

interface AppointmentStep1Props {
    onNext?: (data: { appointmentId: number; event: Event; place: string }) => void; // Tipado Event
    initialEventId?: number | null;
}

// Conversión de formato de hora
function convertTo24Hour(timeStr: string): string {
    if (!timeStr) return "";
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
        return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    }

    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier?.toLowerCase().includes("p") && hours < 12) hours += 12;
    if (modifier?.toLowerCase().includes("a") && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

// Encuentra el primer día disponible a partir de hoy
async function findFirstAvailableDate(start: Date, maxDays = 60): Promise<Date | null> {
    for (let i = 0; i < maxDays; i++) {
        const d = addDays(start, i);
        const dateStr = format(d, "yyyy-MM-dd");
        try {
            const res = await axios.get(`${API_BASE}/api/availability`, { params: { date: dateStr } });
            if (!res.data?.allBlocked) return d;
        } catch {
            // Ignorar errores, continuar
        }
    }
    return null;
}

// Tipado corregido para las props
const AppointmentStep1Validated: React.FC<AppointmentStep1Props> = ({
    onNext,
    initialEventId
}) => { // 👈 TIPADO CORREGIDO: Las props ya están tipadas en AppointmentStep1Props
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [events, setEvents] = useState<Event[]>([]); // Tipado Event[]
    const [eventOptions, setEventOptions] = useState<{ value: string; label: string }[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [initialResolved, setInitialResolved] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
    const [allBlocked, setAllBlocked] = useState(false);
    const [unavailableDays, setUnavailableDays] = useState<string[]>([]);

    // Modals
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<"choose" | "login" | "register">("choose");


    type LocalStorageUser = {
        id: number;
        // Puedes añadir otros campos que necesites, pero 'id' es el crucial
        name: string;
    };
    // Obtener Customer ID del localStorage o contexto
    const getCustomerId = (): number | null => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                // Asume que la clave 'user' contiene el objeto JSON del usuario
                const user = JSON.parse(userStr) as LocalStorageUser;

                // Verificamos si el ID existe y es un número
                if (user.id && typeof user.id === 'number') {
                    return user.id;
                }
            } catch (e) {
                console.error("Error al parsear el objeto 'user' de localStorage:", e);
                // Si el JSON es inválido, devuelve null
                return null;
            }
        }
        // Si la clave 'user' no existe o es null
        return null;
    };


    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        register,
    } = useForm<FormValues>({
        defaultValues: { eventIdFK: "", appointmentDate: "", appointmentTime: "", place: "", comment: "" },
    });

    // Cargar eventos desde el backend
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE}/api/events`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });

                setEvents(res.data);

                const formatted = res.data.map((e: Event) => ({ // 👈 TIPADO CORREGIDO: e es de tipo Event
                    value: String(e.id),
                    label: e.eventType,
                }));
                setEventOptions(formatted);

                // si viene initialEventId desde Maternity, lo seleccionamos
                if (initialEventId) {
                    const value = String(initialEventId);
                    setValue("eventIdFK", value);

                    const selectedEvent = res.data.find((ev: Event) => String(ev.id) === value); // Tipado Event
                    if (selectedEvent) {
                        const isDoc =
                            selectedEvent?.eventType?.toLowerCase() === "documento" ||
                            selectedEvent?.category === "document_photo";
                        setIsDocumentEvent(!!isDoc);
                    }
                }
            } catch (error) {
                console.error("Error al cargar eventos:", error);
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [initialEventId, setValue]);

    // Cargar fecha inicial (primer día disponible)
    useEffect(() => {
        (async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const first = await findFirstAvailableDate(today);
            const decided = first ?? today;
            setSelectedDate(decided);
            setValue("appointmentDate", format(decided, "yyyy-MM-dd"));

            // el mes visible debe ser el mismo de la primera fecha
            setVisibleMonth(decided);

            setInitialResolved(true);
        })();
    }, [setValue]);

    // Cargar disponibilidad diaria
    useEffect(() => {
        if (!selectedDate || !initialResolved) return;
        (async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/availability`, {
                    params: { date: format(selectedDate, "yyyy-MM-dd") },
                });
                setAvailableTimes(res.data.available ?? []);
                setBlockedTimes(res.data.blocked ?? []);
                setAllBlocked(!!res.data.allBlocked);
            } catch (e) {
                console.error("Error cargando disponibilidad:", e);
                setAvailableTimes([]);
                setBlockedTimes([]);
                setAllBlocked(true);
            }
        })();
    }, [selectedDate, initialResolved]);

    // Cargar días bloqueados del mes según el mes visible en el calendario
    useEffect(() => {
        if (!visibleMonth) return;

        (async () => {
            try {
                const res = await axios.get<Record<string, { allBlocked: boolean }>>(
                    `${API_BASE}/api/availability`,
                    {
                        params: {
                            month: visibleMonth.getMonth() + 1,
                            year: visibleMonth.getFullYear(),
                        },
                    }
                );

                const blocked = Object.entries(res.data)
                    .filter(([_, info]) => info.allBlocked)
                    .map(([date]) => date);

                setUnavailableDays(blocked);
            } catch (error) {
                console.error("Error cargando días bloqueados:", error);
                setUnavailableDays([]);
            }
        })();
    }, [visibleMonth]);

    // Envío del formulario
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerErrors({});

        const token = localStorage.getItem("token");
        const customerId = getCustomerId(); // 👈 ¡La función se llama aquí!

        if (!token || !customerId) { // 👈 Se verifica si falta el token O el ID del cliente
            setAuthMode("choose");
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        try {
            const formattedTime = convertTo24Hour(data.appointmentTime);

            const payload = {
                ...data,
                appointmentTime: formattedTime,
                appointmentStatus: "Pending confirmation",
                customerIdFK: customerId, // 👈 Se inyecta el ID del cliente en el payload
            };

            const res = await axios.post(
                `${API_BASE}/api/appointmentsCustomer`,
                payload, // Enviamos el payload completo
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );

            const selectedEvent = events.find((e) => e.id === parseInt(data.eventIdFK));

            if (onNext && selectedEvent) {
                onNext({
                    appointmentId: res.data.appointmentId,
                    event: selectedEvent,
                    place: data.place,
                });
            }
        } catch (err: any) {
            console.error("❌ Error completo:", err);
            if (err.response) {
                if (err.response.status === 422) {
                    // Manejo del error customerIdFK
                    if (err.response.data.errors?.customerIdFK) {
                        setServerErrors({ general: ["Error: Faltó el ID de cliente en la solicitud. Asegúrate de iniciar sesión."].concat(err.response.data.errors.customerIdFK) });
                    } else {
                        setServerErrors(err.response.data.errors || {});
                    }
                }
                else
                    setServerErrors({ general: [err.response.data.message || "Error del servidor"] });
            } else {
                setServerErrors({ general: ["No se pudo conectar con el servidor."] });
            }
        } finally {
            setLoading(false);
        }
    };

    const serverErrorFor = (field: string) =>
        serverErrors[field] ? serverErrors[field].join(" ") : undefined;

    const [isDocumentEvent, setIsDocumentEvent] = useState(false);

    // 👉 callback cuando login/registro se completa correctamente
    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        setAuthMode("choose");
        // Opcional: volver a intentar crear la cita automáticamente
        // handleSubmit(onSubmit)();
    };

    return (
        <div className="container py-4 appointment-step1">
            <h3 className="mb-4 fw-semibold">Selecciona fecha y hora</h3>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-4">
                    {/* Calendario y horarios */}
                    <div className="col-12 col-lg-7">
                        {errors.appointmentTime && (
                            <p className="text-danger text-center mt-2">
                                {errors.appointmentTime.message}
                            </p>
                        )}
                        <div className="bg-white shadow-sm rounded-3 p-3 d-flex a flex-column flex-lg-row gap-4">
                            <div className="calendar-container flex-grow-1">
                                {!initialResolved ? (
                                    <div className="p-4 text-muted">Cargando calendario…</div>
                                ) : (
                                    <Calendar
                                        date={selectedDate!}
                                        onChange={(date: Date) => {
                                            const dateStr = format(date, "yyyy-MM-dd");

                                            const isUnavailable = unavailableDays.includes(dateStr);
                                            if (isUnavailable) return; // no permitas seleccionar días bloqueados

                                            setSelectedDate(date);
                                            setValue("appointmentDate", dateStr);

                                            // 👇 opcional pero útil: sincronizar mes visible cuando el usuario hace click
                                            setVisibleMonth(date);
                                        }}
                                        locale={es}
                                        color="#DCABDF"
                                        minDate={new Date()}
                                        shownDate={visibleMonth}                     // 👈 NUEVO
                                        onShownDateChange={(date: Date) => {        // 👈 NUEVO
                                            setVisibleMonth(date);
                                        }}
                                        dayContentRenderer={(date) => {
                                            const dateStr = format(date, "yyyy-MM-dd");
                                            const isUnavailable = unavailableDays.includes(dateStr);

                                            return (
                                                <div
                                                    style={{
                                                        color: isUnavailable ? "white" : "black",
                                                        backgroundColor: isUnavailable ? "#C792DF" : "transparent",
                                                        borderRadius: "50%",
                                                        width: 28,
                                                        height: 28,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: isUnavailable ? "not-allowed" : "pointer",
                                                    }}
                                                    title={isUnavailable ? "Día sin disponibilidad" : ""}
                                                >
                                                    {format(date, "d")}
                                                </div>
                                            );
                                        }}
                                    />

                                )}
                            </div>

                            {/* Time */}
                            <div className="time-grid-container mt-3">
                                {/* Campo oculto para que react-hook-form pueda validar la hora */}
                                <input
                                    type="hidden"
                                    {...register("appointmentTime", {
                                        required: "Seleccione una hora",
                                    })}
                                />

                                {allBlocked ? (
                                    <p className="text-danger fw-semibold text-center">
                                        No hay horarios disponibles para este día.
                                    </p>
                                ) : (
                                    availableTimes.map((slot: string) => ( // 👈 TIPADO CORREGIDO: slot es de tipo string
                                        <button
                                            key={slot}
                                            type="button"
                                            className={`btn time-btn ${selectedTime === slot
                                                ? "btn-primary"
                                                : blockedTimes.includes(slot)
                                                    ? "btn-secondary disabled"
                                                    : ""
                                                }`}
                                            onClick={() => {
                                                if (!blockedTimes.includes(slot)) {
                                                    setSelectedTime(slot);
                                                    setValue("appointmentTime", slot, { shouldValidate: true });
                                                }
                                            }}
                                        >
                                            {format(new Date(`1970-01-01T${slot}`), "h:mm a")}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="col-12 col-lg-5">
                        <div className="bg-white shadow-sm rounded-3 p-4">
                            <h5 className="fw-semibold mb-3 border-bottom pb-2">Detalles del servicio</h5>

                            <Controller
                                name="eventIdFK"
                                control={control}
                                rules={{ required: "Seleccione un tipo de evento" }}
                                render={({ field }) => (
                                    <SelectLabel
                                        id="eventIdFK"
                                        label="Tipo de evento"
                                        option={loadingEvents ? "Cargando eventos..." : "Selecciona un evento"}
                                        options={eventOptions}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value);

                                            //buscar el evento completo
                                            const selectedEvent = events.find((ev: Event) => String(ev.id) === value); // 👈 TIPADO CORREGIDO: ev es de tipo Event

                                            // ajusta la condición según cómo venga el nombre desde el backend
                                            const isDoc =
                                                selectedEvent?.eventType?.toLowerCase() === "documento" ||
                                                selectedEvent?.eventType?.toLowerCase() === "document";

                                            setIsDocumentEvent(!!isDoc);

                                            // si es documento, limpiamos el campo place
                                            if (isDoc) {
                                                setValue("place", "");
                                            }
                                        }}
                                        error={errors.eventIdFK?.message || serverErrorFor("eventIdFK")}
                                    />
                                )}
                            />

                            <Controller
                                name="place"
                                control={control}
                                rules={{
                                    validate: (value) => {
                                        if (isDocumentEvent) return true;
                                        return value?.trim()
                                            ? true
                                            : "El lugar es obligatorio";
                                    },
                                }}
                                render={({ field }) => (
                                    <InputLabel
                                        id="place"
                                        label="Lugar de la cita"
                                        type="text"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        disabled={isDocumentEvent}
                                        error={errors.place?.message || serverErrorFor("place")}
                                    />
                                )}
                            />

                            <Controller
                                name="comment"
                                control={control}
                                render={({ field }) => (
                                    <InputLabel
                                        id="comment"
                                        label="Comentario (opcional)"
                                        type="text"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        error={serverErrorFor("comment")}
                                    />
                                )}
                            />

                            {serverErrors.general && (
                                <div className="alert alert-danger mt-3">
                                    {serverErrors.general.join(" ")}
                                </div>
                            )}

                            <div className="mt-4 text-center">
                                <Button value={loading ? "Guardando..." : "Siguiente"} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {showAuthModal && (
                <div
                    className="auth-modal-backdrop"
                    onClick={() => setShowAuthModal(false)}
                >
                    <div
                        className="auth-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="auth-modal-close"
                            onClick={() => setShowAuthModal(false)}
                        >
                            ✕
                        </button>

                        <div className="auth-modal-inner">
                            {authMode === "choose" && (
                                <div className="auth-modal-content">
                                    <h3 className="auth-modal-title">¿Tienes una cuenta?</h3>
                                    <p className="auth-modal-text">
                                        Debes iniciar sesión o registrarte para reservar una cita.
                                    </p>

                                    <div className="auth-modal-buttons">
                                        <Button
                                            className="btn btn-perfil auth-modal-btn"
                                            value="Inicia Sesión"
                                            onClick={() => setAuthMode("login")}
                                        />

                                        <span className="auth-modal-divider">o</span>

                                        <Button
                                            className="btn btn-perfil auth-modal-btn"
                                            value="Crea Cuenta"
                                            onClick={() => setAuthMode("register")}
                                        />
                                    </div>

                                    <button
                                        className="btn custom-upload-btn w-100 mt-3"
                                        onClick={() => setShowAuthModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            {authMode === "login" && (
                                <div className="auth-modal-content auth-modal-form-content">
                                    <Login
                                        variant="modal"
                                        onSuccess={handleAuthSuccess}
                                        onCancel={() => setShowAuthModal(false)}
                                    />
                                    <button
                                        className="btn custom-upload-btn w-100 mt-2"
                                        onClick={() => setAuthMode("choose")}
                                    >
                                        Volver
                                    </button>

                                    <p className="auth-modal-switch text-center mt-3">
                                        ¿No tienes cuenta?{" "}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            onClick={() => setAuthMode("register")}
                                        >
                                            Regístrate
                                        </button>
                                    </p>


                                </div>
                            )}

                            {authMode === "register" && (
                                <div className="auth-modal-content auth-modal-form-content">
                                    <Register
                                        onSuccess={handleAuthSuccess}
                                        onCancel={() => setShowAuthModal(false)}
                                    />

                                    <p className="auth-modal-switch text-center mt-3">
                                        ¿Ya tienes cuenta?{" "}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            onClick={() => setAuthMode("login")}
                                        >
                                            Inicia sesión
                                        </button>
                                    </p>

                                    <button
                                        className="btn custom-upload-btn w-100 mt-2"
                                        onClick={() => setAuthMode("choose")}
                                    >
                                        Volver
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentStep1Validated;  