/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/plan.css";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import AppointmentFormStep4PaymentEmbedded from "../../appointment/components/AppointmentFormStep4Payment";
import { useAuth } from "../../../../context/useAuth";

type StoragePlan = {
    id: number;
    name: string;
    description: string | null;
    max_photos: number;
    max_storage_mb: number;
    duration_months: number;
    price: string;
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

const currency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);

const StorageDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);

    const [planToPay, setPlanToPay] = useState<StoragePlan | null>(null);
    const [planToChange, setPlanToChange] = useState<StoragePlan | null>(null);

    const { user } = useAuth();
    const userEmail = user?.email ?? "";
    const currentSubscription = data?.currentSubscription ?? null;

    // Plan gratis (por nombre o precio 0)
    const freePlan =
        data?.plans.find((p) => {
            const priceNumber = Number(p.price);
            return (
                priceNumber === 0 ||
                p.name.toLowerCase().includes("free") ||
                p.name.toLowerCase().includes("gratis")
            );
        }) || null;

    // 👉 ¿El plan actual (si hay suscripción) es gratuito?
    const isFreePlan = currentSubscription
        ? Number(currentSubscription.plan.price) === 0
        : false;

    // 👉 Tiene un plan de pago vigente (active o cancelled, pero NO free)
    const hasPaidSubscription =
        !!currentSubscription &&
        !isFreePlan &&
        (currentSubscription.status === "active" ||
            currentSubscription.status === "cancelled");

    // 👉 Es un plan de pago que YA fue cancelado pero sigue vigente
    const isCancelledAtPeriodEnd =
        !!currentSubscription &&
        !isFreePlan &&
        currentSubscription.status === "cancelled";

    // 👉 Plan actual que mostramos en UI:
    // - Si hay currentSubscription → ese plan
    // - Si no, usamos el freePlan
    const currentPlan: StoragePlan | null = currentSubscription
        ? currentSubscription.plan
        : freePlan;

    const usage = data?.usage || null;

    const handleOpenCancelModal = () => {
        setError(null);
        setSuccessMsg(null);
        setIsCancelModalOpen(true);
    };

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(`api/storage/dashboard`, {
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

    const handleConfirmCancelSubscription = async () => {
        if (!data?.currentSubscription) return;

        setIsCancelling(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await fetch(`/storage/cancel-subscription`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error(await res.text());

            await fetchDashboard(); // recarga datos del dashboard

            setSuccessMsg(
                "Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta la fecha de vencimiento."
            );
            setIsCancelModalOpen(false);
        } catch (err: any) {
            setError(err.message ?? "Error al cancelar la suscripción.");
        } finally {
            setIsCancelling(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleOpenChangePlanModal = (plan: StoragePlan) => {
        setError(null);
        setSuccessMsg(null);
        setPlanToChange(plan);
        setIsChangePlanModalOpen(true);
    };

    // 👉 Si estoy comprando un plan, muestro la pantalla de pago centrada y estilizada
    if (planToPay) {
        return (
            <div className="container py-5 bg-custom-2" style={{ maxWidth: "700px" }}>
                <div className="mb-4">
                    <button
                        type="button"
                        className="btn btn-sm btn-link text-decoration-none text-muted p-0 mb-3 d-inline-flex align-items-center gap-1"
                        onClick={() => setPlanToPay(null)}
                        style={{ color: "#718096" }}
                    >
                        <i className="bi bi-arrow-left"></i> Volver a los planes
                    </button>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                            <h2 className="sd-title-main mb-1" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                                Suscripción: {planToPay.name}
                            </h2>
                            <p className="sd-text-muted mb-0">
                                {planToPay.description || "Almacenamiento en la nube para tus fotografías"}
                            </p>
                        </div>
                        <span
                            className="badge px-3 py-2 rounded-pill"
                            style={{
                                backgroundColor: "#faf4ff",
                                color: "#9d4edd",
                                border: "1px solid #ebd9f5",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                            }}
                        >
                            {planToPay.duration_months} {planToPay.duration_months === 1 ? "Mes" : "Meses"}
                        </span>
                    </div>
                </div>

                <AppointmentFormStep4PaymentEmbedded
                    bookingId={null}
                    total={Number(planToPay.price)}
                    userEmail={userEmail}
                    onBack={() => setPlanToPay(null)}   // vuelve al dashboard
                    onSuccess={async () => {
                        setPlanToPay(null);               // cierra la pantalla de pago
                        await fetchDashboard();           // refresca el plan actual
                        setSuccessMsg("Tu plan ha sido comprado correctamente.");
                    }}
                    paymentMethod="Card"
                    storagePlanId={planToPay.id}
                />
            </div>
        );
    }

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
                                        Plan Actual: {currentPlan ? currentPlan.name : "Free"}
                                    </p>

                                    {hasPaidSubscription && currentPlan && currentSubscription ? (
                                        <>
                                            {isCancelledAtPeriodEnd ? (
                                                <p className="sd-text-muted mb-1">
                                                    Tu suscripción se cancelará el{" "}
                                                    {new Date(
                                                        currentSubscription.ends_at
                                                    ).toLocaleDateString("es", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                    . Seguirás teniendo acceso hasta esa fecha.
                                                </p>
                                            ) : (
                                                <>
                                                    <p className="sd-text-muted mb-1">
                                                        Tu plan se renueva el{" "}
                                                        {new Date(
                                                            currentSubscription.ends_at
                                                        ).toLocaleDateString("es", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                        .
                                                    </p>

                                                    <p className="sd-text-muted mb-0">
                                                        {currency(Number(currentPlan.price))}/
                                                        {currentPlan.duration_months === 1
                                                            ? "mes"
                                                            : "periodo"}
                                                    </p>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <p className="sd-text-muted mb-0">
                                            Estás usando el plan gratuito.
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
                            const isFreeThisPlan = Number(plan.price) === 0;

                            return (
                                <div key={plan.id} className="col-md-4">
                                    <div
                                        className={`card shadow sd-plan-card ${
                                            isCurrent ? "sd-plan-card--current" : ""
                                        }`}
                                    >
                                        {isCurrent && (
                                            <span className="sd-plan-active-badge">
                                                Plan actual
                                            </span>
                                        )}

                                        <h5 className="sd-plan-title">{plan.name}</h5>
                                        <p className="sd-plan-description">
                                            {plan.description ||
                                                "Plan para almacenamiento de fotos."}
                                        </p>

                                        <div className="d-flex align-items-baseline mb-2">
                                            <span className="sd-plan-price">
                                                {currency(Number(plan.price))}
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
                                                    {hasPaidSubscription ? (
                                                        isCancelledAtPeriodEnd ? (
                                                            // Ya está cancelado, solo informamos
                                                            <button
                                                                className="btn sd-plan-btn sd-btn-gray w-100"
                                                                disabled
                                                            >
                                                                Cancelado, vigente hasta{" "}
                                                                {new Date(
                                                                    currentSubscription!.ends_at
                                                                ).toLocaleDateString("es")}
                                                            </button>
                                                        ) : (
                                                            // Tiene plan de pago activo -> puede cancelar
                                                            <button
                                                                className="btn sd-plan-btn sd-btn-gray w-100"
                                                                onClick={handleOpenCancelModal}
                                                            >
                                                                Cancelar renovación
                                                            </button>
                                                        )
                                                    ) : (
                                                        // Plan free actual
                                                        <button
                                                            className="btn sd-plan-btn sd-btn-gray w-100"
                                                            disabled
                                                        >
                                                            Tu plan actual
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {hasPaidSubscription ? (
                                                        isFreeThisPlan ? (
                                                            // Tiene plan de pago y este es FREE:
                                                            // no se cobra, solo mensaje informativo.
                                                            <button
                                                                className="btn sd-plan-btn sd-btn-gray w-100"
                                                                disabled
                                                            >
                                                                Pasarás a este plan cuando termine tu periodo
                                                            </button>
                                                        ) : (
                                                            // Tiene plan de pago vigente -> usa modal para cambiar (y pagar)
                                                            <button
                                                                className="btn sd-plan-btn sd-btn-primary w-100"
                                                                onClick={() => handleOpenChangePlanModal(plan)}
                                                            >
                                                                Cambiar a este plan
                                                            </button>
                                                        )
                                                    ) : (
                                                        // Está en Free → abrir flujo de pago (solo si el plan NO es gratis)
                                                        <button
                                                            className="btn sd-plan-btn sd-btn-primary w-100"
                                                            onClick={() => {
                                                                if (!isFreeThisPlan) {
                                                                    setPlanToPay(plan);
                                                                }
                                                            }}
                                                            disabled={isFreeThisPlan}
                                                        >
                                                            {isFreeThisPlan
                                                                ? "Tu plan actual"
                                                                : "Comprar este plan"}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Modal cancelar suscripción */}
            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => !isCancelling && setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancelSubscription}
                title="Cancelar suscripción"
                message={
                    <>
                        ¿Estás seguro de que deseas cancelar tu suscripción actual?
                        <br />
                        Seguirás teniendo acceso hasta la fecha de vencimiento.
                    </>
                }
                confirmText="Sí, cancelar"
                cancelText="Volver"
                type="error"
                isLoading={isCancelling}
            />

            {/* Modal cambiar plan (solo si tiene plan de pago) */}
            {hasPaidSubscription && (
                <ConfirmModal
                    isOpen={isChangePlanModalOpen}
                    onClose={() => setIsChangePlanModalOpen(false)}
                    onConfirm={() => {
                        if (planToChange) {
                            setIsChangePlanModalOpen(false);
                            setPlanToPay(planToChange); // abre flujo de pago
                        }
                    }}
                    title="Cambiar de plan"
                    message={
                        <>
                            ¿Estás seguro de que deseas cambiar tu suscripción a este plan?
                            <br />
                            Se generará un nuevo cobro por el plan seleccionado.
                        </>
                    }
                    confirmText="Sí, cambiar y pagar"
                    cancelText="Volver"
                    type="info"
                    isLoading={false}
                />
            )}
        </div>
    );
};

export default StorageDashboard;
