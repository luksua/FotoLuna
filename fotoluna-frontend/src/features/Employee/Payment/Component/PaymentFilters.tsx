// components/PaymentFilters.tsx
import React from 'react';
import { Button, ButtonGroup, Form, Row, Col } from 'react-bootstrap';
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
    onOrderChange
}) => {
    const filters: { key: FilterType; label: string; variant: string }[] = [
        { key: 'all', label: 'Todos', variant: 'outline-primary' },
        { key: 'paid', label: 'Pagado', variant: 'outline-success' },
        { key: 'pending', label: 'Pendiente', variant: 'outline-warning' },
        { key: 'overdue', label: 'Vencido', variant: 'outline-danger' }
    ];

    return (
        <div className="filters-section mb-4">
            {/* Fila de buscador + orden */}
            <Row className="g-2 align-items-center mb-3">
                <Col md={8}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por cliente, cédula, correo o teléfono..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={order}
                        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
                    >
                        <option value="desc">Más recientes primero</option>
                        <option value="asc">Más antiguos primero</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Botones de estado */}
            <ButtonGroup className="w-100">
                {filters.map((filter) => (
                    <Button
                        key={filter.key}
                        variant={
                            currentFilter === filter.key
                                ? filter.key === 'all'
                                    ? 'primary'
                                    : filter.variant.replace('outline-', '')
                                : filter.variant
                        }
                        onClick={() => onFilterChange(filter.key)}
                        className="filter-btn"
                    >
                        {filter.label}
                    </Button>
                ))}
            </ButtonGroup>
        </div>
    );
};

export default PaymentFilters;
