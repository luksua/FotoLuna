import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import {
    BarChart,
    Bar,
    Rectangle,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Tarjetas de resumen
const resumen = [
    { label: "Clientes Activos", value: 25, icon: <PeopleIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} /> },
    { label: "Citas Hoy", value: 8, icon: <EventIcon color="success" sx={{ fontSize: 40, mr: 2 }} /> },
    { label: "Pagos Pendientes", value: 3, icon: <MonetizationOnIcon color="warning" sx={{ fontSize: 40, mr: 2 }} /> },
];

// Datos para el gráfico de barras
const data = [
    { name: "Enero", Gastos: 4000, Ganancias: 2400, amt: 2400 },
    { name: "Febrero", Gastos: 3000, Ganancias: 1398, amt: 2210 },
    { name: "Marzo", Gastos: 2000, Ganancias: 9800, amt: 2290 },
    { name: "Abril", Gastos: 2780, Ganancias: 3908, amt: 2000 },
    { name: "Mayo", Gastos: 1890, Ganancias: 4800, amt: 2181 },
    { name: "Junio", Gastos: 2390, Ganancias: 8000, amt: 2500 },
    { name: "Julio", Gastos: 3490, Ganancias: 4300, amt: 2100 },
];

const Dashboard = () => {
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                {resumen.map((item, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                        <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
                            {item.icon}
                            <Box>
                                <Typography variant="h6">{item.label}</Typography>
                                <Typography variant="h4">{item.value}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Gráfico de barras */}
            <Box sx={{ mt: 4, height: 350 }}>
                <Typography variant="h6" gutterBottom>
                    Gastos y Ganancias 
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Ganancias" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
                        <Bar dataKey="Gastos" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default Dashboard;