/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/quinces.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const QUINCES_EVENT_ID = 3;

interface QuincePackage {
    id: number;
    title: string;
    description: string;
    price: number | string;
    img?: string;
}

const cardVariants = {
    hiddenLeft: { opacity: 0, x: -40 },
    hiddenRight: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
};

export default function Quinces() {
    const navigate = useNavigate();

    const [packages, setPackages] = useState<QuincePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `${API_BASE}/api/events/${QUINCES_EVENT_ID}/packages`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const general = res.data.general ?? [];
                const specific = res.data.specific ?? [];

                const combined: QuincePackage[] = [...specific, ...general].map(
                    (pkg: any) => ({
                        id: pkg.id,
                        title: pkg.packageName,
                        description: pkg.packageDescription,
                        price: pkg.packagePrice,
                        img: pkg.photos?.[0]?.url ?? "",
                    })
                );

                setPackages(combined);
            } catch (err) {
                console.error("Error cargando paquetes de quinces:", err);
                setError("No se pudieron cargar los paquetes.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    const handleReserve = (packageId: number) => {
        navigate("/nuevaCita", {
            state: {
                eventId: QUINCES_EVENT_ID,
                packageId,
                skipPackageSelection: true,
            },
        });
    };

    const formatPrice = (value: string | number) => {
        const n = Number(String(value).replace(/[^0-9.-]+/g, ""));
        if (Number.isNaN(n)) return String(value);
        return n.toLocaleString("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    return (
        <section id="quinces" className="quinces-section py-5">
            <div className="container">
                {/* Badge superior */}
                <motion.div
                    className="d-flex justify-content-center mb-3"
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <div className="quinces-badge d-flex align-items-center gap-2">
                        <div className="quinces-badge-icon">
                            <i className="bi bi-camera-fill" />
                        </div>
                        <div className="quinces-badge-text">
                            <span className="fw-semibold d-block">FotoLuna</span>
                            <small className="text-muted d-block">Estudio fotográfico</small>
                        </div>
                    </div>
                </motion.div>

                {/* Título principal */}
                <div className="text-center mb-4">
                    <motion.h1
                        className="quinces-title"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-custom-6">
                            Captura la magia de tus{" "}
                            <span className="quince"> Quince Años</span>
                        </div>
                    </motion.h1>

                    <motion.p
                        className="quinces-subtitle bg-custom-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Sesiones divertidas, modernas y llenas de estilo. Paquetes todo
                        incluido para que sólo tengas que sonreír.
                    </motion.p>
                </div>

                {/* Estado de carga / error */}
                {loading && (
                    <p className="text-center text-muted">Cargando paquetes...</p>
                )}

                {error && <p className="text-center text-danger">{error}</p>}

                {/* Tarjetas */}
                {!loading && !error && packages.length > 0 && (
                    <div className="row g-4 justify-content-center bg-custom-2">
                        {packages.map((pkg, index) => {
                            const isEven = index % 2 === 0;
                            const initialVariant = isEven
                                ? cardVariants.hiddenLeft
                                : cardVariants.hiddenRight;

                            return (
                                <div
                                    key={pkg.id}
                                    className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex"
                                >
                                    <motion.div
                                        className="quinces-card w-100 d-flex flex-column"
                                        initial={initialVariant}
                                        whileInView={cardVariants.visible}
                                        transition={{
                                            duration: 0.6,
                                            delay: 0.2 + index * 0.1,
                                        }}
                                        viewport={{ once: true, amount: 0.2 }}
                                    >
                                        <h3 className="quinces-card-title">{pkg.title}</h3>
                                        <p className="quinces-card-desc">{pkg.description}</p>

                                        <p className="quinces-price mb-3">
                                            ${formatPrice(pkg.price)}
                                        </p>

                                        <ul className="list-unstyled quinces-features mb-4">
                                            <li>
                                                <i className="bi bi-check-circle-fill me-2" />
                                                Sesión personalizada
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle-fill me-2" />
                                                Asesoría de poses y vestuario
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle-fill me-2" />
                                                Entrega digital de fotos
                                            </li>
                                        </ul>

                                        <button
                                            type="button"
                                            className="btn btn-quince mt-auto"
                                            onClick={() => handleReserve(pkg.id)}
                                        >
                                            Reservar
                                        </button>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Fallback si no hay paquetes */}
                {!loading && !error && packages.length === 0 && (
                    <p className="text-center text-muted mt-4">
                        Próximamente paquetes especiales de Quince Años.
                    </p>
                )}
            </div>
        </section>
    );
}
