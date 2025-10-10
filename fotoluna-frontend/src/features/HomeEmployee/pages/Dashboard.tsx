import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { red, teal } from '@mui/material/colors';
import HomeLayout from "../../../layouts/HomeAdminLayouts";
import { BarChart } from "@mui/x-charts/BarChart";
import { Gauge } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';

const estrellasData = [
    { estrellas: 1, cantidad: 3 },
    { estrellas: 2, cantidad: 13 },
    { estrellas: 3, cantidad: 38 },
    { estrellas: 4, cantidad: 120 },
    { estrellas: 5, cantidad: 150 },
];

const totalVotos = estrellasData.reduce((acc, curr) => acc + curr.cantidad, 0);

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
    { mes: "Noviembre", ventas: 0 },
    { mes: "Diciembre", ventas: 0 },
];

const Dashboard = () => {

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
                        className="color-Dash"
                        value={80}
                        startAngle={-110}
                        endAngle={110}
                        sx={{
                            [`& .MuiGauge-valueText`]: {
                                fontSize: 30,
                                transform: 'translate(0px, 0px)',
                            },
                        }}
                        text={({ value, valueMax }) => `${value} / ${valueMax}`}
                        width={200}
                        height={200}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 350, maxWidth: 500, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f1f1ff', borderRadius: 2, boxShadow: 2, p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Paquetes Más Vendidos</Typography>
                    <PieChart
                        series={[{
                            data: [
                                { id: 0, value: 40, label: 'Quince Años' },
                                { id: 1, value: 39, label: 'Bodas' },
                                { id: 2, value: 15, label: 'Bautizos' },
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                    {estrellasData.map((item, idx) => {
                        const percent = totalVotos ? (item.cantidad / totalVotos) * 100 : 0;
                        const bgColors = ["bg-danger", "bg-danger", "bg-primary", "bg-success", "bg-warning"];
                        return (
                            <Box key={idx} sx={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                    <span style={{ marginRight: 6, fontSize: 18, color: '#fbc02d' }}>📸</span>
                                    <span style={{ fontWeight: 500 }}>{item.estrellas} estrella{item.estrellas > 1 ? 's' : ''}</span>
                                    <span style={{ marginLeft: 8, color: '#888' }}>({item.cantidad})</span>
                                </div>
                                <div className="progress" style={{ height: 18, borderRadius: 9, width: '100%' }}>
                                    <div
                                        className={`progress-bar ${bgColors[idx % bgColors.length]}`}
                                        role="progressbar"
                                        style={{ width: `${percent}%` }}
                                        aria-valuenow={item.cantidad}
                                        aria-valuemin={0}
                                        aria-valuemax={totalVotos}
                                    />
                                </div>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

        </HomeLayout>
    );
};

export default Dashboard;