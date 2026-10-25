import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import MonthSection from "../Components/MonthSection";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import ClientModal from "../Components/ClientModal";
import AddCustomerForm from "../Components/AddCustomerForm";
// Importamos el CSS nuevo
import "../Styles/EmployeeCustomers.css";


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

            const response = await axios.get<{ data: any[] }>(`/api/customers`, {
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

    // Total de clientes registrados
    const totalClientsCount = useMemo(() => {
        return Object.values(clientsByMonth).reduce((sum, list) => sum + list.length, 0);
    }, [clientsByMonth]);

    const filteredCount = useMemo(() => {
        return Object.values(filteredClients).reduce((sum, list) => sum + list.length, 0);
    }, [filteredClients]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setFilterMonth("Todos");
        setSelectedYear("Todos");
    };

    return (
        <EmployeeLayout>
            <div className="container-fluid px-lg-5 py-4 employee-customers-page">

                {/* 1. CABECERA PRINCIPAL */}
                <header className="page-header-customers mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h1 className="fw-bold text-dark m-0 page-title">Clientes</h1>
                                <span className="badge rounded-pill total-counter-badge" title="Clientes registrados">
                                    {totalClientsCount} {totalClientsCount === 1 ? "cliente" : "clientes"}
                                </span>
                            </div>
                            <p className="text-muted m-0 page-subtitle">
                                Directorio y gestión de clientes, sesiones y citas fotográficas
                            </p>
                        </div>

                        <div>
                            <Button
                                className="btn-add-custom shadow-sm"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-person-plus-fill me-2"></i>
                                Nuevo Cliente
                            </Button>
                        </div>
                    </div>
                </header>

                {/* 2. BARRA DE HERRAMIENTAS Y FILTROS */}
                <div className="filters-toolbar shadow-sm">
                    {/* Buscador interactivo con icono */}
                    <div className="search-box-wrapper">
                        <i className="bi bi-search search-icon"></i>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-custom"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="btn-clear-search"
                                onClick={() => setSearchTerm("")}
                                title="Limpiar búsqueda"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>

                    {/* Grupo de Filtros */}
                    <div className="filters-controls-group">
                        <div className="filter-item">
                            <span className="filter-label">
                                <i className="bi bi-calendar-event me-1"></i> Año:
                            </span>
                            <Form.Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="filter-select-custom"
                            >
                                <option value="Todos">Todos los años</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </Form.Select>
                        </div>

                        <div className="filter-item">
                            <span className="filter-label">
                                <i className="bi bi-funnel me-1"></i> Mes:
                            </span>
                            <Form.Select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="filter-select-custom"
                            >
                                <option value="Todos">Todos los meses</option>
                                {Object.keys(clientsByMonth).map((m) => <option key={m} value={m}>{m}</option>)}
                            </Form.Select>
                        </div>

                        {(searchTerm || filterMonth !== "Todos" || selectedYear !== "Todos") && (
                            <button
                                type="button"
                                className="btn-reset-filters"
                                onClick={handleResetFilters}
                                title="Restablecer filtros"
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i> Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Resumen de resultados si hay filtro activo */}
                {(searchTerm || filterMonth !== "Todos" || selectedYear !== "Todos") && (
                    <div className="filter-summary-alert mb-3">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <span>
                            Mostrando <strong>{filteredCount}</strong> resultado{filteredCount === 1 ? "" : "s"} para los filtros aplicados.
                        </span>
                    </div>
                )}

                {/* 3. LISTA DE CLIENTES POR MES */}
                <div className="clients-content-area">
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
                        <div className="empty-clients-state text-center py-5">
                            <div className="empty-icon-circle mx-auto mb-3">
                                <i className="bi bi-people display-5 text-muted"></i>
                            </div>
                            <h5 className="fw-bold text-dark mb-2">No se encontraron clientes</h5>
                            <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
                                No hay resultados que coincidan con los criterios de búsqueda o filtros seleccionados.
                            </p>
                            <Button
                                variant="outline-primary"
                                className="btn-outline-purple btn-sm mt-2 rounded-pill px-3"
                                onClick={handleResetFilters}
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i> Ver todos los clientes
                            </Button>
                        </div>
                    )}
                </div>

                {/* 4. MODALES */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="add-customer-modal">
                    <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                            <div className="modal-title-icon">
                                <i className="bi bi-person-plus-fill"></i>
                            </div>
                            <span>Registrar Nuevo Cliente</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4 pb-4">
                        <AddCustomerForm onSuccess={handleCustomerCreated} onCancel={() => setShowModal(false)} />
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