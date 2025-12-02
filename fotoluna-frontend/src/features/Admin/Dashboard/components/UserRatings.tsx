import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface UserRatingsProps {
    data: { estrellas: number; cantidad: number }[];
}

const UserRatings: React.FC<UserRatingsProps> = React.memo(({ data }) => {
    const totalVotos = data.reduce((acc, curr) => acc + curr.cantidad, 0);
    const purpleColors = ['#EFE6FF', '#E9D5FF', '#C4B5FD', '#9F7AEA', '#9569dbff'];

    return (
        <Box sx={{ mb: 2, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Puntuación de usuarios</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                {data.map((item, idx) => {
                    const percent = totalVotos ? (item.cantidad / totalVotos) * 100 : 0;
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
                                    aria-valuemax={totalVotos}
                                />
                            </div>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
});

export default UserRatings;
