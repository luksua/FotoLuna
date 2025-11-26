/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import "../styles/appointment.css";
import Button from "../../../../components/Home/Button";
import axios from "axios";
import AppointmentFormStep4PaymentEmbedded from "./AppointmentFormStep4Payment";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type DocumentType = {
    id: number;
    name: string;
    url?: string;
};

type Installment = {
    id: number;
    amount: number;
    due_date: string;
    paid: boolean;
    paid_at?: string | null;
    receipt_path?: string | null;
    is_overdue?: boolean;
};

type Payment = {
    id: number;
    total: number;
    paid: number;
    installments: Installment[];
    payer?: {
        email?: string;
    } | null;
};

type Appointment = {
    id: number;
    event_type: string;
    datetime: string;
    place?: string | null;
    reservation_status: string;
    payment_status: string;
    document_types: DocumentType[];
    payment?: Payment | null;
};

const Apointment: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal de detalles
    const [showModal, setShowModal] = useState<boolean>(false);
    const [active, setActive] = useState<Appointment | null>(null);

    // Modal de pago
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [paymentBookingId, setPaymentBookingId] = useState<number | null>(null);
    const [paymentTotal, setPaymentTotal] = useState<number | null>(null);
    const [paymentEmail, setPaymentEmail] = useState<string>("");

    const [paymentInstallmentId, setPaymentInstallmentId] = useState<number | null>(null);

    // Helper token
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token
            ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
            : { Accept: "application/json" };
    };

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/api/appointments-customer`, {
                headers: getAuthHeaders(),
            });

            const payload = res.data;
            const items = Array.isArray(payload) ? payload : payload.data ?? [];
            setAppointments(items);
        } catch (err: any) {
            console.error("Error fetching appointments:", err);
            setError(
                err.response?.data?.message || err.message || "Error al obtener citas"
            );
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (a: Appointment) => {
        setActive(a);
        setShowModal(true);
    };

    const closeDetails = () => {
        setActive(null);
        setShowModal(false);
    };

    const calcPending = (p?: Payment | null) => {
        if (!p) return 0;
        return Math.max(0, p.total - p.paid);
    };

    const formatDateTime = (iso?: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleString();
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        });

    const getPaymentBadge = (status?: string, small = false) => {
        const s = (status ?? "").toString().toLowerCase();

        let cls = "status-pill ";
        let label = status ?? "Sin info";

        if (s.includes("pag")) {
            cls += "paid";
            label = "Pagado";
        } else if (s.includes("pend")) {
            cls += "pending";
            label = "Pendiente";
        } else if (s.includes("cuota") || s.includes("parc")) {
            cls += "installments";
            label = "En cuotas";
        } else if (s.includes("venc")) {
            cls += "expired";
            label = "Vencido";
        } else {
            cls += "unknown";
            label = status ?? "Sin info";
        }

        if (small) cls += " sm";

        return (
            <span
                className={cls}
                role="status"
                aria-label={`Estado de pago: ${label}`}
                tabIndex={0}
            >
                {label}
            </span>
        );
    };

    // Resumen de cuotas
    const summarizeInstallments = (installments: Installment[]) => {
        const total = installments.length;
        const paidCount = installments.filter((i) => i.paid).length;
        const pendingCount = total - paidCount;

        const pendingSorted = installments
            .filter((i) => !i.paid)
            .sort(
                (a, b) =>
                    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            );
        const nextDue = pendingSorted[0]?.due_date ?? null;

        return { total, paidCount, pendingCount, nextDue };
    };

    // Abre el modal de pago (brick MP)
    const openPaymentFor = (a: Appointment, installment?: Installment) => {
        if (!a.payment) {
            alert("No hay información de pago asociada a esta cita.");
            return;
        }

        // ID de la reserva
        setPaymentBookingId(a.id);

        if (installment) {
            // 🟦 Pago de cuota específica
            setPaymentTotal(installment.amount);
            setPaymentInstallmentId(installment.id);
        } else {
            // 🟩 Pago del saldo completo
            const pending = calcPending(a.payment);
            setPaymentTotal(pending);
            setPaymentInstallmentId(null); // 👈 importante: NO cuota específica
        }

        const email =
            a.payment.payer?.email ||
            localStorage.getItem("user_email") ||
            "";

        setPaymentEmail(email);
        setShowPaymentModal(true);
    };


    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentBookingId(null);
        setPaymentTotal(null);
        setPaymentEmail("");
    };

    const onPaymentSuccess = () => {
        fetchAppointments();
        closePaymentModal();
        closeDetails();
    };

    // ---------- RENDER DETALLE (modal) usando opción 3 ----------
    const renderDetailModal = () => {
        if (!showModal || !active) return null;

        const payment = active.payment;
        const pending = payment ? calcPending(payment) : 0;
        const installmentsSummary =
            payment && summarizeInstallments(payment.installments);

        return (
            <div className="custom-modal-overlay" role="dialog" aria-modal="true">
                <div className="custom-modal bg-custom-2">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title">
                                Historial de Pagos y cuotas
                            </h5>
                            {/* línea pequeña de contexto, opcional */}
                            <small className="text-muted">
                                {formatDateTime(active.datetime)}
                                {active.place ? ` · ${active.place}` : ""}
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                            onClick={closeDetails}
                        />
                    </div>

                    <div className="modal-body">
                        {!payment ? (
                            <p className="text-muted">
                                Este servicio todavía no tiene información de pago.
                            </p>
                        ) : (
                            <>
                                {/* Resumen de pago */}
                                <div className="row g-2 mb-3">
                                    <div className="col-12 col-md-4">
                                        <div className="p-2 rounded bg-light h-100">
                                            <small className="text-muted d-block">
                                                Total del servicio
                                            </small>
                                            <strong>{formatCurrency(payment.total)}</strong>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="p-2 rounded bg-light h-100">
                                            <small className="text-muted d-block">
                                                Pagado
                                            </small>
                                            <strong>{formatCurrency(payment.paid)}</strong>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="p-2 rounded bg-light h-100">
                                            <small className="text-muted d-block">
                                                Saldo pendiente
                                            </small>
                                            <strong>{formatCurrency(pending)}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen de cuotas */}
                                {installmentsSummary && (
                                    <p className="small text-muted mb-2">
                                        {installmentsSummary.paidCount} de{" "}
                                        {installmentsSummary.total} cuotas pagadas.
                                        {installmentsSummary.pendingCount > 0 &&
                                            installmentsSummary.nextDue && (
                                                <>
                                                    {" "}
                                                    Próx. vencimiento:{" "}
                                                    {new Date(
                                                        installmentsSummary.nextDue
                                                    ).toLocaleDateString()}
                                                </>
                                            )}
                                    </p>
                                )}

                                {/* Tabla de cuotas */}
                                <h6 className="mt-2">Detalle de cuotas</h6>
                                {payment.installments.length === 0 ? (
                                    <p className="text-muted">
                                        Este pago no está dividido en cuotas.
                                    </p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Vencimiento</th>
                                                    <th>Monto</th>
                                                    <th>Estado</th>
                                                    <th>Recibo</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payment.installments.map((ins, index) => {
                                                    const isPaid = ins.paid;
                                                    const isOverdue =
                                                        !ins.paid &&
                                                        new Date(ins.due_date) < new Date();

                                                    return (
                                                        <tr key={ins.id}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                {new Date(
                                                                    ins.due_date
                                                                ).toLocaleDateString()}
                                                            </td>
                                                            <td>{formatCurrency(ins.amount)}</td>
                                                            <td>
                                                                {isPaid ? (
                                                                    <span className="badge bg-success">
                                                                        Pagada
                                                                    </span>
                                                                ) : isOverdue ? (
                                                                    <span className="badge bg-danger">
                                                                        Vencida
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge bg-warning text-dark">
                                                                        Pendiente
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Recibo por cuota (luego lo conectas a tu endpoint) */}
                                                            <td>
                                                                {ins.receipt_path ? (
                                                                    <a
                                                                        href={`${API_BASE}/api/appointments/${active.id}/installments/${ins.id}/receipt`}
                                                                        className="btn btn-sm custom2-upload-btn"
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        Recibo
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-muted small">No disponible</span>
                                                                )}
                                                            </td>
                                                            {/* <td>
                                                                <Button
                                                                    className="btn btn-sm custom2-upload-btn"
                                                                    onClick={() =>
                                                                        alert(
                                                                            "Aquí descargarías el recibo PDF de esta cuota (cuando tengas el endpoint listo)."
                                                                        )
                                                                    }
                                                                >
                                                                    Recibo
                                                                </Button>
                                                            </td> */}

                                                            {/* Pagar esa cuota */}
                                                            <td className="text-end">
                                                                {!isPaid && (
                                                                    <Button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => openPaymentFor(active, ins)}   // 👈 le pasas la cuota
                                                                    >
                                                                        Pagar cuota
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Recibo general (opcional) */}
                                <div className="mt-3">
                                    <Button
                                        className="btn custom2-upload-btn"
                                        onClick={() =>
                                            alert(
                                                "Aquí descargarías el recibo/factura general del servicio."
                                            )
                                        }
                                    >
                                        Descargar recibo general
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <Button className="btn custom-upload-btn" onClick={closeDetails}>
                            Cerrar
                        </Button>
                        {payment && pending > 0 && (
                            <Button
                                className="btn btn-primary"
                                onClick={() => openPaymentFor(active)}
                            >
                                Pagar saldo pendiente
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // const renderDetailModal = () => {
    //     if (!showModal || !active) return null;

    //     const payment = active.payment;

    //     const pending = payment ? calcPending(payment) : 0;
    //     const installmentsSummary =
    //         payment && summarizeInstallments(payment.installments);

    //     return (
    //         <div className="custom-modal-overlay" role="dialog" aria-modal="true">
    //             <div className="custom-modal">
    //                 <div className="modal-header">
    //                     <h5 className="modal-title">
    //                         Detalle cita — {active.event_type}
    //                     </h5>
    //                     <button
    //                         type="button"
    //                         className="btn-close"
    //                         aria-label="Cerrar"
    //                         onClick={closeDetails}
    //                     />
    //                 </div>

    //                 <div className="modal-body">
    //                     {/* Info general */}
    //                     <section className="mb-3">
    //                         <h6>Información de la reserva</h6>
    //                         <p className="mb-1">
    //                             <strong>Fecha y hora:</strong> {formatDateTime(active.datetime)}
    //                         </p>
    //                         <p className="mb-1">
    //                             <strong>Lugar:</strong> {active.place || "—"}
    //                         </p>
    //                         <p className="mb-1">
    //                             <strong>Estado de reserva:</strong> {active.reservation_status}
    //                         </p>
    //                         <p className="mb-0">
    //                             <strong>Estado de pago:</strong>{" "}
    //                             {getPaymentBadge(active.payment_status)}
    //                         </p>
    //                     </section>

    //                     <hr />

    //                     {/* Documentos */}
    //                     <section className="mb-3">
    //                         <h6>Documentos / Requisitos</h6>
    //                         {active.document_types.length === 0 ? (
    //                             <p className="text-muted">
    //                                 No hay tipos de documento asociados a esta cita.
    //                             </p>
    //                         ) : (
    //                             <ul className="mb-0">
    //                                 {active.document_types.map((d) => (
    //                                     <li key={d.id}>
    //                                         {d.name}{" "}
    //                                         {d.url && (
    //                                             <a
    //                                                 href={d.url}
    //                                                 target="_blank"
    //                                                 rel="noreferrer"
    //                                                 className="ms-2"
    //                                             >
    //                                                 Ver
    //                                             </a>
    //                                         )}
    //                                     </li>
    //                                 ))}
    //                             </ul>
    //                         )}
    //                     </section>

    //                     <hr />

    //                     {/* Pagos / cuotas / recibos */}
    //                     <section>
    //                         <h6>Pagos y cuotas</h6>

    //                         {!payment ? (
    //                             <p className="text-muted">No hay información de pago.</p>
    //                         ) : (
    //                             <>
    //                                 {/* Resumen de pago */}
    //                                 <div className="row g-2 mb-3">
    //                                     <div className="col-12 col-md-4">
    //                                         <div className="p-2 rounded bg-light h-100">
    //                                             <small className="text-muted d-block">
    //                                                 Total del servicio
    //                                             </small>
    //                                             <strong>{formatCurrency(payment.total)}</strong>
    //                                         </div>
    //                                     </div>
    //                                     <div className="col-12 col-md-4">
    //                                         <div className="p-2 rounded bg-light h-100">
    //                                             <small className="text-muted d-block">Pagado</small>
    //                                             <strong>{formatCurrency(payment.paid)}</strong>
    //                                         </div>
    //                                     </div>
    //                                     <div className="col-12 col-md-4">
    //                                         <div className="p-2 rounded bg-light h-100">
    //                                             <small className="text-muted d-block">
    //                                                 Saldo pendiente
    //                                             </small>
    //                                             <strong>{formatCurrency(pending)}</strong>
    //                                         </div>
    //                                     </div>
    //                                 </div>

    //                                 {/* Resumen de cuotas */}
    //                                 {installmentsSummary && (
    //                                     <p className="small text-muted mb-2">
    //                                         {installmentsSummary.paidCount} de{" "}
    //                                         {installmentsSummary.total} cuotas pagadas.
    //                                         {installmentsSummary.pendingCount > 0 &&
    //                                             installmentsSummary.nextDue && (
    //                                                 <>
    //                                                     {" "}
    //                                                     Próx. vencimiento:{" "}
    //                                                     {new Date(
    //                                                         installmentsSummary.nextDue
    //                                                     ).toLocaleDateString()}
    //                                                 </>
    //                                             )}
    //                                     </p>
    //                                 )}

    //                                 {/* Tabla de cuotas */}
    //                                 <h6 className="mt-2">Detalle de cuotas</h6>
    //                                 {payment.installments.length === 0 ? (
    //                                     <p className="text-muted">
    //                                         Este pago no está dividido en cuotas.
    //                                     </p>
    //                                 ) : (
    //                                     <div className="table-responsive">
    //                                         <table className="table table-sm align-middle">
    //                                             <thead>
    //                                                 <tr>
    //                                                     <th>#</th>
    //                                                     <th>Vencimiento</th>
    //                                                     <th>Monto</th>
    //                                                     <th>Estado</th>
    //                                                     <th>Recibo</th>
    //                                                     <th></th>
    //                                                 </tr>
    //                                             </thead>
    //                                             <tbody>
    //                                                 {payment.installments.map((ins, index) => {
    //                                                     const isPaid = ins.paid;
    //                                                     const isOverdue =
    //                                                         !ins.paid && new Date(ins.due_date) < new Date();

    //                                                     return (
    //                                                         <tr key={ins.id}>
    //                                                             <td>{index + 1}</td>
    //                                                             <td>
    //                                                                 {new Date(
    //                                                                     ins.due_date
    //                                                                 ).toLocaleDateString()}
    //                                                             </td>
    //                                                             <td>{formatCurrency(ins.amount)}</td>
    //                                                             <td>
    //                                                                 {isPaid ? (
    //                                                                     <span className="badge bg-success">
    //                                                                         Pagada
    //                                                                     </span>
    //                                                                 ) : isOverdue ? (
    //                                                                     <span className="badge bg-danger">
    //                                                                         Vencida
    //                                                                     </span>
    //                                                                 ) : (
    //                                                                     <span className="badge bg-warning text-dark">
    //                                                                         Pendiente
    //                                                                     </span>
    //                                                                 )}
    //                                                             </td>
    //                                                             {/* Recibo por cuota (placeholder) */}
    //                                                             <td>
    //                                                                 <Button
    //                                                                     className="btn btn-sm custom2-upload-btn"
    //                                                                     onClick={() =>
    //                                                                         alert(
    //                                                                             "Aquí descargarías el recibo PDF de esta cuota (a implementar)."
    //                                                                         )
    //                                                                     }
    //                                                                 >
    //                                                                     Recibo
    //                                                                 </Button>
    //                                                             </td>
    //                                                             <td className="text-end">
    //                                                                 {!isPaid && (
    //                                                                     <Button
    //                                                                         className="btn btn-sm btn-outline-primary"
    //                                                                         onClick={() => openPaymentFor(active)}
    //                                                                     >
    //                                                                         Pagar cuota
    //                                                                     </Button>
    //                                                                 )}
    //                                                             </td>
    //                                                         </tr>
    //                                                     );
    //                                                 })}
    //                                             </tbody>
    //                                         </table>
    //                                     </div>
    //                                 )}

    //                                 {/* Recibo general de toda la reserva (placeholder) */}
    //                                 <div className="mt-3">
    //                                     <Button
    //                                         className="btn custom2-upload-btn"
    //                                         onClick={() =>
    //                                             alert(
    //                                                 "Aquí descargarías el recibo/factura general (todas las cuotas)."
    //                                             )
    //                                         }
    //                                     >
    //                                         Descargar recibo general
    //                                     </Button>
    //                                 </div>
    //                             </>
    //                         )}
    //                     </section>
    //                 </div>

    //                 <div className="modal-footer">
    //                     <Button className="btn custom-upload-btn" onClick={closeDetails}>
    //                         Cerrar
    //                     </Button>
    //                     {payment && calcPending(payment) > 0 && (
    //                         <Button
    //                             className="btn btn-primary"
    //                             onClick={() => openPaymentFor(active)}
    //                         >
    //                             Pagar saldo pendiente
    //                         </Button>
    //                     )}
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    // ---------- RENDER PAGO (modal MP) ----------
    const renderPaymentModal = () => {
        if (!showPaymentModal || paymentBookingId == null || paymentTotal == null) {
            return null;
        }

        return (
            <div className="custom-modal-overlay" role="dialog" aria-modal="true">
                <div className="custom-modal large-modal">
                    <div className="modal-header">
                        <h5 className="modal-title">Pagar cita / servicio</h5>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                            onClick={closePaymentModal}
                        />
                    </div>
                    <div className="modal-body">
                        <AppointmentFormStep4PaymentEmbedded
                            bookingId={paymentBookingId}
                            total={paymentTotal}
                            userEmail={paymentEmail}
                            onBack={closePaymentModal}
                            onSuccess={onPaymentSuccess}
                            paymentMethod={"Card"}
                            storagePlanId={null}
                            installmentId={paymentInstallmentId}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // ---------- RENDER PRINCIPAL ----------
    return (
        <div className="container py-4">
            <section className="appointment-section">
                <div className="row justify-content-center">
                    {/* Header */}
                    <div className="col-12">
                        <div className="appointment-header text-center bg-custom-2 py-3 rounded-3 mb-3">
                            <h1 className="h4 m-0">Mis Citas</h1>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="col-12 bg-custom-9 p-3 rounded-3">
                        {/* Botón crear cita */}
                        <div className="d-flex justify-content-end mb-3">
                            <Button
                                className="btn btn-perfil w-100 w-sm-auto"
                                value="Nueva Cita"
                                to="/nuevaCita"
                            >
                                <i className="bi bi-plus-circle" /> Nueva Cita
                            </Button>
                        </div>

                        {/* Mensajes */}
                        {loading && (
                            <div className="text-center py-3">Cargando citas…</div>
                        )}
                        {error && <div className="alert alert-danger mb-3">{error}</div>}

                        {/* Tabla / tarjetas */}
                        {!loading && !error && (
                            <>
                                {/* DESKTOP / TABLET */}
                                <div
                                    className="table-responsive-md d-none d-md-block"
                                    role="region"
                                    aria-label="Listado de citas"
                                >
                                    <table className="table table-hover table-sm align-middle mb-0 rounded-3 overflow-hidden appointment-table">
                                        <caption className="visually-hidden">
                                            Listado de citas
                                        </caption>
                                        <thead className="thead-light bg-custom-2 table-secondary">
                                            <tr>
                                                <th scope="col">Evento</th>
                                                <th scope="col">Fecha y Hora</th>
                                                <th scope="col">Estado reserva</th>
                                                <th scope="col">Pago</th>
                                                <th scope="col">Saldo / Cuotas</th>
                                                <th scope="col">Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-custom-2">
                                            {appointments.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="text-center text-muted fst-italic"
                                                    >
                                                        No hay citas registradas.
                                                    </td>
                                                </tr>
                                            )}

                                            {appointments.map((c) => {
                                                const payment = c.payment;
                                                const pending = payment ? calcPending(payment) : 0;
                                                const installmentsSummary =
                                                    payment &&
                                                    summarizeInstallments(payment.installments);

                                                return (
                                                    <tr key={c.id}>
                                                        <td data-label="Evento">{c.event_type}</td>
                                                        <td data-label="Fecha y Hora">
                                                            {formatDateTime(c.datetime)}
                                                        </td>
                                                        <td data-label="Estado reserva">
                                                            {c.reservation_status}
                                                        </td>
                                                        <td data-label="Pago">
                                                            {getPaymentBadge(c.payment_status)}
                                                        </td>
                                                        <td data-label="Saldo / Cuotas">
                                                            {payment ? (
                                                                <>
                                                                    <div>
                                                                        <strong>Saldo:</strong>{" "}
                                                                        {formatCurrency(pending)}
                                                                    </div>
                                                                    {installmentsSummary && (
                                                                        <small className="text-muted">
                                                                            {installmentsSummary.paidCount} de{" "}
                                                                            {installmentsSummary.total} cuotas
                                                                            pagadas
                                                                        </small>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-muted">
                                                                    Sin información
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td data-label="Acciones">
                                                            <div className="d-flex flex-column gap-1">
                                                                <Button
                                                                    value="Ver detalle"
                                                                    className="btn custom2-upload-btn"
                                                                    onClick={() => openDetails(c)}
                                                                >
                                                                    Ver detalle
                                                                </Button>

                                                                {payment && pending > 0 && (
                                                                    <Button
                                                                        value="Pagar"
                                                                        className="btn btn-primary"
                                                                        onClick={() => openPaymentFor(c)}
                                                                    >
                                                                        Pagar saldo
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* MOBILE: tarjetas */}
                                <div className="d-md-none mt-3">
                                    {appointments.map((c) => {
                                        const payment = c.payment;
                                        const pending = payment ? calcPending(payment) : 0;
                                        const installmentsSummary =
                                            payment &&
                                            summarizeInstallments(payment.installments);

                                        return (
                                            <article
                                                key={c.id}
                                                className="card mb-2 shadow-sm"
                                            >
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <h5 className="card-title mb-0">
                                                            {c.event_type}
                                                        </h5>
                                                        {getPaymentBadge(c.payment_status, true)}
                                                    </div>
                                                    <p className="card-text mb-1 small">
                                                        <strong>Fecha:</strong>{" "}
                                                        {formatDateTime(c.datetime)}
                                                    </p>
                                                    <p className="card-text mb-1 small">
                                                        <strong>Lugar:</strong> {c.place || "—"}
                                                    </p>

                                                    {payment && (
                                                        <p className="card-text mb-1 small">
                                                            <strong>Saldo:</strong>{" "}
                                                            {formatCurrency(pending)}
                                                            {installmentsSummary && (
                                                                <>
                                                                    <br />
                                                                    <span className="text-muted">
                                                                        {installmentsSummary.paidCount} de{" "}
                                                                        {installmentsSummary.total} cuotas
                                                                        pagadas
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    )}

                                                    <div className="d-flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            className="btn custom2-upload-btn"
                                                            onClick={() => openDetails(c)}
                                                        >
                                                            Ver detalle
                                                        </button>

                                                        {payment && pending > 0 && (
                                                            <Button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => openPaymentFor(c)}
                                                            >
                                                                Pagar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Paginación (si la usas) */}
                    <div className="col-12 d-flex justify-content-center mt-3">
                        {/* paginación aquí */}
                    </div>
                </div>
            </section>

            {renderDetailModal()}
            {renderPaymentModal()}
        </div>
    );
};

export default Apointment;


// import "../styles/appointment.css";
// import Button from "../../../../components/Home/Button";

// const Apointment = () => {
//     return (
//         <div className="container py-4">
//             <section className="appointment-section">
//                 <div className="row justify-content-center">

//                     {/* Header */}
//                     <div className="col-12">
//                         <div className="appointment-header text-center bg-custom-2 py-3 rounded-3 mb-3">
//                             <h1 className="h4 m-0">Mis Citas</h1>
//                         </div>
//                     </div>

//                     {/* Contenido */}
//                     <div className="col-12 bg-custom-9 p-3 rounded-3">

//                         {/* Botón crear cita */}
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button
//                                 className="btn btn-perfil w-100 w-sm-auto"
//                                 value="Nueva Cita"
//                                 to="/nuevaCita"
//                             >
//                                 <i className="bi bi-plus-circle" /> Nueva Cita
//                             </Button>
//                         </div>

//                         {/* Tabla / Tarjetas responsive */}
//                         <div className="table-responsive-md" role="region" aria-label="Listado de citas">
//                             <table className="table table-hover table-sm align-middle mb-0 rounded-3 overflow-hidden appointment-table">
//                                 <caption className="visually-hidden">Listado de citas</caption>
//                                 <thead className="thead-light bg-custom-2 table-secondary">
//                                     <tr>
//                                         <th scope="col">Tipo de Evento</th>
//                                         <th scope="col">Fecha y Hora</th>
//                                         <th scope="col" className="d-none d-md-table-cell">Lugar</th>
//                                         <th scope="col">Estado reserva</th>
//                                         <th scope="col">Estado de pago</th>
//                                         <th scope="col">Acciones</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody className="bg-custom-2">
//                                     {/* Fila de ejemplo / placeholder */}
//                                     <tr>
//                                         <td data-label="Tipo de Evento">—</td>
//                                         <td data-label="Fecha y Hora">—</td>
//                                         <td data-label="Lugar" className="d-none d-md-table-cell">—</td>
//                                         <td data-label="Estado reserva">aaaa</td>
//                                         <td data-label="Esrado de pago">aaaa</td>
//                                         <td data-label="Acciones">
//                                             <Button
//                                                 value="Ver Detalles"
//                                                 className="btn custom2-upload-btn"
//                                             />
//                                         </td>
//                                     </tr>

//                                     {/*
//                     Aquí colocas tu loop real (React o Blade si renderizas server-side).
//                     Asegúrate de añadir data-label a cada <td> para el modo “tarjeta”:
//                     <td data-label="Tipo de Evento">{cita.tipoEvento}</td> etc.
//                   */}

//                                     {/* Si no hay citas */}
//                                     {/*
//                         <tr>
//                             <td colSpan="6" className="text-center text-muted fst-italic">
//                             No hay citas registradas.
//                             </td>
//                         </tr>
//                   */}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Paginación */}
//                     <div className="col-12 d-flex justify-content-center mt-3">
//                         {/* {!! $citas->links() !!} */}
//                     </div>
//                 </div>
//             </section>
//         </div>
//     );
// };

// export default Apointment;
