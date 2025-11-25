// components/PaymentTable.tsx
import React from 'react';
import { Table, Card, Button, Badge, ProgressBar, Pagination } from 'react-bootstrap';
import type { Payment } from './Types/payment';

interface PaymentTableProps {
    payments: Payment[];
    onDownloadInvoice: (paymentId: string) => void;
    onPayNow: (paymentId: string) => void;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
    payments,
    onDownloadInvoice,
    onPayNow,
    currentPage,
    totalPages,
    totalItems,
    onPageChange
}) => {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Pagado';
            case 'pending': return 'Pendiente';
            case 'overdue': return 'Vencido';
            default: return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Pagination.Item>
            );
        }

        return items;
    };

    return (
        <Card className="payment-table-card shadow-sm">
            <Card.Body>
                <div className="table-responsive">
                    <Table hover className="payment-table">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Cuota</th>
                                <th>Monto Cuota</th>
                                <th>Monto Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">
                                        No se encontraron pagos con los filtros seleccionados
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="payment-row">
                                        <td className="fw-semibold">{payment.date}</td>
                                        <td>
                                            <div className="description-cell">
                                                <strong>{payment.description}</strong>
                                                {payment.installment.total > 1 && (
                                                    <small className="text-muted d-block">
                                                        Vence: {payment.dueDate}
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {payment.installment.total > 1 ? (
                                                <div className="installment-progress">
                                                    <ProgressBar
                                                        now={(payment.installment.current / payment.installment.total) * 100}
                                                        variant={getStatusVariant(payment.status)}
                                                        className="mb-2"
                                                    />
                                                    <small className="text-muted">
                                                        {payment.installment.current} de {payment.installment.total}
                                                    </small>
                                                </div>
                                            ) : (
                                                <Badge bg="secondary">Pago único</Badge>
                                            )}
                                        </td>
                                        <td className="fw-bold text-primary">
                                            {formatCurrency(payment.installmentAmount)}
                                        </td>
                                        <td className="fw-semibold">
                                            {formatCurrency(payment.totalAmount)}
                                        </td>
                                        <td>
                                            <Badge bg={getStatusVariant(payment.status)}>
                                                {getStatusText(payment.status)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => onDownloadInvoice(payment.id)}
                                                    className="action-btn"
                                                >
                                                    <i className="bi bi-download me-1"></i>
                                                    Factura
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* Paginación */}
                {payments.length > 0 && (
                    <div className="pagination-section mt-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Mostrando {(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, totalItems)} de {totalItems} resultados
                            </div>
                            <Pagination className="mb-0">
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