import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import MonthSection from "../Components/MonthSection";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import ClientModal from "../Components/ClientModal";
import AddCustomerForm from "../Components/AddCustomerForm";
// Importamos el CSS nuevo
import "../Styles/EmployeeCustomers.css";

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
    const [selectedYear, setSelectedYear] = useState<string>("Todos");
    const [years, setYears] = useState<string[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);

    // ... (fetchCustomers se mantiene IGUAL) ...
    const fetchCustomers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const params: Record<string, string> = {};
            if (selectedYear !== "Todos") params.year = selectedYear;

            const response = await axios.get<{ data: any[] }>(`${API_URL}/customers`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                params,
            });

            const grouped: ClientsByMonth = {};
            const yearsSet = new Set<string>();

            response.data.data.forEach((c) => {
                const date = c.createdAt ? new Date(c.createdAt) : null;
                let monthName = "Sin mes";
                if (date) {
                    yearsSet.add(date.getFullYear().toString());
                    monthName = date.toLocaleString("es-ES", { month: "long" });
                    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
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

    // ... (filteredClients se mantiene IGUAL) ...
    const filteredClients: ClientsByMonth = useMemo(() => {
        return Object.entries(clientsByMonth).reduce((acc: ClientsByMonth, [month, clients]) => {
            if (filterMonth !== "Todos" && month !== filterMonth) return acc;
            const filtered = clients.filter((c) => {
                const term = searchTerm.toLowerCase();
                return c.name.toLowerCase().includes(term) || c.documentNumber?.toString().toLowerCase().includes(term);
            });
            if (filtered.length > 0) acc[month] = filtered;
            return acc;
        }, {});
    }, [clientsByMonth, filterMonth, searchTerm]);

    const handleClientClick = useCallback((client: Client) => {
        setSelectedClient(client);
        setShowClientModal(true);
    }, []);

    const handleCustomerCreated = useCallback(() => {
        setShowModal(false);
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <EmployeeLayout>
            <div className="container my-4">

                {/* 1. TÍTULO Y BARRA DE HERRAMIENTAS HORIZONTAL */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="fw-bold text-dark m-0 tt" style={{ letterSpacing: '-0.5px' }}>Clientes</h2>
                </div>

                <div className="filters-toolbar">
                    {/* Grupo Izquierdo: Buscador */}
                    <div style={{ flex: '1 1 300px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-custom"
                        />
                    </div>

                    {/* Grupo Derecho: Filtros y Botón */}
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small fw-bold">Año:</span>
                            <Form.Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="filter-select-custom"
                                style={{ width: "100px" }}
                            >
                                <option value="Todos">Todos</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </Form.Select>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small fw-bold">Mes:</span>
                            <Form.Select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="filter-select-custom"
                                style={{ width: "130px" }}
                            >
                                <option>Todos</option>
                                {Object.keys(clientsByMonth).map((m) => <option key={m}>{m}</option>)}
                            </Form.Select>
                        </div>

                        {/* Separador vertical sutil */}
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

                        <Button
                            className="btn-add-custom"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-plus-lg me-2"></i> Nuevo Cliente
                        </Button>
                    </div>
                </div>

                {/* 2. LISTA DE CLIENTES */}
                {Object.entries(filteredClients).length > 0 ? (
                    Object.entries(filteredClients).map(([month, clients]) => (
                        <MonthSection
                            key={month}
                            month={month}
                            clients={clients}
                            onClientClick={handleClientClick}
                        />
                    ))
                ) : (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-search display-4 opacity-25"></i>
                        <p className="mt-3">No se encontraron clientes con estos filtros.</p>
                    </div>
                )}

                {/* MODALES (Sin cambios) */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">Registrar nuevo cliente</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddCustomerForm onSuccess={handleCustomerCreated} />
                    </Modal.Body>
                </Modal>

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