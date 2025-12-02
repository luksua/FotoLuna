import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

interface SalesChartProps {
    data: { mes: string; ventas: number }[];
}

const SalesChart: React.FC<SalesChartProps> = React.memo(({ data }) => (
    <BarChart
        dataset={data}
        xAxis={[{ dataKey: 'mes', tickPlacement: 'middle', tickLabelPlacement: 'middle' }]}
        yAxis={[{ label: 'Ventas', width: 60 }]}
        series={[{ dataKey: 'ventas', label: 'Ventas por mes al año', color: '#805fa6'}]}
        height={300}
        margin={{ left: 0 }}
    />
));

export default SalesChart;
