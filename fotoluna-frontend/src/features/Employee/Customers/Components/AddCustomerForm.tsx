import React, { useState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

interface AddCustomerFormProps {
    onSuccess: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onSuccess }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [documentType, setDocumentType] = useState("CC");
    const [documentNumber, setDocumentNumber] = useState("");
    const [password, setPassword] = useState(""); // clave inicial del cliente

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !email || !password) {
            setError("Nombre, correo y contraseña son obligatorios.");
            return;
        }

        try {
            setLoading(true);

            // Intentamos obtener el usuario logueado desde localStorage
            let createdByUserId: number | undefined;
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    if (user?.id) {
                        createdByUserId = user.id;
                    }
                } catch {
                    // si falla el parse, simplemente no enviamos el id
                }
            }

            const token = localStorage.getItem("token");

            const payload: any = {
                role: "cliente",
                name,
                email,
                password,
                phoneCustomer: phone,
                documentType,
                documentNumber,
            };

            if (createdByUserId) {
                payload.created_by_user_id = createdByUserId;
            }

            await axios.post(`${API_URL}/register`, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            // si todo sale bien
            onSuccess();
        } catch (err: any) {
            console.error("Error registrando cliente", err);
            const message =
                err?.response?.data?.message ||
                "Ocurrió un error al registrar el cliente.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group controlId="customerName">
                        <Form.Label>Nombre completo</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del cliente"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="customerEmail">
                        <Form.Label>Correo</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group controlId="customerPhone">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Teléfono"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="customerPassword">
                        <Form.Label>Contraseña inicial</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Contraseña para el cliente"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group controlId="customerDocType">
                        <Form.Label>Tipo de documento</Form.Label>
                        <Form.Select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                        >
                            <option value="CC">CC</option>
                            <option value="CE">CE</option>
                            <option value="PAS">PAS</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col md={8}>
                    <Form.Group controlId="customerDocNumber">
                        <Form.Label>Número de documento</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Documento"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <div className="d-flex justify-content-end">
                <Button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: "#8c2db0", border: "none" }}
                >
                    {loading ? "Guardando..." : "Registrar cliente"}
                </Button>
            </div>
        </Form>
    );
};

export default AddCustomerForm;
