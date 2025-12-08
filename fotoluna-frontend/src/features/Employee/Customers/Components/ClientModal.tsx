import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal, Button, Table, Tabs, Tab } from "react-bootstrap";
import { ThreeDotsVertical } from "react-bootstrap-icons";
// 1. IMPORTAR HOOK DE NAVEGACIÓN
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClientGallery from "./ClientGallery";
import "../Styles/ClientModal.css";

const API_URL = "http://localhost:8000/api";

interface AppointmentRow {
    id: number;
    date: string;
    time: string;
    place?: string;
    status?: string;
    comment?: string;
    eventType?: string;
    packageName?: string | null;
    packagePrice?: number | null;
    employeeName?: string | null;
}

interface BookingRow {
    id: number;
    status: string;
    date: string;
    time: string;
    eventType?: string;
    packageName?: string | null;
    packagePrice?: number | null;
    employee?: string | null;
    totalPaid?: number | null;
}

interface PaymentRow {
    id: number;
    bookingId: number;
    amount: number;
    method?: string;
    status?: string;
    paidAt?: string;
}

interface ClientDetailsResponse {
    documentNumber?: string;
    documentType?: string;
    email?: string;
    phone?: string;
    appointments: any[];
    bookings: BookingRow[];
    payments: PaymentRow[];
}

interface ClientModalProps {
    show: boolean;
    onClose: () => void;
    clientId: number | null;
    name: string;
    image?: string;
}

