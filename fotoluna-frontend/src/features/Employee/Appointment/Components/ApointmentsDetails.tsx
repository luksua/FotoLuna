// components/appointments/AppointmentDetails.tsx
import React, { useMemo, useState } from "react";
import type { Cita } from "../Components/Types/types";

interface AppointmentDetailsProps {
    citasDelDia: Cita[];
    selectedCita: Cita | null;
    selectedDate: Date | null;
    onSelectCita: (cita: Cita) => void;
    onEditClick: (cita: Cita) => void;
    onNewClick: () => void;
}

type StatusFilter = "Todas" | "Pendiente" | "Confirmada" | "Cancelada" | "Completada";

const getCitaKey = (cita: Cita, index: number): string | number => {
    const anyCita = cita as any;
    if (anyCita.id !== undefined && anyCita.id !== null) return anyCita.id;
    const datePart =
        cita.date instanceof Date ? cita.date.toISOString() : String(cita.date);
    return `${datePart}_${cita.startTime}_${cita.endTime}_${index}`;
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
    citasDelDia,
    selectedCita,
    selectedDate,
    onSelectCita,
    onEditClick,
    onNewClick,
}) => {
    const [expandedKey, setExpandedKey] = useState<string | number | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todas");

    const titleDate = useMemo(() => {
        if (selectedDate) return selectedDate;
        if (citasDelDia.length > 0 && citasDelDia[0].date instanceof Date) {
            return citasDelDia[0].date as Date;
        }
        return null;
    }, [selectedDate, citasDelDia]);

    const formattedTitleDate = titleDate
        ? titleDate.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Selecciona una fecha";

    const filteredCitas = useMemo(() => {
        if (statusFilter === "Todas") return citasDelDia;
        return citasDelDia.filter((c) => c.status === statusFilter);
    }, [citasDelDia, statusFilter]);

    const handleCardClick = (cita: Cita, key: string | number) => {
        onSelectCita(cita);
        setExpandedKey((prev) => (prev === key ? null : key));
    };

    const isEmptyForDay = citasDelDia.length === 0;

    const totalTexto = isEmptyForDay
        ? "No hay citas para este día."
        : citasDelDia.length === 1
        ? "1 cita reservada para este día."
        : `${citasDelDia.length} citas reservadas para este día.`;

    return (
        <div className="appointment-details">
            {/* Header tipo “Citas para …” + botón nueva */}
            <div className="appointments-panel-header">
                <div>
                    <h3 className="appointments-panel-title">
                        Citas para {formattedTitleDate}
                    </h3>
                    <p className="appointments-panel-subtitle">{totalTexto}</p>
                </div>

                <button className="appointments-new-btn" onClick={onNewClick}>
                    <i className="fas fa-plus me-1" />
                    Nueva cita
                </button>
            </div>

            {/* Filtros por estado */}
            <div className="appointments-filters">
                {(["Todas", "Pendiente", "Confirmada", "Cancelada", "Completada"] as StatusFilter[]).map(
                    (value) => (
                        <button
                            key={value}
                            type="button"
                            className={
                                "appointments-filter-chip" +
                                (statusFilter === value ? " active" : "")
                            }
                            onClick={() => setStatusFilter(value)}
                        >
                            {value === "Todas" ? "Todas" : value}
                        </button>
                    )
                )}
            </div>

            {/* Lista de citas filtradas */}
            <div className="appointments-list">
                {filteredCitas.map((cita, index) => {
                    const key = getCitaKey(cita, index);
                    const isExpanded = expandedKey === key;

                    const isSelected =
                        selectedCita &&
                        ((("id" in (selectedCita as any) &&
                            (selectedCita as any).id === (cita as any).id) ||
                            (selectedCita.date?.toString() ===
                                cita.date?.toString() &&
                                selectedCita.startTime === cita.startTime &&
                                selectedCita.endTime === cita.endTime)));

                    return (
                        <div
                            key={key}
                            className={
                                "appointment-card" +
                                (isExpanded ? " expanded" : "") +
                                (isSelected ? " selected" : "")
                            }
                            onClick={() => handleCardClick(cita, key)}
                        >
                            {/* icono persona */}
                            <div className="appointment-card-icon">
                                <i className="bi bi-person" />
                            </div>

                            {/* contenido principal */}
                            <div className="appointment-card-main">
                                <div className="appointment-card-title">
                                    {cita.client}
                                </div>
                                <div className="appointment-card-subtitle">
                                    {cita.location || "Sin ubicación"}
                                </div>
                            </div>

                            {/* hora */}
                            <div className="appointment-card-time">
                                {cita.startTime} - {cita.endTime}
                            </div>

                            {/* editar */}
                            <button
                                className="appointment-card-edit"
                                title="Editar cita"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditClick(cita);
                                }}
                            >
                                <i className="bi bi-pencil-square" />
                            </button>

                            {/* bloque expandido */}
                            <div className="appointment-card-body">
                                {cita.notes && (
                                    <p className="appointment-card-body-text">
                                        <strong>Notas:</strong> {cita.notes}
                                    </p>
                                )}
                                <p className="appointment-card-body-meta">
                                    <strong>Estado:</strong>{" "}
                                    <span className="badge bg-light text-dark">
                                        {cita.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                    );
                })}

                {filteredCitas.length === 0 && !isEmptyForDay && (
                    <div className="text-center text-muted py-3">
                        <i className="far fa-filter fa-lg d-block mb-2" />
                        <p className="mb-0">
                            No hay citas con ese estado para este día.
                        </p>
                    </div>
                )}

                {isEmptyForDay && (
                    <div className="text-center text-muted py-4">
                        <i className="fas fa-calendar-day fa-2x mb-2" />
                        <p className="mb-0">
                            {selectedDate
                                ? "No hay citas para este día."
                                : "Selecciona un día para ver sus citas."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetails;
