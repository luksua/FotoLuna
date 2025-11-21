import React, { useState, type ChangeEvent } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import MonthSection from "../Components/MonthSection";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";

interface Client {
    name: string;
    image?: string;
}

interface ClientsByMonth {
    [month: string]: Client[];
}

const EmployeeCustomers = () => {
    const [clientsByMonth, setClientsByMonth] = useState<ClientsByMonth>({

        Enero: [
            { name: "Crosty" },
            { name: "Carlos" },
            { name: "David" },
            { name: "Santiago" },
        ],
        Febrero: [
            { name: "Valen", image: "https://via.placeholder.com/150" },
            { name: "Danna" },
            { name: "Joan", image: "https://via.placeholder.com/150" },
            { name: "Axel" },
        ],
    });

    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({
        name: "",
        month: "Enero",
        image: "",
        imageFile: null as File | null,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState("Todos");

    // ✅ Convertir imagen a URL temporal
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewClient({
                ...newClient,
                imageFile: file,
                image: URL.createObjectURL(file),
            });
        }
    };

    // ✅ Agregar nuevo cliente
    const handleAddClient = () => {
        if (!newClient.name || !newClient.month)
            return alert("Completa el nombre y el mes.");

        setClientsByMonth((prev) => {
            const updated = { ...prev };
            if (!updated[newClient.month]) updated[newClient.month] = [];
            updated[newClient.month].push({
                name: newClient.name,
                image: newClient.image,
            });
            return updated;
        });

        setShowModal(false);
        setNewClient({ name: "", month: "Enero", image: "", imageFile: null });
    };

    // ✅ Filtrado
    const filteredClients = Object.entries(clientsByMonth).reduce(
        (acc: ClientsByMonth, [month, clients]) => {
            if (filterMonth !== "Todos" && month !== filterMonth) return acc;
            const filtered = clients.filter((c) =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filtered.length > 0) acc[month] = filtered;
            return acc;
        },
        {}
    );

    return (
        <EmployeeLayout>
            <div className="container my-4">
                {/* Encabezado */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <h3 className="mb-0">Nuestros Clientes</h3>

                    <div className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Form.Select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            <option>Todos</option>
                            {Object.keys(clientsByMonth).map((m) => (
                                <option key={m}>{m}</option>
                            ))}
                        </Form.Select>
                        <Button
                            variant="primary"
                            onClick={() => setShowModal(true)}
                            style={{ backgroundColor: "#8c2db0", border: "none" }}
                        >
                            + Agregar
                        </Button>
                    </div>
                </div>

                {/* Lista filtrada */}
                {Object.entries(filteredClients).map(([month, clients]) => (
                    <MonthSection key={month} month={month} clients={clients} />
                ))}

                {/* ✅ Modal para agregar cliente */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Agregar Nuevo Cliente</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre del Cliente</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej. Valen"
                                    value={newClient.name}
                                    onChange={(e) =>
                                        setNewClient({ ...newClient, name: e.target.value })
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mes</Form.Label>
                                <Form.Select
                                    value={newClient.month}
                                    onChange={(e) =>
                                        setNewClient({ ...newClient, month: e.target.value })
                                    }
                                >
                                    {[
                                        "Enero",
                                        "Febrero",
                                        "Marzo",
                                        "Abril",
                                        "Mayo",
                                        "Junio",
                                        "Julio",
                                        "Agosto",
                                        "Septiembre",
                                        "Octubre",
                                        "Noviembre",
                                        "Diciembre",
                                    ].map((m) => (
                                        <option key={m}>{m}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Subir Imagen</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                                {newClient.image && (
                                    <div className="mt-3 text-center">
                                        <img
                                            src={newClient.image}
                                            alt="Preview"
                                            style={{ width: "100px", borderRadius: "50%" }}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleAddClient}>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>

        </EmployeeLayout>
    );
};

export default EmployeeCustomers;

