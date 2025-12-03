import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import MonthSection from "../Components/MonthSection";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import ClientModal from "../Components/ClientModal";
import AddCustomerForm from "../Components/AddCustomerForm";

const API_URL = "http://localhost:8000/api";

interface Client {
    id?: number;
    name: string;
    documentNumber?: string;
    image?: string;
    hasAppointment?: boolean;
}

interface ClientsByMonth {
    [month: string]: Client[];
}

const EmployeeCustomers: React.FC = React.memo(() => {
    const [clientsByMonth, setClientsByMonth] = useState<ClientsByMonth>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState("Todos");

    // 🔹 Filtro por año
    const [selectedYear, setSelectedYear] = useState<string>("Todos");
    const [years, setYears] = useState<string[]>([]);

    // Modal "Agregar cliente"
    const [showModal, setShowModal] = useState(false);

    // Modal "Ver más" del cliente
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);

    // ==========================
    //   CARGAR CLIENTES DESDE API
    // ==========================
    const fetchCustomers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            const params: Record<string, string> = {};
            if (selectedYear !== "Todos") {
                params.year = selectedYear;
            }

            const response = await axios.get<{ data: any[] }>(
                `${API_URL}/customers`,
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                    params,
                }
            );

            const grouped: ClientsByMonth = {};
            const yearsSet = new Set<string>();

            response.data.data.forEach((c) => {
                const date = c.createdAt ? new Date(c.createdAt) : null;
                let monthName = "Sin mes";

                if (date) {
                    // año para el combo de años
                    yearsSet.add(date.getFullYear().toString());

                    monthName = date.toLocaleString("es-ES", { month: "long" });
                    monthName =
                        monthName.charAt(0).toUpperCase() + monthName.slice(1);
                }

                if (!grouped[monthName]) grouped[monthName] = [];

                grouped[monthName].push({
                    id: c.id,
                    name: c.fullName,
                    documentNumber: c.documentNumber,
                    image: c.employee?.photo_url || c.photoUrl || undefined,
                    hasAppointment: c.hasAppointments,
                });
            });

            setClientsByMonth(grouped);
            setYears(Array.from(yearsSet).sort());
        } catch (error) {
            console.error("Error cargando clientes", error);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // ==========================
    //   FILTRADO POR MES Y BUSCADOR
    // ==========================
    const filteredClients: ClientsByMonth = useMemo(() => {
        return Object.entries(
            clientsByMonth
        ).reduce((acc: ClientsByMonth, [month, clients]) => {
            if (filterMonth !== "Todos" && month !== filterMonth) return acc;

            const filtered = clients.filter((c) => {
                const term = searchTerm.toLowerCase();

                const nameMatch = c.name.toLowerCase().includes(term);
                const documentMatch =
                    c.documentNumber?.toString().toLowerCase().includes(term);

                return nameMatch || documentMatch;
            });

            if (filtered.length > 0) acc[month] = filtered;
            return acc;
        }, {});
    }, [clientsByMonth, filterMonth, searchTerm]);

    // ==========================
    //   CLICK EN "VER MÁS"
    // ==========================
    const handleClientClick = useCallback((client: Client) => {
        setSelectedClient(client);
        setShowClientModal(true);
    }, []);

    // ==========================
    //   CUANDO SE CREA UN CLIENTE DESDE EL MODAL
    // ==========================
    const handleCustomerCreated = useCallback(() => {
        setShowModal(false);
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <EmployeeLayout>
            <div className="container my-4">
                {/* Encabezado */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <h3 className="mb-0">Nuestros Clientes</h3>

                    <div className="d-flex flex-wrap gap-2">
                        {/* Buscar */}
                        <Form.Control
                            type="text"
                            placeholder="Buscar cliente (nombre o cédula)."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ minWidth: "220px" }}
                        />

                        {/* Filtro por año */}
                        <Form.Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ minWidth: "120px" }}
                        >
                            <option value="Todos">Todos los años</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </Form.Select>

                        {/* Filtro por mes */}
                        <Form.Select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            style={{ minWidth: "120px" }}
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
                    <MonthSection
                        key={month}
                        month={month}
                        clients={clients}
                        onClientClick={handleClientClick}
                    />
                ))}

                {/* Modal para registrar cliente (formulario propio de empleado) */}
                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Registrar nuevo cliente</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddCustomerForm onSuccess={handleCustomerCreated} />
                    </Modal.Body>
                </Modal>

                {/* Modal de detalle de cliente */}
                {selectedClient && (
                    <ClientModal
                        show={showClientModal}
                        onClose={() => setShowClientModal(false)}
                        clientId={selectedClient.id ?? null}
                        name={selectedClient.name}
                        image={selectedClient.image}
                    />
                )}
            </div>
        </EmployeeLayout>
    );
});

export default EmployeeCustomers;
