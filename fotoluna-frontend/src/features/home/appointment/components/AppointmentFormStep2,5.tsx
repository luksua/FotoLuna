import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/appointmentPlan.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const STORAGE_PLAN_DRAFT_KEY = "appointmentStep4StoragePlan";

interface StoragePlansSelectorProps {
    selectedPlan: StoragePlan | null;
    onSelect: (plan: StoragePlan | null) => void;
    showTitle?: boolean;
}

interface StoragePlan {
    id: number;
    name: string;
    description?: string | null;
    max_photos?: number | null;
    max_storage_mb?: number | null;
    duration_months: number;
    price: number | string;
    is_active?: boolean;
}

const StoragePlansSelector: React.FC<StoragePlansSelectorProps> = ({
    selectedPlan,
    onSelect,
    showTitle = true,
}) => {
    const [plans, setPlans] = useState<StoragePlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");

                const res = await axios.get(`${API_BASE}/api/storage-plans-customer`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });

                console.log("storage-plans-customer response:", res.data);

                const payload = res.data;

                // Soportar ambas formas: [ ... ] o { plans: [ ... ] }
                const fetchedPlans: StoragePlan[] = Array.isArray(payload)
                    ? payload
                    : payload.plans ?? [];

                // (Opcional) filtrar solo activos si lo usas así en backend
                const normalized = fetchedPlans.map((p) => ({
                    ...p,
                    id: Number(p.id),
                }));

                setPlans(normalized);

                // 🔹 Intentar restaurar selección desde localStorage
                const raw = localStorage.getItem(STORAGE_PLAN_DRAFT_KEY);
                if (raw && !selectedPlan) {
                    try {
                        const parsed = JSON.parse(raw) as { planId: number | string | null };
                        if (parsed.planId != null) {
                            const savedId = Number(parsed.planId);
                            const found = normalized.find((pl) => pl.id === savedId);
                            if (found) {
                                onSelect(found);
                            }
                        }
                    } catch (e) {
                        console.warn("Error leyendo borrador de plan de almacenamiento:", e);
                    }
                }
            } catch (err) {
                console.error("Error cargando planes de almacenamiento:", err);
                setError("No se pudieron cargar los planes de almacenamiento.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // solo una vez al montar

    // 🔹 Guardar la selección en localStorage cuando cambie
    useEffect(() => {
        const planId = selectedPlan ? selectedPlan.id : null;
        localStorage.setItem(
            STORAGE_PLAN_DRAFT_KEY,
            JSON.stringify({ planId })
        );
    }, [selectedPlan]);

    const handleSelect = (plan: StoragePlan) => {
        // si ya está seleccionado, al hacer click otra vez se deselecciona
        if (selectedPlan && selectedPlan.id === plan.id) {
            onSelect(null);
        } else {
            onSelect(plan);
        }
    };

    if (loading) {
        return <p>Cargando planes de almacenamiento...</p>;
    }

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    if (!plans.length) {
        return <p>No hay planes de almacenamiento disponibles en este momento.</p>;
    }

    return (
        <div className="storage-plans-wrapper mt-4">
            {showTitle && (
                <div className="mb-3">
                    <h4>Planes de almacenamiento en la nube</h4>
                    <p className="text-muted">
                        Elige un plan para que tus fotos queden guardadas en tu espacio privado en la web.
                    </p>
                </div>
            )}

            <div className="row g-3">
                {plans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id;
                    const priceNumber = Number(plan.price);
                    const capacityLabel =
                        plan.max_photos != null
                            ? `${plan.max_photos} fotos`
                            : plan.max_storage_mb != null
                                ? `${plan.max_storage_mb} MB`
                                : "Capacidad flexible";

                    return (
                        <div key={plan.id} className="col-md-4 bg-custom-2">
                            <button
                                type="button"
                                className={`storage-plan-card w-100 ${isSelected ? "selected" : ""}`}
                                onClick={() => handleSelect(plan)}
                            >
                                <div className="storage-plan-header mb-2">
                                    <h5 className="storage-plan-name mb-1">{plan.name}</h5>
                                    <span className="storage-plan-price">
                                        ${priceNumber.toLocaleString("es-CO")} COP
                                    </span>
                                </div>

                                <p className="storage-plan-description mb-2">
                                    {plan.description || "Plan de almacenamiento para tus fotos."}
                                </p>

                                <ul className="storage-plan-features list-unstyled mb-0">
                                    <li>
                                        <strong>Duración:</strong> {plan.duration_months}{" "}
                                        {plan.duration_months === 1 ? "mes" : "meses"}
                                    </li>
                                    <li>
                                        <strong>Capacidad:</strong> {capacityLabel}
                                    </li>
                                </ul>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StoragePlansSelector;
