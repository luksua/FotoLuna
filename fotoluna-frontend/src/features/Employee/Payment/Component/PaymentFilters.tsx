// components/PaymentFilters.tsx
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import type { FilterType } from './Types/payment';

interface PaymentFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;

    searchTerm: string;
    onSearchTermChange: (value: string) => void;

    order: 'asc' | 'desc';
    onOrderChange: (value: 'asc' | 'desc') => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
    currentFilter,
    onFilterChange,
    searchTerm,
    onSearchTermChange,
    order,
    onOrderChange,
}) => {
    const filters: { key: FilterType; label: string; icon: string; className: string }[] = [
        { key: 'all',     label: 'Todos',     icon: 'bi-grid-fill',              className: 'pill-all' },
        { key: 'paid',    label: 'Pagado',    icon: 'bi-check-circle-fill',      className: 'pill-paid' },
        { key: 'pending', label: 'Pendiente', icon: 'bi-clock-fill',             className: 'pill-pending' },
        { key: 'partial', label: 'En cuotas', icon: 'bi-pie-chart-fill',         className: 'pill-partial' },
        { key: 'overdue', label: 'Vencido',   icon: 'bi-exclamation-circle-fill', className: 'pill-overdue' },
        { key: 'no_info', label: 'Sin info',  icon: 'bi-dash-circle',            className: 'pill-no-info' },
    ];

    return (
        <div className="payment-filters-toolbar shadow-sm mb-4">
            {/* Fila de buscador + orden */}
            <Row className="g-3 align-items-center mb-3">
                <Col md={8}>
                    <div className="search-box-wrapper">
                        <i className="bi bi-search search-icon"></i>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por cliente, cédula, correo o teléfono..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="search-input-custom"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="btn-clear-search"
                                onClick={() => onSearchTermChange("")}
                                title="Limpiar búsqueda"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>
                </Col>

                <Col md={4}>
                    <div className="order-select-wrapper">
                        <i className="bi bi-arrow-down-up order-icon"></i>
                        <Form.Select
                            value={order}
                            onChange={(e) =>
                                onOrderChange(e.target.value as 'asc' | 'desc')
                            }
                            className="order-select-custom"
                        >
                            <option value="desc">Más recientes primero</option>
                            <option value="asc">Más antiguos primero</option>
                        </Form.Select>
                    </div>
                </Col>
            </Row>

            {/* Pestañas de estado estilo píldoras modernas */}
            <div className="status-pills-bar">
                {filters.map((f) => {
                    const isActive = currentFilter === f.key;
                    return (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => onFilterChange(f.key)}
                            className={`status-filter-pill ${f.className} ${isActive ? 'active' : ''}`}
                        >
                            <i className={`bi ${f.icon} me-1`}></i>
                            <span>{f.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PaymentFilters;

