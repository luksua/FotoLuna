import React, { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { AppointmentModal } from "../ApointmentsEmploye"; // Ajusta ruta

interface Reservation {
    id: number;
    date: string;
    service: string;
}

interface ClientModalProps {
    show: boolean;
    onClose: () => void;
    name: string;
    image?: string;
    reservations?: Reservation[];
}

const ClientModal: React.FC<ClientModalProps> = ({
    show,
    onClose,
    name,
    image,
    reservations = [],
}) => {
    const [showAppointments, setShowAppointments] = useState(false);

    return (
        <>
            <Modal show={show} onHide={onClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                    </div>

                    <h6 className="fw-bold">Reservas</h6>
                    {reservations.length > 0 ? (
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Servicio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.date}</td>
                                        <td>{r.service}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="text-muted text-center">Sin reservas registradas.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: "#b47bd3", border: "none" }}
                        onClick={() => setShowAppointments(true)}
                    >
                        Registrar nueva cita
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Reutiliza tu componente de citas */}
            {showAppointments && (
                <div className="modal-fullscreen">
                    <AppointmentModal />
                    <Button
                        className="btn btn-danger position-fixed top-0 end-0 m-3"
                        onClick={() => setShowAppointments(false)}
                    >
                        Cerrar calendario
                    </Button>
                </div>
            )}
        </>
    );
};

export default ClientModal;
