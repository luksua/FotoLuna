/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/plan.css"

type StoragePlan = {
    id: number;
    name: string;
    description: string | null;
    max_photos: number;
    max_storage_mb: number;
    duration_months: number;
    price: number;
    is_active: boolean;
};

type StorageUsage = {
    totalPhotos: number;
    totalSizeMb: number;
    maxPhotos: number;
    maxStorageMb: number;
    photosPercent: number;
    storagePercent: number;
};

type StorageSubscription = {
    id: number;
    plan_id: number;
    status: "active" | "expired" | "cancelled";
    starts_at: string;
    ends_at: string;
    plan: StoragePlan;
};

type PaymentMethod = {
    brand: string;
    last4: string;
    expires: string;
};

type DashboardResponse = {
    currentSubscription: StorageSubscription | null;
    plans: StoragePlan[];
    usage: StorageUsage | null;
    paymentMethod?: PaymentMethod | null;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const currency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);

const StorageDashboardBootstrap: React.FC = () => {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [changingPlanId, setChangingPlanId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(`${API_BASE}/api/storage/dashboard`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                setData(res.data);
            } catch (err: any) {
                console.log(err);
                setError("Error al cargar la información.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleCancelSubscription = async () => {
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await fetch(`${API_BASE}/api/storage/cancel-subscription`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error(await res.text());

            const json: DashboardResponse = await res.json();
            setData(json);
            setSuccessMsg("Tu suscripción ha sido cancelada. Seguirá activa hasta la fecha de vencimiento.");
        } catch (err: any) {
            setError(err.message ?? "Error al cancelar la suscripción.");
        }
    };


    const handleChangePlan = async (planId: number) => {
        setError(null);
        setSuccessMsg(null);
        setChangingPlanId(planId);

        try {
            const res = await fetch(`${API_BASE}/api/storage/change-plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ plan_id: planId }),
            });

            if (!res.ok) throw new Error(await res.text());

            const json: DashboardResponse = await res.json();
            setData(json);
            setSuccessMsg("Tu plan ha sido actualizado correctamente.");
        } catch (err: any) {
            setError(err.message ?? "Error al cambiar el plan.");
        } finally {
            setChangingPlanId(null);
        }
    };

    const currentPlan = data?.currentSubscription?.plan || null;
    const usage = data?.usage || null;

    return (
        <div className="container py-5 sd-dashboard-container bg-custom-2">
            {/* ENCABEZADO */}
            <div className="mb-4">
                <h1 className="sd-title-main">Plan de almacenamiento</h1>
                <p className="sd-text-muted">Administra tu espacio en la nube.</p>
            </div>

            {loading && (
                <div className="alert alert-secondary small">
                    Cargando información de tu plan…
                </div>
            )}

            {!loading && error && (
                <div className="alert alert-danger small">{error}</div>
            )}

            {!loading && successMsg && (
                <div className="alert alert-success small">{successMsg}</div>
            )}

            {!loading && data && (
                <>
                    {/* ===== PRIMERA FILA ===== */}
                    <div className="row g-3 mb-3">
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm sd-card">
                                <div className="card-body">
                                    <p className="fw-semibold mb-1">
                                        Plan Actual:{" "}
                                        {currentPlan ? currentPlan.name : "No activo"}
                                    </p>

                                    {currentPlan && data.currentSubscription ? (
                                        <>
                                            <p className="sd-text-muted mb-1">
                                                Tu plan se renueva el{" "}
                                                {new Date(
                                                    data.currentSubscription.ends_at
                                                ).toLocaleDateString("es", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                                .
                                            </p>

                                            <p className="sd-text-muted mb-0">
                                                {currency(currentPlan.price)}/
                                                {currentPlan.duration_months === 1
                                                    ? "mes"
                                                    : "periodo"}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="sd-text-muted mb-0">
                                            No tienes un plan activo actualmente.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ===== USO DE ALMACENAMIENTO ===== */}
                        {usage && currentPlan && (
                            <div className="col-md-7">
                                <div className="card border-0 shadow-sm sd-card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="sd-storage-header">
                                                Espacio de almacenamiento usado
                                            </span>

                                            <span className="sd-storage-counter">
                                                {usage.totalSizeMb} MB / {usage.maxStorageMb} MB
                                            </span>
                                        </div>

                                        <div className="progress mb-3" style={{ height: "8px" }}>
                                            <div
                                                className="progress-bar bg-warning"
                                                role="progressbar"
                                                style={{ width: `${usage.storagePercent}%` }}
                                                aria-valuenow={usage.storagePercent}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            ></div>
                                        </div>

                                        <p className="sd-text-muted mb-0">
                                            Estás usando {usage.storagePercent}% de tu espacio.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* ===== ACTUALIZAR PLAN ===== */}
                    <div className="mb-3">
                        <h2 className="h5 fw-semibold pt-4">Actualiza tu plan</h2>
                        <p className="sd-text-muted">
                            Elige el plan que mejor se adapte a tus necesidades.
                        </p>
                    </div>

                    <div className="row g-3">
                        {data.plans.map((plan) => {
                            const isCurrent = currentPlan && currentPlan.id === plan.id;
                            const isChanging = changingPlanId === plan.id;

                            return (
                                <div key={plan.id} className="col-md-4">
                                    <div
                                        className={`card shadow sd-plan-card ${isCurrent ? "sd-plan-card--current" : ""
                                            }`}
                                    >
                                        {isCurrent && (
                                            <span className="sd-plan-active-badge">
                                                Plan actual
                                            </span>
                                        )}

                                        <h5 className="sd-plan-title">{plan.name}</h5>
                                        <p className="sd-plan-description">
                                            {plan.description || "Plan para almacenamiento de fotos."}
                                        </p>

                                        <div className="d-flex align-items-baseline mb-2">
                                            <span className="sd-plan-price">
                                                {currency(plan.price)}
                                            </span>
                                            <span className="sd-plan-price-sub">/mes</span>
                                        </div>

                                        <ul className="sd-plan-list">
                                            <li>{plan.max_storage_mb} MB de espacio</li>
                                            <li>Hasta {plan.max_photos} fotos</li>
                                            <li>Acceso en la nube</li>
                                        </ul>

                                        <div className="mt-auto">
                                            {isCurrent ? (
                                                <>
                                                    <button
                                                        className="btn sd-plan-btn sd-btn-gray w-100"
                                                        disabled
                                                    >
                                                        Tu plan
                                                    </button>
                                                    {data.currentSubscription && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm mt-2"
                                                            onClick={handleCancelSubscription}
                                                        >
                                                            Cancelar plan
                                                        </button>

                                                    )} </>

                                            ) : (
                                                <button
                                                    className="btn sd-plan-btn sd-btn-primary w-100"
                                                    disabled={isChanging}
                                                    onClick={() => handleChangePlan(plan.id)}
                                                >
                                                    {isChanging
                                                        ? "Actualizando..."
                                                        : "Elegir plan"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default StorageDashboardBootstrap;
