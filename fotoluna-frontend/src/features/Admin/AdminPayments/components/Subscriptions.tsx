/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import axios from "axios";
import ExportButton from "../../../../components/ExportButton";
import { exportStoragePaymentsToExcel } from "../../../../services/exportStoragePaymentsService";

export type PaymentStatus = "approved" | "rejected" | "pending";

export interface Payment {
    paymentId: number;
    amount: number;
    paymentDate: string;
    paymentStatus: PaymentStatus;
}

export interface PaymentSummary {
    totalApprovedAmount: number;
    pendingCount: number;
    approvedCount: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const Subscriptions: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<PaymentSummary | null>(null);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | PaymentStatus>("");
    const [fromDate, setFromDate] = useState<string>("");  // yyyy-mm-dd
    const [toDate, setToDate] = useState<string>("");      // yyyy-mm-dd

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // Fetch all storage payments across all pages
    const fetchAllStoragePayments = async () => {
        let all: Payment[] = [];
        let pageNum = 1;
        let lastPageNum = 1;
        try {
            do {
                const { data } = await axios.get(`${API_BASE}/api/admin/payments`, {
                    params: {
                        search: search || undefined,
                        status: status || undefined,
                        from: fromDate || undefined,
                        to: toDate || undefined,
                        page: pageNum,
                        per_page: 50,
                    },
                });
                all = all.concat(data.data);
                lastPageNum = data.last_page;
                pageNum++;
            } while (pageNum <= lastPageNum);
        } catch (err) {
            console.error('Error fetching all storage payments for export:', err);
        }
        return all;
    };

    const handleExportToExcel = async () => {
        const allPayments = await fetchAllStoragePayments();
        // Usar el resumen si está disponible para mostrar ingresos totales
        const totalAmount = summary?.totalApprovedAmount ?? undefined;
        await exportStoragePaymentsToExcel(allPayments, 'Pagos_Almacenamiento_Todos', totalAmount);
    };

    const fetchSummary = async () => {
        try {
            const { data } = await axios.get<PaymentSummary>(
                `${API_BASE}/api/admin/payments/summary`
            );
            setSummary(data);
        } catch (error) {
            console.error("Error cargando resumen de pagos", error);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${API_BASE}/api/admin/payments`,
                {
                    params: {
                        search: search || undefined,
                        status: status || undefined,
                        from: fromDate || undefined,
                        to: toDate || undefined,
                        page,
                        per_page: 10,
                    },
                }
            );

            // el controlador devuelve un LengthAwarePaginator completo
            setPayments(data.data);
            setLastPage(data.last_page);
        } catch (error) {
            console.error("Error cargando pagos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // Recarga cuando cambian page o status / fechas
    useEffect(() => {
        fetchPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status, fromDate, toDate]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPayments();
    };

    const resetFilters = () => {
        setSearch("");
        setStatus("");
        setFromDate("");
        setToDate("");
        setPage(1);
        fetchPayments();
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <div>
            {/* Tarjetas de resumen */}
            <div className="summary-cards" style={{ marginBottom: 16 }}>
                <div className="summary-card">
                    <p className="summary-card-title">Ingresos Totales</p>
                    <p className="summary-card-value">
                        {summary
                            ? `$${formatCurrency(summary.totalApprovedAmount)}`
                            : "—"}
                    </p>
                </div>

                <div className="summary-card">
                    <p className="summary-card-title">Transacciones Pendientes</p>
                    <p className="summary-card-value">
                        {summary ? summary.pendingCount : "—"}
                    </p>
                </div>

                <div className="summary-card">
                    <p className="summary-card-title">Transacciones Aprobadas</p>
                    <p className="summary-card-value">
                        {summary ? summary.approvedCount : "—"}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <form className="filter-box" onSubmit={handleSearchSubmit}>
                <div className="filter-row">
                    <input
                        className="filter-input"
                        placeholder="Buscar por ID, usuario, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="filter-select"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value as any);
                            setPage(1);
                        }}
                    >
                        <option value="">Todos los estados</option>
                        <option value="approved">Aprobado</option>
                        <option value="pending">Pendiente</option>
                        <option value="rejected">Rechazado</option>
                    </select>

                    {/* rango de fechas */}
                    <input
                        type="date"
                        className="filter-input"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Desde"
                    />
                    <input
                        type="date"
                        className="filter-input"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Hasta"
                    />

                    <button type="submit" className="btn-primary">
                        Buscar
                    </button>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={resetFilters}
                    >
                        Limpiar
                    </button>
                </div>
            </form>

            {/* Botón de exportar */}
            <div style={{ marginBottom: 16 }}>
                <ExportButton onClick={handleExportToExcel} label="Descargar Excel" />
            </div>
            {/* Tabla de pagos */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID Transacción</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                                    Cargando...
                                </td>
                            </tr>
                        )}

                        {!loading && payments.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                                    No se encontraron registros.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            payments.map((p) => (
                                <tr key={p.paymentId}>
                                    <td>{p.paymentId}</td>
                                    <td>
                                        {new Date(p.paymentDate).toLocaleString("es-CO", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </td>
                                    <td>${formatCurrency(p.amount)}</td>
                                    <td>
                                        <StatusBadge status={p.paymentStatus} />
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {/* Paginación */}
                <div className="pagination">
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className={"page-btn" + (page <= 1 ? " disabled" : "")}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {page} de {lastPage}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setPage((prev) => Math.min(lastPage, prev + 1))
                        }
                        className={
                            "page-btn" + (page >= lastPage ? " disabled" : "")
                        }
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
    let className = "badge ";
    if (status === "approved") className += "approved";
    else if (status === "pending") className += "pending";
    else className += "rejected";

    const label =
        status === "approved"
            ? "Aprobado"
            : status === "pending"
            ? "Pendiente"
            : "Rechazado";

    return <span className={className}>{label}</span>;
};

export default Subscriptions;
