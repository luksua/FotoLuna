// components/PaymentStats.tsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import type { Payment } from './Types/payment';

interface PaymentStatsProps {
  payments: Payment[];
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ payments }) => {
  // Asegurarnos de que siempre sumamos números
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, payment) => {
      const raw = payment.installmentAmount as unknown;

      const amount =
        typeof raw === 'number'
          ? raw
          : parseFloat(String(raw)) || 0;

      return sum + amount;
    }, 0);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const overdueCount = payments.filter((p) => p.status === 'overdue').length;

  return (
    <Card className="stats-card shadow-sm mb-4">
      <Card.Body>
        <Row className="text-center">
          <Col md={4} className="border-end">
            <h3 className="text-primary fw-bold">
              ${totalPaid.toFixed(2)}
            </h3>
            <p className="text-muted mb-0">Total Pagado</p>
          </Col>
          <Col md={4} className="border-end">
            <h3 className="text-warning fw-bold">{pendingCount}</h3>
            <p className="text-muted mb-0">Pendientes</p>
          </Col>
          <Col md={4}>
            <h3 className="text-danger fw-bold">{overdueCount}</h3>
            <p className="text-muted mb-0">Vencidos</p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PaymentStats;
