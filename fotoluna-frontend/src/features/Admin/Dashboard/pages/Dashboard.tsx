import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { red, teal } from '@mui/material/colors';
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import { BarChart } from "@mui/x-charts/BarChart";
import { Gauge } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import { useEffect, useState } from "react";
import api from "../../../../lib/api";

// Tarjetas de resumen
const resumen = [
    { label: "Citas Pendientes", value: 0, id: "pending-appointments", icon: <EventIcon color="warning" sx={{ color: teal[500], fontSize: 35, mr: 2 }} /> },
    { label: "Cita Más Cercana", value: "11 octubre", icon: <AccessTimeIcon color="action" sx={{ fontSize: 35, mr: 2 }} /> },
    { label: "Citas Canceladas", value: 7, icon: <EventBusyIcon color="success" sx={{ color: red[500], fontSize: 35, mr: 2 }} /> },
];

const resumen2 = [
    { label: "Clientes Registrados", value: 0, id: "customer-count", icon: <PeopleIcon color="secondary" sx={{ fontSize: 35, mr: 2 }} /> },
    { label: "Paquetes Vendidos en total", value: 25, icon: <AttachMoneyIcon color="success" sx={{ fontSize: 35, mr: 2 }} /> },
    { label: "Ventas", value: 0, id: "monthly-sales", icon: <EventIcon color="primary" sx={{ fontSize: 35, mr: 2 }} /> },
];

const data = [
    { mes: "Enero", ventas: 20 },
    { mes: "Febrero", ventas: 58 },
    { mes: "Marzo", ventas: 100 },
    { mes: "Abril", ventas: 15 },
    { mes: "Mayo", ventas: 12 },
    { mes: "Junio", ventas: 76 },
    { mes: "Julio", ventas: 55 },
    { mes: "Agosto", ventas: 96 },
    { mes: "Septiembre", ventas: 83 },
    { mes: "Octubre", ventas: 30 },
    { mes: "Noviembre", ventas: 84 },
    { mes: "Diciembre", ventas: 0 },
];

type EmployeeRating = {
    employeeId: number;
    name: string;
    averageRating: number;
};

