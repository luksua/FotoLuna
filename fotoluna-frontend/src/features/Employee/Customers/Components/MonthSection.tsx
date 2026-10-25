import React, { useRef, useCallback, useState, useEffect } from "react";
import ClientCard from "./ClientCard";

export interface Client {
  id?: number;
  name: string;
  documentNumber?: string;
  image?: string;
  hasAppointment?: boolean;
}

interface MonthSectionProps {
  month: string;
  clients: Client[];
  onClientClick?: (client: Client) => void;
}

const MonthSection: React.FC<MonthSectionProps> = React.memo(({
  month,
  clients,
  onClientClick,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    if (!clients.length) return;
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, clients]);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = 460;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  if (!clients.length) return null;

  return (
    <section className="month-section-container mb-4">
      {/* Cabecera del Mes */}
      <div className="month-header-bar">
        <div className="d-flex align-items-center gap-2">
          <div className="month-title-badge">
            <i className="bi bi-calendar2-heart-fill me-2"></i>
            <span className="month-name">{month}</span>
          </div>
          <span className="month-count-badge">
            {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
          </span>
        </div>

        {/* Botones de navegación en la cabecera si hay overflow */}
        <div className="month-nav-controls">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`btn-scroll-nav ${canScrollLeft ? "active" : "disabled"}`}
            aria-label="Desplazar a la izquierda"
            title="Ver anteriores"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`btn-scroll-nav ${canScrollRight ? "active" : "disabled"}`}
            aria-label="Desplazar a la derecha"
            title="Ver siguientes"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Contenedor relativo para lista horizontal */}
      <div className="month-cards-wrapper position-relative">
        {/* Track de tarjetas horizontal */}
        <div ref={scrollRef} className="month-cards-track">
          {clients.map((client, idx) => (
            <div key={client.id ?? `${client.name}-${idx}`} className="month-card-item">
              <ClientCard
                name={client.name}
                documentNumber={client.documentNumber}
                image={client.image}
                hasAppointment={client.hasAppointment}
                onClick={() => onClientClick?.(client)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default MonthSection;

