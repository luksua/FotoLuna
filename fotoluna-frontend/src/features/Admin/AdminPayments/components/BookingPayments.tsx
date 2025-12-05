/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";

import PaymentTable from "../../../Employee/Payment/Component/PaymentTable";
import PaymentFilters from "../../../Employee/Payment/Component/PaymentFilters";
import ExportButton from "../../../../components/ExportButton";
import { exportPaymentsToExcel } from "../../../../services/exportService";
import type {
    Payment,
    FilterType,
} from "../../../Employee/Payment/Component/Types/payment";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const BookingPayments: React.FC = () => {
    const [filter, setFilter] = useState<FilterType>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [searchTerm, setSearchTerm] = useState("");
    const [order, setOrder] = useState<"asc" | "desc">("desc");

    const [payments, setPayments] = useState<Payment[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            setError(null);

            try {
                const params: any = {
                    page: currentPage,
                    per_page: itemsPerPage,
                    order,
                };

                if (filter !== "all") params.status = filter;
                if (searchTerm.trim() !== "") params.client = searchTerm.trim();

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_URL}/api/admin/booking-payments`,
                    {
                        params,
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : undefined,
                    }
                );

                const payload = response.data;
                const data: Payment[] = payload.data ?? [];
                const meta = payload.meta ?? null;

                setPayments(data);
                setTotalPages(meta?.last_page ?? payload.last_page ?? 1);
                setTotalItems(meta?.total ?? payload.total ?? data.length);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los pagos. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [filter, currentPage, searchTerm, order]);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleViewDetails = (paymentId: number) => {
        const found = payments.find((p) => p.id === paymentId) || null;
        setSelectedPayment(found);
        setShowDetailModal(!!found);
    };

    const formatCOP = (value: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(value);

    const handleDownloadBookingReceipt = async (bookingId: number) => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_URL}/api/bookings/${bookingId}/receipt`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        Accept: "application/pdf",
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `recibo-FL-${bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error descargando recibo general:", err);
            alert("No se pudo descargar el recibo.");
        }
    };

    const handleDownloadInstallmentReceipt = async (
        payment: Payment,
        installmentId: number
    ) => {
        try {
            const appointmentId = payment.appointment_id;

            if (!appointmentId) {
                alert("No se encontró el ID de la cita para este pago.");
                return;
            }

            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_URL}/api/appointments/${appointmentId}/installments/${installmentId}/receipt`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        Accept: "application/pdf",
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `recibo-cuota-${installmentId}-FL-${appointmentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error descargando recibo de cuota:", err);
            alert("No se pudo descargar el recibo de esta cuota.");
        }
    };

    const renderDetailModal = () => {
        if (!showDetailModal || !selectedPayment) return null;

        const p = selectedPayment;
        const installments = p.installments ?? [];
        const hasInstallments = installments.length > 0;

        const total = p.totalAmount;

        const paidFromInstallments = hasInstallments
            ? installments
                .filter((i) => i.paid)
                .reduce((s, i) => s + i.amount, 0)
            : p.status === "paid"
                ? total
                : 0;

        const paid = paidFromInstallments;
        const pending = Math.max(0, total - paid);

        return (
            <div
                className="custom-modal-overlay"
                role="dialog"
                aria-modal="true"
                onClick={() => setShowDetailModal(false)}
            >
                <div
                    className="custom-modal bg-custom-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title">Detalle de pago</h5>
                            <small className="text-muted">
                                {p.clientName} · {p.date}
                            </small>
                            <br />
                            <small className="text-muted">{p.description}</small>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                            onClick={() => setShowDetailModal(false)}
                        />
                    </div>

                    <div className="modal-body">
                        {/* Resumen */}
                        <div className="row g-2 mb-4 mt-1">
                            <div className="col-12 col-md-4">
                                <div className="shadow p-2 rounded bg-light h-100">
                                    <small className="text-muted d-block">
                                        Total del servicio
                                    </small>
                                    <strong>{formatCOP(total)}</strong>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="shadow p-2 rounded bg-light h-100">
                                    <small className="text-muted d-block">Pagado</small>
                                    <strong>{formatCOP(paid)}</strong>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="shadow p-2 rounded bg-light h-100">
                                    <small className="text-muted d-block">
                                        Saldo pendiente
                                    </small>
                                    <strong>{formatCOP(pending)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de cuotas */}
                        {!hasInstallments ? (
                            <p className="text-muted">
                                Este pago no está dividido en cuotas. Estado:{" "}
                                <strong>{p.status}</strong>
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Vencimiento</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th>Recibo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {installments.map((ins, index) => {
                                            let badgeClass = "status-pill sm ";
                                            let label = "";

                                            if (ins.paid) {
                                                badgeClass += "paid";
                                                label = "Pagada";
                                            } else if (ins.is_overdue) {
                                                badgeClass += "expired";
                                                label = "Vencida";
                                            } else {
                                                badgeClass += "pending";
                                                label = "Pendiente";
                                            }

                                            const dateLabel = ins.due_date
                                                ? new Date(ins.due_date).toLocaleDateString(
                                                    "es-CO",
                                                    { dateStyle: "medium" }
                                                )
                                                : "—";

                                            return (
                                                <tr key={ins.id ?? index}>
                                                    <td>{index + 1}</td>
                                                    <td>{dateLabel}</td>
                                                    <td>{formatCOP(ins.amount)}</td>
                                                    <td>
                                                        <span className={badgeClass}>{label}</span>
                                                    </td>
                                                    <td>
                                                        {ins.paid &&
                                                            ins.id != null &&
                                                            p.booking_id && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() =>
                                                                        handleDownloadInstallmentReceipt(
                                                                            p,
                                                                            ins.id as number
                                                                        )
                                                                    }
                                                                >
                                                                    Ver recibo
                                                                </button>
                                                            )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        {/* Recibo general si hay algo pagado */}
                        {p.booking_id && paid > 0 && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary me-auto"
                                onClick={() =>
                                    handleDownloadBookingReceipt(p.booking_id as number)
                                }
                            >
                                Recibo general
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowDetailModal(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const fetchAllPayments = async () => {
        const token = localStorage.getItem('token');
        const all: Payment[] = [];

        let page = 1;
        const per_page = 50; // fetch in larger batches to reduce requests
        let lastPage = 1;

        try {
            do {
                const params: any = {
                    page,
                    per_page,
                    order,
                };

                if (filter !== 'all') params.status = filter;
                if (searchTerm.trim() !== '') params.client = searchTerm.trim();

                const response = await axios.get(`${API_URL}/api/admin/booking-payments`, {
                    params,
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                const payload = response.data;
                const data: Payment[] = payload.data ?? [];
                const meta = payload.meta ?? null;

                all.push(...data);

                lastPage = meta?.last_page ?? payload.last_page ?? 1;
                page += 1;
            } while (page <= lastPage);
        } catch (err) {
            console.error('Error fetching all payments for export:', err);
            throw err;
        }

        return all;
    };

    const handleExportToExcel = async () => {
        // Fetch all payments across pagination, map to export shape, then export
        const allPayments = await fetchAllPayments();

        const dataToExport = allPayments.map((p) => ({
            id: p.id,
            customerName: p.clientName,
            amount: p.totalAmount,
            method: p.paymentMethod || 'Desconocido',
            status: p.status,
            date: p.date,
            reference: p.transactionId || 'N/A',
        }));

        await exportPaymentsToExcel(dataToExport, 'Pagos_Reservas_Todos');
    };

    const formatLoadingOrError = () => {
        if (loading) {
            return (
                <div
                    style={{
                        textAlign: "center",
                        padding: 24,
                        fontSize: 14,
                        color: "#64748b",
                    }}
                >
                    Cargando pagos de reservas...
                </div>
            );
        }

        if (error) {
            return (
                <div
                    style={{
                        textAlign: "center",
                        padding: 12,
                        marginBottom: 12,
                        borderRadius: 8,
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        fontSize: 14,
                    }}
                >
                    {error}
                </div>
            );
        }

        return null;
    };

    return (
        <div>
            {renderDetailModal()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <h2
                    className="admin-title"
                    style={{ fontSize: 22, margin: 0 }}
                >
                    Pagos de reservas
                </h2>
                <ExportButton 
                    onClick={handleExportToExcel}
                    label="Descargar Excel"
                    disabled={payments.length === 0}
                />
            </Box>

            <PaymentFilters
                currentFilter={filter}
                onFilterChange={handleFilterChange}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                order={order}
                onOrderChange={setOrder}
            />

            {formatLoadingOrError()}

            <div className="table-wrapper">
                <PaymentTable
                    payments={payments}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    onViewDetails={handleViewDetails}
                />
            </div>
        </div>
    );
};

export default BookingPayments;