const Dashboard = () => {
    const [estrellasData, setEstrellasData] = useState<Array<{ estrellas: number; cantidad: number }>>([
        { estrellas: 1, cantidad: 0 },
        { estrellas: 2, cantidad: 0 },
        { estrellas: 3, cantidad: 0 },
        { estrellas: 4, cantidad: 0 },
        { estrellas: 5, cantidad: 0 },
    ]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [packagesStats, setPackagesStats] = useState<Array<{name: string; value: number}>>([]);
    const [topEmployees, setTopEmployees] = useState<EmployeeRating[]>([]);
    const [monthlySales, setMonthlySales] = useState(0);
    const [customersCount, setCustomersCount] = useState(0);
    const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await api.get('/api/comments/ratings/stats');
                if (response.data.success) {
                    setEstrellasData(response.data.data);
                    setAverageRating(response.data.average);
                    setTotalVotos(response.data.total);
                }
            } catch (error) {
                console.warn('Error al obtener estadísticas de puntuaciones:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchPackagesStats = async () => {
            try {
                const res = await api.get('/api/admin/packages/stats');
                if (res.data && res.data.success) {
                    setPackagesStats(res.data.data || []);
                }
            } catch (err) {
                console.warn('Error fetching package stats:', err);
            }
        };

        const fetchEmployeeRatings = async () => {
            try {
                const res = await api.get('/api/employees/ratings');
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    // Ordenar por averageRating descendente y tomar top 3
                    const sorted = res.data.data
                        .sort((a: EmployeeRating, b: EmployeeRating) => b.averageRating - a.averageRating)
                        .slice(0, 3);
                    setTopEmployees(sorted);
                }
            } catch (err) {
                console.warn('Error fetching employee ratings:', err);
            }
        };

        const fetchMonthlySales = async () => {
            try {
                const res = await api.get('/api/admin/packages/sales/monthly');
                if (res.data && res.data.success) {
                    setMonthlySales(res.data.data.totalSales || 0);
                }
            } catch (err) {
                console.warn('Error fetching monthly sales:', err);
            }
        };

        const fetchCustomersCount = async () => {
            try {
                const res = await api.get('/api/admin/customers/count');
                if (res.data && res.data.success) {
                    setCustomersCount(res.data.data.total || 0);
                }
            } catch (err) {
                console.warn('Error fetching customers count:', err);
            }
        };

        const fetchPendingAppointmentsCount = async () => {
            try {
                const res = await api.get('/api/admin/appointments/pending-count');
                if (res.data && res.data.success) {
                    setPendingAppointmentsCount(res.data.data.total || 0);
                }
            } catch (err) {
                console.warn('Error fetching pending appointments count:', err);
            }
        };

        fetchRatings();
        fetchPackagesStats();
        fetchEmployeeRatings();
        fetchMonthlySales();
        fetchCustomersCount();
        fetchPendingAppointmentsCount();
    }, []);

    const totalVotosCalculated = estrellasData.reduce((acc, curr) => acc + curr.cantidad, 0);

    return (
        <HomeLayout>

            {/* Tarjetas de resumen */}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center', width: '100%' }}>
                {resumen.map((item, idx) => (
                    <Box key={idx} sx={{ flex: '1 1 250px', maxWidth: 350, minWidth: 220, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, p: 2, boxShadow: 2 }}>
                        {item.icon}
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle1" color="text.secondary">{item.label}</Typography>
                            <Typography variant="h5" color="primary">
                                {item.id === 'pending-appointments'
                                    ? pendingAppointmentsCount
                                    : item.value
                                }
                            </Typography>
                        </Box>
                    </Box>
                ))}
                {resumen2.map((item, idx) => (
                    <Box key={idx} sx={{ flex: '1 1 250px', maxWidth: 350, minWidth: 220, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, p: 2, boxShadow: 2 }}>
                        {item.icon}
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle1" color="text.secondary">{item.label}</Typography>
                            <Typography variant="h5" color="primary">
                                {item.id === 'monthly-sales' 
                                    ? `$ ${monthlySales.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                    : item.id === 'customer-count'
                                    ? customersCount
                                    : item.value
                                }
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Gráfica de ventas*/}
            <BarChart
                dataset={data}
                xAxis={[{ dataKey: 'mes', tickPlacement: 'middle', tickLabelPlacement: 'middle' }]}
                yAxis={[{ label: 'Ventas', width: 60 }]}
                series={[{ dataKey: 'ventas', label: 'Ventas por mes al año', color: '#805fa6'}]}
                height={300}
                margin={{ left: 0 }}
            />

            {/* Gauge y PieChart lado a lado, igual tamaño y alineados */}
            <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', justifyContent: 'center', gap: 4 }}>
                <Box sx={{ flex: 1, minWidth: 350, maxWidth: 500, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f1f1ff', borderRadius: 2, boxShadow: 2, p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Media de satisfacción</Typography>
                    <Gauge
                        className="color-gauge"
                        value={Math.round(averageRating * 20)}
                        startAngle={-110}
                        endAngle={110}
                        sx={{
                            [`& .MuiGauge-valueText`]: {
                                fontSize: 30,
                                transform: 'translate(0px, 0px)',
                            },
                            [`& .MuiGauge-valueArc`]: {
                                fill: '#ab64fcff',
                            },
                        }}
                        text={({ value, valueMax }) => `${(averageRating).toFixed(1)} / 5`}
                        width={200}
                        height={200}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 350, maxWidth: 500, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f1f1ff', borderRadius: 2, boxShadow: 2, p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Paquetes Más Vendidos</Typography>
                    <PieChart
                        series={[{
                            data: packagesStats.length > 0 ? packagesStats.map((p, idx) => ({
                                id: idx,
                                value: p.value,
                                label: p.name,
                                color: ['#d297e0ff', '#fdd1deff', '#9c97e0ff', '#c792dfff', '#efd6f9ff'][idx % 5]
                            })) : [
                                { id: 0, value: 1, label: 'Sin datos', color: '#efe6ff' }
                            ],
                        }]}
                        width={150}
                        height={150}
                    />
                </Box>
            </Box>

            {/* Gráfica de puntuación */}
            <Box sx={{ mb: 2, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Puntuación de usuarios</Typography>
                {loading ? (
                    <Typography>Cargando estadísticas...</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        {estrellasData.map((item, idx) => {
                            const percent = totalVotosCalculated ? (item.cantidad / totalVotosCalculated) * 100 : 0;
                            // Paleta morada coherente con la estética
                            const purpleColors = ['#EFE6FF', '#E9D5FF', '#C4B5FD', '#9F7AEA', '#9569dbff'];
                            return (
                                <Box key={idx} sx={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                        <span style={{ marginRight: 6, fontSize: 18, color: '#fbc02d' }}>📸</span>
                                        <span style={{ fontWeight: 500 }}>{item.estrellas} estrella{item.estrellas > 1 ? 's' : ''}</span>
                                        <span style={{ marginLeft: 8, color: '#888' }}>({item.cantidad})</span>
                                    </div>
                                    <div className="progress" style={{ height: 18, borderRadius: 9, width: '100%', backgroundColor: '#f5f3ff' }}>
                                        <div
                                            role="progressbar"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: purpleColors[idx % purpleColors.length],
                                                height: '100%',
                                                borderRadius: 9,
                                                transition: 'width 400ms ease'
                                            }}
                                            aria-valuenow={item.cantidad}
                                            aria-valuemin={0}
                                            aria-valuemax={totalVotosCalculated}
                                        />
                                    </div>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Línea decorativa */}
            <Box sx={{ my: 4, display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(to right, #d1a3e2, #e9d5ff, #f3e8ff, transparent)', borderRadius: 1 }} />
                <Typography variant="body2" sx={{ color: '#9569dbff', fontWeight: 500, px: 2 }}></Typography>
                <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(to left, #d1a3e2, #e9d5ff, #f3e8ff, transparent)', borderRadius: 1 }} />
            </Box>

            {/* Top 3 Empleados con Mejor Puntuación */}
            <Box sx={{ mb: 2, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Top 3 Empleados con Mejor Puntuación</Typography>
                {loading ? (
                    <Typography>Cargando empleados...</Typography>
                ) : topEmployees.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        {topEmployees.map((employee, idx) => {
                            const purpleColors = ['#d1a3e2', '#e9d5ff', '#f3e8ff'];
                            const medalEmojis = ['1.', '2.', '3.'];
                            return (
                                <Box key={employee.employeeId} sx={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                        <span style={{ marginRight: 8, fontSize: 20 }}>{medalEmojis[idx]}</span>
                                        <span style={{ fontWeight: 500, flex: 1 }}>{employee.name}</span>
                                        <span style={{ marginLeft: 8, color: '#888', fontWeight: '600' }}>⭐ {employee.averageRating.toFixed(1)}/5</span>
                                    </div>
                                    <div className="progress" style={{ height: 18, borderRadius: 9, width: '100%', backgroundColor: '#f5f3ff' }}>
                                        <div
                                            role="progressbar"
                                            style={{
                                                width: `${(employee.averageRating / 5) * 100}%`,
                                                backgroundColor: purpleColors[idx % purpleColors.length],
                                                height: '100%',
                                                borderRadius: 9,
                                                transition: 'width 400ms ease'
                                            }}
                                            aria-valuenow={employee.averageRating}
                                            aria-valuemin={0}
                                            aria-valuemax={5}
                                        />
                                    </div>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Typography color="text.secondary">No hay empleados con calificaciones aún.</Typography>
                )}
            </Box>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>

        </HomeLayout>
    );
};

export default Dashboard;