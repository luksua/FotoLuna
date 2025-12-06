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

const API_URL = 'http://localhost:8000/api';

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

                const response = await axios.get(`${API_URL}/employee/payments`, {
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

                const response = await axios.get(`${API_URL}/employee/payments`, {
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
                `${API_URL}/bookings/${bookingId}/receipt`,
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
                `${API_URL}/appointments/${appointmentId}/installments/${installmentId}/receipt`,
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
                                    <small className="text-muted d-block">Total del servicio</small>
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
                                    <small className="text-muted d-block">Saldo pendiente</small>
                                    <strong>{formatCOP(pending)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de cuotas (reales o virtuales) */}
                        {!hasInstallments ? (
                            <p className="text-muted">
                                Este pago no está dividido en cuotas. Estado:{' '}
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
                                                    <td>{index + 1}</td>
                                                    <td>{dateLabel}</td>
                                                    <td>{formatCOP(ins.amount)}</td>
                                                    <td>
                                                        <span className={badgeClass}>{label}</span>
                                                    </td>
                                                    <td>
                                                        {ins.paid && ins.id != null && p.booking_id && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() =>
                                                                    handleDownloadInstallmentReceipt(
                                                                        selectedPayment,
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
                                onClick={() => handleDownloadBookingReceipt(p.booking_id)}
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

    return (
        <EmployeeLayout>
            {renderDetailModal()}
            <Container fluid className="app-container payments-page">
                <Row className="justify-content-center">
                    {/* Antes: <Col lg={10} xl={8}> */}
                    <Col xs={12} lg={12} xl={12}>
                        {/* Header */}
                        <div className="app-header text-center mb-4">
                            <h2 className="text-dark">Pagos y Cuotas</h2>
                            {/* <p className="lead app-header-subtitle">
                                Revisa tu historial de transacciones y gestiona tus cuotas pendientes
                            </p> */}
                        </div>

                        {/* Errores */}
                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="text-center my-4">
                                <Spinner animation="border" />
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
                    </Col>
                </Row>
            </Container>
        </EmployeeLayout>

    );
};

export default Payments;