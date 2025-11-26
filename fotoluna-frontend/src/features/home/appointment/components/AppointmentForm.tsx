/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import AppointmentStep1Validated from "./AppointmentFormStep1";
import AppointmentStep2Packages from "./AppointmentFormStep2";
import AppointmentStep2Documents from "./AppointmentFormStep2Documents";
import AppointmentStep3Photographer from "./AppointmentFormStep3";
import StepProgressBar from "./StepProgressBar";
import { useLocation } from "react-router-dom";
import axios from "axios";
import AppointmentFormStep4PaymentEmbedded from "./AppointmentFormStep4Payment";
import "../styles/appointment.css";

// Componente para seleccionar planes de almacenamiento
import StoragePlansSelector from "./AppointmentFormStep2,5";
import Button from "../../../../components/Home/Button";
import AppointmentSummary from "./AppointmentSummary";

type PaymentMethod = "Card" | "PSE" | "Nequi" | "Daviplata";

type StoragePlan = {
    id: number;
    name: string;
    description?: string | null;
    max_photos?: number | null;
    max_storage_mb?: number | null;
    duration_months: number;
    price: number | string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const NEQUI_PAYMENT_LINK =
    import.meta.env.VITE_NEQUI_PAYMENT_LINK ?? "https://tu-link-nequi";
const DAVIPLATA_PAYMENT_LINK =
    import.meta.env.VITE_DAVIPLATA_PAYMENT_LINK ?? "https://tu-link-daviplata";

// ➜ Pasos (6 en total)
const steps = [
    "Selecciona fecha y hora", // 1
    "Selecciona el paquete",   // 2
    "Elige tu fotógrafo",      // 3
    "Plan de almacenamiento",  // 4
    "Pago",                    // 5
    "Finaliza",                // 6 (resumen)
];

const AppointmentForm: React.FC = () => {
    const [step, setStep] = useState(1);
    const [appointmentId, setAppointmentId] = useState<number | null>(null);
    const [event, setEvent] = useState<any>(null);
    const [bookingId, setBookingId] = useState<number | null>(null);
    const [place, setPlace] = useState<string>("");

    const [total, setTotal] = useState<number>(0); // total de la sesión
    const [userEmail, setUserEmail] = useState<string>("");

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
    const [paymentReference, setPaymentReference] = useState<string>("");

    const [loading, setLoading] = useState(false); // para Nequi / Daviplata

    const [selectedStoragePlan, setSelectedStoragePlan] =
        useState<StoragePlan | null>(null);
    const [grandTotal, setGrandTotal] = useState(0); // sesión + plan nube

    const [summary, setSummary] = useState<{
        eventName: string;
        packageName: string;
        date: string;
        time: string;
        place: string;
    } | null>(null);

    const location = useLocation() as {
        state?: { eventId?: number; packageId?: number; documentTypeId?: number };
    };

    const preselectedEventId = location.state?.eventId ?? null;
    const preselectedPackageId = location.state?.packageId ?? null;
    const preselectedDocumentTypeId = location.state?.documentTypeId ?? null;

    // 🔹 Paso 1 -> siguiente (con lógica de salto de paso 2)
    const handleNext = async (data: {
        appointmentId: number;
        event: any;
        place: string;
    }) => {
        setAppointmentId(data.appointmentId);
        setEvent(data.event);
        setPlace(data.place);

        const isDocumentEvent = data.event?.category === "document_photo";

        if (!isDocumentEvent && preselectedPackageId) {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.post(
                    `${API_BASE}/api/appointments/${data.appointmentId}/booking`,
                    { packageIdFK: preselectedPackageId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const newBookingId = res?.data?.bookingId ?? res?.data?.id;
                setBookingId(newBookingId);
                setStep(3); // saltamos al paso 3 (fotógrafo)
            } catch (error) {
                console.error("Error creando booking automáticamente:", error);
                alert("No se pudo asignar el paquete automáticamente. Intenta de nuevo.");
                setStep(2);
            }
        } else {
            setStep(2);
        }
    };

    // cuando Mercado Pago devuelve "approved"
    const handleOnlinePaymentSuccess = () => {
        // Ir al paso 6: resumen final
        setStep(6);
    };

    // Nequi / Daviplata (manual / offline)
    const handleOfflinePaymentConfirm = async () => {
        if (!bookingId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            await axios.post(
                `${API_BASE}/api/bookings/${bookingId}/payments/offline`,
                {
                    amount: grandTotal, // usamos el total completo
                    paymentMethod, // "Nequi" | "Daviplata"
                    paymentReference,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            // Ir al resumen
            setStep(6);
        } catch (e) {
            console.error(e);
            alert("No se pudo registrar tu pago. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Cargar el booking: total, email y resumen
    useEffect(() => {
        if (!bookingId) return;

        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(`${API_BASE}/api/bookings/${bookingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                // total de la sesión
                setTotal(Number(res.data.total) || 0);

                // email: tratamos distintas formas de respuesta
                const email =
                    res.data.user?.email ??
                    res.data.customer?.emailCustomer ??
                    res.data.customer?.email ??
                    "";

                setUserEmail(email);

                setSummary({
                    eventName: res.data.event?.name ?? "",
                    packageName: res.data.package?.name ?? "",
                    date: res.data.appointment?.date ?? "",
                    time: res.data.appointment?.time ?? "",
                    place: res.data.appointment?.place ?? "",
                });
            } catch (err) {
                console.error("Error obteniendo booking:", err);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Recalcular total completo (sesión + plan nube)
    useEffect(() => {
        const extra = selectedStoragePlan ? Number(selectedStoragePlan.price) : 0;
        setGrandTotal(total + extra);
    }, [total, selectedStoragePlan]);

    // Paso 2 -> 3
    const handlePackageConfirm = (data: { bookingId: number }) => {
        setBookingId(data.bookingId);
        setStep(3);
    };

    // Paso 3 -> 4 (fotógrafo -> plan nube)
    const handlePhotographerNext = () => {
        setStep(4);
    };

    // Volver atrás
    const handleBack = () => {
        if (step > 1) setStep((prev) => prev - 1);
    };

    // Opcional: volver al inicio después del resumen
    const handleFinish = () => {
        setStep(1);
        setAppointmentId(null);
        setEvent(null);
        setBookingId(null);
        setSelectedStoragePlan(null);
    };

    return (
        <div className="appointment-wrapper">
            {/* Barra de progreso */}
            <div className="progress-bar-wrapper">
                <StepProgressBar currentStep={step} steps={steps} />
            </div>

            <div className="step-content">
                {/* Paso 1 — Fecha y hora */}
                {step === 1 && (
                    <AppointmentStep1Validated
                        onNext={handleNext}
                        initialEventId={preselectedEventId}
                    />
                )}

                {/* Paso 2 — Paquete o documentos */}
                {step === 2 && appointmentId && event && (
                    event.category === "document_photo" ? (
                        <AppointmentStep2Documents
                            appointmentId={appointmentId}
                            eventId={event.id}
                            place={place}
                            preselectedDocumentTypeId={preselectedDocumentTypeId ?? undefined}
                            onConfirm={handlePackageConfirm}
                            onBack={() => setStep(1)}
                        />
                    ) : (
                        <AppointmentStep2Packages
                            appointmentId={appointmentId}
                            eventId={event.id}
                            preselectedPackageId={preselectedPackageId ?? undefined}
                            onConfirm={handlePackageConfirm}
                            onBack={() => setStep(1)}
                        />
                    )
                )}

                {/* Paso 3 — Fotógrafo */}
                {step === 3 && bookingId && (
                    <AppointmentStep3Photographer
                        bookingId={bookingId}
                        onBack={() => setStep(2)}
                        onNext={handlePhotographerNext} // pasa al Plan de almacenamiento
                    />
                )}

                {/* Paso 4 — Plan de almacenamiento */}
                {step === 4 && (
                    <div className="container plans mt-4">
                        <h3 className="mb-3">Plan de almacenamiento</h3>
                        <div className="plan-description">
                            <p className="text-muted mb-4">
                                Elige un plan para guardar tus fotos editadas en la nube de FotoLuna.
                                Este costo se suma al valor de tu sesión.
                            </p>
                        </div>

                        <StoragePlansSelector
                            selectedPlan={selectedStoragePlan}
                            onSelect={setSelectedStoragePlan}
                            showTitle={false}
                        />

                        <div className="d-flex justify-content-between mt-4 align-items-center">
                            {/* IZQUIERDA → Botón Atrás */}
                            <div>
                                <Button value="Atrás" onClick={handleBack} />
                            </div>

                            {/* DERECHA → Totales + Botón Continuar */}
                            <div className="text-end">
                                <div className="mb-2">
                                    <strong>Total sesión: </strong>
                                    ${total.toLocaleString("es-CO")} COP
                                </div>

                                {selectedStoragePlan && (
                                    <div className="mb-2">
                                        <strong>Plan nube: </strong>
                                        + $
                                        {Number(selectedStoragePlan.price).toLocaleString("es-CO")}{" "}
                                        COP
                                    </div>
                                )}

                                <div className="mb-3">
                                    <strong>Total actual: </strong>
                                    ${grandTotal.toLocaleString("es-CO")} COP
                                </div>

                                <Button value="Continuar a pago" onClick={() => setStep(5)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Paso 5 — Pago */}
                {step === 5 && bookingId && (
                    <div className="container payment-page">
                        {/* Columna izquierda: resumen */}
                        <aside className="payment-summary-card">
                            <h4 className="payment-summary-title">Detalles de la reserva</h4>

                            <div className="payment-summary-row">
                                <span className="label">Servicio</span>
                                <span className="value">
                                    {summary?.eventName || event?.name || "—"}
                                </span>
                            </div>

                            <div className="payment-summary-row">
                                <span className="label">Paquete</span>
                                <span className="value">
                                    {summary?.packageName || "—"}
                                </span>
                            </div>

                            <div className="payment-summary-row">
                                <span className="label">Fecha y hora</span>
                                <span className="value">
                                    {summary
                                        ? `${summary.date} ${summary.time ? summary.time.slice(0, 5) : ""
                                        }`
                                        : "—"}
                                </span>
                            </div>

                            <div className="payment-summary-row">
                                <span className="label">Total sesión</span>
                                <span className="value">
                                    ${total.toLocaleString("es-CO")} COP
                                </span>
                            </div>

                            {selectedStoragePlan && (
                                <div className="payment-summary-row">
                                    <span className="label">
                                        Plan nube: {selectedStoragePlan.name}
                                    </span>
                                    <span className="value">
                                        + $
                                        {Number(selectedStoragePlan.price).toLocaleString("es-CO")}{" "}
                                        COP
                                    </span>
                                </div>
                            )}

                            <div className="payment-summary-row total">
                                <span className="label">Total a pagar</span>
                                <span className="value total-amount">
                                    ${grandTotal.toLocaleString("es-CO")} COP
                                </span>
                            </div>
                        </aside>

                        {/* Columna derecha: métodos de pago */}
                        <section className="payment-method-section">
                            <h2 className="payment-heading">Pago en línea</h2>
                            <p className="payment-subheading">
                                Elige tu método de pago para finalizar tu reserva.
                            </p>

                            <h4 className="payment-method-title">Método de pago</h4>

                            {/* Grid de métodos */}
                            <div className="payment-method-grid">
                                {/* Card */}
                                <button
                                    type="button"
                                    className={`payment-method-item ${paymentMethod === "Card" ? "is-selected" : ""
                                        }`}
                                    onClick={() => setPaymentMethod("Card")}
                                >
                                    <span className="radio" />
                                    <div className="method-text">
                                        <span className="method-name m-2">
                                            Tarjeta (Crédito/Débito)
                                        </span>
                                        <span className="method-desc">
                                            Paga con Visa, Mastercard, o Amex
                                        </span>
                                    </div>
                                </button>

                                {/* PSE */}
                                <button
                                    type="button"
                                    className={`payment-method-item ${paymentMethod === "PSE" ? "is-selected" : ""
                                        }`}
                                    onClick={() => setPaymentMethod("PSE")}
                                >
                                    <span className="radio" />
                                    <div className="method-text">
                                        <span className="method-name m-2">PSE</span>
                                        <span className="method-desc">Pagos seguros en línea</span>
                                    </div>
                                </button>

                                {/* Nequi */}
                                <button
                                    type="button"
                                    className={`payment-method-item ${paymentMethod === "Nequi" ? "is-selected" : ""
                                        }`}
                                    onClick={() => setPaymentMethod("Nequi")}
                                >
                                    <span className="radio" />
                                    <div className="method-text">
                                        <span className="method-name m-2">Nequi</span>
                                        <span className="method-desc">Paga con tu cuenta</span>
                                    </div>
                                </button>

                                {/* Daviplata */}
                                <button
                                    type="button"
                                    className={`payment-method-item ${paymentMethod === "Daviplata" ? "is-selected" : ""
                                        }`}
                                    onClick={() => setPaymentMethod("Daviplata")}
                                >
                                    <span className="radio" />
                                    <div className="method-text">
                                        <span className="method-name m-2">Daviplata</span>
                                        <span className="method-desc">Paga con tu cuenta</span>
                                    </div>
                                </button>
                            </div>

                            {/* Detalle según método */}
                            <div className="payment-detail-panel">
                                {(paymentMethod === "Card" || paymentMethod === "PSE") && (
                                    <>
                                        <p className="payment-footnote">
                                            Tu reserva será agendada después del pago.
                                        </p>
                                        <AppointmentFormStep4PaymentEmbedded
                                            bookingId={bookingId}
                                            total={grandTotal}
                                            currency="COP"
                                            userEmail={userEmail}
                                            paymentMethod={paymentMethod === "Card" ? "Card" : "PSE"}
                                            onBack={handleBack}
                                            onSuccess={handleOnlinePaymentSuccess}
                                            storagePlanId={selectedStoragePlan?.id ?? null}
                                        />
                                    </>
                                )}

                                {(paymentMethod === "Nequi" ||
                                    paymentMethod === "Daviplata") && (
                                        <>
                                            <h4 className="detail-title">
                                                Paga con {paymentMethod}
                                            </h4>
                                            <p className="detail-text">
                                                Te redirigimos para completar tu pago con tu cuenta{" "}
                                                {paymentMethod}. Después, vuelve y confirma tu reserva.
                                            </p>

                                            <div className="p-3 d-flex justify-content-center">
                                                <button
                                                    type="button"
                                                    className="btn custom-upload-btn"
                                                    onClick={() => {
                                                        const link =
                                                            paymentMethod === "Nequi"
                                                                ? NEQUI_PAYMENT_LINK
                                                                : DAVIPLATA_PAYMENT_LINK;
                                                        window.open(link, "_blank");
                                                    }}
                                                >
                                                    Ir a {paymentMethod}
                                                </button>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Referencia / comentario
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={paymentReference}
                                                    onChange={(e) => setPaymentReference(e.target.value)}
                                                />
                                            </div>

                                            <div className="payment-footer">
                                                <button
                                                    className="btn custom-upload-btn"
                                                    onClick={handleBack}
                                                    disabled={loading}
                                                >
                                                    Atrás
                                                </button>
                                                <button
                                                    className="btn btn-perfil"
                                                    onClick={handleOfflinePaymentConfirm}
                                                    disabled={loading}
                                                >
                                                    Confirmar reserva
                                                </button>
                                            </div>

                                            <p className="payment-footnote">
                                                Tu reserva será confirmada una vez que verifiquemos el
                                                pago. Te informaremos por correo.
                                            </p>
                                        </>
                                    )}
                            </div>
                        </section>
                    </div>
                )}

                {/* Paso 6 — Resumen final */}
                {step === 6 && bookingId && (
                    <AppointmentSummary
                        bookingId={bookingId}
                        storagePlan={selectedStoragePlan}
                        grandTotal={grandTotal}
                        onBack={() => setStep(5)}
                        onFinish={handleFinish}
                    />
                )}
            </div>
        </div>
    );
};

export default AppointmentForm;




// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useState } from "react";
// import AppointmentStep1Validated from "./AppointmentFormStep1";
// import AppointmentStep2Packages from "./AppointmentFormStep2";
// import AppointmentStep2Documents from "./AppointmentFormStep2Documents";
// import AppointmentStep3Photographer from "./AppointmentFormStep3";
// import StepProgressBar from "./StepProgressBar";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import AppointmentFormStep4PaymentEmbedded from "./AppointmentFormStep4Payment";
// import "../styles/appointment.css"
// import StoragePlan from "./AppointmentFormStep2,5";

// type PaymentMethod = "Card" | "PSE" | "Nequi" | "Daviplata";

// const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// const NEQUI_PAYMENT_LINK =
//     import.meta.env.VITE_NEQUI_PAYMENT_LINK ?? "https://tu-link-nequi";
// const DAVIPLATA_PAYMENT_LINK =
//     import.meta.env.VITE_DAVIPLATA_PAYMENT_LINK ?? "https://tu-link-daviplata";

// const steps = [
//     "Selecciona fecha y hora",
//     "Selecciona el paquete",
//     "Escoge tu plan",
//     "Elige tu fotógrafo",
//     "Pago",
//     "Confirma tu cita",
//     "Finaliza",
// ];

// const AppointmentForm: React.FC = () => {
//     const [step, setStep] = useState(1);
//     const [appointmentId, setAppointmentId] = useState<number | null>(null);
//     const [event, setEvent] = useState<any>(null);
//     const [bookingId, setBookingId] = useState<number | null>(null);
//     const [place, setPlace] = useState<string>("");
//     const [total, setTotal] = useState<number>(0);
//     const [userEmail, setUserEmail] = useState<string>("");

//     const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
//     const [paymentReference, setPaymentReference] = useState<string>("");

//     const [loading, setLoading] = useState(false); // 👈 para el offline

//     const [selectedStoragePlan, setSelectedStoragePlan] = useState<StoragePlan | null>(null);
//     const [grandTotal, setGrandTotal] = useState(0);

//     const location = useLocation() as {
//         state?: { eventId?: number; packageId?: number; documentTypeId?: number };
//     };

//     const preselectedEventId = location.state?.eventId ?? null;
//     const preselectedPackageId = location.state?.packageId ?? null;
//     const preselectedDocumentTypeId = location.state?.documentTypeId ?? null;

//     const [summary, setSummary] = useState<{
//         eventName: string;
//         packageName: string;
//         date: string;
//         time: string;
//         place: string;
//     } | null>(null);


//     // 🔹 Paso 1 -> siguiente (con lógica de salto de paso 2)
//     const handleNext = async (data: {
//         appointmentId: number;
//         event: any;
//         place: string;
//     }) => {
//         setAppointmentId(data.appointmentId);
//         setEvent(data.event);
//         setPlace(data.place);

//         const isDocumentEvent = data.event?.category === "document_photo";

//         if (!isDocumentEvent && preselectedPackageId) {
//             try {
//                 const token = localStorage.getItem("token");
//                 const res = await axios.post(
//                     `${API_BASE}/api/appointments/${data.appointmentId}/booking`,
//                     { packageIdFK: preselectedPackageId },
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             Accept: "application/json",
//                         },
//                     }
//                 );

//                 const newBookingId = res?.data?.bookingId ?? res?.data?.id;
//                 setBookingId(newBookingId);
//                 setStep(3);
//             } catch (error) {
//                 console.error("Error creando booking automáticamente:", error);
//                 alert("No se pudo asignar el paquete automáticamente. Intenta de nuevo.");
//                 setStep(2);
//             }
//         } else {
//             setStep(2);
//         }
//     };

//     // cuando MP devuelve approved
//     const handleOnlinePaymentSuccess = () => {
//         setStep(5);
//     };

//     // Nequi / Daviplata / Cash
//     const handleOfflinePaymentConfirm = async () => {
//         if (!bookingId) return;

//         try {
//             setLoading(true);
//             const token = localStorage.getItem("token");

//             await axios.post(
//                 `${API_BASE}/api/bookings/${bookingId}/payments/offline`,
//                 {
//                     amount: total,
//                     paymentMethod, // "Nequi" | "Daviplata" | "Cash"
//                     paymentReference,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         Accept: "application/json",
//                     },
//                 }
//             );

//             setStep(5);
//         } catch (e) {
//             console.error(e);
//             alert("No se pudo registrar tu pago. Inténtalo de nuevo.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // cargar total y email del booking
//     useEffect(() => {
//         if (!bookingId) return;

//         const fetchBooking = async () => {
//             try {
//                 const token = localStorage.getItem("token");

//                 const res = await axios.get(`${API_BASE}/api/bookings/${bookingId}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         Accept: "application/json",
//                     },
//                 });

//                 // total para el pago
//                 setTotal(Number(res.data.total) || 0);

//                 // 👇 antes: res.data.user.email  → ahora:
//                 setUserEmail(res.data.customer?.email ?? "");

//                 // si quieres rellenar el resumen bonito del paso 4:
//                 setSummary({
//                     eventName: res.data.event?.name ?? "",
//                     packageName: res.data.package?.name ?? "",
//                     date: res.data.appointment?.date ?? "",
//                     time: res.data.appointment?.time ?? "",
//                     place: res.data.appointment?.place ?? "",
//                 });

//             } catch (err) {
//                 console.error("Error obteniendo booking:", err);
//             }
//         };

//         fetchBooking();
//     }, [bookingId]);

//     useEffect(() => {
//         const extra = selectedStoragePlan ? Number(selectedStoragePlan.price) : 0;
//         setGrandTotal(total + extra);
//     }, [total, selectedStoragePlan]);

//     // 🔹 Paso 2 -> 3
//     const handlePackageConfirm = (data: { bookingId: number }) => {
//         setBookingId(data.bookingId);
//         setStep(3);
//     };

//     // 🔹 Paso 3 -> 4
//     const handlePhotographerNext = () => {
//         setStep(4);
//     };

//     // 🔹 Paso final (confirmación)
//     const handleConfirm = () => {
//         alert("🎉 Cita confirmada con éxito!");
//         setStep(1);
//     };

//     // 🔹 Volver atrás
//     const handleBack = () => {
//         if (step > 1) setStep((prev) => prev - 1);
//     };

//     return (
//         <div className="appointment-wrapper">
//             <div className="progress-bar-wrapper">
//                 <StepProgressBar currentStep={step} steps={steps} />
//             </div>

//             <div className="step-content">
//                 {/* Paso 1 */}
//                 {step === 1 && (
//                     <AppointmentStep1Validated
//                         onNext={handleNext}
//                         initialEventId={preselectedEventId}
//                     />
//                 )}

//                 {/* Paso 2 */}
//                 {step === 2 && appointmentId && event && (
//                     event.category === "document_photo" ? (
//                         <AppointmentStep2Documents
//                             appointmentId={appointmentId}
//                             eventId={event.id}
//                             place={place}
//                             preselectedDocumentTypeId={preselectedDocumentTypeId ?? undefined}
//                             onConfirm={handlePackageConfirm}
//                             onBack={() => setStep(1)}
//                         />
//                     ) : (
//                         <AppointmentStep2Packages
//                             appointmentId={appointmentId}
//                             eventId={event.id}
//                             preselectedPackageId={preselectedPackageId ?? undefined}
//                             onConfirm={handlePackageConfirm}
//                             onBack={() => setStep(1)}
//                         />
//                     )
//                 )}

//                 {/* Paso 3 */}
//                 {step === 3 && bookingId && (
//                     <AppointmentStep3Photographer
//                         bookingId={bookingId}
//                         onBack={() => setStep(2)}
//                         onNext={handlePhotographerNext}
//                     />
//                 )}

//                 {/* Paso 4 — Pago */}
//                 {step === 4 && bookingId && (
//                     <div className="container payment-page">
//                         {/* Columna izquierda: resumen */}
//                         <aside className="payment-summary-card">
//                             <h4 className="payment-summary-title">Detalles de la reserva</h4>

//                             <div className="payment-summary-row">
//                                 <span className="label">Servicio</span>
//                                 <span className="value">
//                                     {summary?.eventName || "—"}
//                                 </span>
//                             </div>

//                             <div className="payment-summary-row">
//                                 <span className="label">Paquete</span>
//                                 <span className="value">
//                                     {summary?.packageName || "—"}
//                                 </span>
//                             </div>

//                             <div className="payment-summary-row">
//                                 <span className="label">Fecha y hora</span>
//                                 <span className="value">
//                                     {summary
//                                         ? `${summary.date} ${summary.time.slice(0, 5)}`
//                                         : "—"}
//                                 </span>
//                             </div>

//                             <div className="payment-summary-row">
//                                 <span className="label">Total sesión</span>
//                                 <span className="value">
//                                     ${total.toLocaleString("es-CO")} COP
//                                 </span>
//                             </div>

//                             {selectedStoragePlan && (
//                                 <div className="payment-summary-row">
//                                     <span className="label">
//                                         Plan nube: {selectedStoragePlan.name}
//                                     </span>
//                                     <span className="value">
//                                         + ${Number(selectedStoragePlan.price).toLocaleString("es-CO")} COP
//                                     </span>
//                                 </div>
//                             )}

//                             <div className="payment-summary-row total">
//                                 <span className="label">Total a pagar</span>
//                                 <span className="value total-amount">
//                                     ${grandTotal.toLocaleString("es-CO")} COP
//                                 </span>
//                             </div>
//                         </aside>

//                         {/* Columna derecha: métodos de pago */}
//                         <section className="payment-method-section">
//                             <h2 className="payment-heading">Pago en Linea</h2>
//                             <p className="payment-subheading">
//                                 Elige tu método de pago para finalizar tu reserva.
//                             </p>
//                             {/* <p className="text-muted">Puedes</p> */}

//                             <h4 className="payment-method-title">Método de Pago</h4>

//                             {/* Grid de métodos */}
//                             <div className="payment-method-grid">
//                                 {/* Card */}
//                                 <button
//                                     type="button"
//                                     className={`payment-method-item ${paymentMethod === "Card" ? "is-selected" : ""
//                                         }`}
//                                     onClick={() => setPaymentMethod("Card")}
//                                 >
//                                     <span className="radio" />
//                                     <div className="method-text">
//                                         <span className="method-name m-2">Tarjeta (Credito/Debito)</span>
//                                         <span className="method-desc">
//                                             Paga con Visa, Mastercard, o Amex
//                                         </span>
//                                     </div>
//                                 </button>

//                                 {/* PSE */}
//                                 <button
//                                     type="button"
//                                     className={`payment-method-item ${paymentMethod === "PSE" ? "is-selected" : ""
//                                         }`}
//                                     onClick={() => setPaymentMethod("PSE")}
//                                 >
//                                     <span className="radio" />
//                                     <div className="method-text">
//                                         <span className="method-name m-2">PSE</span>
//                                         <span className="method-desc">Pagos seguros en línea</span>
//                                     </div>
//                                 </button>

//                                 {/* Nequi */}
//                                 <button
//                                     type="button"
//                                     className={`payment-method-item ${paymentMethod === "Nequi" ? "is-selected" : ""
//                                         }`}
//                                     onClick={() => setPaymentMethod("Nequi")}
//                                 >
//                                     <span className="radio" />
//                                     <div className="method-text">
//                                         <span className="method-name m-2">Nequi</span>
//                                         <span className="method-desc">Paga con tu cuenta</span>
//                                     </div>
//                                 </button>

//                                 {/* Daviplata */}
//                                 <button
//                                     type="button"
//                                     className={`payment-method-item ${paymentMethod === "Daviplata" ? "is-selected" : ""
//                                         }`}
//                                     onClick={() => setPaymentMethod("Daviplata")}
//                                 >
//                                     <span className="radio" />
//                                     <div className="method-text">
//                                         <span className="method-name m-2">Daviplata</span>
//                                         <span className="method-desc">
//                                             Paga con tu cuenta
//                                         </span>
//                                     </div>
//                                 </button>
//                             </div>

//                             {/* Detalle según método */}
//                             <div className="payment-detail-panel">
//                                 {(paymentMethod === "Card" || paymentMethod === "PSE") && (
//                                     <>
//                                         <p className="payment-footnote">
//                                             Tu reserva será agendada después del pago.
//                                         </p>
//                                         <AppointmentFormStep4PaymentEmbedded
//                                             bookingId={bookingId}
//                                             total={grandTotal}
//                                             currency="COP"
//                                             userEmail={userEmail}
//                                             paymentMethod={paymentMethod === "Card" ? "Card" : "PSE"}
//                                             onBack={handleBack}
//                                             onSuccess={handleOnlinePaymentSuccess}
//                                         />

//                                     </>
//                                 )}

//                                 {(paymentMethod === "Nequi" || paymentMethod === "Daviplata") && (
//                                     <>
//                                         <h4 className="detail-title">
//                                             Paga con {paymentMethod}
//                                         </h4>
//                                         <p className="detail-text">
//                                             Te redirigemos para completar tu pago con tu cuenta{" "}
//                                             {paymentMethod}. Despúes, vuelve y confirma tu reserva.
//                                         </p>
//                                         <div className="p-3 d-flex justify-content-center">
//                                             <button
//                                                 type="button"
//                                                 className="btn custom-upload-btn"
//                                                 onClick={() => {
//                                                     const link =
//                                                         paymentMethod === "Nequi"
//                                                             ? NEQUI_PAYMENT_LINK
//                                                             : DAVIPLATA_PAYMENT_LINK;
//                                                     window.open(link, "_blank");
//                                                 }}
//                                             >
//                                                 Ir a {paymentMethod}
//                                             </button>
//                                         </div>

//                                         <div className="mb-3">
//                                             <label className="form-label">Referencia / comentario</label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 value={paymentReference}
//                                                 onChange={(e) => setPaymentReference(e.target.value)}
//                                             />
//                                         </div>

//                                         <div className="payment-footer">
//                                             <button
//                                                 className="btn custom-upload-btn"
//                                                 onClick={handleBack}
//                                                 disabled={loading}
//                                             >
//                                                 Atrás
//                                             </button>
//                                             <button
//                                                 className="btn btn-perfil"
//                                                 onClick={handleOfflinePaymentConfirm}
//                                                 disabled={loading}
//                                             >
//                                                 Confirmar Reserva
//                                             </button>
//                                         </div>

//                                         <p className="payment-footnote">
//                                             Tu reserva será confirmada una vez que verifiquemos el pago. Te informaremos.
//                                         </p>
//                                     </>
//                                 )}
//                             </div>
//                         </section>
//                     </div>
//                 )}


//                 {/* Paso 5 */}
//                 {step === 5 && (
//                     <div className="text-center mt-5">
//                         <h3>✅ Confirmar cita</h3>
//                         <div className="d-flex justify-content-center gap-3 mt-4">
//                             <button className="btn btn-outline-secondary" onClick={handleBack}>
//                                 ← Atrás
//                             </button>
//                             <button className="btn btn-primary" onClick={handleConfirm}>
//                                 Finalizar
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AppointmentForm;
