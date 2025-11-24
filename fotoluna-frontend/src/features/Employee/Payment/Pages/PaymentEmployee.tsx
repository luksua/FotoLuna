// App.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar} from 'react-bootstrap';
import PaymentTable from '../Component/PaymentTable';
import PaymentFilters from '../Component/PaymentFilters';
import PaymentStats from '../Component/PaymentStats';
import type { Payment, PaymentStatus, FilterType } from '../Component/Types/payment';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/Payment/PaymentEmployee.css';
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";


const Payments: React.FC = () => {
    const [filter, setFilter] = useState<FilterType>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Datos de ejemplo
    const paymentsData: Payment[] = [
        {
            id: '1',
            date: '15/07/2024',
            description: 'Suscripción Premium - Anual',
            installment: { current: 1, total: 1 },
            installmentAmount: 250.00,
            totalAmount: 250.00,
            status: 'paid',
            dueDate: '15/07/2024'
        },
        {
            id: '2',
            date: '10/08/2024',
            description: 'Paquete de Bodas',
            installment: { current: 2, total: 3 },
            installmentAmount: 150.00,
            totalAmount: 450.00,
            status: 'pending',
            dueDate: '10/08/2024'
        },
        {
            id: '3',
            date: '05/06/2024',
            description: 'Compra de presets "Cinematic"',
            installment: { current: 1, total: 1 },
            installmentAmount: 50.00,
            totalAmount: 50.00,
            status: 'paid',
            dueDate: '05/06/2024'
        },
        {
            id: '4',
            date: '01/05/2024',
            description: 'Paquete de Bodas',
            installment: { current: 1, total: 3 },
            installmentAmount: 150.00,
            totalAmount: 450.00,
            status: 'overdue',
            dueDate: '01/05/2024'
        },
        {
            id: '5',
            date: '15/04/2024',
            description: 'Sesión de Retrato',
            installment: { current: 1, total: 1 },
            installmentAmount: 300.00,
            totalAmount: 300.00,
            status: 'paid',
            dueDate: '15/04/2024'
        },
        {
            id: '6',
            date: '10/03/2024',
            description: 'Curso de Fotografía Avanzada',
            installment: { current: 2, total: 4 },
            installmentAmount: 75.00,
            totalAmount: 300.00,
            status: 'pending',
            dueDate: '10/09/2024'
        }
    ];

    // Filtrar pagos
    const filteredPayments = paymentsData.filter(payment => {
        if (filter === 'all') return true;
        return payment.status === filter;
    });

    // Calcular paginación
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDownloadInvoice = (paymentId: string) => {
        // Validación básica
        if (!paymentId) {
            alert('Error: ID de pago no válido');
            return;
        }

        // Simular descarga
        alert(`Descargando factura para pago ${paymentId}`);
        console.log(`Iniciando descarga de factura: ${paymentId}`);
    };

    const handlePayNow = (paymentId: string) => {
        // Validación básica
        if (!paymentId) {
            alert('Error: ID de pago no válido');
            return;
        }

        // Simular proceso de pago
        alert(`Procesando pago para: ${paymentId}`);
        console.log(`Iniciando proceso de pago: ${paymentId}`);
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

                        {/* Estadísticas */}
                        <PaymentStats payments={paymentsData} />

                        {/* Filtros */}
                        <PaymentFilters
                            currentFilter={filter}
                            onFilterChange={handleFilterChange}
                        />

                        {/* Tabla de pagos */}
                        <PaymentTable
                            payments={currentPayments}
                            onDownloadInvoice={handleDownloadInvoice}
                            onPayNow={handlePayNow}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredPayments.length}
                            onPageChange={handlePageChange}
                        />
                    </Col>
                </Row>
            </Container>
        </EmployeeLayout>
    );
};

export default Payments;