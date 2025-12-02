/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import axios from "axios";
import type {
    AssignPhotographerModalProps,
    CandidateEmployee,
    CandidatesResponse,
    AvailabilityStatus,
} from "./Types/types";

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

    useEffect(() => {
        if (!show || !appointment) return;
        loadCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, appointment?.appointmentId]);

    const loadCandidates = async () => {
        setLoadingCandidates(true);
        try {
            const response = await axios.get<CandidatesResponse>(
                `${apiBaseUrl}/admin/appointments/${appointment.appointmentId}/candidates`,
                { headers: getAuthHeaders() }
            );

            setSuggested(response.data.suggestedEmployee ?? null);
            setCandidates(response.data.employees ?? []);
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

    const filteredCandidates = candidates
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

    if (!show) return null;

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
                                                {filteredCandidates.map((c) => (
                                                    <tr key={c.employeeId}
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
                                                                    assigning || c.availabilityStatus === "busy"
                                                                }
                                                                onClick={() => handleAssign(c.employeeId)}
                                                            >
                                                                Elegir
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                                                                        <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>
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
