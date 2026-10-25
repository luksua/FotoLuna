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
    return `${cita.appointmentId}_${cita.date.getFullYear()}-${cita.date.getMonth()}-${cita.date.getDate()}_${cita.startTime}_${index}`;
};

const getInitials = (name?: string): string => {
    if (!name) return "FL";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getStatusBadgeConfig = (status: string) => {
    switch (status) {
        case "Confirmada":
            return {
                bgClass: "badge-status-confirmed",
                icon: "bi-check2-circle",
                label: "Confirmada",
            };
        case "Pendiente":
            return {
                bgClass: "badge-status-pending",
                icon: "bi-hourglass-split",
                label: "Pendiente",
            };
        case "Completada":
            return {
                bgClass: "badge-status-completed",
                icon: "bi-check-all",
                label: "Completada",
            };
        case "Cancelada":
            return {
                bgClass: "badge-status-cancelled",
                icon: "bi-x-circle",
                label: "Cancelada",
            };
        default:
            return {
                bgClass: "badge-status-default",
                icon: "bi-info-circle",
                label: status,
            };
    }
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
    const DOCUMENT_EVENT_ID = 6;

    // Fecha del título
    const titleDate = useMemo(() => {
        if (selectedDate) return selectedDate;
        if (citasDelDia.length > 0) return citasDelDia[0].date;
        return null;
    }, [selectedDate, citasDelDia]);

    const formattedTitleDate = useMemo(() => {
        if (!titleDate) return "Selecciona una fecha";
        const dateStr = titleDate.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }, [titleDate]);

    // Filtro por estado
    const filteredCitas = useMemo(() => {
        if (statusFilter === "Todas") return citasDelDia;
        return citasDelDia.filter((c) => c.status === statusFilter);
    }, [citasDelDia, statusFilter]);

    const handleCardClick = useCallback((cita: Cita, key: string) => {
        onSelectCita(cita);
        setExpandedKey((prev) => (prev === key ? null : key));
    }, [onSelectCita]);

    const isEmptyForDay = citasDelDia.length === 0;

    const totalTexto = isEmptyForDay
        ? "No hay citas para este día."
        : citasDelDia.length === 1
            ? "1 cita programada"
            : `${citasDelDia.length} citas programadas`;

    return (
        <div className="appointment-details-modern">
            {/* Header del Panel */}
            <div className="appointments-panel-header-modern">
                <div className="panel-title-container">
                    <span className="panel-date-badge">
                        <i className="bi bi-calendar-event me-1"></i>
                        {formattedTitleDate}
                    </span>
                    <h3 className="appointments-panel-title-modern">
                        Detalle del Día
                    </h3>
                    <p className="appointments-panel-subtitle-modern">
                        <i className="bi bi-info-circle me-1"></i>
                        {totalTexto}
                    </p>
                </div>

                <button
                    type="button"
                    className="appointments-new-btn-modern"
                    onClick={onNewClick}
                    title="Crear nueva cita"
                >
                    <i className="bi bi-plus-lg me-1" />
                    <span>Nueva cita</span>
                </button>
            </div>

            {/* Filtros de estado */}
            <div className="appointments-filters-modern">
                {[
                    { label: "Todas", icon: "bi-grid-fill" },
                    { label: "Pendiente", icon: "bi-hourglass-split" },
                    { label: "Confirmada", icon: "bi-check2-circle" },
                    { label: "Completada", icon: "bi-check-all" },
                    { label: "Cancelada", icon: "bi-x-circle" },
                ].map(({ label, icon }) => (
                    <button
                        key={label}
                        type="button"
                        className={
                            "appointments-filter-chip-modern" +
                            (statusFilter === label ? " active" : "")
                        }
                        onClick={() => setStatusFilter(label as StatusFilter)}
                    >
                        <i className={`bi ${icon} me-1`}></i>
                        {label}
                    </button>
                ))}
            </div>

            {/* Lista de Citas */}
            <div className="appointments-list-modern">
                {filteredCitas.map((cita, index) => {
                    const key = getCitaKey(cita, index);
                    const isExpanded = expandedKey === key;
                    const isSelected = selectedCita?.appointmentId === cita.appointmentId;
                    const statusConfig = getStatusBadgeConfig(cita.status);
                    const initials = getInitials(cita.client);
                    const packageNameLabel =
                        cita.eventIdFK === DOCUMENT_EVENT_ID ? "Tipo Documento" : "Paquete";

                    return (
                        <div
                            key={key}
                            className={
                                "appointment-card-modern" +
                                (isExpanded ? " expanded" : "") +
                                (isSelected ? " selected" : "")
                            }
                            onClick={() => handleCardClick(cita, key)}
                        >
                            {/* Cabecera de la tarjeta */}
                            <div className="appointment-card-top">
                                <div className="appointment-card-avatar" title={cita.client}>
                                    {initials}
                                </div>

                                <div className="appointment-card-primary-info">
                                    <div className="appointment-card-client-name">
                                        {cita.client || "Cliente sin nombre"}
                                    </div>
                                    <div className="appointment-card-tags">
                                        {cita.eventName && (
                                            <span className="appointment-tag event-tag">
                                                <i className="bi bi-camera me-1"></i>
                                                {cita.eventName}
                                            </span>
                                        )}
                                        {cita.packageName && (
                                            <span className="appointment-tag package-tag">
                                                <i className="bi bi-box-seam me-1"></i>
                                                {cita.packageName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="appointment-card-right-actions">
                                    <div className="appointment-card-time-badge">
                                        <i className="bi bi-clock me-1"></i>
                                        {cita.startTime}
                                    </div>
                                    <button
                                        type="button"
                                        className="appointment-card-edit-btn"
                                        title="Editar cita"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditClick(cita);
                                        }}
                                    >
                                        <i className="bi bi-pencil-fill" />
                                    </button>
                                </div>
                            </div>

                            {/* Fila de estado y toggle expandir */}
                            <div className="appointment-card-status-row">
                                <span className={`status-pill ${statusConfig.bgClass}`}>
                                    <i className={`bi ${statusConfig.icon} me-1`}></i>
                                    {statusConfig.label}
                                </span>

                                <span className="expand-indicator">
                                    {isExpanded ? (
                                        <>Menos detalles <i className="bi bi-chevron-up ms-1"></i></>
                                    ) : (
                                        <>Ver detalles <i className="bi bi-chevron-down ms-1"></i></>
                                    )}
                                </span>
                            </div>

                            {/* Detalles desplegables */}
                            {isExpanded && (
                                <div className="appointment-card-expanded-body">
                                    <div className="details-grid">
                                        {cita.document && (
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    <i className="bi bi-person-vcard me-1"></i>
                                                    Documento
                                                </span>
                                                <span className="detail-value">{cita.document}</span>
                                            </div>
                                        )}

                                        {cita.phone && (
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    <i className="bi bi-telephone me-1"></i>
                                                    Teléfono
                                                </span>
                                                <span className="detail-value">{cita.phone}</span>
                                            </div>
                                        )}

                                        {cita.email && (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">
                                                    <i className="bi bi-envelope me-1"></i>
                                                    Correo
                                                </span>
                                                <span className="detail-value">{cita.email}</span>
                                            </div>
                                        )}

                                        {cita.location && (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">
                                                    <i className="bi bi-geo-alt me-1"></i>
                                                    Lugar / Dirección
                                                </span>
                                                <span className="detail-value">{cita.location}</span>
                                            </div>
                                        )}

                                        {cita.appointmentDuration && (
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    <i className="bi bi-hourglass me-1"></i>
                                                    Duración
                                                </span>
                                                <span className="detail-value">{cita.appointmentDuration} min</span>
                                            </div>
                                        )}

                                        {cita.packageName && (
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    <i className="bi bi-award me-1"></i>
                                                    {packageNameLabel}
                                                </span>
                                                <span className="detail-value">{cita.packageName}</span>
                                            </div>
                                        )}

                                        {cita.notes && (
                                            <div className="detail-item full-width notes-item">
                                                <span className="detail-label">
                                                    <i className="bi bi-chat-left-text me-1"></i>
                                                    Notas
                                                </span>
                                                <span className="detail-value notes-text">{cita.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="expanded-card-actions">
                                        <button
                                            type="button"
                                            className="btn-edit-action"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditClick(cita);
                                            }}
                                        >
                                            <i className="bi bi-pencil-square me-1"></i>
                                            Modificar Cita
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredCitas.length === 0 && !isEmptyForDay && (
                    <div className="appointments-empty-filter text-center py-4">
                        <div className="empty-icon-box">
                            <i className="bi bi-funnel"></i>
                        </div>
                        <h6 className="fw-bold mt-2 text-dark">Sin resultados con este filtro</h6>
                        <p className="text-muted small mb-3">
                            No hay citas marcadas como "{statusFilter}" para esta fecha.
                        </p>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            onClick={() => setStatusFilter("Todas")}
                        >
                            Ver todas las citas del día
                        </button>
                    </div>
                )}

                {isEmptyForDay && (
                    <div className="appointments-empty-day text-center py-5">
                        <div className="empty-day-icon-circle">
                            <i className="bi bi-calendar2-plus"></i>
                        </div>
                        <h6 className="fw-bold mt-3 text-dark">Día Libre o Sin Citas</h6>
                        <p className="text-muted small mb-3 px-3">
                            {selectedDate
                                ? "No tienes ninguna sesión ni cita agendada para esta fecha."
                                : "Selecciona un día en el calendario para explorar la agenda."}
                        </p>
                        <button
                            type="button"
                            className="btn btn-primary rounded-pill px-3 py-2 btn-sm shadow-sm fl-btn-primary"
                            onClick={onNewClick}
                        >
                            <i className="bi bi-plus-circle me-1"></i>
                            Agendar para este día
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default AppointmentDetails;