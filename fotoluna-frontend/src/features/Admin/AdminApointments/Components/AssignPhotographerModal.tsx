/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/appointments/AssignPhotographerModal.tsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type {
    AssignPhotographerModalProps,
    CandidateEmployee,
    CandidatesResponse,
    AvailabilityStatus,
} from "./Types/types";

const PAGE_SIZE = 10; // Puedes hacerlo prop si quieres

// Normaliza cualquier string de disponibilidad que venga del backend
const normalizeAvailability = (value: any): AvailabilityStatus => {
    if (!value) return "busy"; // fallback, ajusta según tu lógica

    const v = String(value).trim().toLowerCase();

    // libres
    if (v.includes("free") || v.includes("available") || v.includes("disponible")) {
        return "free";
    }
    // parciales
    if (v.includes("partial") || v.includes("parcial")) {
        return "partial";
    }
    // ocupados
    if (v.includes("busy") || v.includes("ocupado")) {
        return "busy";
    }

    // por defecto
    return "busy";
};

const AssignPhotographerModal: React.FC<AssignPhotographerModalProps> = ({
    show,
    onClose,
    appointment,
    onAssigned,
    apiBaseUrl,
    getAuthHeaders,
}) => {
    const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false);
    const [assigning, setAssigning] = useState<boolean>(false);
    const [focusedEmployeeId, setFocusedEmployeeId] = useState<number | null>(null);

    const [suggested, setSuggested] = useState<CandidateEmployee | null>(null);
    const [candidates, setCandidates] = useState<CandidateEmployee[]>([]);

    const [filterAvailability, setFilterAvailability] =
        useState<AvailabilityStatus | "all">("all");
    const [sortBy, setSortBy] = useState<"score" | "load">("score");

    // paginación
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        if (!show || !appointment) return;
        loadCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, appointment?.appointmentId]);

    // Cuando cambien filtros/orden/reset de modal, vuelve a la página 1
    useEffect(() => {
        setCurrentPage(1);
    }, [filterAvailability, sortBy, show]);

    const loadCandidates = async () => {
        if (!appointment) return;

        setLoadingCandidates(true);
        try {
            const response = await axios.get<CandidatesResponse>(
                `${apiBaseUrl}/admin/appointments/${appointment.appointmentId}/candidates`,
                { headers: getAuthHeaders() }
            );

            // Normalizamos disponibilidad para que siempre sea "free" | "partial" | "busy"
            const rawSuggested = response.data.suggestedEmployee ?? null;
            const normalizedSuggested = rawSuggested
                ? {
                    ...rawSuggested,
                    availabilityStatus: normalizeAvailability(rawSuggested.availabilityStatus),
                }
                : null;

            const normalizedEmployees: CandidateEmployee[] = (response.data.employees ?? []).map(
                (emp) => ({
                    ...emp,
                    availabilityStatus: normalizeAvailability(emp.availabilityStatus),
                })
            );

            setSuggested(normalizedSuggested);
            setCandidates(normalizedEmployees);
        } catch (error) {
            console.error(error);
            alert("Error cargando los candidatos.");
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleAssign = async (employeeId: number) => {
        if (!appointment) return;
        if (!window.confirm("¿Asignar este fotógrafo a la cita?")) return;

        setAssigning(true);
        try {
            await axios.post(
                `${apiBaseUrl}/admin/appointments/${appointment.appointmentId}/assign`,
                { employee_id: employeeId },
                { headers: getAuthHeaders() }
            );
            onAssigned(); // el padre recarga y cierra
        } catch (error: any) {
            console.error(error);
            const msg =
                error?.response?.data?.message ||
                "Error asignando el fotógrafo, revisa disponibilidad.";
            alert(msg);
        } finally {
            setAssigning(false);
        }
    };

    const renderAvailabilityBadge = (status: AvailabilityStatus) => {
        if (status === "free")
            return <span className="badge bg-success">Libre</span>;
        if (status === "partial")
            return <span className="badge bg-warning text-dark">Parcial</span>;
        if (status === "busy")
            return <span className="badge bg-danger">Ocupado</span>;
        return <span className="badge bg-secondary">N/D</span>;
    };

    const renderAvailabilityBar = (candidate: CandidateEmployee) => {
        const blocks = 6;
        const used = Math.min(blocks, candidate.dayAppointmentsCount || 0);
        const arr = Array.from({ length: blocks }, (_, i) => i < used);

        return (
            <div style={{ display: "flex", gap: 2 }}>
                {arr.map((on, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: 12,
                            height: 8,
                            borderRadius: 3,
                            backgroundColor: on ? "#6c757d" : "#e9ecef",
                        }}
                    />
                ))}
            </div>
        );
    };

    // --- Filtros + ordenamiento memoizados ---
    const filteredCandidates = useMemo(() => {
        return candidates
            .filter((c) => {
                if (filterAvailability === "all") return true;
                return c.availabilityStatus === filterAvailability;
            })
            .sort((a, b) => {
                if (sortBy === "score") return (b.score || 0) - (a.score || 0);
                if (sortBy === "load")
                    return (a.dayAppointmentsCount || 0) - (b.dayAppointmentsCount || 0);
                return 0;
            });
    }, [candidates, filterAvailability, sortBy]);

    // --- Paginación sobre los candidatos filtrados ---
    const totalPages = Math.max(
        1,
        Math.ceil(filteredCandidates.length / PAGE_SIZE)
    );

    // Si la cantidad de registros cambia y la página actual queda fuera de rango, ajústala
    useEffect(() => {
        setCurrentPage((prev) =>
            prev > totalPages ? totalPages : prev < 1 ? 1 : prev
        );
    }, [totalPages]);

    const paginatedCandidates = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return filteredCandidates.slice(start, end);
    }, [filteredCandidates, currentPage]);

    if (!show || !appointment) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1040 }}
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div
                className="modal fade show"
                style={{ display: "block", zIndex: 1050 }}
                tabIndex={-1}
            >
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                Asignar fotógrafo – Cita #{appointment.appointmentId}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <div className="mb-3 p-2 rounded border bg-white">
                                <div className="d-flex flex-wrap justify-content-between">
                                    <div>
                                        <div className="fw-bold">Información de la cita</div>
                                        <div>
                                            <strong>Fecha:</strong> {appointment.date} &nbsp;
                                            <strong>Hora:</strong> {appointment.time}
                                        </div>
                                        <div>
                                            <strong>Cliente:</strong> {appointment.clientName}
                                        </div>
                                        <div>
                                            <strong>Evento:</strong> {appointment.eventName || "N/A"}
                                        </div>
                                    </div>
                                    {appointment.employeeName && (
                                        <div className="text-end">
                                            <div className="fw-bold">Asignado actualmente</div>
                                            <div>{appointment.employeeName}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {loadingCandidates ? (
                                <p>Cargando candidatos...</p>
                            ) : (
                                <>
                                    {suggested && (
                                        <div className="mb-3 p-3 border rounded bg-light">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                <div>
                                                    <div className="fw-bold">Sugerencia automática</div>

                                                    <div>{suggested.name}</div>
                                                    <small className="text-muted">
                                                        Basado en disponibilidad y carga de trabajo.
                                                    </small>
                                                    <div className="mt-1 d-flex flex-wrap gap-2">
                                                        {renderAvailabilityBadge(
                                                            suggested.availabilityStatus
                                                        )}
                                                        <span className="badge bg-info">
                                                            Citas hoy: {suggested.dayAppointmentsCount || 0}
                                                        </span>
                                                        {suggested.score != null && (
                                                            <span className="badge bg-secondary">
                                                                Score: {suggested.score}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                        disabled={
                                                            assigning ||
                                                            suggested.availabilityStatus === "busy"
                                                        }
                                                        onClick={() => handleAssign(suggested.employeeId)}
                                                    >
                                                        {assigning
                                                            ? "Asignando..."
                                                            : "Asignar sugerido"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Filtros */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-6 col-md-3">
                                            <label className="form-label mb-1">
                                                Disponibilidad
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={filterAvailability}
                                                onChange={(e) =>
                                                    setFilterAvailability(
                                                        e.target.value as AvailabilityStatus | "all"
                                                    )
                                                }
                                            >
                                                <option value="all">Todos</option>
                                                <option value="free">Libres</option>
                                                <option value="partial">Parciales</option>
                                                <option value="busy">Ocupados</option>
                                            </select>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="form-label mb-1">Ordenar por</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={sortBy}
                                                onChange={(e) =>
                                                    setSortBy(e.target.value as "score" | "load")
                                                }
                                            >
                                                <option value="score">Recomendado</option>
                                                <option value="load">Menos carga hoy</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Tabla candidatos */}
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Fotógrafo</th>
                                                    <th>Disponibilidad</th>
                                                    <th>Citas hoy</th>
                                                    <th>Carga</th>
                                                    <th>Score</th>
                                                    <th className="text-end">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedCandidates.map((c) => (
                                                    <tr
                                                        key={c.employeeId}
                                                        onClick={() =>
                                                            setFocusedEmployeeId((prev) =>
                                                                prev === c.employeeId ? null : c.employeeId
                                                            )
                                                        }
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <td>{c.name}</td>
                                                        <td>
                                                            {renderAvailabilityBadge(
                                                                c.availabilityStatus
                                                            )}
                                                        </td>
                                                        <td>{c.dayAppointmentsCount || 0}</td>
                                                        <td>{renderAvailabilityBar(c)}</td>
                                                        <td>{c.score != null ? c.score : "-"}</td>
                                                        <td className="text-end">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-success"
                                                                disabled={
                                                                    assigning ||
                                                                    c.availabilityStatus === "busy"
                                                                }
                                                                onClick={(e) => {
                                                                    // Evita que el click en el botón dispare también el onClick del <tr>
                                                                    e.stopPropagation();
                                                                    handleAssign(c.employeeId);
                                                                }}
                                                            >
                                                                Elegir
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {paginatedCandidates.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="text-center text-muted">
                                                            No hay fotógrafos que coincidan con los filtros.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Controles de paginación */}
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <small className="text-muted">
                                            Mostrando{" "}
                                            {filteredCandidates.length === 0
                                                ? 0
                                                : (currentPage - 1) * PAGE_SIZE + 1}{" "}
                                            -{" "}
                                            {Math.min(
                                                currentPage * PAGE_SIZE,
                                                filteredCandidates.length
                                            )}{" "}
                                            de {filteredCandidates.length} fotógrafos
                                        </small>

                                        <nav>
                                            <ul className="pagination pagination-sm mb-0">
                                                <li
                                                    className={`page-item ${
                                                        currentPage === 1 ? "disabled" : ""
                                                    }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setCurrentPage((p) => Math.max(1, p - 1))
                                                        }
                                                    >
                                                        Anterior
                                                    </button>
                                                </li>

                                                {Array.from(
                                                    { length: totalPages },
                                                    (_, i) => i + 1
                                                ).map((page) => (
                                                    <li
                                                        key={page}
                                                        className={`page-item ${
                                                            page === currentPage ? "active" : ""
                                                        }`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                ))}

                                                <li
                                                    className={`page-item ${
                                                        currentPage === totalPages ? "disabled" : ""
                                                    }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setCurrentPage((p) =>
                                                                Math.min(totalPages, p + 1)
                                                            )
                                                        }
                                                    >
                                                        Siguiente
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>

                                    {focusedEmployeeId && (
                                        <div className="mt-3 p-2 border rounded bg-white">
                                            {(() => {
                                                const emp = candidates.find(
                                                    (c) => c.employeeId === focusedEmployeeId
                                                );
                                                if (!emp) return null;

                                                return (
                                                    <>
                                                        <div className="fw-bold mb-1">
                                                            Agenda del día – {emp.name}
                                                        </div>
                                                        {emp.citasDelDia.length === 0 ? (
                                                            <small className="text-muted">
                                                                No tiene citas este día.
                                                            </small>
                                                        ) : (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {emp.citasDelDia.map((cita, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="px-2 py-1 rounded border bg-light"
                                                                    >
                                                                        <div
                                                                            className="fw-semibold"
                                                                            style={{ fontSize: "0.85rem" }}
                                                                        >
                                                                            {cita.time}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {cita.status}
                                                                        </small>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <br />

                                    <small className="text-muted">
                                        Leyenda:&nbsp;
                                        <span className="badge bg-success me-1">Libre</span>
                                        <span className="badge bg-warning text-dark me-1">
                                            Parcial
                                        </span>
                                        <span className="badge bg-danger">Ocupado</span>
                                    </small>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={assigning}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssignPhotographerModal;
