import React from "react";
import { Card, Button } from "react-bootstrap";

interface ClientCardProps {
  name: string;
  image?: string;
  onClick?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ name, image, onClick }) => {
  return (
    <Card
      className="text-center border-0 shadow-sm p-2 mx-2"
      style={{ width: "10rem", backgroundColor: "#f9f6fc" }}
    >
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
        <Card.Title className="fs-6">{name}</Card.Title>
        <Button
          variant="light"
          className="px-3 py-1"
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
};

export default ClientCard;
