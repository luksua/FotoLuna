// src/components/admin/appointments/AdminAppointments.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import AssignPhotographerModal from "../Components/AssignPhotographerModal";
import type { AdminAppointment } from "../Components/Types/types";
import HomeLayout from "../../../../layouts/HomeAdminLayout";

const API_BASE_URL = "http://127.0.0.1:8000/api"; // ajusta a tu entorno

const AdminAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // filtros
    const [filterText, setFilterText] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterAssigned, setFilterAssigned] = useState<string>("all"); // all | assigned | unassigned
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "all">("all");


    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AdminAppointment | null>(null);

    // TODO: cambia esto por tu implementación real de auth
    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token
            ? {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            }
            : { Accept: "application/json" };
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.get<AdminAppointment[]>(
                `${API_BASE_URL}/admin/appointments`,
                { headers: getAuthHeaders() }
            );
            setAppointments(response.data);
        } catch (error) {
            console.error(error);
            alert("Error cargando las citas del administrador.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenModal = (appointment: AdminAppointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleAssigned = () => {
        // Se ejecuta cuando el modal asigna correctamente
        loadAppointments();
        handleCloseModal();
    };
    const filteredAppointments = appointments.filter((a) => {
        // filtro por texto (cliente o evento)
        const text = filterText.toLowerCase();
        const matchesText =
            !text ||
            a.clientName.toLowerCase().includes(text) ||
            (a.eventName || "").toLowerCase().includes(text);

        // filtro por estado
        const matchesStatus =
            filterStatus === "all" ? true : a.status === filterStatus;

        // filtro por asignación
        const isAssigned = !!a.employeeId;
        const matchesAssigned =
            filterAssigned === "all"
                ? true
                : filterAssigned === "assigned"
                    ? isAssigned
                    : !isAssigned;

        return matchesText && matchesStatus && matchesAssigned;



    });
    const sortedAppointments = [...filteredAppointments];

    if (sortOrder === "newest") {
        sortedAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB.getTime() - dateA.getTime(); // más nueva → primero
        });
    } else if (sortOrder === "oldest") {
        sortedAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA.getTime() - dateB.getTime(); // más vieja → primero
        });
    }





    return (
        <HomeLayout>
            <div className="container mt-4">
                <h2 className="mb-3">Citas</h2>
                <div className="row g-3 mb-3">
                    <div className="col-12 col-md-3">
                        <label className="form-label mb-1">Buscar</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Cliente o evento..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label mb-1">Estado</label>
                        <select
                            className="form-select form-select-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            <option value="Pending_assignment">Pendiente asignación</option>
                            <option value="Scheduled">Programada</option>
                            <option value="Completed">Completada</option>
                            <option value="Cancelled">Cancelada</option>
                        </select>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label mb-1">Asignación</label>
                        <select
                            className="form-select form-select-sm"
                            value={filterAssigned}
                            onChange={(e) => setFilterAssigned(e.target.value)}
                        >
                            <option value="all">Todas</option>
                            <option value="assigned">Con fotógrafo</option>
                            <option value="unassigned">Sin fotógrafo</option>
                        </select>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label mb-1">Ordenar por</label>
                        <select
                            className="form-select form-select-sm"
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(e.target.value as "newest" | "oldest" | "all")
                            }
                        >
                            <option value="all">Todas (sin orden)</option>
                            <option value="newest">Más nueva primero</option>
                            <option value="oldest">Más vieja primero</option>
                        </select>
                    </div>





                </div>





                {loading ? (
                    <p>Cargando citas...</p>
                ) : appointments.length === 0 ? (
                    <p>No hay citas registradas.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cliente</th>
                                    <th>Evento</th>
                                    <th>Fotógrafo</th>
                                    <th>Estado</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAppointments.map((a) => (
                                    <tr key={a.appointmentId}>
                                        <td>{a.date}</td>
                                        <td>{a.time}</td>
                                        <td>{a.clientName}</td>
                                        <td>{a.eventName}</td>
                                        <td>{a.employeeName || <em>Sin asignar</em>}</td>
                                        <td>{a.status}</td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleOpenModal(a)}
                                            >
                                                {a.employeeId ? "Reasignar" : "Asignar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && selectedAppointment && (
                    <AssignPhotographerModal
                        show={showModal}
                        onClose={handleCloseModal}
                        appointment={selectedAppointment}
                        onAssigned={handleAssigned}
                        apiBaseUrl={API_BASE_URL}
                        getAuthHeaders={getAuthHeaders}
                    />
                )}
            </div>
        </HomeLayout>
    );
};

export default AdminAppointments;
