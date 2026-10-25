// src/features/Employee/Photos/pages/EmployeePhotosPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import type { CustomerRecentSummary } from "../Components/types/Photo";
import { RecentSummaryCard } from "../Components/RecentSummaryCard";
import "../Styles/EmployeePhotos.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const EmployeePhotosPage: React.FC = () => {
    const [summaries, setSummaries] = useState<CustomerRecentSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const fetchSummaries = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("No se encontró la sesión activa.");

            // Endpoint: /api/employee/photos/summary
            const response = await axios.get<CustomerRecentSummary[]>(
                `/api/employee/photos/summary`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSummaries(response.data);
        } catch (err: any) {
            console.error("Error al cargar el resumen de fotos:", err);
            setError("Error al cargar el historial: " + (err.response?.data?.message || err.message || "Verifica la conexión o tu rol."));
            setSummaries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummaries();
    }, []);

    // Función de navegación para el botón "Ver fotos recientes"
    const handleViewRecent = (customerId: number) => {
        navigate(`/employee/customers/${customerId}/photos/recent`);
    };

    return (
        <EmployeeLayout>
            <div className="emp-photos-container">
                {/* Header moderno */}
                <div className="emp-photos-header">
                    <div className="d-flex align-items-center gap-3">
                        <div className="emp-photos-header-badge">
                            <i className="bi bi-images"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h1 className="emp-photos-title">Historial y Administración de Fotos</h1>
                                {!loading && (
                                    <span className="emp-badge-count">{summaries.length} clientes</span>
                                )}
                            </div>
                            <p className="emp-photos-subtitle">
                                Sesiones fotográficas subidas a la nube de tus clientes en los últimos 15 días.
                            </p>
                        </div>
                    </div>
                    <button
                        className="emp-btn-upload-new"
                        onClick={() => navigate("/employee/upload")}
                    >
                        <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                        Subir Nuevas Fotos
                    </button>
                </div>

                {loading && (
                    <div className="emp-loading-card">
                        <div className="spinner-border" role="status" style={{ color: '#9d4edd', width: '2.5rem', height: '2.5rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted fw-semibold">Cargando historial de sesiones...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && summaries.length > 0 && (
                    <section className="emp-photos-grid">
                        {summaries.map((customer) => (
                            <RecentSummaryCard
                                key={customer.customerId}
                                customer={customer}
                                onViewRecent={handleViewRecent}
                            />
                        ))}
                    </section>
                )}

                {!loading && !error && summaries.length === 0 && (
                    <div className="emp-empty-state-card">
                        <div className="emp-empty-icon-wrapper">
                            <i className="bi bi-camera2"></i>
                        </div>
                        <h3 className="emp-empty-title">No hay fotos recientes</h3>
                        <p className="emp-empty-desc">
                            No se han registrado sesiones subidas a clientes en los últimos 15 días.
                            Comienza subiendo las fotos procesadas para que tus clientes las descarguen en su portal personal.
                        </p>
                        <button
                            className="emp-empty-cta-btn"
                            onClick={() => navigate("/employee/upload")}
                        >
                            <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                            Subir Primera Sesión
                        </button>
                    </div>
                )}
            </div>
            <footer>
                <p>FotoLuna &copy;</p>
            </footer>
        </EmployeeLayout>
    );
};

export default EmployeePhotosPage;