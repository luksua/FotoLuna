import React from "react";
import { Card, Button } from "react-bootstrap";

interface ClientCardProps {
  name: string;
  documentNumber?: string;
  image?: string;
  hasAppointment?: boolean;  // 👈 nuevo
  onClick?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = React.memo(({
  name,
  documentNumber,
  image,
  hasAppointment,
  onClick,
}) => {
  return (
    <Card
      className="text-center border-0 shadow-sm p-2 mx-2 position-relative"
      style={{ width: "10rem", backgroundColor: "#f9f6fc" }}
    >
      {/* Badge "Sin cita" */}
      {hasAppointment === false && (
        <span
          className="badge bg-warning text-dark position-absolute"
          style={{ top: "6px", right: "6px", borderRadius: "999px" }}
        >
          Sin cita
        </span>
      )}

      <Card.Img
        variant="top"
        src={image || "https://via.placeholder.com/150"}
        alt={name}
        className="rounded-circle mx-auto mt-3"
        style={{
          width: "90px",
          height: "90px",
          objectFit: "cover",
          border: "3px solid #e2c5f5",
        }}
      />
      <Card.Body>
        <Card.Title className="fs-6 mb-1">{name}</Card.Title>
        {documentNumber && (
          <div className="small text-muted mb-2">
            Cédula: {documentNumber}
          </div>
        )}
        <Button
          className="px-3 py-1 appointments-new-btn mx-auto"
          style={{
            backgroundColor: "#e2c5f5",
            color: "#5a2a7b",
            fontWeight: "bold",
          }}
          onClick={onClick}
        >
          Ver más
        </Button>
      </Card.Body>
    </Card>
  );
});

export default ClientCard;
