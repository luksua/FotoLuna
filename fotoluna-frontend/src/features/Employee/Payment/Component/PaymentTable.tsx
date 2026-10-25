import React from 'react';
import { Table, Card, Button, Pagination } from 'react-bootstrap';
import type { Payment } from './Types/payment';

interface PaymentTableProps {
    payments: Payment[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onViewDetails: (paymentId: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
    payments,
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    onViewDetails,
}) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="payment-status-badge badge-paid">
                        <i className="bi bi-check-circle-fill me-1"></i> Pagado
                    </span>
                );
            case 'pending':
                return (
                    <span className="payment-status-badge badge-pending">
                        <i className="bi bi-clock-fill me-1"></i> Pendiente
                    </span>
                );
            case 'partial':
                return (
                    <span className="payment-status-badge badge-partial">
                        <i className="bi bi-pie-chart-fill me-1"></i> En cuotas
                    </span>
                );
            case 'overdue':
                return (
                    <span className="payment-status-badge badge-overdue">
                        <i className="bi bi-exclamation-circle-fill me-1"></i> Vencido
                    </span>
                );
            case 'no_info':
            default:
                return (
                    <span className="payment-status-badge badge-no-info">
                        <i className="bi bi-dash-circle me-1"></i> Sin info
                    </span>
                );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase() || "CL";
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className="payment-page-item"
                >
                    {page}
                </Pagination.Item>
            );
        }

        return items;
    };

    const itemsPerPage = 5;

    return (
        <Card className="payment-table-card shadow-sm border-0">
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover className="payment-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Servicio / Paquete</th>
                                <th>Cuotas</th>
                                <th>Monto Cuota</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th className="text-end pe-4">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <div className="empty-payments-state py-4">
                                            <i className="bi bi-search display-6 text-muted opacity-50 mb-3 d-block"></i>
                                            <h6 className="fw-bold text-dark">No se encontraron pagos</h6>
                                            <p className="text-muted small mb-0">
                                                Intenta ajustar los filtros de búsqueda o seleccionar otro estado.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="payment-row">
                                        {/* Fecha */}
                                        <td className="payment-date-cell">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="calendar-icon-box">
                                                    <i className="bi bi-calendar3"></i>
                                                </div>
                                                <span className="fw-semibold text-dark">{payment.date}</span>
                                            </div>
                                        </td>

                                        {/* Cliente agrupado con iniciales */}
                                        <td className="payment-client-cell">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="client-table-avatar" aria-hidden="true">
                                                    {getInitials(payment.clientName)}
                                                </div>
                                                <div className="client-details-block">
                                                    <div className="client-table-name fw-bold text-dark">
                                                        {payment.clientName}
                                                    </div>
                                                    <div className="client-table-meta text-muted small">
                                                        {payment.clientCedula && (
                                                            <span className="me-2">
                                                                <i className="bi bi-person-vcard me-1"></i>
                                                                {payment.clientCedula}
                                                            </span>
                                                        )}
                                                        {payment.clientPhone && (
                                                            <span>
                                                                <i className="bi bi-telephone me-1"></i>
                                                                {payment.clientPhone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Descripción / Servicio */}
                                        <td className="payment-desc-cell">
                                            <div className="description-cell">
                                                <span className="fw-bold text-dark d-block">
                                                    {payment.description}
                                                </span>
                                                {payment.installment.total > 1 && payment.dueDate && (
                                                    <small className="due-date-badge text-muted">
                                                        <i className="bi bi-clock me-1"></i>
                                                        Vence: {payment.dueDate}
                                                    </small>
                                                )}
                                            </div>
                                        </td>

                                        {/* Cuota */}
                                        <td className="payment-cuota-cell">
                                            {payment.installment.total > 1 ? (
                                                <div className="installment-progress-box">
                                                    <div className="progress-track">
                                                        <div
                                                            className={`progress-fill ${payment.status}`}
                                                            style={{
                                                                width: `${(payment.installment.current / payment.installment.total) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="installment-text">
                                                        Cuota {payment.installment.current} de {payment.installment.total}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="badge-pago-unico">
                                                    <i className="bi bi-check2 me-1"></i> Pago único
                                                </span>
                                            )}
                                        </td>

                                        {/* Monto Cuota */}
                                        <td className="payment-amount-cell">
                                            <span className="installment-amount fw-bold">
                                                {formatCurrency(payment.installmentAmount)}
                                            </span>
                                        </td>

                                        {/* Monto Total */}
                                        <td className="payment-total-cell">
                                            <span className="total-amount text-muted fw-semibold">
                                                {formatCurrency(payment.totalAmount)}
                                            </span>
                                        </td>

                                        {/* Estado */}
                                        <td className="payment-status-cell">
                                            {getStatusBadge(payment.status)}
                                        </td>

                                        {/* Acción */}
                                        <td className="text-end pe-4">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                onClick={() => onViewDetails(payment.id)}
                                                className="btn-view-payment-detail"
                                            >
                                                <i className="bi bi-eye-fill me-1"></i> Ver detalle
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {payments.length > 0 && (
                    <div className="pagination-wrapper p-3 border-top">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                            <div className="pagination-info text-muted small">
                                Mostrando <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> -{' '}
                                <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> de{' '}
                                <strong>{totalItems}</strong> resultados
                            </div>
                            <Pagination className="mb-0 custom-pagination">
                                <Pagination.Prev
                                    disabled={currentPage === 1}
                                    onClick={() => onPageChange(currentPage - 1)}
                                />
                                {renderPaginationItems()}
                                <Pagination.Next
                                    disabled={currentPage === totalPages}
                                    onClick={() => onPageChange(currentPage + 1)}
                                />
                            </Pagination>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default PaymentTable;
