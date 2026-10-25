/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/PaymentEmployee.tsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import PaymentTable from '../Component/PaymentTable';
import PaymentFilters from '../Component/PaymentFilters';
import PaymentStats from '../Component/PaymentStats';
import type { Payment, FilterType } from '../Component/Types/payment';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/Payment/PaymentEmployee.css';
import EmployeeLayout from '../../../../layouts/HomeEmployeeLayout';
import axios from 'axios';

const Payments: React.FC = () => {
    const [filter, setFilter] = useState<FilterType>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    const [payments, setPayments] = useState<Payment[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [statsPayments, setStatsPayments] = useState<Payment[]>([]);

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

                if (filter !== 'all') {
                    params.status = filter;
                }

                if (searchTerm.trim() !== '') {
                    params.client = searchTerm.trim();
                }

                const token = localStorage.getItem('token');

                const response = await axios.get(`/api/employee/payments`, {
                    params,
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                });

                const { data, meta } = response.data;

                setPayments(data);
                setTotalPages(meta.last_page ?? 1);
                setTotalItems(meta.total ?? data.length);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los pagos. Intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [filter, currentPage, searchTerm, order]);

    useEffect(() => {
        const fetchStatsPayments = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`/api/employee/payments`, {
                    params: {
                        page: 1,
                        per_page: 200, // o 500, según tu volumen
                        order,         // si quieres que las stats respeten el orden
                        // 👉 OJO: sin status, sin client
                    },
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                });

                const { data } = response.data;
                setStatsPayments(data);
            } catch (err) {
                console.error('Error obteniendo pagos para stats:', err);
                // no hace falta bloquear nada si esto falla
            }
        };

        fetchStatsPayments();
    }, [order]); // puedes dejar solo [] si no quieres que cambie con el orden

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (paymentId: number) => {
        const found = payments.find((p) => p.id === paymentId) || null;
        setSelectedPayment(found);
        setShowDetailModal(!!found);
    };

    const formatCOP = (value: number) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(value);

    const handleDownloadBookingReceipt = async (bookingId: number) => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.get(
                `/api/bookings/${bookingId}/receipt`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        Accept: 'application/pdf',
                    },
                    responseType: 'blob',
                }
            );

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `recibo-FL-${bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error descargando recibo general:', err);
            alert('No se pudo descargar el recibo.');
        }
    };

    // 🔽 Descargar recibo de una cuota específica
    const handleDownloadInstallmentReceipt = async (
        payment: Payment,
        installmentId: number
    ) => {
        try {
            const appointmentId = payment.appointment_id;

            if (!appointmentId) {
                alert('No se encontró el ID de la cita para este pago.');
                return;
            }

            const token = localStorage.getItem('token');

            const res = await axios.get(
                `/api/appointments/${appointmentId}/installments/${installmentId}/receipt`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        Accept: 'application/pdf',
                    },
                    responseType: 'blob',
                }
            );

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `recibo-cuota-${installmentId}-FL-${appointmentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error descargando recibo de cuota:', err);
            alert('No se pudo descargar el recibo de esta cuota.');
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
            : (p.status === 'paid' ? total : 0);

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
                    className="payment-detail-modal-card shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header del Modal */}
                    <div className="payment-modal-header d-flex align-items-center justify-content-between p-4 border-bottom">
                        <div className="d-flex align-items-center gap-3">
                            <div className="modal-title-icon-box">
                                <i className="bi bi-receipt-cutoff"></i>
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold text-dark m-0">Detalle de Pago</h5>
                                <div className="text-muted small mt-1">
                                    <span className="fw-semibold text-dark">{p.clientName}</span> · {p.date}
                                </div>
                                <div className="text-muted small">
                                    <i className="bi bi-tag-fill me-1 text-primary"></i>
                                    {p.description}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                            onClick={() => setShowDetailModal(false)}
                        />
                    </div>

                    <div className="payment-modal-body p-4">
                        {/* 3 Tarjetas de Resumen Financiero */}
                        <div className="row g-3 mb-4">
                            <div className="col-12 col-md-4">
                                <div className="modal-summary-card total p-3 rounded-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <small className="text-muted fw-bold">TOTAL SERVICIO</small>
                                        <i className="bi bi-wallet2 text-muted"></i>
                                    </div>
                                    <h4 className="fw-bold text-dark m-0">{formatCOP(total)}</h4>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="modal-summary-card paid p-3 rounded-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <small className="text-success fw-bold">PAGADO</small>
                                        <i className="bi bi-check-circle-fill text-success"></i>
                                    </div>
                                    <h4 className="fw-bold text-success m-0">{formatCOP(paid)}</h4>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="modal-summary-card pending p-3 rounded-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <small className="text-warning fw-bold">SALDO PENDIENTE</small>
                                        <i className="bi bi-hourglass-split text-warning"></i>
                                    </div>
                                    <h4 className="fw-bold text-warning m-0">{formatCOP(pending)}</h4>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de cuotas */}
                        <div className="installments-section">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                <i className="bi bi-list-columns-reverse text-primary"></i>
                                Desglose de Cuotas
                            </h6>

                            {!hasInstallments ? (
                                <div className="p-3 bg-light rounded-3 text-muted small">
                                    <i className="bi bi-info-circle me-1"></i> Este pago corresponde a una modalidad de pago único (sin cuotas). Estado: <strong className="text-dark text-capitalize">{p.status}</strong>.
                                </div>
                            ) : (
                                <div className="table-responsive rounded-3 border">
                                    <table className="table table-sm align-middle mb-0 custom-modal-table">
                                        <thead>
                                            <tr>
                                                <th className="ps-3">#</th>
                                                <th>Vencimiento</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th className="text-end pe-3">Recibo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {installments.map((ins, index) => {
                                                let badgeClass = 'status-pill sm ';
                                                let label = '';

                                                if (ins.paid) {
                                                    badgeClass += 'paid';
                                                    label = 'Pagada';
                                                } else if (ins.is_overdue) {
                                                    badgeClass += 'expired';
                                                    label = 'Vencida';
                                                } else {
                                                    badgeClass += 'pending';
                                                    label = 'Pendiente';
                                                }

                                                const dateLabel = ins.due_date
                                                    ? new Date(ins.due_date).toLocaleDateString('es-CO', {
                                                        dateStyle: 'medium',
                                                    })
                                                    : '—';

                                                return (
                                                    <tr key={ins.id ?? index}>
                                                        <td className="ps-3 fw-bold">{index + 1}</td>
                                                        <td className="text-muted">{dateLabel}</td>
                                                        <td className="fw-bold">{formatCOP(ins.amount)}</td>
                                                        <td>
                                                            <span className={badgeClass}>{label}</span>
                                                        </td>
                                                        <td className="text-end pe-3">
                                                            {ins.paid && ins.id != null && p.booking_id && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-purple rounded-pill px-3"
                                                                    onClick={() =>
                                                                        handleDownloadInstallmentReceipt(
                                                                            selectedPayment,
                                                                            ins.id as number
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="bi bi-file-earmark-pdf me-1"></i> Recibo
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
                    </div>

                    <div className="payment-modal-footer d-flex justify-content-between p-4 border-top">
                        {p.booking_id && paid > 0 ? (
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-3 fw-semibold"
                                onClick={() => handleDownloadBookingReceipt(p.booking_id)}
                            >
                                <i className="bi bi-download me-1"></i> Recibo general
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 fw-bold"
                            style={{
                                background: 'linear-gradient(135deg, #c792df 0%, #9d4edd 100%)',
                                border: 'none',
                            }}
                            onClick={() => setShowDetailModal(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <EmployeeLayout contentClassName="appointments-layout-main">
            {renderDetailModal()}
            <Container fluid className="employee-payments-page px-0">
                {/* Header Principal Compacto */}
                <header className="page-header-payments d-flex align-items-center justify-content-between mb-2">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <div className="page-header-icon-badge">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <h1 className="fw-bold text-dark m-0 page-title">Pagos y Cuotas</h1>
                            <span className="badge rounded-pill total-counter-badge">
                                {totalItems} {totalItems === 1 ? 'registro' : 'registros'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Errores */}
                {error && (
                    <Alert variant="danger" className="mb-3 rounded-4 shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </Alert>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center my-4 py-3">
                        <Spinner animation="border" style={{ color: '#9d4edd' }} />
                        <div className="text-muted small mt-2">Cargando pagos...</div>
                    </div>
                )}

                {/* Estadísticas (siempre con datos globales) */}
                {!loading && (
                    <PaymentStats
                        payments={statsPayments.length ? statsPayments : payments}
                    />
                )}

                {/* Filtros */}
                <PaymentFilters
                    currentFilter={filter}
                    onFilterChange={handleFilterChange}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    order={order}
                    onOrderChange={setOrder}
                />

                {/* Tabla de pagos */}
                <PaymentTable
                    payments={payments}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onViewDetails={handleViewDetails}
                />
            </Container>
        </EmployeeLayout>
    );
};

export default Payments;