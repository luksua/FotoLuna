import React from "react";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { red, teal } from '@mui/material/colors';
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import SummaryCards from "../components/SummaryCards";
import SalesChart from "../components/SalesChart";
import SatisfactionGauge from "../components/SatisfactionGauge";
import TopPackagesChart from "../components/TopPackagesChart";
import UserRatings from "../components/UserRatings";

const estrellasData = [
    { estrellas: 1, cantidad: 3 },
    { estrellas: 2, cantidad: 13 },
    { estrellas: 3, cantidad: 38 },
    { estrellas: 4, cantidad: 120 },
    { estrellas: 5, cantidad: 150 },
];

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

const topPackagesData = [
    { id: 0, value: 40, label: 'Quince Años' },
    { id: 1, value: 39, label: 'Bodas' },
    { id: 2, value: 15, label: 'Bautizos' },
];

const Dashboard = React.memo(() => {

    return (
        <HomeLayout>

            <SummaryCards data={[...resumen, ...resumen2]} />

            <SalesChart data={data} />

            <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', justifyContent: 'center', gap: 4 }}>
                <SatisfactionGauge value={100} valueMax={100} />
                <TopPackagesChart data={topPackagesData} />
            </Box>

            <UserRatings data={estrellasData} />

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>

        </HomeLayout>
    );
});

export default Dashboard;