const ClientModal: React.FC<ClientModalProps> = React.memo(({
    show,
    onClose,
    clientId,
    name,
    image,
}) => {
    // 2. INICIALIZAR NAVIGATE
    const navigate = useNavigate();
    // Scroll styles ajustados
    const tableScrollStyle: React.CSSProperties = { maxHeight: "50vh", overflowY: "auto", paddingRight: '5px' };

    const [details, setDetails] = useState<ClientDetailsResponse | null>(null);

    const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!clientId) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/customers/${clientId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const data: ClientDetailsResponse = response.data;
            setDetails(data);
            setBookings(data.bookings || []);
            setPayments(data.payments || []);

            const appRows: AppointmentRow[] = (data.appointments || []).map((a: any) => ({
                id: a.id,
                date: a.date,
                time: a.time,
                place: a.place,
                status: a.status,
                comment: a.comment,
                eventType: a.eventType,
                packageName: a.bookings?.[0]?.package?.name ?? null,
                packagePrice: a.bookings?.[0]?.package?.price ?? null,
                employeeName: a.bookings?.[0]?.employee?.name ?? null,
            }));
            setAppointments(appRows);
        } catch (err) {
            console.error("Error cargando detalles", err);
            setError("No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        if (show) fetchDetails();
    }, [show, fetchDetails]);

    // 1. Encontrar Próxima Cita
    const nextAppointment = useMemo(() => {
        const now = new Date();
        const upcoming = appointments
            .filter(a => new Date(`${a.date}T${a.time}`) >= now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        return upcoming.length > 0 ? upcoming[0] : null;
    }, [appointments]);

    // 2. Calcular Balance
    const totalBalance = useMemo(() => {
        return payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    }, [payments]);

    // 3. Helper para colores de estado
    const getStatusThemeClass = (status: string | undefined) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('confirm')) return 'theme-purple';
        if (s.includes('pendient') || s.includes('scheduled')) return 'theme-orange';
        return 'theme-gray';
    };
    /// 👈 4. FUNCIÓN PARA REDIRECCIONAR
    const handleNewAppointmentClick = () => {
        // Cerramos el modal actual
        onClose();
        
        // Navegamos a la ruta de citas (Ajusta "/citas" si tu ruta es diferente, ej: "/employee/appointments")
        // Enviamos el estado para que la página de destino sepa qué cliente pre-seleccionar
        navigate("/employee/appointments", { 
            state: { 
                preSelectedClient: { 
                    id: clientId, 
                    name: name 
                } 
            } 
        });
    };

    return (
        <>
            <Modal show={show} onHide={onClose} centered size="lg" className="client-modal" scrollable>
                <Modal.Body className="position-relative p-4">
                    <button
                        type="button"
                        className="btn-close custom-close-btn"
                        aria-label="Close"
                        onClick={onClose}
                    ></button>

                    <div className="profile-header-container mt-2">
                        <img
                            src={image || "https://ui-avatars.com/api/?name=" + name + "&background=b47bd3&color=fff"}
                            alt={name}
                            className="client-avatar-large"
                        />
                        <div className="client-info">
                            <h4>{name}</h4>
                            <div className="client-meta">
                                <span>
                                    <i className="bi bi-person-vcard"></i>
                                    {details?.documentType} {details?.documentNumber || "N/A"}
                                </span>
                                <span>
                                    <i className="bi bi-telephone"></i>
                                    {details?.phone || "Sin teléfono"}
                                </span>
                                <span>
                                    <i className="bi bi-envelope"></i>
                                    {details?.email || "Sin correo"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultActiveKey="info" className="custom-tabs mb-3">

                        <Tab eventKey="info" title="Información">
                            <div className="info-grid">
                                <div className="info-card">
                                    <div>
                                        <div className="card-label">Próxima Cita</div>
                                        <div className="card-value">
                                            {nextAppointment ? new Date(nextAppointment.date + "T00:00:00").toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : "Sin citas próximas"}
                                        </div>
                                        <div className="card-subtext">
                                            {nextAppointment?.time ? nextAppointment.time.substring(0, 5) : "--:--"}
                                        </div>
                                    </div>
                                    {nextAppointment && <span className="status-badge status-confirmed">Confirmado</span>}
                                </div>

                                <div className="info-card">
                                    <div>
                                        <div className="card-label">Estado de Pagos</div>
                                        <div className="d-flex align-items-end gap-2">
                                            <div className="total-balance">${totalBalance.toLocaleString()}</div>
                                            <div className="text-muted small mb-1">(Total Pagado)</div>
                                        </div>
                                    </div>
                                    <div className="card-subtext mt-1">
                                        Último pago: {payments.length > 0 && payments[0].paidAt ? new Date(payments[0].paidAt).toLocaleDateString() : "-"}
                                    </div>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="citas" title="Citas">
                            {/* Mensaje de error si existe */}
                            {error && <div className="alert alert-danger py-2 mb-3 small">{error}</div>}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <p className="mt-2 text-muted small">Cargando...</p>
                                </div>
                            ) : (
                                /* 👇 ESTE WRAPPER ES LA CLAVE DEL FONDO GRIS */
                                <div className="appointments-bg-wrapper" style={{ maxHeight: "55vh", overflowY: "auto" }}>

                                    {appointments.length > 0 ? (
                                        appointments.map((a) => {
                                            const dateObj = new Date(a.date + "T00:00:00");
                                            const day = dateObj.getDate();
                                            const month = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                                            const year = dateObj.getFullYear();
                                            const themeClass = getStatusThemeClass(a.status);

                                            return (
                                                <div key={a.id} className={`appointment-card ${themeClass}`}>
                                                    {/* 1. Caja de Fecha Coloreada */}
                                                    <div className="date-box">
                                                        <span className="date-day">{day < 10 ? `0${day}` : day}</span>
                                                        <span className="date-month">{month}</span>
                                                        <span className="date-year">{year}</span>
                                                    </div>

                                                    {/* 2. Detalles */}
                                                    <div className="details-box flex-grow-1 d-flex align-items-center">
                                                        {/* Hora */}
                                                        <div className="me-4 me-md-5">
                                                            <div className="card-label-small">Hora</div>
                                                            <div className="card-value-text">
                                                                {a.time ? a.time.substring(0, 5) : '--:--'}
                                                            </div>
                                                        </div>
                                                        {/* Evento */}
                                                        <div className="flex-grow-1">
                                                            <div className="card-label-small">Evento</div>
                                                            <div className="card-value-text text-truncate" style={{ maxWidth: '200px' }}>
                                                                {a.eventType || "Sesión General"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 3. Estado y Menú */}
                                                    <div className="d-flex align-items-center pe-3">
                                                        <div className="text-end me-3 d-none d-sm-block">
                                                            <div className="card-label-small">Estado</div>
                                                            <span className="status-badge">
                                                                {a.status || "Pendiente"}
                                                            </span>
                                                        </div>
                                                        <button className="btn btn-link text-muted p-1">
                                                            <ThreeDotsVertical size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-5 text-muted opacity-50">
                                            <i className="bi bi-calendar-plus display-1"></i>
                                            <p className="mt-3">No hay citas registradas para este cliente.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Tab>

                        <Tab eventKey="sesiones" title="Sesiones">
                            {/* Usamos el mismo wrapper gris para mantener el diseño consistente */}
                            <div className="appointments-bg-wrapper" style={{ maxHeight: "55vh", overflowY: "auto" }}>
                                {bookings.length > 0 ? (
                                    bookings.map((b) => {
                                        // 1. Procesar Fecha
                                        const dateObj = new Date(b.date + "T00:00:00");
                                        const day = dateObj.getDate();
                                        const month = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                                        const year = dateObj.getFullYear();

                                        // 2. Lógica de Colores (Tema Rosa si debe dinero, Morado si está al día)
                                        // Asumimos que si no hay precio, está al día.
                                        const price = b.packagePrice || 0;
                                        const paid = b.totalPaid || 0;
                                        const isDebt = paid < price;

                                        // Si debe dinero usa el tema 'pink', si no, 'purple'
                                        const themeClass = isDebt ? 'theme-pink' : 'theme-purple';

                                        return (
                                            <div key={b.id} className={`appointment-card ${themeClass}`}>
                                                {/* --- CAJA DE FECHA --- */}
                                                <div className="date-box">
                                                    <span className="date-day">{day < 10 ? `0${day}` : day}</span>
                                                    <span className="date-month">{month}</span>
                                                    <span className="date-year">{year}</span>
                                                </div>

                                                {/* --- DETALLES DEL PAQUETE --- */}
                                                <div className="details-box flex-grow-1 d-flex flex-column justify-content-center">
                                                    <div className="card-label-small">Paquete</div>
                                                    <div className="package-name text-truncate">
                                                        {b.packageName || "Sesión Estándar"}
                                                    </div>
                                                    {b.employee && (
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                            <i className="bi bi-person-fill me-1"></i>
                                                            {b.employee}
                                                        </small>
                                                    )}
                                                </div>

                                                {/* --- FINANZAS (Precio y Pagado) --- */}
                                                <div className="d-flex flex-column justify-content-center align-items-end pe-3" style={{ minWidth: '110px' }}>
                                                    <div className="card-label-small">Finanzas</div>

                                                    {/* Precio Total */}
                                                    <div className="price-tag">
                                                        ${price.toLocaleString()}
                                                    </div>

                                                    {/* Lo que ha pagado */}
                                                    <div className={isDebt ? "pending-tag" : "paid-tag"}>
                                                        Pagado: ${paid.toLocaleString()}
                                                    </div>
                                                </div>


                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-5 text-muted opacity-50">
                                        <i className="bi bi-camera display-4"></i>
                                        <p className="mt-3">No hay sesiones registradas.</p>
                                    </div>
                                )}
                            </div>
                        </Tab>

                        <Tab eventKey="pagos" title="Pagos">
                            {/* Wrapper gris para el efecto de tarjetas flotantes */}
                            <div className="appointments-bg-wrapper" style={{ maxHeight: "55vh", overflowY: "auto" }}>
                                {payments.length > 0 ? (
                                    payments.map((p) => {
                                        // 1. Procesar Fecha
                                        // Si no hay fecha de pago, usamos la fecha actual por defecto o mostramos aviso
                                        const dateObj = p.paidAt ? new Date(p.paidAt) : new Date();
                                        const day = dateObj.getDate();
                                        const month = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                                        const year = dateObj.getFullYear();

                                        // 2. Icono según método (Lógica visual simple)
                                        const isCard = p.method?.toLowerCase().includes('card') || p.method?.toLowerCase().includes('tarjeta');
                                        const methodIcon = isCard ? "bi-credit-card-2-front" : "bi-cash-coin";

                                        return (
                                            <div key={p.id} className="appointment-card theme-purple">
                                                {/* --- CAJA DE FECHA (Siempre Lila para pagos exitosos) --- */}
                                                <div className="date-box">
                                                    <span className="date-day">{day < 10 ? `0${day}` : day}</span>
                                                    <span className="date-month">{month}</span>
                                                    <span className="date-year">{year}</span>
                                                </div>

                                                {/* --- DETALLES DEL PAGO --- */}
                                                <div className="details-box flex-grow-1 d-flex flex-column justify-content-center">
                                                    <div className="card-label-small">Método de Pago</div>
                                                    <div>
                                                        <span className="payment-method-badge">
                                                            <i className={`bi ${methodIcon}`}></i>
                                                            {p.method || "Efectivo"}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className="ref-text">Ref. Booking #{p.bookingId}</span>
                                                    </div>
                                                </div>

                                                {/* --- MONTO (A la derecha) --- */}
                                                <div className="d-flex flex-column justify-content-center align-items-end pe-4">
                                                    <div className="card-label-small">Monto Recibido</div>
                                                    <div className="amount-highlight">
                                                        +${Number(p.amount).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-5 text-muted opacity-50">
                                        <i className="bi bi-wallet2 display-4"></i>
                                        <p className="mt-3">No hay pagos registrados.</p>
                                    </div>
                                )}
                            </div>
                        </Tab>

                        <Tab eventKey="fotos" title="Fotos">
                            <ClientGallery clientId={clientId} />
                        </Tab>
                    </Tabs>
                </Modal.Body>

                <Modal.Footer className="py-2 px-4">
                    <Button variant="light" className="btn-custom-secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button
                        className="btn-custom-primary"
                        onClick={handleNewAppointmentClick} // 👈 5. USAR LA NUEVA FUNCIÓN AQUÍ
                    >
                        {appointments.length > 0 ? "+ Nueva cita" : "Crear cita"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {showAppointmentsModal && (
                <div className="modal-fullscreen-overlay">
                    <Button variant="danger" size="sm" style={{ position: 'fixed', top: 15, right: 15, zIndex: 9999 }} onClick={() => setShowAppointmentsModal(false)}>Cerrar</Button>
                </div>
            )}
        </>
    );
});

export default ClientModal;