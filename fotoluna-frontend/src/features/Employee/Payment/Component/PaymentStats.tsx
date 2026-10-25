import React from 'react';
import { Row, Col } from 'react-bootstrap';
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
    <Row className="g-3 mb-4 stats-grid-row">
      {/* 1. Total Cobrado */}
      <Col xs={12} sm={6} lg={3}>
        <div className="stat-card stat-card-purple shadow-sm">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper purple">
              <i className="bi bi-wallet2"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Cobrado</span>
              <h3 className="stat-value purple-text">{formatCOP(totalFullyPaid)}</h3>
              <span className="stat-subtext">
                <i className="bi bi-check-circle-fill me-1 text-success"></i>
                Reservas pagadas
              </span>
            </div>
          </div>
        </div>
      </Col>

      {/* 2. Pendientes */}
      <Col xs={12} sm={6} lg={3}>
        <div className="stat-card stat-card-amber shadow-sm">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper amber">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">Pendientes</span>
              <h3 className="stat-value amber-text">{pendingCount}</h3>
              <span className="stat-subtext">
                <i className="bi bi-clock-history me-1 text-warning"></i>
                Sin pago registrado
              </span>
            </div>
          </div>
        </div>
      </Col>

      {/* 3. En Cuotas */}
      <Col xs={12} sm={6} lg={3}>
        <div className="stat-card stat-card-blue shadow-sm">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper blue">
              <i className="bi bi-pie-chart-fill"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">En Cuotas</span>
              <h3 className="stat-value blue-text">{partialCount}</h3>
              <span className="stat-subtext">
                <i className="bi bi-arrow-repeat me-1 text-info"></i>
                Pagos en progreso
              </span>
            </div>
          </div>
        </div>
      </Col>

      {/* 4. Vencidos */}
      <Col xs={12} sm={6} lg={3}>
        <div className="stat-card stat-card-rose shadow-sm">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper rose">
              <i className="bi bi-exclamation-octagon-fill"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">Vencidos</span>
              <h3 className="stat-value rose-text">{overdueCount}</h3>
              <span className="stat-subtext">
                <i className="bi bi-calendar-x-fill me-1 text-danger"></i>
                Cuotas atrasadas
              </span>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default PaymentStats;

