import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PieChart } from '@mui/x-charts/PieChart';

interface TopPackagesChartProps {
    data: { id: number; value: number; label: string }[];
}

const TopPackagesChart: React.FC<TopPackagesChartProps> = React.memo(({ data }) => (
    <Box sx={{ flex: 1, minWidth: 350, maxWidth: 500, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f1f1ff', borderRadius: 2, boxShadow: 2, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Paquetes Más Vendidos</Typography>
        <PieChart
            series={[{
                data: data,
            }]}
            width={150}
            height={150}
        />
    </Box>
));

export default TopPackagesChart;
