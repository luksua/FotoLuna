/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/appointmentSummary.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type StoragePlan = {
    id: number;
    name: string;
    duration_months: number;
    price: number | string;
};

interface AppointmentSummaryProps {
    bookingId: number;
    storagePlan: StoragePlan | null;
    grandTotal: number;
    onBack: () => void;
    onFinish: () => void;
    refreshKey?: number;
}

interface BookingSummaryResponse {
    id: number;
    total: number;
    event?: { name: string } | null;
    package?: { name: string } | null;
    appointment?: {
        date: string;
        time: string;
        place: string;
    } | null;
    photographer?: { name: string } | null;
    customer?: {
        fullName?: string;
        nameCustomer?: string;
        emailCustomer?: string;
    } | null;
    last_payment?: {
        status: string;
        mp_payment_id?: string | null;
    } | null;
}

const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
    bookingId,
    storagePlan,
    grandTotal,
    // onBack,
    onFinish,
    refreshKey
}) => {
    const [data, setData] = useState<BookingSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingMail, setSendingMail] = useState(false);

    /* ---------------------------------------------------------
        Cargar datos del backend
    --------------------------------------------------------- */
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const res = await axios.get(`${API_BASE}/api/bookings/${bookingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                setData(res.data);
            } catch (err) {
                console.error("Error cargando resumen de reserva:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [bookingId, refreshKey]);


    /* ---------------------------------------------------------
        Enviar correo nuevamente
    --------------------------------------------------------- */
    const handleSendConfirmation = async () => {
        try {
            setSendingMail(true);
            const token = localStorage.getItem("token");

            await axios.post(
                `${API_BASE}/api/bookings/${bookingId}/send-confirmation`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            alert("Hemos reenviado la confirmación a tu correo ✉️");
        } catch (err) {
            console.error(err);
            alert("No se pudo enviar el correo de confirmación.");
        } finally {
            setSendingMail(false);
        }
    };


    /* ---------------------------------------------------------
        Generar link de Google Calendar
    --------------------------------------------------------- */
    const handleAddToCalendar = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE}/api/bookings/${bookingId}/calendar-link`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (res.data?.url) {
                window.open(res.data.url, "_blank");
            } else {
                alert("No se pudo generar el enlace de calendario.");
            }
        } catch (err) {
            console.error(err);
            alert("No se pudo generar el enlace de calendario.");
        }
    };

    const handleViewAppointments = () => {
        window.location.href = "/citas";
    };

    /* ---------------------------------------------------------
        UI mientras carga
    --------------------------------------------------------- */
    if (loading || !data) {
        return (
            <div className="summary-wrapper text-center mt-5">
                <p>Cargando resumen de tu cita...</p>
            </div>
        );
    }

    /* ---------------------------------------------------------
        Datos procesados
    --------------------------------------------------------- */
    const customerName =
        data.customer?.fullName ??
        data.customer?.nameCustomer ??
        "Tu sesión está confirmada";

    const eventName = data.event?.name ?? "Sesión fotográfica";
    const packageName = data.package?.name ?? "Paquete seleccionado";

    const dateStr = data.appointment?.date ?? "—";
    const timeStr = data.appointment?.time
        ? data.appointment.time.slice(0, 5)
        : "—";
    const placeStr = data.appointment?.place ?? "—";

    const paymentStatus = data.last_payment?.status ?? "approved";

    const transactionId =
        data.last_payment?.mp_payment_id ??
        "—";

    const handleDownloadReceipt = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE}/api/bookings/${bookingId}/receipt`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/pdf",
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `recibo-FL-${bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("No se pudo descargar el recibo.");
        }
    };

    // --- Resumen de cuotas / pagos ---
    const installments = (data as any)?.installments ?? [];
    const hasInstallments = Array.isArray(installments) && installments.length > 0;

    const totalFromInstallments = hasInstallments
        ? installments.reduce(
            (sum: number, ins: any) => sum + Number(ins.amount || 0),
            0
        )
        : grandTotal;

    const paidAmount = hasInstallments
        ? installments
            .filter((ins: any) => ins.status === "paid")
            .reduce(
                (sum: number, ins: any) => sum + Number(ins.amount || 0),
                0
            )
        : (paymentStatus === "approved" ? grandTotal : 0);

    const pendingAmount = Math.max(0, totalFromInstallments - paidAmount);

    const paymentStatusLabel = (() => {
        if (!hasInstallments) {
            return paymentStatus === "approved" ? "Pagado" : (paymentStatus || "Pendiente");
        }
        if (pendingAmount === 0 && totalFromInstallments > 0) {
            return "Pagado";
        }
        if (paidAmount > 0 && pendingAmount > 0) {
            return "En cuotas";
        }
        return "Pendiente";
    })();

    // Próxima cuota
    const nextInstallment = hasInstallments
        ? installments
            .filter((ins: any) => ins.status !== "paid" && ins.due_date)
            .sort(
                (a: any, b: any) =>
                    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            )[0]
        : null;

    const nextDueLabel = nextInstallment
        ? new Date(nextInstallment.due_date).toLocaleDateString("es-CO")
        : null;

    /* =========================================================
        RENDER
    ========================================================= */
    return (
        <div className="summary-page container my-5">

            {/* Header */}
            <div className="summary-header text-center mb-4">
                <h2 className="summary-title">¡Tu sesión ha sido reservada!</h2>
                <p className="summary-subtitle">
                    {customerName}, hemos enviado un correo con todos los detalles a tu email.
                </p>
            </div>

            {/* Tarjeta principal */}
            <div className="summary-card">

                {/* Fecha y Hora */}
                <div className="summary-row border-bottom pb-3 mb-3">
                    <div className="summary-col">
                        <span className="summary-label">Fecha</span>
                        <span className="summary-value">{dateStr}</span>
                    </div>

                    <div className="summary-col">
                        <span className="summary-label">Hora</span>
                        <span className="summary-value">{timeStr}</span>
                    </div>
                </div>

                {/* Lugar */}
                <div className="summary-row border-bottom pb-3 mb-3">
                    <div className="summary-col w-100">
                        <span className="summary-label">Lugar</span>
                        <span className="summary-value">{placeStr}</span>
                    </div>
                </div>

                {/* Paquete / Fotógrafo */}
                <div className="summary-row border-bottom pb-3 mb-3">
                    <div className="summary-col">
                        <span className="summary-label">Paquete</span>
                        <span className="summary-value">{eventName}</span>
                        <span className="summary-value">{packageName}</span>
                    </div>

                    <div className="summary-col">
                        <span className="summary-label">Fotógrafo</span>
                        <span className="summary-value">
                            {data.photographer?.name ?? "Por asignar"}
                        </span>
                    </div>
                </div>

                {/* Plan de almacenamiento */}
                {storagePlan && (
                    <div className="summary-row border-bottom pb-3 mb-3">
                        <div className="summary-col w-100">
                            <span className="summary-label">Plan de almacenamiento</span>
                            <span className="summary-value">
                                {storagePlan.name} · {storagePlan.duration_months}{" "}
                                {storagePlan.duration_months === 1 ? "mes" : "meses"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Resumen de pago */}
                <div className="summary-row">
                    <div className="summary-col w-100">
                        <span className="summary-label">Resumen de pago</span>

                        {hasInstallments ? (
                            <>
                                <div className="d-flex justify-content-between">
                                    <span className="summary-value">Total de la reserva</span>
                                    <span className="summary-amount">
                                        ${totalFromInstallments.toLocaleString("es-CO")} COP
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between mt-1">
                                    <span className="summary-value">Pagado</span>
                                    <span className="summary-amount text-success">
                                        ${paidAmount.toLocaleString("es-CO")} COP
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between mt-1">
                                    <span className="summary-value">Saldo pendiente</span>
                                    <span className="summary-amount text-warning">
                                        ${pendingAmount.toLocaleString("es-CO")} COP
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between mt-1">
                                    <span className="summary-value">Estado</span>
                                    <span>{paymentStatusLabel}</span>
                                </div>

                                {nextDueLabel && (
                                    <div className="d-flex justify-content-between mt-1">
                                        <span className="summary-value">Próximo vencimiento</span>
                                        <span>{nextDueLabel}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="summary-value d-flex justify-content-between">
                                <span>{paymentStatusLabel}</span>
                                <span className="summary-amount">
                                    ${grandTotal.toLocaleString("es-CO")} COP
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Booking ID + Transacción */}
                <div className="summary-meta mt-4">
                    <div className="summary-meta-item">
                        <span className="meta-label">Booking ID:</span>
                        <span className="meta-value">FL-{bookingId}</span>
                    </div>

                    <div className="summary-meta-item">
                        <span className="meta-label">Transacción:</span>
                        <span className="meta-value">{transactionId}</span>
                    </div>
                </div>
            </div>

            {/* Botones principales */}
            <div className="summary-actions mt-4 d-flex flex-column flex-md-row justify-content-center gap-3">
                <button className="btn custom-upload-btn" onClick={handleAddToCalendar}>
                    Añadir al calendario
                </button>

                <button className="btn custom2-upload-btn" onClick={handleViewAppointments}>
                    Ver mis reservas
                </button>

                {/* Descargar Recibo */}
                <button className="btn custom3-upload-btn" onClick={handleDownloadReceipt}>
                    Descargar recibo
                </button>
            </div>

            {/* Footer */}
            <div className="summary-footer text-center mt-4">

                {/* <button type="button" className="btn btn-link p-0" onClick={onBack}>
                    Volver al paso anterior 
                </button><br /> */}

                <button
                    type="button"
                    className="btn btn-link p-0 me-3"
                    onClick={handleSendConfirmation}
                    disabled={sendingMail}
                >
                    {sendingMail ? "Enviando correo..." : "Reenviar confirmación por correo"}
                </button>

                <div className="mt-3">
                    <button
                        type="button"
                        className="btn btn-link p-0 text-muted"
                        onClick={onFinish}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentSummary;
