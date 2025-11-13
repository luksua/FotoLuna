import React from "react";
import ClientCard from "./ClientCard";

interface Client {
  name: string;
  image?: string;
}

interface MonthSectionProps {
  month: string;
  clients: Client[];
}

const MonthSection: React.FC<MonthSectionProps> = ({ month, clients }) => {
  if (!clients.length) return null;

  return (
    <div className="mb-5">
      <div
        className="fw-bold mb-3 px-3 py-1"
        style={{
          backgroundColor: "#f3e6f7",
          borderLeft: "4px solid #8c2db0",
          display: "inline-block",
          borderRadius: "4px",
        }}
      >
        {month}
      </div>

      {/* Carrusel horizontal */}
      <div
        className="d-flex overflow-auto pb-3"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {clients.map((client, idx) => (
          <div key={idx} style={{ scrollSnapAlign: "start" }}>
            <ClientCard {...client} onClick={() => alert(`Cliente: ${client.name}`)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthSection;
