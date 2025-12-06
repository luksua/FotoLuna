// src/features/Employee/Photos/pages/EmployeePhotosPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import type { CustomerRecentSummary } from "../Components/types/Photo";
import { RecentSummaryCard } from "../Components/RecentSummaryCard";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


// URL del backend (Asegúrate que esta variable apunte a la raíz)
const API_SERVER_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

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
                `${API_SERVER_URL}/api/employee/photos/summary`,
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
    const handleViewPhotos = (customerId: number) => {
        // Redirección a la ruta detallada: /employee/customers/{customerId}/photos
        navigate(`/employee/customers/${customerId}/photos`);
    };

    return (
        <EmployeeLayout>
            <div className="container py-4">
                <header className="mb-5 border-bottom pb-3">
                    <h1 className="h3 fw-bold text-dark">Historial de Subidas Recientes</h1>
                    <p className="text-muted">
                        Fotos que has subido a la nube para tus clientes en los últimos 15 días.
                    </p>
                </header>

                {loading && <p className="text-center text-primary">Cargando historial...</p>}
                {error && (
                    <div className="alert alert-danger text-center">
                        <i className="bi bi-x-octagon me-2"></i> {error}
                    </div>
                )}

                {!loading && !error && (
                    <section className="row g-4 justify-content-start">
                        {summaries.map((customer) => (
                            <div key={customer.customerId} className="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3">
                                <RecentSummaryCard
                                    customer={customer}
                                    onViewPhotos={handleViewPhotos}
                                />
                            </div>
                        ))}
                    </section>
                )}

                {!loading && !error && summaries.length === 0 && (
                    <div className="alert alert-info text-center mt-5">
                        <i className="bi bi-info-circle me-2"></i> No hay fotos recientes (últimos 15 días) subidas por ti.
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
};

export default EmployeePhotosPage;