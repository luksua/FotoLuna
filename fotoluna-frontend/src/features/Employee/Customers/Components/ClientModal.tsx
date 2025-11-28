import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Tabs, Tab } from "react-bootstrap";
import axios from "axios";

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

const ClientModal: React.FC<ClientModalProps> = ({
    show,
    onClose,
    clientId,
    name,
    image,
}) => {
    const [details, setDetails] = useState<ClientDetailsResponse | null>(null);
    const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

    useEffect(() => {
        if (!show || !clientId) return;

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_URL}/customers/${clientId}`, {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                });

                const data: ClientDetailsResponse = response.data;

                setDetails(data);
                setBookings(data.bookings || []);
                setPayments(data.payments || []);

                const appRows: AppointmentRow[] = (data.appointments || []).map(
                    (a: any) => {
                        const firstBooking = (a.bookings && a.bookings[0]) || null;

                        return {
                            id: a.id,
                            date: a.date,
                            time: a.time,
                            place: a.place,
                            status: a.status,
                            comment: a.comment,
                            eventType: a.eventType,
                            packageName: firstBooking?.package?.name ?? null,
                            packagePrice: firstBooking?.package?.price ?? null,
                            employeeName: firstBooking?.employee?.name ?? null,
                        };
                    }
                );

                setAppointments(appRows);
            } catch (err) {
                console.error("Error cargando detalles del cliente", err);
                setError("No se pudo cargar la información del cliente.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [show, clientId]);

    // ⭐ Determinar si tiene citas
    const hasAppointments = appointments.length > 0;

    return (
        <>
            <Modal show={show} onHide={onClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Cliente</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Tabs defaultActiveKey="info" className="mb-3">

                        {/* INFORMACIÓN */}
                        <Tab eventKey="info" title="Información">
                            <div className="text-center mb-3">
                                <img
                                    src={image || "https://via.placeholder.com/150?text=Sin+Foto"}
                                    alt={name}
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "3px solid #d4a6f4",
                                    }}
                                />
                                <h5 className="mt-2">{name}</h5>

                                {details && (
                                    <div className="mt-3 text-start mx-auto" style={{ maxWidth: 400 }}>
                                        <p><strong>Documento:</strong>
                                            {details.documentType
                                                ? `${details.documentType} ${details.documentNumber ?? ""}`
                                                : details.documentNumber ?? "No registrado"}
                                        </p>
                                        <p><strong>Teléfono:</strong> {details.phone || "No registrado"}</p>
                                        <p><strong>Correo:</strong> {details.email || "No registrado"}</p>
                                    </div>
                                )}
                            </div>
                        </Tab>

                        {/* CITAS */}
                        <Tab eventKey="citas" title="Citas">
                            {loading && <p className="text-center">Cargando...</p>}
                            {error && <p className="text-danger text-center">{error}</p>}

                            {!loading && !error && (
                                appointments.length ? (
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Evento</th>
                                                <th>Lugar</th>
                                                <th>Estado</th>
                                                <th>Comentarios</th>
                                                <th>Paquete</th>
                                                <th>Precio</th>
                                                <th>Empleado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map((a) => (
                                                <tr key={a.id}>
                                                    <td>{a.date}</td>
                                                    <td>{a.time}</td>
                                                    <td>{a.eventType || "-"}</td>
                                                    <td>{a.place || "-"}</td>
                                                    <td>{a.status || "-"}</td>
                                                    <td>{a.comment || "-"}</td>
                                                    <td>{a.packageName || "-"}</td>
                                                    <td>{a.packagePrice ? `$${a.packagePrice}` : "-"}</td>
                                                    <td>{a.employeeName || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted text-center">Sin citas registradas.</p>
                                )
                            )}
                        </Tab>

                        {/* SESIONES */}
                        <Tab eventKey="sesiones" title="Sesiones">
                            {bookings.length ? (
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Hora</th>
                                            <th>Evento</th>
                                            <th>Paquete</th>
                                            <th>Precio</th>
                                            <th>Empleado</th>
                                            <th>Estado</th>
                                            <th>Pagado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.id}>
                                                <td>{b.date}</td>
                                                <td>{b.time}</td>
                                                <td>{b.eventType || "-"}</td>
                                                <td>{b.packageName || "-"}</td>
                                                <td>{b.packagePrice ? `$${b.packagePrice}` : "-"}</td>
                                                <td>{b.employee || "-"}</td>
                                                <td>{b.status}</td>
                                                <td>{b.totalPaid ? `$${b.totalPaid}` : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted text-center">Sin sesiones registradas.</p>
                            )}
                        </Tab>

                        {/* PAGOS */}
                        <Tab eventKey="pagos" title="Pagos">
                            {payments.length ? (
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Booking</th>
                                            <th>Monto</th>
                                            <th>Método</th>
                                            <th>Estado</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.bookingId}</td>
                                                <td>${p.amount}</td>
                                                <td>{p.method || "-"}</td>
                                                <td>{p.status || "-"}</td>
                                                <td>
                                                    {p.paidAt
                                                        ? new Date(p.paidAt).toLocaleString("es-ES")
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted text-center">Sin pagos registrados.</p>
                            )}
                        </Tab>
                    </Tabs>
                </Modal.Body>

                {/* FOOTER → botón dinámico */}
                <Modal.Footer>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: "#b47bd3", border: "none" }}
                        onClick={() => setShowAppointmentsModal(true)}
                    >
                        {hasAppointments ? "Registrar nueva cita" : "Crear primera cita"}
                    </Button>

                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Aquí irá tu AppointmentModal real */}
            {showAppointmentsModal && (
                <div className="modal-fullscreen">
                    <Button
                        className="btn btn-danger position-fixed top-0 end-0 m-3"
                        onClick={() => setShowAppointmentsModal(false)}
                    >
                        Cerrar calendario
                    </Button>
                </div>
            )}
        </>
    );
};

export default ClientModal;
