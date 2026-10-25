import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/home.css";
import { useAuth } from "../../../../context/useAuth";
import { useWeather } from "../../../../hooks/useWeather";
import {
    getEmployeeAppointments,
    getCustomers,
    getEmployeePhotoSummary,
    getEmployeePayments, // Add this
    type EmployeeAppointment,
    type Customer,
    type PhotoSummary,
    type Payment,
} from "../../../../services/homeEmployeeService";
import { isToday, isThisWeek, isFuture } from "../../../../lib/date-utils";
import DetailsModal from "../../../../components/common/DetailsModal"; // Nuevo modal

// Interfaz para las columnas del modal
interface Column {
    header: string;
    accessor: string;
  }

const EmployeeHome: React.FC = () => {
    const { user } = useAuth();
    const displayName = user?.displayName ?? user?.name ?? "Amalia";
    const { weather, iconClass, description } = useWeather();
    
    // Estado para las estadísticas del dashboard (simplificado)
    const [stats, setStats] = useState({
        appointments: { today: 0, thisWeek: 0, upcoming: 0 },
        uploads: { total: 0 },
        customers: { total: 0 },
        performance: { projects: 0, satisfaction: '0' }
    });

    // Estado para almacenar los datos completos
    const [allAppointments, setAllAppointments] = useState<EmployeeAppointment[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [allPhotoSummary, setAllPhotoSummary] = useState<PhotoSummary[]>([]);
    const [allPayments, setAllPayments] = useState<Payment[]>([]); // New state for payments


    // Estado para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalColumns, setModalColumns] = useState<Column[]>([]);
    const [modalFilterConfig, setModalFilterConfig] = useState<any>(undefined);
    const [modalDateColumnAccessor, setModalDateColumnAccessor] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!user?.id) return;

        const fetchAndProcessData = async () => {
            try {
                const [appointments, customers, photoSummary, payments] = await Promise.all([
                    getEmployeeAppointments(user.id),
                    getCustomers(),
                    getEmployeePhotoSummary(),
                    getEmployeePayments(), // Fetch payments
                ]);

                // Garantizamos que los datos sean arrays antes de procesarlos
                const safeAppointments = Array.isArray(appointments) ? appointments : [];
                const safeCustomers = Array.isArray(customers) ? customers : [];
                const safePhotoSummary = Array.isArray(photoSummary) ? photoSummary : [];
                const safePayments = Array.isArray(payments) ? payments : []; // Ensure payments is an array

                // Guardamos listas completas
                setAllAppointments(safeAppointments);
                setAllCustomers(safeCustomers);
                setAllPhotoSummary(safePhotoSummary);
                setAllPayments(safePayments); // Save payments

                // --- Cálculos de estadísticas más robustos ---
                const today = safeAppointments.filter(a => a && a.date && isToday(new Date(a.date))).length;
                const thisWeek = safeAppointments.filter(a => a && a.date && isThisWeek(new Date(a.date))).length;
                const upcoming = safeAppointments.filter(a => a && a.date && isFuture(new Date(a.date))).length;
                const completedProjects = safeAppointments.filter(a => a && a.status === 'Completed').length;
                
                const totalUploads = safePhotoSummary.reduce((sum, item) => {
                    const count = Number(item?.totalRecentPhotos) || 0;
                    return sum + count;
                }, 0);

                const paidPayments = safePayments.filter(p => p.status === 'paid');
                const totalPaidAmount = paidPayments.reduce((sum, p) => sum + p.totalAmount, 0);


                setStats({
                    appointments: { today, thisWeek, upcoming },
                    customers: { total: safeCustomers.length },
                    uploads: { total: totalUploads },
                    performance: { projects: completedProjects, satisfaction: `$${totalPaidAmount.toLocaleString()}` }
                });

            } catch (error) {
                console.error("Error al obtener y procesar los datos del dashboard:", error);
                // En caso de un error mayor, reseteamos las estadísticas
                setStats({
                    appointments: { today: 0, thisWeek: 0, upcoming: 0 },
                    uploads: { total: 0 },
                    customers: { total: 0 },
                    performance: { projects: 0, satisfaction: 'N/A' }
                });
            }
        };

        fetchAndProcessData();
    }, [user]);

    const openModal = (title: string, data: any[], columns: Column[], filterConfig?: any, dateColumnAccessor?: string) => {
        setModalTitle(title);
        setModalData(data);
        setModalColumns(columns);
        setModalFilterConfig(filterConfig);
        setModalDateColumnAccessor(dateColumnAccessor); 
        setIsModalOpen(true);
    };

    const handleAppointmentsClick = () => {
        openModal(
            "Listado de Citas",
            allAppointments,
            [
                { header: "ID Cita", accessor: "appointmentId" },
                { header: "Cliente", accessor: "clientName" },
                { header: "Email Cliente", accessor: "clientEmail" },
                { header: "Fecha", accessor: "date" },
                { header: "Hora", accessor: "startTime" },
                { header: "Lugar", accessor: "place" },
                { header: "Comentario", accessor: "comment" },
                { header: "Estado", accessor: "status" },
            ],
            { column: 'status', header: 'Estado' },
            "date" 
        );
    };
    
    const handleCustomersClick = () => {
        openModal(
            "Listado de Clientes",
            allCustomers,
            [
                { header: "ID", accessor: "id" },
                { header: "Nombre Completo", accessor: "fullName" },
                { header: "Documento", accessor: "documentNumber" },
                { header: "Fecha Creación", accessor: "createdAt" },
            ],
            undefined,
            "createdAt"
        );
    };

    const handleUploadsClick = () => {
        openModal(
            "Resumen de Fotos Subidas",
            allPhotoSummary,
            [
                { header: "ID Cliente", accessor: "customerId" },
                { header: "Nombre Cliente", accessor: "customerName" },
                { header: "Total Fotos Recientes", accessor: "totalRecentPhotos" },
                { header: "Última Subida", accessor: "lastUploadAt" },
            ],
            undefined, 
            "lastUploadAt" 
        );
    };

    const handlePaymentsClick = () => {
        openModal(
            "Listado de Pagos",
            allPayments,
            [
                { header: "ID Pago", accessor: "id" },
                { header: "Cliente", accessor: "clientName" },
                { header: "Monto Total", accessor: "totalAmount" },
                { header: "Estado", accessor: "status" },
                { header: "Fecha", accessor: "date" },
            ],
            { column: 'status', header: 'Estado' }, 
            "date" 
        );
    };


    const todayFormatted = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const capitalizedToday = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

    return (
        <EmployeeLayout>
            <div className="employee-home">
                {/* Hero / Welcome Section */}
                <section className="welcome-section">
                    <div className="welcome-content">
                        <div className="welcome-badge">
                            <i className="bi bi-camera2 me-1"></i> Panel de Fotógrafo &amp; Gestión
                        </div>
                        <h1 className="welcome-title">¡Hola, {displayName}!</h1>
                        <p className="welcome-subtitle">
                            {capitalizedToday} · Es un día perfecto para crear fotos y experiencias inolvidables.
                        </p>
                    </div>

                    <div className="weather-card-modern">
                        <div className="weather-icon-box">
                            <i className={`bi ${iconClass}`}></i>
                        </div>
                        <div className="weather-details-box">
                            <span className="weather-city">Estudio FotoLuna</span>
                            <div className="d-flex align-items-center gap-2">
                                <span className="weather-temp">{weather ? `${weather.temp}°C` : '--'}</span>
                                <span className="weather-desc">{description}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Metrics Cards */}
                <div className="dashboard-grid">
                    {/* 1. Citas */}
                    <div className="dash-card citos-card" onClick={handleAppointmentsClick}>
                        <div className="dash-card-header">
                            <div className="dash-card-icon purple">
                                <i className="bi bi-calendar2-heart-fill"></i>
                            </div>
                            <div className="dash-card-titles">
                                <h3>Citas &amp; Agenda</h3>
                                <span>Disponibilidad y reservas</span>
                            </div>
                            <button
                                type="button"
                                className="dash-modal-btn"
                                onClick={(e) => { e.stopPropagation(); handleAppointmentsClick(); }}
                                title="Ver tabla detallada"
                            >
                                <i className="bi bi-arrows-angle-expand"></i>
                            </button>
                        </div>

                        <div className="dash-card-stats-row">
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{stats.appointments.today}</span>
                                <span className="dash-stat-label">Hoy</span>
                            </div>
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{stats.appointments.thisWeek}</span>
                                <span className="dash-stat-label">Esta semana</span>
                            </div>
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{stats.appointments.upcoming}</span>
                                <span className="dash-stat-label">Próximas</span>
                            </div>
                        </div>

                        <div className="dash-card-footer">
                            <Link
                                to="/employee/appointments"
                                className="dash-action-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>Abrir Calendario</span>
                                <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    {/* 2. Subidas de Fotos */}
                    <div className="dash-card subir-card" onClick={handleUploadsClick}>
                        <div className="dash-card-header">
                            <div className="dash-card-icon pink">
                                <i className="bi bi-cloud-arrow-up-fill"></i>
                            </div>
                            <div className="dash-card-titles">
                                <h3>Subidas de Fotos</h3>
                                <span>Carga a nube de clientes</span>
                            </div>
                            <button
                                type="button"
                                className="dash-modal-btn"
                                onClick={(e) => { e.stopPropagation(); handleUploadsClick(); }}
                                title="Ver tabla detallada"
                            >
                                <i className="bi bi-arrows-angle-expand"></i>
                            </button>
                        </div>

                        <div className="dash-card-stats-row">
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{allPhotoSummary.length}</span>
                                <span className="dash-stat-label">Clientes</span>
                            </div>
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{stats.uploads.total}</span>
                                <span className="dash-stat-label">Total Fotos</span>
                            </div>
                        </div>

                        <div className="dash-card-footer">
                            <Link
                                to="/employee/upload"
                                className="dash-action-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>Nueva Subida</span>
                                <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    {/* 3. Clientes */}
                    <div className="dash-card clientes-card" onClick={handleCustomersClick}>
                        <div className="dash-card-header">
                            <div className="dash-card-icon blue">
                                <i className="bi bi-people-fill"></i>
                            </div>
                            <div className="dash-card-titles">
                                <h3>Clientes Registrados</h3>
                                <span>Directorio e información</span>
                            </div>
                            <button
                                type="button"
                                className="dash-modal-btn"
                                onClick={(e) => { e.stopPropagation(); handleCustomersClick(); }}
                                title="Ver tabla detallada"
                            >
                                <i className="bi bi-arrows-angle-expand"></i>
                            </button>
                        </div>

                        <div className="dash-card-stats-row">
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{stats.customers.total}</span>
                                <span className="dash-stat-label">Clientes Activos</span>
                            </div>
                        </div>

                        <div className="dash-card-footer">
                            <Link
                                to="/employee/customers"
                                className="dash-action-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>Ver Directorio</span>
                                <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    {/* 4. Pagos */}
                    <div className="dash-card pagos-card" onClick={handlePaymentsClick}>
                        <div className="dash-card-header">
                            <div className="dash-card-icon emerald">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <div className="dash-card-titles">
                                <h3>Pagos &amp; Finanzas</h3>
                                <span>Ingresos y cuotas</span>
                            </div>
                            <button
                                type="button"
                                className="dash-modal-btn"
                                onClick={(e) => { e.stopPropagation(); handlePaymentsClick(); }}
                                title="Ver tabla detallada"
                            >
                                <i className="bi bi-arrows-angle-expand"></i>
                            </button>
                        </div>

                        <div className="dash-card-stats-row">
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{stats.performance.satisfaction}</span>
                                <span className="dash-stat-label">Cobrado</span>
                            </div>
                            <div className="dash-stat-pill">
                                <span className="dash-stat-num">{allPayments.length}</span>
                                <span className="dash-stat-label">Transacciones</span>
                            </div>
                        </div>

                        <div className="dash-card-footer">
                            <Link
                                to="/employee/payments"
                                className="dash-action-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>Control de Pagos</span>
                                <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos Section */}
                <div className="quick-shortcuts-section">
                    <h3 className="shortcuts-title">
                        <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
                        Accesos Rápidos
                    </h3>
                    <div className="shortcuts-grid">
                        <Link to="/employee/appointments" className="shortcut-card">
                            <div className="shortcut-icon-box purple">
                                <i className="bi bi-calendar-plus"></i>
                            </div>
                            <div className="shortcut-info">
                                <strong>Agendar Cita</strong>
                                <span>Ver disponibilidad y reservar</span>
                            </div>
                            <i className="bi bi-chevron-right ms-auto arrow-icon"></i>
                        </Link>

                        <Link to="/employee/upload" className="shortcut-card">
                            <div className="shortcut-icon-box pink">
                                <i className="bi bi-cloud-arrow-up"></i>
                            </div>
                            <div className="shortcut-info">
                                <strong>Subir Fotos</strong>
                                <span>Cargar sesión a la nube</span>
                            </div>
                            <i className="bi bi-chevron-right ms-auto arrow-icon"></i>
                        </Link>

                        <Link to="/employee/admin" className="shortcut-card">
                            <div className="shortcut-icon-box amber">
                                <i className="bi bi-images"></i>
                            </div>
                            <div className="shortcut-info">
                                <strong>Administrar Fotos</strong>
                                <span>Historial de entregas</span>
                            </div>
                            <i className="bi bi-chevron-right ms-auto arrow-icon"></i>
                        </Link>

                        <Link to="/employee/customers" className="shortcut-card">
                            <div className="shortcut-icon-box blue">
                                <i className="bi bi-person-plus"></i>
                            </div>
                            <div className="shortcut-info">
                                <strong>Clientes</strong>
                                <span>Gestionar contactos y fotos</span>
                            </div>
                            <i className="bi bi-chevron-right ms-auto arrow-icon"></i>
                        </Link>
                    </div>
                </div>
            </div>

            <DetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                data={modalData}
                columns={modalColumns}
                fileName={modalTitle.replace(/\s/g, '_')}
                filterConfig={modalFilterConfig}
                dateColumnAccessor={modalDateColumnAccessor}
            />

        </EmployeeLayout>
    );
};

export default EmployeeHome;

