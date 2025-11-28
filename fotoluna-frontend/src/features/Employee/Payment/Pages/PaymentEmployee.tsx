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

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (paymentId: string) => {
        alert(`Ver detalle de pago ${paymentId} (aún no implementado)`);
    };

    return (
        <EmployeeLayout>
            <Container fluid className="app-container">
                <Row className="justify-content-center">
                    <Col lg={10} xl={8}>
                        {/* Header */}
                        <div className="app-header text-center mb-4">
                            <h1 className="display-5 fw-bold text-primary">Mis Pagos y Cuotas</h1>
                            <p className="lead text-muted">
                                Revisa tu historial de transacciones y gestiona tus cuotas pendientes
                            </p>
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

                        {/* Estadísticas */}
                        {!loading && <PaymentStats payments={payments} />}

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