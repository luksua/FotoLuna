import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";

interface ClientCardProps {
  name: string;
  documentNumber?: string;
  image?: string;
  hasAppointment?: boolean;
  onClick?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = React.memo(({
  name,
  documentNumber,
  image,
  hasAppointment,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Generar iniciales para el avatar por defecto
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || "CL";
  };

  const hasValidImage = image && !image.includes("via.placeholder.com") && !imgError;

  return (
    <Card className="client-card-aesthetic" onClick={onClick}>
      {/* Círculo decorativo superior */}
      <div className="card-bg-decoration" />

      {/* Badge de Estado de Cita */}
      <div className="client-badge-wrapper">
        {hasAppointment === false ? (
          <span className="client-status-badge badge-warning-subtle" title="Sin citas agendadas">
            <i className="bi bi-calendar-x me-1"></i> Sin cita
          </span>
        ) : (
          <span className="client-status-badge badge-success-subtle" title="Tiene citas agendadas">
            <i className="bi bi-calendar-check-fill me-1"></i> Con cita
          </span>
        )}
      </div>

      {/* Avatar del Cliente */}
      <div className="client-avatar-wrapper">
        {hasValidImage ? (
          <img
            src={image}
            alt={name}
            className="client-avatar-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="client-avatar-initials" aria-hidden="true">
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <Card.Body className="client-card-body">
        <h6 className="client-name" title={name}>
          {name}
        </h6>

        <div className="client-doc-wrapper">
          <i className="bi bi-person-vcard text-muted me-1"></i>
          <span className="client-doc">
            {documentNumber ? `CC: ${documentNumber}` : "Sin documento"}
          </span>
        </div>

        <Button
          className="btn-view-profile"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <i className="bi bi-eye-fill me-1"></i> Ver más
        </Button>
      </Card.Body>
    </Card>
  );
});

export default ClientCard;

