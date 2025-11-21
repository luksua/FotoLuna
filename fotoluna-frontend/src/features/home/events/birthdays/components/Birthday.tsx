/* eslint-disable @typescript-eslint/no-explicit-any */
import "../styles/birthday.css";
import { Card, Carousel } from "react-bootstrap";
import Button from "../../../../../components/Home/Button";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const BIRTHDAY_EVENT_ID = 2;

const Birthday = () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Observer para animaciones de entrada
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
                    `${API_BASE}/api/events/${BIRTHDAY_EVENT_ID}/packages`,
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
                    img: pkg.photos?.[0]?.url ?? "/img/birthday-default.jpg", // fallback
                }));

                setPackages(combined);
            } catch (err) {
                console.error("Error cargando paquetes de cumpleaños:", err);
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
                eventId: BIRTHDAY_EVENT_ID,
                packageId,
                skipPackageSelection: true,
            },
        });
    };

    const formatPrice = (value: string | number) => {
    const n = Number(String(value).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(n)) return String(value);
    // sin decimales:
    return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    // si quieres decimales, usa:
    // return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

    return (
        <section className="birthday-section py-5 p-5" id="birthday">
            <br />
            <br />
            <div className="container-fluid">
                <div className="row align-items-center justify-content-between">
                    <div
                        className="col-lg-7 mb-4 mb-lg-0 text-center birthday-text"
                        ref={contentRef}
                    >
                        {/* TEXTO Y PAQUETES */}
                        <motion.h2
                            className="fw-bold bg-custom-1 title"
                            initial={{ opacity: 0, y: -30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Cumpleaños
                        </motion.h2>

                        <motion.p
                            className="description mt-3 bg-custom-2"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Celebra tu día especial con una sesión llena de color, alegría y
                            diversión. Capturamos los mejores momentos para que revivas cada
                            sonrisa, cada gesto y cada vela apagada con amor.
                        </motion.p>

                        <div className="packages card-grid mt-4">
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
                                        initial={{ opacity: 0, y: 60 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: i * 0.2 }}
                                        viewport={{ once: true }}
                                    >
                                        <Card className="package-card mb-3 bg-custom-2">
                                            <Card.Body>
                                                <Card.Title className="fw-bold text-blue">
                                                    {pkg.title}
                                                </Card.Title>
                                                <Card.Text>{pkg.description}</Card.Text>
                                                <h5 className="price-birthday">${formatPrice(pkg.price)}</h5>
                                                <Button
                                                    className="shiny-text-birthday"
                                                    onClick={() => handleReserve(pkg.id)}
                                                >
                                                    Reservar
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                ))}
                        </div>
                    </div>

                    {/* GALERÍA DE FOTOS SIMULADA */}
                    <motion.div
                        className="col-lg-5 col-md-6 birthday-gallery align-items-center justify-content-between"
                        initial={{ opacity: 0, x: 100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <Carousel>
                            <Carousel.Item>
                                <div className="gallery-item img1"></div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="gallery-item img2"></div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="gallery-item img3"></div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="gallery-item img4"></div>
                            </Carousel.Item>
                        </Carousel>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Birthday;
