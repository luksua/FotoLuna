import React from 'react';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CircularProgress } from '@mui/material';

interface ExportButtonProps {
  onClick: () => Promise<void>;
  label?: string;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  label = 'Descargar Excel',
  variant = 'contained',
  size = 'medium',
  disabled = false,
  loading: initialLoading = false,
}) => {
  const [loading, setLoading] = React.useState(initialLoading);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
      sx={{
        backgroundColor: variant === 'contained' ? '#805fa6' : undefined,
        '&:hover': {
          backgroundColor: variant === 'contained' ? '#6b4b8a' : undefined,
        },
      }}
    >
      {loading ? 'Descargando...' : label}
    </Button>
  );
};

export default ExportButton;
