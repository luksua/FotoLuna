import React, { useEffect, useState } from "react";
import axios from "axios";

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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type PlanFilterStatus = "all" | "active" | "inactive";

const StoragePlan: React.FC = () => {
    const [plans, setPlans] = useState<StoragePlan[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<PlanFilterStatus>("all");

    // edición
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

    // 🔍 Filtro en memoria
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

    // guardar cambios
    const handleSave = async () => {
        if (!editingPlan) return;
        setSaving(true);

        try {
            const payload = {
                name: editingPlan.name,
                description: editingPlan.description,
                max_photos: editingPlan.max_photos,
                max_storage_mb: editingPlan.max_storage_mb,
                duration_months: editingPlan.duration_months,
                price: editingPlan.price,
                is_active: editingPlan.is_active,
            };

            const { data } = await axios.put<StoragePlan>(
                `${API_BASE}/api/admin/storage-plans/${editingPlan.id}`,
                payload
            );

            // actualizar en memoria
            setPlans((prev) =>
                prev.map((p) => (p.id === data.id ? data : p))
            );
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
                                        className="btn-primary"
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

            {/* Modal simple de edición */}
            {editingPlan && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Editar plan</h3>

                        <div className="modal-body">
                            <label>
                                Nombre
                                <input
                                    className="filter-input"
                                    value={editingPlan.name}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Descripción
                                <textarea
                                    className="filter-input"
                                    value={editingPlan.description ?? ""}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            description: e.target.value || null,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Duración (meses)
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={editingPlan.duration_months}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            duration_months: Number(e.target.value),
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Máx. fotos (0 = sin límite)
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={editingPlan.max_photos ?? 0}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            max_photos:
                                                Number(e.target.value) === 0
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Máx. almacenamiento (MB, 0 = sin límite)
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={editingPlan.max_storage_mb ?? 0}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            max_storage_mb:
                                                Number(e.target.value) === 0
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Precio (COP)
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={editingPlan.price}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            price: Number(e.target.value),
                                        })
                                    }
                                />
                            </label>

                            <label style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={editingPlan.is_active}
                                    onChange={(e) =>
                                        setEditingPlan({
                                            ...editingPlan,
                                            is_active: e.target.checked,
                                        })
                                    }
                                />
                                Activo
                            </label>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setEditingPlan(null)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoragePlan;
