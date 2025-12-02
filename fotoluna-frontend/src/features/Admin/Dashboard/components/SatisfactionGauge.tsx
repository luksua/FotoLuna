import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Gauge } from '@mui/x-charts/Gauge';

interface SatisfactionGaugeProps {
    value: number;
    valueMax: number;
}

const SatisfactionGauge: React.FC<SatisfactionGaugeProps> = React.memo(({ value, valueMax }) => (
    <Box sx={{ flex: 1, minWidth: 350, maxWidth: 500, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f1f1ff', borderRadius: 2, boxShadow: 2, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Media de satisfacción</Typography>
        <Gauge
            className="color-Dash"
            value={value}
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
));

export default SatisfactionGauge;
