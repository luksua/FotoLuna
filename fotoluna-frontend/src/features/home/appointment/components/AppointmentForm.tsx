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
type PaymentPlanMode = "full" | "partial";

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
    "Selecciona el paquete", // 2
    "Elige tu fotógrafo", // 3
    "Plan de almacenamiento", // 4
    "Pago", // 5
    "Finaliza", // 6 (resumen)
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

    const [appointmentDate, setAppointmentDate] = useState<string>("");
    const [appointmentTime, setAppointmentTime] = useState<string>("");
    const [packageIdFK, setPackageIdFK] = useState<number | null>(null);

    // cuotas
    const [paymentPlanMode, setPaymentPlanMode] =
        useState<PaymentPlanMode>("full");
    const [depositPercent, setDepositPercent] = useState<number>(20);
    const [paymentInstallmentId, setPaymentInstallmentId] = useState<number | null>(null);
    const [planReady, setPlanReady] = useState(false);

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

    // cuánto se va a cobrar en este pago (total o abono)
    const effectiveAmount =
        paymentPlanMode === "full"
            ? grandTotal
            : Math.round((grandTotal * depositPercent) / 100);

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

                setAppointmentDate(res.data.appointment?.date ?? "");
                setAppointmentTime(res.data.appointment?.time ?? "");

                // Dependiendo de cómo se llame en tu backend:
                setPackageIdFK(
                    res.data.packageIdFK ??
                    res.data.package?.id ??
                    res.data.package?.packageId ??
                    null
                );
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
        setPaymentPlanMode("full");
        setDepositPercent(20);
        setPlanReady(false);
    };

    const prepareInstallmentsAndPay = async () => {
        if (!bookingId) return;

        // Si es abono, validar porcentaje mínimo
        if (paymentPlanMode === "partial") {
            if (depositPercent < 20) {
                alert("El abono debe ser al menos el 20% del total.");
                return;
            }
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Debes iniciar sesión para continuar.");
                return;
            }

            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

            const payload: any = {
                total_amount: grandTotal,
                mode: paymentPlanMode, // "full" o "partial"
            };

            if (paymentPlanMode === "full") {
                // Pago completo: una sola cuota con el total
                payload.deposit_amount = grandTotal;
                payload.deposit_due_date = today;
            } else {
                // Abono: usar el monto calculado por porcentaje
                payload.deposit_amount = effectiveAmount; // 👈 ESTE es el abono
                payload.deposit_due_date = today;

                // si tienes fecha de cita, úsala como vencimiento del saldo
                if (summary?.date) {
                    payload.remaining_due_date = summary.date; // ej. "2025-01-20"
                }
            }

            const res = await axios.post(
                `${API_BASE}/api/bookings/${bookingId}/installments-plan`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            // y luego:
            const first = res.data.installments?.[0];
            setPaymentInstallmentId(first?.id ?? null);
            setPlanReady(true);

        } catch (error) {
            console.error(error);
            alert("No se pudo generar el plan de pago. Intenta de nuevo.");
            setPlanReady(false);
        }
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
                        onNext={handlePhotographerNext}
                        appointmentDate={appointmentDate}
                        appointmentTime={appointmentTime}
                        packageIdFK={packageIdFK}
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
                                        {Number(selectedStoragePlan.price).toLocaleString(
                                            "es-CO"
                                        )}{" "}
                                        COP
                                    </span>
                                </div>
                            )}

                            {/* 🔽 AQUÍ CAMBIA EL RESUMEN SEGÚN SEA TOTAL O ABONO */}
                            <div className="payment-summary-row total">
                                <span className="label">
                                    {paymentPlanMode === "partial"
                                        ? "Total del servicio"
                                        : "Total a pagar"}
                                </span>
                                <span className="value total-amount">
                                    ${grandTotal.toLocaleString("es-CO")} COP
                                </span>
                            </div>

                            {paymentPlanMode === "partial" && (
                                <>
                                    <div className="payment-summary-row">
                                        <span className="label">
                                            Abono ({depositPercent}%)
                                        </span>
                                        <span className="value">
                                            ${effectiveAmount.toLocaleString("es-CO")} COP
                                        </span>
                                    </div>

                                    <div className="payment-summary-row">
                                        <span className="label">Saldo pendiente</span>
                                        <span className="value">
                                            $
                                            {(grandTotal - effectiveAmount).toLocaleString(
                                                "es-CO"
                                            )}{" "}
                                            COP
                                        </span>
                                    </div>
                                </>
                            )}
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
                                        {/* --- Selector: pagar todo vs abono --- */}
                                        <h4 className="payment-method-title">Plan de pago</h4>

                                        <div className="mb-3">
                                            <div className="form-check">
                                                <input
                                                    id="plan-full"
                                                    type="radio"
                                                    className="form-check-input"
                                                    checked={paymentPlanMode === "full"}
                                                    onChange={() => {
                                                        setPaymentPlanMode("full");
                                                        setPlanReady(false);
                                                    }}
                                                />
                                                <label htmlFor="plan-full" className="form-check-label">
                                                    Pagar el total ahora
                                                </label>
                                            </div>

                                            <div className="form-check mt-1">
                                                <input
                                                    id="plan-partial"
                                                    type="radio"
                                                    className="form-check-input"
                                                    checked={paymentPlanMode === "partial"}
                                                    onChange={() => {
                                                        setPaymentPlanMode("partial");
                                                        setPlanReady(false);
                                                    }}
                                                />
                                                <label htmlFor="plan-partial" className="form-check-label">
                                                    Pagar solo un abono ahora y el resto después
                                                </label>
                                            </div>
                                        </div>

                                        {/* Si es abono → elegir porcentaje */}
                                        {paymentPlanMode === "partial" && (
                                            <div className="mb-3">
                                                <label className="form-label">¿Cuánto quieres abonar?</label>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {[20, 30, 50, 70].map((p) => (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            className={
                                                                "btn btn-sm " +
                                                                (depositPercent === p
                                                                    ? "custom3-upload-btn"
                                                                    : "btn-outline-secondary")
                                                            }
                                                            onClick={() => {
                                                                setDepositPercent(p);
                                                                setPlanReady(false);
                                                            }}
                                                        >
                                                            {p}% ({(grandTotal * p / 100).toLocaleString("es-CO")} COP)
                                                        </button>
                                                    ))}
                                                </div>
                                                {/* <small className="text-muted d-block mt-1">
                                                    Total: ${grandTotal.toLocaleString("es-CO")} COP
                                                </small>
                                                <small className="text-muted d-block">
                                                    Abono seleccionado: $
                                                    {effectiveAmount.toLocaleString("es-CO")} COP
                                                </small> */}
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-muted small">*Recuerda que para poder recibir tus fotos, debes de completar el pago antes o el día de tu sesión</p>
                                        </div>

                                        {/* Botón que crea el plan de cuotas y habilita el brick */}
                                        <div className="mb-3">
                                            <Button
                                                value="Confirmar monto y generar plan de pago"
                                                onClick={prepareInstallmentsAndPay}
                                            />
                                        </div>

                                        {/* Brick de Mercado Pago: solo se muestra cuando ya hay plan */}
                                        {planReady && (
                                            <>
                                                <p className="payment-footnote">
                                                    Tu reserva será agendada después del pago.
                                                </p>
                                                <AppointmentFormStep4PaymentEmbedded
                                                    bookingId={bookingId}
                                                    total={effectiveAmount} // total calculado (100% o porcentaje)
                                                    currency="COP"
                                                    userEmail={userEmail}
                                                    paymentMethod={paymentMethod === "Card" ? "Card" : "PSE"}
                                                    onBack={handleBack}
                                                    onSuccess={handleOnlinePaymentSuccess}
                                                    storagePlanId={selectedStoragePlan?.id ?? null}
                                                    installmentId={paymentInstallmentId}
                                                />
                                            </>
                                        )}
                                    </>
                                )}

                                {(paymentMethod === "Nequi" || paymentMethod === "Daviplata") && (
                                    <>
                                        <h4 className="detail-title">Paga con {paymentMethod}</h4>
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
                                            <label className="form-label">Referencia / comentario</label>
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
                                            Tu reserva será confirmada una vez que verifiquemos el pago. Te
                                            informaremos por correo.
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
                        refreshKey={Date.now()}
                        onBack={() => setStep(5)}
                        onFinish={handleFinish}
                    />
                )}
            </div>
        </div>
    );
};

export default AppointmentForm;
