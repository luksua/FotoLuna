import React, { useMemo, useState, useCallback } from "react";
import type { Cita } from "../Components/Types/types";

interface AppointmentDetailsProps {
    citasDelDia: Cita[];
    selectedCita: Cita | null;
    selectedDate: Date | null;
    onSelectCita: (cita: Cita) => void;
    onEditClick: (cita: Cita) => void;
    onNewClick: () => void;
}

type StatusFilter =
    | "Todas"
    | "Pendiente"
    | "Confirmada"
    | "Cancelada"
    | "Completada";

const getCitaKey = (cita: Cita, index: number): string => {
    return `${cita.appointmentId}_${cita.date.toISOString()}_${cita.startTime}_${index}`;
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = React.memo(({
    citasDelDia,
    selectedCita,
    selectedDate,
    onSelectCita,
    onEditClick,
    onNewClick,
}) => {
    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todas");

    // Fecha del título
    const titleDate = useMemo(() => {
        if (selectedDate) return selectedDate;
        if (citasDelDia.length > 0) return citasDelDia[0].date;
        return null;
    }, [selectedDate, citasDelDia]);

    const formattedTitleDate = titleDate
        ? titleDate.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Selecciona una fecha";

    // Filtro por estado
    const filteredCitas = useMemo(() => {
        if (statusFilter === "Todas") return citasDelDia;
        return citasDelDia.filter((c) => c.status === statusFilter);
    }, [citasDelDia, statusFilter]);

    const handleCardClick = useCallback((cita: Cita, key: string) => {
        onSelectCita(cita); // Actualiza selectedCita en el padre
        setExpandedKey(key);
    }, [onSelectCita]);

    const isEmptyForDay = citasDelDia.length === 0;

    const totalTexto = isEmptyForDay
        ? "No hay citas para este día."
        : citasDelDia.length === 1
            ? "1 cita reservada para este día."
            : `${citasDelDia.length} citas reservadas para este día.`;

    return (
        <div className="appointment-details">
            {/* Header */}
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

            {/* Filtros */}
            <div className="appointments-filters">
                {(
                    [
                        "Todas",
                        "Pendiente",
                        "Confirmada",
                        "Cancelada",
                        "Completada",
                    ] as StatusFilter[]
                ).map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={
                            "appointments-filter-chip" +
                            (statusFilter === value ? " active" : "")
                        }
                        onClick={() => setStatusFilter(value)}
                    >
                        {value}
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div className="appointments-list">
                {filteredCitas.map((cita, index) => {
                    const key = getCitaKey(cita, index);
                    const isExpanded = expandedKey === key;

                    const isSelected =
                        selectedCita?.appointmentId === cita.appointmentId;

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
                            {/* Icono */}
                            <div className="appointment-card-icon">
                                <i className="bi bi-person" />
                            </div>

                            {/* Datos principales */}
                            <div className="appointment-card-main">
                                <div className="appointment-card-title">
                                    {cita.client}
                                </div>
                            </div>

                            {/* Hora */}
                            <div className="appointment-card-time">
                                {cita.startTime}
                            </div>

                            {/* Botón editar */}
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

                            {/* Expanded */}
                            {isExpanded && (
                                <div className="appointment-card-body">
                                    {/* Todo el contenido detallado va aquí dentro */}

                                    {cita.document && (
                                        <p className="appointment-card-body-meta">
                                            <strong>Documento:</strong>{" "}
                                            {cita.document}
                                        </p>
                                    )}

                                    {cita.email && (
                                        <p className="appointment-card-body-meta">
                                            <strong>Correo:</strong> {cita.email}
                                        </p>
                                    )}

                                    {cita.phone && (
                                        <p className="appointment-card-body-meta">
                                            <strong>Teléfono:</strong> {cita.phone}
                                        </p>
                                    )}

                                    {cita.eventName && (
                                        <p className="appointment-card-body-meta">
                                            <strong>Evento:</strong>{" "}
                                            {cita.eventName}
                                        </p>
                                    )}

                                    {cita.packageName && (
                                        <p className="appointment-card-body-meta">
                                            <strong>Paquete:</strong>{" "}
                                            {cita.packageName}
                                        </p>
                                    )}

                                    {cita.location && (
                                        <p className="appointment-card-body-meta">
                                            <strong>Dirección:</strong>{" "}
                                            {cita.location}
                                        </p>
                                    )}

                                    <p className="appointment-card-body-meta">
                                        <strong>Horario:</strong>{" "}
                                        {cita.startTime}
                                    </p>

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
                            )}
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
});

export default AppointmentDetails;
