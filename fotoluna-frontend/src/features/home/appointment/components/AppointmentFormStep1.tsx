/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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

// 🔹 Clave para el borrador del paso 1
const APPOINTMENT_DRAFT_KEY = "appointmentDraftStep1";

type Event = {
    id: number;
    eventType: string;
    category: string;
};

type FormValues = {
    eventIdFK: string;
    appointmentDate: string;
    appointmentTime: string;
    place: string;
    comment?: string;
    customerIdFK?: number | string;
};

interface AppointmentStep1Props {
    onNext?: (data: { appointmentId: number; event: Event; place: string }) => void;
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

const AppointmentStep1Validated: React.FC<AppointmentStep1Props> = ({
    onNext,
    initialEventId,
}) => {
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>("");

    const [events, setEvents] = useState<Event[]>([]);
    const [eventOptions, setEventOptions] = useState<{ value: string; label: string }[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [initialResolved, setInitialResolved] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
    const [allBlocked, setAllBlocked] = useState(false);
    const [unavailableDays, setUnavailableDays] = useState<string[]>([]);
    const [busyDays, setBusyDays] = useState<string[]>([]);

    const [isDocumentEvent, setIsDocumentEvent] = useState(false);

    // Modals
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<"choose" | "login" | "register">("choose");

    // Mensaje de feedback (login/register ok)
    const [authMessage, setAuthMessage] = useState<string | null>(null);

    type LocalStorageUser = {
        id: number;
        name: string;
    };

    const getCustomerId = (): number | null => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr) as LocalStorageUser;
            if (user.id && typeof user.id === "number") {
                return user.id;
            }
        } catch (e) {
            console.error("Error al parsear el objeto 'user' de localStorage:", e);
        }
        return null;
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        register,
        watch,
        reset,
    } = useForm<FormValues>({
        defaultValues: {
            eventIdFK: "",
            appointmentDate: "",
            appointmentTime: "",
            place: "",
            comment: "",
        },
    });

    const watchedEventId = watch("eventIdFK");

    // 🔁 Recalcular isDocumentEvent cuando haya eventos + eventIdFK
    useEffect(() => {
        if (!events.length || !watchedEventId) return;

        const selectedEvent = events.find(
            (ev: Event) => String(ev.id) === String(watchedEventId)
        );

        const isDoc =
            selectedEvent?.eventType?.toLowerCase() === "documento" ||
            selectedEvent?.eventType?.toLowerCase() === "document" ||
            selectedEvent?.category === "document_photo";

        setIsDocumentEvent(!!isDoc);

        if (isDoc) {
            // aseguramos que el lugar no se use para documentos
            setValue("place", "");
        }
    }, [events, watchedEventId, setValue]);

    // ================================
    // 1) Cargar borrador al montar
    // ================================
    useEffect(() => {
        const raw = localStorage.getItem(APPOINTMENT_DRAFT_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw) as {
                formValues?: Partial<FormValues>;
                selectedDate?: string | null;
                selectedTime?: string | null;
                visibleMonth?: string | null;
            };

            if (parsed.formValues) {
                reset(parsed.formValues as FormValues);
            }

            if (parsed.selectedDate) {
                const d = new Date(parsed.selectedDate);
                setSelectedDate(d);
                setValue("appointmentDate", format(d, "yyyy-MM-dd"));
                setVisibleMonth(d);
            }

            if (parsed.selectedTime) {
                setSelectedTime(parsed.selectedTime);
                setValue("appointmentTime", parsed.selectedTime);
            }

            if (parsed.visibleMonth) {
                setVisibleMonth(new Date(parsed.visibleMonth));
            }

            setInitialResolved(true);
        } catch (e) {
            console.warn("Error leyendo borrador de la cita:", e);
        }
    }, [reset, setValue]);

    // ================================
    // 2) Guardar borrador en localStorage
    // ================================
    useEffect(() => {
        const subscription = watch((values) => {
            const payload = {
                formValues: values,
                selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
                selectedTime: selectedTime || null,
                visibleMonth: visibleMonth ? format(visibleMonth, "yyyy-MM-dd") : null,
            };
            localStorage.setItem(APPOINTMENT_DRAFT_KEY, JSON.stringify(payload));
        });

        return () => subscription.unsubscribe();
    }, [watch, selectedDate, selectedTime, visibleMonth]);

    // ================================
    // 3) Cargar eventos
    // ================================
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE}/api/events`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });

                setEvents(res.data);

                const formatted = res.data.map((e: Event) => ({
                    value: String(e.id),
                    label: e.eventType,
                }));
                setEventOptions(formatted);

                // Si viene initialEventId (desde otra parte) y NO hay eventId en el borrador
                if (initialEventId && !watch("eventIdFK")) {
                    const value = String(initialEventId);
                    setValue("eventIdFK", value);
                    const selectedEvent = res.data.find((ev: Event) => String(ev.id) === value) as
                        | Event
                        | undefined;

                    if (selectedEvent) {
                        const isDoc =
                            selectedEvent?.eventType?.toLowerCase() === "documento" ||
                            selectedEvent?.eventType?.toLowerCase() === "document" ||
                            selectedEvent?.category === "document_photo";
                        setIsDocumentEvent(!!isDoc);
                        if (isDoc) setValue("place", "");
                    }
                }
            } catch (error) {
                console.error("Error al cargar eventos:", error);
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [initialEventId, setValue, watch]);

    // ================================
    // 4) Fecha inicial si no había borrador
    // ================================
    useEffect(() => {
        if (initialResolved && selectedDate) return;

        (async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const first = await findFirstAvailableDate(today);
            const decided = first ?? today;

            setSelectedDate(decided);
            setValue("appointmentDate", format(decided, "yyyy-MM-dd"));
            setVisibleMonth(decided);
            setInitialResolved(true);
        })();
    }, [initialResolved, selectedDate, setValue]);

    // ================================
    // 5) Disponibilidad diaria
    // ================================
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

    // ================================
    // 6) Días bloqueados / con citas del mes
    // ================================
    useEffect(() => {
        if (!visibleMonth) return;

        (async () => {
            try {
                const res = await axios.get<
                    Record<string, { allBlocked: boolean; hasAppointments: boolean }>
                >(`${API_BASE}/api/availability`, {
                    params: {
                        month: visibleMonth.getMonth() + 1,
                        year: visibleMonth.getFullYear(),
                    },
                });

                const blocked: string[] = [];
                const busy: string[] = [];

                Object.entries(res.data).forEach(([date, info]) => {
                    if (info.allBlocked) blocked.push(date);
                    if (info.hasAppointments) busy.push(date);
                });

                setUnavailableDays(blocked);
                setBusyDays(busy);
            } catch (error) {
                console.error("Error cargando días bloqueados:", error);
                setUnavailableDays([]);
                setBusyDays([]);
            }
        })();
    }, [visibleMonth]);

    // ================================
    // 7) Submit
    // ================================
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerErrors({});

        const token = localStorage.getItem("token");
        const customerId = getCustomerId();

        if (!token || !customerId) {
            setAuthMode("choose");
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        try {
            const formattedTime = convertTo24Hour(data.appointmentTime);

            // const payload = {
            //     ...data,
            //     appointmentTime: formattedTime,
            //     appointmentStatus: "Pending confirmation",
            //     customerIdFK: customerId,
            // };
            const payload = {
                ...data,
                appointmentTime: formattedTime,
                appointmentStatus: "draft", // 👈 NUEVO
                customerIdFK: customerId,
            };

            const res = await axios.post(
                `${API_BASE}/api/appointmentsCustomer`,
                payload,
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );

            const selectedEvent = events.find((e) => e.id === parseInt(data.eventIdFK));

            // ✅ Limpiar borrador al completar cita
            localStorage.removeItem(APPOINTMENT_DRAFT_KEY);

            if (onNext && selectedEvent) {
                onNext({
                    appointmentId: res.data.appointmentId,
                    event: selectedEvent,
                    place: data.place,
                });
            }
        } catch (err: any) {
            console.error("❌ Error completo:", err.response?.data || err);
            if (err.response) {
                if (err.response.status === 422) {
                    if (err.response.data.errors?.customerIdFK) {
                        setServerErrors({
                            general: [
                                "Error: Faltó el ID de cliente en la solicitud. Asegúrate de iniciar sesión.",
                                ...err.response.data.errors.customerIdFK,
                            ],
                        });
                    } else {
                        setServerErrors(err.response.data.errors || {});
                    }
                } else {
                    setServerErrors({ general: [err.response.data.message || "Error del servidor"] });
                }
            } else {
                setServerErrors({ general: ["No se pudo conectar con el servidor."] });
            }
        } finally {
            setLoading(false);
        }
    };

    const serverErrorFor = (field: string) =>
        serverErrors[field] ? serverErrors[field].join(" ") : undefined;

    // ================================
    // 8) Auth success (login / register)
    // ================================
    const handleAuthSuccess = (type?: "login" | "register") => {
        setShowAuthModal(false);
        setAuthMode("choose");

        if (type === "login") {
            setAuthMessage("¡Sesión iniciada correctamente!");
        } else if (type === "register") {
            setAuthMessage("¡Cuenta creada y sesión iniciada!");
        }

        setTimeout(() => setAuthMessage(null), 5000);
    };

    // ================================
    // RENDER
    // ================================
    return (
        <div className="container py-4 appointment-step1">
            <h3 className="mb-4 fw-semibold">Selecciona fecha y hora</h3>

            {authMessage && (
                <div className="alert alert-success text-center fw-semibold" role="alert">
                    {authMessage}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-4">
                    {/* Calendario y horarios */}
                    <div className="col-12 col-lg-7">
                        {errors.appointmentTime && (
                            <p className="text-danger text-center mt-2">
                                {errors.appointmentTime.message}
                            </p>
                        )}

                        <div className="row">
                            <div className="calendar-legend mt-2">
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="calendar-legend-dot calendar-legend-dot--unavailable" />
                                        <span className="small text-muted">
                                            Día ocupado (sin horarios disponibles)
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="calendar-legend-dot calendar-legend-dot--busy" />
                                        <span className="small text-muted">
                                            Día con citas (aún hay horarios libres)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-3 p-3 d-flex a flex-column flex-lg-row gap-4">
                            <div className="calendar-container flex-grow-1">
                                {!initialResolved || !selectedDate ? (
                                    <div className="p-4 text-muted">Cargando calendario…</div>
                                ) : (
                                    <Calendar
                                        date={selectedDate}
                                        onChange={(date: Date) => {
                                            const dateStr = format(date, "yyyy-MM-dd");
                                            const isUnavailable = unavailableDays.includes(dateStr);
                                            if (isUnavailable) return;

                                            setSelectedDate(date);
                                            setValue("appointmentDate", dateStr);
                                            setVisibleMonth(date);
                                        }}
                                        locale={es}
                                        color="#DCABDF"
                                        minDate={new Date()}
                                        shownDate={visibleMonth}
                                        onShownDateChange={(date: Date) => {
                                            setVisibleMonth(date);
                                        }}
                                        dayContentRenderer={(date) => {
                                            const dateStr = format(date, "yyyy-MM-dd");
                                            const isUnavailable = unavailableDays.includes(dateStr);
                                            const isBusy = busyDays.includes(dateStr);

                                            let tooltip = "";
                                            if (isUnavailable) {
                                                tooltip = "Día ocupado (sin horarios disponibles)";
                                            } else if (isBusy) {
                                                tooltip = "Día con citas (aún quedan horarios)";
                                            }

                                            return (
                                                <div
                                                    className={
                                                        "calendar-dot" +
                                                        (isUnavailable ? " calendar-dot--unavailable" : "")
                                                    }
                                                    style={{
                                                        color: isUnavailable ? "white" : isBusy ? "#6b21a8" : "black",
                                                        backgroundColor: isUnavailable ? "#C792DF" : "transparent",
                                                        borderRadius: "50%",
                                                        width: 28,
                                                        height: 28,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: isUnavailable ? "not-allowed" : "pointer",
                                                        border: isBusy && !isUnavailable ? "1px solid #C792DF" : "none",
                                                    }}
                                                    title={tooltip}
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
                                {/* Campo oculto para validar la hora */}
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
                                    availableTimes.map((slot: string) => (
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

                    {/* Columna derecha: detalles del servicio */}
                    <div className="col-12 col-lg-5">
                        <div className="bg-white shadow-sm rounded-3 p-4">
                            <h5 className="fw-semibold mb-3 border-bottom pb-2">
                                Detalles del servicio
                            </h5>

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

                                            const selectedEvent = events.find(
                                                (ev: Event) => String(ev.id) === value
                                            );

                                            const isDoc =
                                                selectedEvent?.eventType?.toLowerCase() === "documento" ||
                                                selectedEvent?.eventType?.toLowerCase() === "document" ||
                                                selectedEvent?.category === "document_photo";

                                            setIsDocumentEvent(!!isDoc);

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
                                        return value?.trim() ? true : "El lugar es obligatorio";
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

            {/* Modal de auth */}
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
                                        onSuccess={() => handleAuthSuccess("login")}
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
                                        variant="modal"
                                        onSuccess={() => handleAuthSuccess("register")}
                                        onCancel={() => setShowAuthModal(false)}
                                    />
                                    <button
                                        className="btn custom-upload-btn w-100 mt-2"
                                        onClick={() => setAuthMode("choose")}
                                    >
                                        Volver
                                    </button>
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
