import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../../styles/buttons.css";

interface StoragePlan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration_months: number;
    max_photos: number | null;
    max_storage_mb: number | null;
    is_active: boolean;
}

interface EditPlanModalProps {
    plan: StoragePlan;
    saving: boolean;
    onClose: () => void;
    onSave: (plan: StoragePlan) => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({
    plan,
    saving,
    onClose,
    onSave,
}) => {
    const [localPlan, setLocalPlan] = useState<StoragePlan>(plan);

    useEffect(() => {
        setLocalPlan(plan);
    }, [plan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localPlan);
    };

    return (
        <div
            className="plan-modal-backdrop"
            onClick={onClose}
        >
            <div
                className="plan-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Editar plan</h3>

                <form className="plan-modal-body" onSubmit={handleSubmit}>
                    <label>
                        Nombre
                        <input
                            className="filter-input"
                            value={localPlan.name}
                            onChange={(e) =>
                                setLocalPlan({ ...localPlan, name: e.target.value })
                            }
                            required
                        />
                    </label>

                    <label>
                        Descripción
                        <textarea
                            className="filter-input"
                            value={localPlan.description ?? ""}
                            onChange={(e) =>
                                setLocalPlan({
                                    ...localPlan,
                                    description: e.target.value || null,
                                })
                            }
                        />
                    </label>

                    <label>
                        Duración (meses)
                        <input
                            type="number"
                            min={1}
                            className="filter-input"
                            value={localPlan.duration_months}
                            onChange={(e) =>
                                setLocalPlan({
                                    ...localPlan,
                                    duration_months: Number(e.target.value),
                                })
                            }
                            required
                        />
                    </label>

                    <label>
                        Máx. fotos (0 = sin límite)
                        <input
                            type="number"
                            min={0}
                            className="filter-input"
                            value={localPlan.max_photos ?? 0}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setLocalPlan({
                                    ...localPlan,
                                    max_photos: val === 0 ? null : val,
                                });
                            }}
                        />
                    </label>

                    <label>
                        Máx. almacenamiento (MB, 0 = sin límite)
                        <input
                            type="number"
                            min={0}
                            className="filter-input"
                            value={localPlan.max_storage_mb ?? 0}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setLocalPlan({
                                    ...localPlan,
                                    max_storage_mb: val === 0 ? null : val,
                                });
                            }}
                        />
                    </label>

                    <label>
                        Precio (COP)
                        <input
                            type="number"
                            min={0}
                            className="filter-input"
                            value={localPlan.price}
                            onChange={(e) =>
                                setLocalPlan({
                                    ...localPlan,
                                    price: Number(e.target.value),
                                })
                            }
                            required
                        />
                    </label>

                    <label
                        style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 8,
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={localPlan.is_active}
                            onChange={(e) =>
                                setLocalPlan({
                                    ...localPlan,
                                    is_active: e.target.checked,
                                })
                            }
                        />
                        Activo
                    </label>

                    <div className="plan-modal-footer mx-auto">
                        <button
                            type="button"
                            className="btn custom2-upload-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn custom-upload-btn"
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type PlanFilterStatus = "all" | "active" | "inactive";

const StoragePlan: React.FC = () => {
    const [plans, setPlans] = useState<StoragePlan[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<PlanFilterStatus>("all");

    const [editingPlan, setEditingPlan] = useState<StoragePlan | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchPlans = async () => {
        try {
            const { data } = await axios.get<StoragePlan[]>(
                `${API_BASE}/api/admin/storage-plans`
            );
            setPlans(data);
        } catch (error) {
            console.error("Error obteniendo planes de almacenamiento", error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(value);

    const formatStorage = (mb: number | null) => {
        if (!mb) return "∞";
        const gb = mb / 1024;
        return `${gb.toFixed(1)} GB`;
    };

    const filteredPlans = plans.filter((p) => {
        const matchesSearch =
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && p.is_active) ||
            (statusFilter === "inactive" && !p.is_active);

        return matchesSearch && matchesStatus;
    });

    const handleSave = async (planToSave: StoragePlan) => {
        setSaving(true);

        try {
            const payload = {
                name: planToSave.name,
                description: planToSave.description,
                max_photos: planToSave.max_photos,
                max_storage_mb: planToSave.max_storage_mb,
                duration_months: planToSave.duration_months,
                price: planToSave.price,
                is_active: planToSave.is_active,
            };

            const { data } = await axios.put<StoragePlan>(
                `${API_BASE}/api/admin/storage-plans/${planToSave.id}`,
                payload
            );

            setPlans((prev) => prev.map((p) => (p.id === data.id ? data : p)));
            setEditingPlan(null);
        } catch (error) {
            console.error("Error actualizando plan", error);
            alert("No se pudo actualizar el plan.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h2 className="admin-title" style={{ fontSize: 22, marginBottom: 16 }}>
                Planes de almacenamiento
            </h2>

            {/* Filtros */}
            <div className="filter-box" style={{ marginBottom: 12 }}>
                <div className="filter-row">
                    <input
                        className="filter-input"
                        placeholder="Buscar por nombre o descripción..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value as PlanFilterStatus)
                        }
                    >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Plan</th>
                            <th>Duración</th>
                            <th>Límites</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlans.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                                    No hay planes configurados con esos filtros.
                                </td>
                            </tr>
                        )}

                        {filteredPlans.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                        {p.description && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#64748b",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {p.description}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>{p.duration_months} meses</td>
                                <td style={{ fontSize: 13 }}>
                                    {(p.max_photos ?? "∞") + " fotos"} ·{" "}
                                    {formatStorage(p.max_storage_mb)}
                                </td>
                                <td>{formatCurrency(p.price)}</td>
                                <td>
                                    <span
                                        className={
                                            "badge " +
                                            (p.is_active ? "approved" : "pending")
                                        }
                                    >
                                        {p.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn custom-upload-btn"
                                        onClick={() => setEditingPlan(p)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingPlan && (
                <EditPlanModal
                    plan={editingPlan}
                    saving={saving}
                    onClose={() => setEditingPlan(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default StoragePlan;