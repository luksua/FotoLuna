/* eslint-disable @typescript-eslint/no-explicit-any */
import "../styles/quinces.css";
// import Carousel from "../components/Carousel";
import Button from "../../../../../components/Home/Button";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const QUINCES_EVENT_ID = 3;

export default function Quinces() {
    const contentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    } else {
                        entry.target.classList.remove("visible");
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "-50px",
            }
        );

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // 🔹 Cargar paquetes del backend (generales + específicos)
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

                const combined = [...specific, ...general].map((pkg: any) => ({
                    id: pkg.id,
                    title: pkg.packageName,
                    description: pkg.packageDescription,
                    price: pkg.packagePrice,
                    // Si quieres mostrar imagen del paquete en algún lado, tendrías esto:
                    img: pkg.photos?.[0]?.url ?? "",
                }));

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

    // 🔹 Ir al wizard con el paquete preseleccionado
    const handleReserve = (packageId: number) => {
        navigate("/nuevaCita", {
            state: {
                eventId: QUINCES_EVENT_ID,
                packageId,
                skipPackageSelection: true,
            },
        });
    };

    // const instagramImages = [
    //     {
    //         id: 1,
    //         url: "https://images.unsplash.com/photo-1579546929662-711aa81148cf",
    //         alt: "Paisaje colorido",
    //     },
    //     {
    //         id: 2,
    //         url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    //         alt: "Montañas nevadas",
    //     },
    //     {
    //         id: 3,
    //         url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    //         alt: "Bosque encantado",
    //     },
    //     {
    //         id: 4,
    //         url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
    //         alt: "Atardecer en la playa",
    //     },
    // ];

    const formatPrice = (value: string | number) => {
        const n = Number(String(value).replace(/[^0-9.-]+/g, ""));
        if (Number.isNaN(n)) return String(value);
        // sin decimales:
        return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        // si quieres decimales, usa:
        // return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="quince-container my-5" id="quinces" ref={contentRef}>
            <header className="promo-hero rounded-4">
                <div className="container py-5">
                    <div className="row align-items-center ">
                        <div className="col-lg-12">
                            <div className="glass-card">
                                <div className="camera-badge d-flex align-items-center gap-2">
                                    <i className="bi bi-camera-fill fs-4"></i>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>FotoLuna</div>
                                        <small className="text-muted">
                                            Ibagué • Estudio móvil
                                        </small>
                                    </div>
                                </div>

                                <motion.h1
                                    className="display-5 headline-big mt-2"
                                    initial={{ opacity: 0, y: -30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="bg-custom-6">
                                        Captura la magia de tus{" "}
                                        <span className="quince"> Quince Años</span>
                                    </div>
                                </motion.h1>

                                <motion.p
                                    className="lead text-muted bg-custom-2"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    Sesiones divertidas, modernas y llenas de estilo. Paquetes
                                    todo incluido para que sólo tengas que sonreír.
                                </motion.p>

                                <div className="row">
                                    {loading && (
                                        <p className="text-muted">Cargando paquetes...</p>
                                    )}

                                    {error && (
                                        <p className="text-danger">{error}</p>
                                    )}

                                    {!loading &&
                                        !error &&
                                        packages.map((pkg, i) => (
                                            <motion.div
                                                key={pkg.id}
                                                className="col-12 col-md-6 mb-3"
                                                initial={{
                                                    opacity: 0,
                                                    x: i % 2 === 0 ? -50 : 50,
                                                }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.4 + i * 0.2,
                                                }}
                                                viewport={{ once: true }}
                                            >
                                                <div className="options plan">
                                                    <div className="bg-custom-2 p-3 rounded-3">
                                                        <h4 className="fw-bold">{pkg.title}</h4>
                                                        <p className="mb-2">{pkg.description}</p>
                                                        <p className="fw-semibold mb-3">
                                                            ${formatPrice(pkg.price)}
                                                        </p>

                                                        {/* Si quieres mantener bullets fijos, puedes dejarlos,
                                                            o eliminarlos si todo viene desde la BD */}
                                                        <ul className="list-unstyled bg-custom-2">
                                                            <li>
                                                                <i className="bi bi-check-circle-fill me-2 circle-check"></i>
                                                                Sesión personalizada
                                                            </li>
                                                            <li>
                                                                <i className="bi bi-check-circle-fill me-2 circle-check"></i>
                                                                Asesoría de poses y vestuario
                                                            </li>
                                                            <li>
                                                                <i className="bi bi-check-circle-fill me-2 circle-check"></i>
                                                                Entrega digital de fotos
                                                            </li>
                                                        </ul>

                                                        <div className="d-flex justify-content-center align-items-center pt-3">
                                                            <Button
                                                                className="shiny-text-quince"
                                                                onClick={() => handleReserve(pkg.id)}
                                                            >
                                                                Reservar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                    {/* Fallback por si no hay paquetes en BD */}
                                    {!loading && !error && packages.length === 0 && (
                                        <p className="text-muted">
                                            Próximamente paquetes especiales de Quince Años.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Carousel section */}
                        {/* <motion.div
                            className="col-lg-5 d-none d-lg-block position-relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <div className="justify-content-center carousel">
                                <div className="card shadow-sm">
                                    <div className="p-0">
                                        <motion.div
                                            className="d-flex align-items-center p-3 border-bottom"
                                            initial={{ opacity: 0, y: -20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 1 }}
                                            viewport={{ once: true }}
                                        >
                                            <div
                                                className="rounded-circle bg-secondary me-3"
                                                style={{ width: "32px", height: "32px" }}
                                            ></div>
                                            <div className="">
                                                <h6 className="bg-custom-2 fw-bold">danna</h6>
                                            </div>
                                        </motion.div>
                                        <Carousel
                                            images={instagramImages}
                                            autoPlay={true}
                                            interval={4000}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div> */}
                    </div>
                </div>
            </header>
        </div>
    );
}
