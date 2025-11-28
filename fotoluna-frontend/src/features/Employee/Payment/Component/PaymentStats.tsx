import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import type { Payment } from './Types/payment';

interface PaymentStatsProps {
  payments: Payment[];
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ payments }) => {
  // Reservas completamente pagadas
  const paidPayments = payments.filter((p) => p.status === 'paid');

  const totalFullyPaid = paidPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const partialCount = payments.filter((p) => p.status === 'partial').length;
  const overdueCount = payments.filter((p) => p.status === 'overdue').length;

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Card className="stats-card shadow-sm mb-4">
      <Card.Body>
        <Row className="text-center gy-3">
          <Col md={3} className="border-end">
            <h3 className="text-primary fw-bold">
              {formatCOP(totalFullyPaid)}
            </h3>
            <p className="text-muted mb-0">Total cobrado</p>
            <small className="text-muted">
              Reservas completamente pagadas
            </small>
          </Col>

          <Col md={3} className="border-end">
            <h3 className="text-warning fw-bold">{pendingCount}</h3>
            <p className="text-muted mb-0">Pendientes</p>
            <small className="text-muted">Sin ningún pago registrado</small>
          </Col>

          <Col md={3} className="border-end">
            <h3 className="text-info fw-bold">{partialCount}</h3>
            <p className="text-muted mb-0">En cuotas</p>
            <small className="text-muted">Pagaron una parte</small>
          </Col>

          <Col md={3}>
            <h3 className="text-danger fw-bold">{overdueCount}</h3>
            <p className="text-muted mb-0">Vencidos</p>
            <small className="text-muted">Cuotas atrasadas</small>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PaymentStats;
