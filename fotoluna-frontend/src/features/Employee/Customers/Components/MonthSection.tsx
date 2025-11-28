import React, { useRef } from "react";
import ClientCard from "./ClientCard";

export interface Client {
  id?: number;
  name: string;
  documentNumber?: string;
  image?: string;
  hasAppointment?: boolean; // 👈 nuevo
}

interface MonthSectionProps {
  month: string;
  clients: Client[];
  onClientClick?: (client: Client) => void;
}

const MonthSection: React.FC<MonthSectionProps> = ({
  month,
  clients,
  onClientClick,
}) => {
  if (!clients.length) return null;

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = 260; // px por “tarjeta”

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-5">
      <div
        className="fw-bold mb-3 px-3 py-1"
        style={{
          backgroundColor: "#f3e6f7",
          borderLeft: "4px solid #8c2db0",
          display: "inline-block",
          borderRadius: "999px",
        }}
      >
        {month}
      </div>

      <div className="position-relative">
        {/* Botón izquierda */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="btn btn-light shadow-sm position-absolute top-50 start-0 translate-middle-y"
          style={{
            zIndex: 2,
            borderRadius: "999px",
            padding: "0.2rem 0.6rem",
          }}
        >
          ‹
        </button>

        {/* Lista horizontal */}
        <div
          ref={scrollRef}
          className="d-flex pb-3 mx-5"
          style={{
            overflowX: "auto",
            gap: "1rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {clients.map((client, idx) => (
            <div
              key={idx}
              style={{
                scrollSnapAlign: "start",
                flex: "0 0 auto",
              }}
            >
              <ClientCard
                name={client.name}
                documentNumber={client.documentNumber}
                image={client.image}
                hasAppointment={client.hasAppointment} // 👈 nuevo
                onClick={() => onClientClick?.(client)}
              />
            </div>
          ))}
        </div>

        {/* Botón derecha */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="btn btn-light shadow-sm position-absolute top-50 end-0 translate-middle-y"
          style={{
            zIndex: 2,
            borderRadius: "999px",
            padding: "0.2rem 0.6rem",
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default MonthSection;
