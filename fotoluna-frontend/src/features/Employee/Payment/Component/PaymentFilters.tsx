// components/PaymentFilters.tsx
import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import type { FilterType } from './Types/payment';

interface PaymentFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
    currentFilter,
    onFilterChange
}) => {
    const filters: { key: FilterType; label: string; variant: string }[] = [
        { key: 'all', label: 'Todos', variant: 'outline-primary' },
        { key: 'paid', label: 'Pagado', variant: 'outline-success' },
        { key: 'pending', label: 'Pendiente', variant: 'outline-warning' },
        { key: 'overdue', label: 'Vencido', variant: 'outline-danger' }
    ];

    return (
        <div className="filters-section mb-4">
            <ButtonGroup className="w-100">
                {filters.map((filter) => (
                    <Button
                        key={filter.key}
                        variant={currentFilter === filter.key ? filter.key === 'all' ? 'primary' : filter.variant.replace('outline-', '') : filter.variant}
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