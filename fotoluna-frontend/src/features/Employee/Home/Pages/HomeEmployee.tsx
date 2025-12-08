import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import React, { useState, useEffect } from "react";
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


    return (
        <EmployeeLayout>
            <div className="employee-home">
                <section className="welcome-section">
                    <div className="welcome-text">
                        <h2>¡Bienvenid@, {displayName}!</h2>
                        <p>Es un día perfecto para crear fotos increíbles</p>
                    </div>
                    <div className="weather-info">
                        <div className="weather-icon">
                            <i className={`bi ${iconClass}`}></i>
                        </div>
                        <div className="weather-details">
                            <h3>{description}</h3>
                            {weather && <p>{weather.temp}°C</p>}
                        </div>
                    </div>
                </section>

                <div className="dashboard">
                    {/* Citas */}
                    <div className="card-employee citos clickable" onClick={handleAppointmentsClick}>
                        <div className="card-header-employee">
                            <div className="card-icon"><i className="bi bi-calendar-event"></i></div>
                            <h3>Citas</h3>
                        </div>
                        <p>Gestiona y visualiza las citas programadas con los clientes</p>
                        <div className="card-stats">
                            <div className="stat"><div className="stat-value">{stats.appointments.today}</div><div className="stat-label">Hoy</div></div>
                            <div className="stat"><div className="stat-value">{stats.appointments.thisWeek}</div><div className="stat-label">Esta semana</div></div>
                            <div className="stat"><div className="stat-value">{stats.appointments.upcoming}</div><div className="stat-label">Próximas</div></div>
                        </div>
                    </div>

                    {/* Subir */}
                    <div className="card-employee subir clickable" onClick={handleUploadsClick}>
                        <div className="card-header-employee">
                            <div className="card-icon"><i className="bi bi-upload"></i></div>
                            <h3>Subidas de Fotos</h3>
                        </div>
                        <p>Consulta el resumen de fotos subidas por cliente</p>
                        <div className="card-stats">
                             <div className="stat"><div className="stat-value">{allPhotoSummary.length}</div><div className="stat-label">Clientes</div></div>
                             <div className="stat"><div className="stat-value">{stats.uploads.total}</div><div className="stat-label">Total Fotos</div></div>
                        </div>
                    </div>

                    {/* Clientes */}
                    <div className="card-employee clientes clickable" onClick={handleCustomersClick}>
                        <div className="card-header-employee">
                            <div className="card-icon"><i className="bi bi-person-lines-fill"></i></div>
                            <h3>Clientes</h3>
                        </div>
                        <p>Consulta y gestiona la información de los clientes</p>
                        <div className="card-stats">
                            <div className="stat"><div className="stat-value">{stats.customers.total}</div><div className="stat-label">Total</div></div>
                        </div>
                    </div>

                    {/* Pagos */}
                    <div className="card-employee administrar clickable" onClick={handlePaymentsClick}>
                        <div className="card-header-employee">
                            <div className="card-icon"><i className="bi bi-graph-up"></i></div>
                            <h3>Pagos</h3>
                        </div>
                        <p>Revisa las métricas de tu trabajo completado</p>
                        <div className="card-stats">
                            <div className="stat"><div className="stat-value">{stats.performance.satisfaction}</div><div className="stat-label">Total</div></div>
                            <div className="stat"><div className="stat-value">{allPayments.length}</div><div className="stat-label">Pagos</div></div>
                        </div>
                    </div>
                </div>

                {/* Quitamos la sección de actividad que ya no corresponde con los datos que tenemos */}

                <footer>
                    <p>FotoLuna &copy;</p>
                </footer>
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

