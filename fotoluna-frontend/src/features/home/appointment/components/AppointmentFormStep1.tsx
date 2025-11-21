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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type FormValues = {
    eventIdFK: string;
    appointmentDate: string;
    appointmentTime: string;
    place: string;
    comment?: string;
};

interface AppointmentStep1Props {
    onNext?: (data: { appointmentId: number; event: any; place: string }) => void;
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

const AppointmentStep1Validated: React.FC<AppointmentStep1Props> = ({ onNext, initialEventId }) => {
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [events, setEvents] = useState<any[]>([]);
    const [eventOptions, setEventOptions] = useState<{ value: string; label: string }[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [initialResolved, setInitialResolved] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
    const [allBlocked, setAllBlocked] = useState(false);
    const [unavailableDays, setUnavailableDays] = useState<string[]>([]);

    const [showAuthModal, setShowAuthModal] = useState(false);

    const { control, handleSubmit, formState: { errors }, setValue, register } = useForm<FormValues>({
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

                const formatted = res.data.map((e: any) => ({
                    value: String(e.id),
                    label: e.eventType,
                }));
                setEventOptions(formatted);

                // 👇 si viene initialEventId desde Maternity, lo seleccionamos
                if (initialEventId) {
                    const value = String(initialEventId);
                    setValue("eventIdFK", value);

                    const selectedEvent = res.data.find((ev: any) => String(ev.id) === value);
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

    // useEffect(() => {
    //     const fetchEvents = async () => {
    //         try {
    //             const token = localStorage.getItem("token");
    //             const res = await axios.get(`${API_BASE}/api/events`, {
    //                 headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    //             });

    //             // ✅ guardamos los eventos completos
    //             setEvents(res.data);

    //             // Formateamos para el select
    //             const formatted = res.data.map((e: any) => ({
    //                 value: String(e.id),
    //                 label: e.eventType,
    //             }));

    //             setEventOptions(formatted);
    //         } catch (error) {
    //             console.error("Error al cargar eventos:", error);
    //         } finally {
    //             setLoadingEvents(false);
    //         }
    //     };

    //     fetchEvents();
    // }, []);

    // Cargar fecha inicial (primer día disponible)
    useEffect(() => {
        (async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const first = await findFirstAvailableDate(today);
            const decided = first ?? today;
            setSelectedDate(decided);
            setValue("appointmentDate", format(decided, "yyyy-MM-dd"));
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

    // 🔹 Cargar días bloqueados del mes
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get<Record<string, { allBlocked: boolean }>>(`${API_BASE}/api/availability`, {
                    params: {
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                    },
                });
                const blocked = Object.entries(res.data)
                    .filter(([_, info]) => info.allBlocked)
                    .map(([date]) => date);
                setUnavailableDays(blocked);
            } catch (error) {
                console.error("Error cargando días bloqueados:", error);
            }
        })();
    }, []);

    // 🔹 Envío del formulario
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerErrors({});

        const token = localStorage.getItem("token");

        // 👇 Si NO hay token → mostrar modal
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        try {
            const formattedTime = convertTo24Hour(data.appointmentTime);
            const res = await axios.post(
                `${API_BASE}/api/appointments`,
                {
                    ...data,
                    appointmentTime: formattedTime,
                    appointmentStatus: "Pending confirmation",
                },
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
                if (err.response.status === 422)
                    setServerErrors(err.response.data.errors || {});
                else
                    setServerErrors({ general: [err.response.data.message || "Error del servidor"] });
            } else {
                setServerErrors({ general: ["No se pudo conectar con el servidor."] });
            }
        } finally {
            setLoading(false);
        }
    };

    // const onSubmit: SubmitHandler<FormValues> = async (data) => {
    //     setServerErrors({});
    //     setLoading(true);
    //     try {
    //         const token = localStorage.getItem("token");
    //         const formattedTime = convertTo24Hour(data.appointmentTime);
    //         const res = await axios.post(
    //             `${API_BASE}/api/appointments`,
    //             {
    //                 ...data,
    //                 appointmentTime: formattedTime,
    //                 appointmentStatus: "Pending confirmation",
    //             },
    //             { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    //         );

    //         // Encontramos el evento completo
    //         const selectedEvent = events.find((e) => e.id === parseInt(data.eventIdFK));

    //         if (onNext && selectedEvent) {
    //             onNext({
    //                 appointmentId: res.data.appointmentId,
    //                 event: selectedEvent,
    //                 place: data.place,  // 👈 aquí mandas el lugar al padre
    //             });
    //         }
    //     } catch (err: any) {
    //         console.error("❌ Error completo:", err);
    //         if (err.response) {
    //             if (err.response.status === 422)
    //                 setServerErrors(err.response.data.errors || {});
    //             else if (err.response.status === 401)
    //                 alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    //             else
    //                 setServerErrors({ general: [err.response.data.message || "Error del servidor"] });
    //         } else {
    //             setServerErrors({ general: ["No se pudo conectar con el servidor."] });
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const serverErrorFor = (field: string) =>
        serverErrors[field] ? serverErrors[field].join(" ") : undefined;

    // 👇 nuevo estado
    const [isDocumentEvent, setIsDocumentEvent] = useState(false);


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
                                            if (unavailableDays.includes(dateStr)) return;
                                            setSelectedDate(date);
                                            setValue("appointmentDate", dateStr);
                                        }}
                                        locale={es}
                                        color="#DCABDF"
                                        minDate={new Date()}
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
                                    availableTimes.map((slot) => (
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
                                                    // 👇 importante: validar al cambiar
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
                                            const selectedEvent = events.find((ev) => String(ev.id) === value);

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
                                    // solo es obligatorio si NO es evento de documento
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
                <div className="auth-modal-backdrop">
                    <div className="auth-modal">
                        <h3>¿Tienes una cuenta?</h3>
                        <p>Debes iniciar sesión o registrarte para reservar una cita.</p>

                        <div className="auth-modal-buttons">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <Button
                                    className="btn btn-perfil"
                                    value="Inicia Sesión"
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        window.location.href = "/iniciarSesion";
                                    }}
                                />

                                <span className="m-4">o</span>

                                <Button
                                    className="btn btn-perfil"
                                    value="Crea Cuenta"
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        window.location.href = "/registrarse";
                                    }}
                                />
                            </div>

                            <button
                                className="btn custom-upload-btn w-100"
                                onClick={() => setShowAuthModal(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default AppointmentStep1Validated;
