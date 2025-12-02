import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { red, teal } from '@mui/material/colors';
import { BarChart } from "@mui/x-charts/BarChart";
import { Gauge } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";

// Paleta púrpura coherente con la estética del sitio
const purpleColors = ['#efe6ff', '#e9d5ff', '#c4b5fd', '#9f7aea', '#ab64fcff'];

// Tarjetas de resumen
const resumen = [
    { label: "Citas Pendientes", value: 14, icon: <EventIcon color="warning" sx={{ color: teal[500], fontSize: 35, mr: 2 }} /> },
    { label: "Cita Más Cercana", value: "11 octubre", icon: <AccessTimeIcon color="action" sx={{ fontSize: 35, mr: 2 }} /> },
    { label: "Citas Canceladas", value: 7, icon: <EventBusyIcon color="success" sx={{ color: red[500], fontSize: 35, mr: 2 }} /> },
];

const resumen2 = [
    { label: "Clientes Registrados", value: 25, icon: <PeopleIcon color="secondary" sx={{ fontSize: 35, mr: 2 }} /> },
    { label: "Paquetes Vendidos en total", value: 25, icon: <AttachMoneyIcon color="success" sx={{ fontSize: 35, mr: 2 }} /> },
    { label: "Ventas en el mes", value: 14, icon: <EventIcon color="primary" sx={{ fontSize: 35, mr: 2 }} /> },
];

// Datos para el gráfico de barras
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
}

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
    const [topEmployees, setTopEmployees] = useState<EmployeeRating[]>([]);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await api.get('/api/comments/ratings/stats');
                if (response.data.success) {
                    setEstrellasData(response.data.data);
                    setAverageRating(response.data.average);
                }
            } catch (error) {
                console.warn('Error al obtener estadísticas de puntuaciones:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchEmployeeRatings = async () => {
            try {
                const res = await api.get('/api/employees/ratings');
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    const sorted = res.data.data
                        .sort((a: EmployeeRating, b: EmployeeRating) => b.averageRating - a.averageRating)
                        .slice(0, 3);
                    setTopEmployees(sorted);
                }
            } catch (err) {
                console.warn('Error fetching employee ratings:', err);
            }
        };

        fetchRatings();
        fetchEmployeeRatings();
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
                            <Typography variant="h5" color="primary">{item.value}</Typography>
                        </Box>
                    </Box>
                ))}
                {resumen2.map((item, idx) => (
                    <Box key={idx} sx={{ flex: '1 1 250px', maxWidth: 350, minWidth: 220, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, p: 2, boxShadow: 2 }}>
                        {item.icon}
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle1" color="text.secondary">{item.label}</Typography>
                            <Typography variant="h5" color="primary">{item.value}</Typography>
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
                        text={() => `${(averageRating).toFixed(1)} / 5`}
                        width={200}
                        height={200}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 350, maxWidth: 500, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f1f1ff', borderRadius: 2, boxShadow: 2, p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Paquetes Más Vendidos</Typography>
                    <PieChart
                        series={[{
                            data: [
                                { id: 0, value: 40, label: 'Quince Años', color: '#d297e0ff' },
                                { id: 1, value: 39, label: 'Bodas', color: '#fdd1deff' },
                                { id: 2, value: 15, label: 'Bautizos', color: '#9c97e0ff' },
                                { id: 3, value: 18, label: 'yepa', color: '#1b0fbdff' },
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
                            // Usar un tono más oscuro cuanto mayor sea la estrella (1..5)
                            const colorIndex = Math.min(purpleColors.length - 1, Math.max(0, item.estrellas - 1));
                            const color = purpleColors[colorIndex];
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
                                                backgroundColor: color,
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
                <Typography variant="body2" sx={{ color: '#9569dbff', fontWeight: 500, px: 2 }}>Empleados</Typography>
                <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(to left, #d1a3e2, #e9d5ff, #f3e8ff, transparent)', borderRadius: 1 }} />
            </Box>

            {/* Top 3 Empleados con Mejor Puntuación (estilo similar a la gráfica de puntuación) */}
            <Box sx={{ mb: 2, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Top 3 Empleados con Mejor Puntuación</Typography>
                {topEmployees.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#999' }}>No hay datos de empleados aún.</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        {topEmployees.map((emp, idx) => {
                            const percent = (emp.averageRating / 5) * 100;
                            // Mapear la puntuación (0..5) a un índice de color (más alto -> más oscuro)
                            const colorIndex = Math.min(
                                purpleColors.length - 1,
                                Math.max(0, Math.round((emp.averageRating / 5) * (purpleColors.length - 1)))
                            );
                            const color = purpleColors[colorIndex];
                            return (
                                <Box key={emp.employeeId} sx={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ marginRight: 8, fontSize: 18, color: '#6d5ba6ff' }}>📸</span>
                                        <span style={{ fontWeight: 600 }}>{emp.name}</span>
                                        <span style={{ marginLeft: 8, color: '#888' }}>({emp.averageRating.toFixed(2)})</span>
                                    </div>
                                    <div className="progress" style={{ height: 18, borderRadius: 9, width: '100%', backgroundColor: '#f5f3ff', position: 'relative' }}>
                                        <div
                                            role="progressbar"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: color,
                                                height: '100%',
                                                borderRadius: 9,
                                                transition: 'width 400ms ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: percent > 15 ? 'center' : 'flex-end',
                                                paddingRight: 8
                                            }}
                                            aria-valuenow={emp.averageRating}
                                            aria-valuemin={0}
                                            aria-valuemax={5}
                                        >
                                            {percent > 15 && (
                                                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>
                                                    {emp.averageRating.toFixed(2)}
                                                </Typography>
                                            )}
                                        </div>
                                        {percent <= 15 && (
                                            <Typography variant="caption" sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#666', fontWeight: 700, fontSize: '0.7rem' }}>
                                                {emp.averageRating.toFixed(2)}
                                            </Typography>
                                        )}
                                    </div>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>

        </HomeLayout>
    );
};

export default Dashboard;