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

const StoragePlan: React.FC = () => {
    const [plans, setPlans] = useState<StoragePlan[]>([]);

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
        value.toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatStorage = (mb: number | null) => {
        if (!mb) return "∞";
        const gb = mb / 1024;
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <div>
            <h2 className="admin-title" style={{ fontSize: 22, marginBottom: 16 }}>
                Planes de almacenamiento
            </h2>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Plan</th>
                            <th>Duración</th>
                            <th>Límites</th>
                            <th>Precio</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                                    No hay planes configurados.
                                </td>
                            </tr>
                        )}

                        {plans.map((p) => (
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
                                <td>${formatCurrency(p.price)}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StoragePlan;
