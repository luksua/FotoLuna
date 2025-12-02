import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface SummaryCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon }) => (
    <Box sx={{ flex: '1 1 250px', maxWidth: 350, minWidth: 220, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, p: 2, boxShadow: 2 }}>
        {icon}
        <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">{label}</Typography>
            <Typography variant="h5" color="primary">{value}</Typography>
        </Box>
    </Box>
);

interface SummaryCardsProps {
    data: SummaryCardProps[];
}

const SummaryCards: React.FC<SummaryCardsProps> = React.memo(({ data }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center', width: '100%' }}>
        {data.map((item, idx) => (
            <SummaryCard key={idx} {...item} />
        ))}
    </Box>
));

export default SummaryCards;
