/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import "../styles/appointment.css";
import Button from "../../../../components/Home/Button";
import axios from "axios";
import AppointmentFormStep4PaymentEmbedded from "./AppointmentFormStep4Payment";
import { useNavigate } from "react-router-dom";

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
    id: number;                 // appointmentId
    booking_id: number | null;  // bookingId
    event_type: string;
    package: string;
    datetime: string;
    place?: string | null;
    reservation_status: string;
    payment_status: string;
    document_types: DocumentType[];
    payment?: Payment | null;
    created_at?: string | null;
    appointment_status?: string | null;
};

const Apointment: React.FC = () => {
    const navigate = useNavigate();

    // paginación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);

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

    const getPageNumbers = (current: number, last: number, delta = 1): (number | string)[] => {
        const pages: (number | string)[] = [];

        if (last <= 1) return [1];

        const left = Math.max(2, current - delta);
        const right = Math.min(last - 1, current + delta);

        pages.push(1);

        if (left > 2) {
            pages.push("left-ellipsis");
        }

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        if (right < last - 1) {
            pages.push("right-ellipsis");
        }

        if (last > 1) {
            pages.push(last);
        }

        return pages;
    };

    const fetchAppointments = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/api/appointments-customer`, {
                headers: getAuthHeaders(),
                params: { page },
            });

            const payload = res.data;
            const items = Array.isArray(payload) ? payload : payload.data ?? [];

            setAppointments(items);
            if (!Array.isArray(payload)) {
                setCurrentPage(payload.current_page ?? 1);
                setLastPage(payload.last_page ?? 1);
            }
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

    const handlePageChange = (page: number) => {
        if (page < 1 || page > lastPage || page === currentPage) return;
        fetchAppointments(page);
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
        return d.toLocaleString("es-CO", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    // 🔸 Cita incompleta para el wizard
    // Regla: cualquier cita en estado "draft" / "borrador" creada en las últimas 24h
    // (sin importar si ya tiene booking o no).
    const isWizardIncomplete = (a: Appointment) => {
        const statusLower = (
            a.appointment_status ??
            a.reservation_status ??
            ""
        ).toLowerCase();

        const isDraftLike =
            statusLower === "draft" ||
            statusLower === "borrador";

        if (!isDraftLike) return false;

        // Si no hay created_at o es raro, la consideramos reciente para no perder el banner
        if (!a.created_at) return true;
        const createdMs = new Date(a.created_at).getTime();
        if (Number.isNaN(createdMs)) return true;

        const diffMs = Date.now() - createdMs;
        const oneDayMs = 24 * 60 * 60 * 1000;

        return diffMs < oneDayMs;
    };

    const getFirstIncompleteAppointment = (): Appointment | null =>
        appointments.find(isWizardIncomplete) ?? null;

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

    const getInstallmentBadge = (ins: Installment) => {
        let cls = "status-pill ";
        let label = "";

        if (ins.paid) {
            cls += "paid";
            label = "Pagada";
        } else if (ins.is_overdue) {
            cls += "expired";
            label = "Vencida";
        } else {
            cls += "pending";
            label = "Pendiente";
        }

        return (
            <span
                className={cls + " sm"}
                role="status"
                aria-label={`Estado de la cuota: ${label}`}
            >
                {label}
            </span>
        );
    };

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

    const openPaymentFor = (a: Appointment, installment?: Installment) => {
        if (!a.payment) {
            alert("No hay información de pago asociada a esta cita.");
            return;
        }

        setPaymentBookingId(a.booking_id);

        if (installment) {
            setPaymentTotal(installment.amount);
            setPaymentInstallmentId(installment.id);
        } else {
            const pending = calcPending(a.payment);
            setPaymentTotal(pending);
            setPaymentInstallmentId(null);
        }

        let email: string | null = null;

        if (a.payment?.payer?.email) {
            email = a.payment.payer.email;
        }

        if (!email) {
            email = localStorage.getItem("user_email");
        }

        if (!email) {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            email = userData.emailCustomer || userData.email || null;
        }

        if (!email) {
            alert("No se encontró tu correo. Por favor vuelve a iniciar sesión.");
            return;
        }

        setPaymentEmail(email);
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentBookingId(null);
        setPaymentTotal(null);
        setPaymentEmail("");
        setPaymentInstallmentId(null);
    };

    const onPaymentSuccess = () => {
        fetchAppointments();
        closePaymentModal();
        closeDetails();
    };

    const handleDownloadBookingReceipt = async (bookingId: number) => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE}/api/bookings/${bookingId}/receipt`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
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
            console.error("Error descargando recibo general:", err);
            alert("No se pudo descargar el recibo.");
        }
    };

    const handleDownloadInstallmentReceipt = async (
        appointmentId: number,
        installmentId: number
    ) => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE}/api/appointments/${appointmentId}/installments/${installmentId}/receipt`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        Accept: "application/pdf",
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `recibo-cuota-${installmentId}-FL-${appointmentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error descargando recibo de cuota:", err);
            alert("No se pudo descargar el recibo de esta cuota.");
        }
    };

    const renderDetailModal = () => {
        if (!showModal || !active) return null;

        const payment = active.payment;
        const pending = payment ? calcPending(payment) : 0;
        const isFullyPaid = !!payment && pending === 0;

        return (
            <div
                className="custom-modal-overlay"
                role="dialog"
                aria-modal="true"
                onClick={closeDetails}
            >
                <div
                    className="custom-modal bg-custom-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title">
                                Historial de pagos y cuotas
                            </h5>
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
                                <div className="row g-2 mb-4 mt-1">
                                    <div className="col-12 col-md-4">
                                        <div className="shadow p-2 rounded bg-light h-100">
                                            <small className="text-muted d-block">
                                                Total del servicio
                                            </small>
                                            <strong>{formatCurrency(payment.total)}</strong>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="shadow p-2 rounded bg-light h-100">
                                            <small className="text-muted d-block">
                                                Pagado
                                            </small>
                                            <strong>{formatCurrency(payment.paid)}</strong>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="shadow p-2 rounded bg-light h-100">
                                            <small className="text-muted d-block">
                                                Saldo pendiente
                                            </small>
                                            <strong>{formatCurrency(pending)}</strong>
                                        </div>
                                    </div>
                                </div>

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
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payment.installments.map((ins, index) => {
                                                    const isPaid = ins.paid;

                                                    return (
                                                        <tr key={ins.id}>
                                                            <td>{index + 1}</td>

                                                            <td>
                                                                {new Date(
                                                                    ins.due_date
                                                                ).toLocaleDateString("es-CO", {
                                                                    dateStyle: "medium",
                                                                })}
                                                            </td>

                                                            <td>{formatCurrency(ins.amount)}</td>

                                                            <td>{getInstallmentBadge(ins)}</td>

                                                            <td>
                                                                {isPaid ? (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() =>
                                                                            handleDownloadInstallmentReceipt(
                                                                                active.id,
                                                                                ins.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="bi bi-receipt me-1" />
                                                                        Ver recibo
                                                                    </button>
                                                                ) : (
                                                                    <Button
                                                                        className="btn btn-sm custom-upload-btn"
                                                                        onClick={() => openPaymentFor(active, ins)}
                                                                    >
                                                                        <i className="bi bi-credit-card me-1" />
                                                                        Pagar
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
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        {active.booking_id &&
                            payment &&
                            isFullyPaid && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary me-auto"
                                    onClick={() => handleDownloadBookingReceipt(active.booking_id!)}
                                >
                                    <i className="bi bi-receipt me-1" />
                                    Recibo general
                                </button>
                            )}

                        <Button className="btn custom2-upload-btn" onClick={closeDetails}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPaymentModal = () => {
        if (!showPaymentModal || paymentBookingId == null || paymentTotal == null) {
            return null;
        }

        return (
            <div
                className="custom-modal-overlay"
                role="dialog"
                aria-modal="true"
                onClick={closePaymentModal}
            >
                <div
                    className="custom-modal bg-custom-2 large-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h5 className="modal-title">Pagar servicio</h5>
                        <button
                            type="button"
                            className="btn-close modal-close-x"
                            aria-label="Cerrar"
                            onClick={closePaymentModal}
                        />
                    </div>
                    <div className="modal-body  bg-custom-2">
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

    const incompleteAppointment = getFirstIncompleteAppointment();

    return (
        <div className="container py-4">
            <section className="appointment-section">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="appointment-header text-center bg-custom-2 py-3 rounded-3 mb-3">
                            <h1 className="h4 m-0">Mis Reservas</h1>
                        </div>
                    </div>

                    <div className="col-12 bg-custom-9 p-3 rounded-3">
                        <div className="d-flex justify-content-end mb-3">
                            <Button
                                className="btn btn-perfil w-100 w-sm-auto"
                                value="Nueva Cita"
                                to="/nuevaCita"
                            >
                                <i className="bi bi-plus-circle" /> Nueva Cita
                            </Button>
                        </div>

                        {loading && <div className="text-center py-3">Cargando citas…</div>}
                        {error && <div className="alert alert-danger mb-3">{error}</div>}

                        {!loading && !error && incompleteAppointment && (
                            <div className="alert alert-warning d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                                <div>
                                    <strong>Tienes una reserva sin completar.</strong>
                                    <br />
                                    Recuerda que tienes hasta <strong>24 horas</strong> para completar el pago
                                    y asegurar tu cupo. Si no lo haces, la fecha y hora podrían liberarse.
                                </div>
                                <div className="mt-2 mt-md-0">
                                    <Button
                                        className="btn btn-sm btn-perfil"
                                        value="Continuar reserva"
                                        onClick={() =>
                                            navigate("/nuevaCita", {
                                                state: { appointmentId: incompleteAppointment.id },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
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
                                                <th scope="col">Reserva</th>
                                                <th scope="col">Paquete</th>
                                                <th scope="col">Fecha y Hora</th>
                                                <th scope="col">Estado reserva</th>
                                                <th scope="col">Pago</th>
                                                <th scope="col">Saldo</th>
                                                <th scope="col">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-custom-2">
                                            {appointments.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="text-center text-muted fst-italic">
                                                        No hay citas registradas.
                                                    </td>
                                                </tr>
                                            )}

                                            {appointments.map((c) => {
                                                const payment = c.payment;
                                                const pending = payment ? calcPending(payment) : 0;
                                                const incomplete = isWizardIncomplete(c);

                                                return (
                                                    <tr key={c.id}>
                                                        <td data-label="Reserva">
                                                            <div className="fw-semibold">
                                                                {c.event_type}
                                                            </div>
                                                            <div className="small text-muted">
                                                                #{c.id}
                                                                {c.place ? ` · ${c.place}` : ""}
                                                            </div>
                                                        </td>
                                                        <td data-label="Paquete">{c.package}</td>
                                                        <td data-label="Fecha y Hora">
                                                            {formatDateTime(c.datetime)}
                                                        </td>
                                                        <td
                                                            data-label="Estado reserva"
                                                            className={
                                                                incomplete
                                                                    ? "estado-reserva estado-reserva--incomplete"
                                                                    : "estado-reserva"
                                                            }
                                                        >
                                                            <span className="estado-reserva__label">
                                                                {c.reservation_status}
                                                            </span>

                                                            {incomplete && (
                                                                <span
                                                                    className="estado-reserva__badge"
                                                                    title="Tienes hasta 24 horas para completar el pago y asegurar tu cupo."
                                                                >
                                                                    <i className="bi bi-exclamation-triangle-fill me-1" />
                                                                    Completar en &lt; 24h
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td data-label="Pago">
                                                            {getPaymentBadge(c.payment_status)}
                                                        </td>
                                                        <td data-label="Saldo">
                                                            {payment ? (
                                                                <>{formatCurrency(pending)}</>
                                                            ) : (
                                                                <span className="text-muted">
                                                                    Sin información
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td data-label="Acciones">
                                                            <div className="d-flex flex-column gap-1">
                                                                {incomplete ? (
                                                                    <Button
                                                                        value="Continuar"
                                                                        className="btn custom-upload-btn"
                                                                        onClick={() =>
                                                                            navigate("/nuevaCita", {
                                                                                state: { appointmentId: c.id },
                                                                            })
                                                                        }
                                                                    >
                                                                        Continuar
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        value="Ver detalle"
                                                                        className="btn custom2-upload-btn"
                                                                        onClick={() => openDetails(c)}
                                                                    >
                                                                        Ver detalle
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

                                <div className="d-md-none mt-3">
                                    {appointments.map((c) => {
                                        const payment = c.payment;
                                        const pending = payment ? calcPending(payment) : 0;
                                        const installmentsSummary =
                                            payment && summarizeInstallments(payment.installments);

                                        const incomplete = isWizardIncomplete(c);

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

                                                    {incomplete && (
                                                        <p className="card-text mb-1 small text-warning">
                                                            Tienes 24 horas para completar el pago y asegurar tu cupo.
                                                        </p>
                                                    )}

                                                    {payment && (
                                                        <p className="card-text mb-1 small">
                                                            <strong>Saldo:</strong>{" "}
                                                            {formatCurrency(pending)}
                                                            {installmentsSummary && (
                                                                <>
                                                                    <br />
                                                                    <span className="text-muted">
                                                                        {installmentsSummary.paidCount} de{" "}
                                                                        {installmentsSummary.total} cuotas pagadas
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    )}

                                                    <div className="d-flex gap-2 mt-2">
                                                        {incomplete ? (
                                                            <Button
                                                                className="btn custom-upload-btn"
                                                                onClick={() =>
                                                                    navigate("/nuevaCita", {
                                                                        state: { appointmentId: c.id },
                                                                    })
                                                                }
                                                            >
                                                                Continuar
                                                            </Button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn custom2-upload-btn"
                                                                onClick={() => openDetails(c)}
                                                            >
                                                                Ver detalle
                                                            </button>
                                                        )}

                                                        {payment && pending > 0 && !incomplete && (
                                                            <Button
                                                                className="btn btn-sm custom-upload-btn"
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

                    <div className="col-12 d-flex justify-content-center mt-3">
                        {lastPage > 1 && (
                            <nav
                                className="admin-pagination"
                                aria-label="Paginación de reservas"
                            >
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    &larr;
                                </button>

                                {getPageNumbers(currentPage, lastPage, 1).map((item, index) => {
                                    if (item === "left-ellipsis" || item === "right-ellipsis") {
                                        return (
                                            <button
                                                key={`${item}-${index}`}
                                                className="ellipsis"
                                                disabled
                                            >
                                                …
                                            </button>
                                        );
                                    }

                                    const page = item as number;

                                    return (
                                        <button
                                            key={page}
                                            className={page === currentPage ? "active" : ""}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === lastPage}
                                >
                                    &rarr;
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </section>

            {renderDetailModal()}
            {renderPaymentModal()}
        </div>
    );
};

export default Apointment;
