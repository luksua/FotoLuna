/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import "../styles/graduation.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const GRADUATION_EVENT_ID = 7;

interface Package {
    id: number;
    name: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    popular?: boolean;
    image: string;
    category: "basic" | "standard" | "premium" | "deluxe" | string;
    duration: string;
    photos: string;
}

// rutas de imagen definidas a mano
const LOCAL_IMAGES: string[] = [
    "/img/grado.jpg",
    "/img/grado2.jpg",
    "/img/grado3.jpg",
    "/img/grado4.jpg",
    "/img/grado5.jpg",
    "/img/graduacion-6.jpg",
];

const GraduationPhotography: React.FC = () => {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");

    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${API_BASE}/api/events/${GRADUATION_EVENT_ID}/packages`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const general = res.data.general ?? [];
                const specific = res.data.specific ?? [];
                const combinedRaw = [...specific, ...general];

                console.log("Paquetes desde el backend:", combinedRaw); // 👈 para verificar que están los 2 extra

                const mapped: Package[] = combinedRaw.map((pkg: any, index: number) => ({
                    id: pkg.id,
                    name: pkg.packageName,
                    price: pkg.packagePrice,
                    originalPrice: pkg.originalPrice ?? undefined,
                    description: pkg.packageDescription,
                    features:
                        pkg.features ?? [
                            "Sesión fotográfica profesional",
                            "Edición básica de fotos",
                            "Entrega digital",
                        ],
                    popular: index === 0,
                    // imagen tomada del arreglo LOCAL_IMAGES
                    image: LOCAL_IMAGES[index] ?? "/img/graduacion-default.jpg",
                    category: (pkg.category as Package["category"]) ?? "standard",
                    duration: pkg.duration ?? "1 hora",
                    photos: pkg.photosCount ? `${pkg.photosCount} fotos` : "Fotos digitales",
                }));

                setPackages(mapped);
            } catch (err) {
                console.error("Error cargando paquetes de graduación:", err);
                setError("No se pudieron cargar los paquetes en este momento.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    const handleImageClick = (image: string) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedImage("");
    };

    const handleReserve = (packageId: number) => {
        navigate("/nuevaCita", {
            state: {
                eventId: GRADUATION_EVENT_ID,
                packageId,
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
        <>
            <section className="compact-graduation-section" id="graduation">
                <div className="compact-background">
                    <div className="compact-pattern"></div>
                </div>

                <div className="container py-5">
                    <div className="text-center mb-5">
                        <div className="compact-title-container">
                            <motion.h1
                                className="compact-main-title title"
                                initial={{ opacity: 0, y: -30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Paquetes de Fotografía de Grado
                            </motion.h1>

                            <div className="compact-divider">
                                <div className="compact-cap-icon">🎓</div>
                            </div>
                            <p className="compact-subtitle">
                                Elige el paquete perfecto para inmortalizar tu logro académico
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <p className="text-center text-muted">Cargando paquetes...</p>
                    )}
                    {error && <p className="text-center text-danger">{error}</p>}

                    {!loading && !error && (
                        <div className="row g-4 justify-content-center">
                            {packages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
                                    initial={{ opacity: 0, y: 60 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        ease: "easeOut",
                                    }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <div
                                        className={`compact-package-card ${pkg.popular ? "featured" : ""
                                            } ${selectedPackage === pkg.id ? "card-hover" : ""}`}
                                        onMouseEnter={() => setSelectedPackage(pkg.id)}
                                        onMouseLeave={() => setSelectedPackage(null)}
                                    >
                                        <div className="compact-card-content">
                                            <div className="compact-card-header">
                                                <div className={`compact-category-badge ${pkg.category}`}>
                                                    {pkg.category}
                                                </div>
                                                <div className="compact-package-meta">
                                                    <span className="duration">{pkg.duration}</span>
                                                    <span className="photos">{pkg.photos}</span>
                                                </div>
                                            </div>

                                            {/* Imagen más larga */}
                                            <div
                                                className="compact-image-container"
                                                onClick={() => handleImageClick(pkg.image)}
                                            >
                                                <img
                                                    src={pkg.image}
                                                    alt={pkg.name}
                                                    className="compact-image"
                                                />
                                                <div className="compact-image-overlay">Ver grande</div>
                                            </div>

                                            <div className="compact-info">
                                                <h3 className="compact-package-name">{pkg.name}</h3>
                                                <p className="compact-package-desc">
                                                    {pkg.description}
                                                </p>

                                                <div className="compact-pricing">
                                                    <div className="compact-current-price">
                                                        ${formatPrice(pkg.price)}
                                                    </div>
                                                </div>

                                                <div className="compact-features">
                                                    {pkg.features.slice(0, 3).map((feature, index2) => (
                                                        <div key={index2} className="compact-feature">
                                                            <span className="feature-dot">•</span>
                                                            <span className="feature-text">{feature}</span>
                                                        </div>
                                                    ))}
                                                    {pkg.features.length > 3 && (
                                                        <div className="compact-feature-more">
                                                            +{pkg.features.length - 3} más...
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="compact-actions">
                                                    <button
                                                        className="compact-primary-btn"
                                                        onClick={() => handleReserve(pkg.id)}
                                                    >
                                                        Reservar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {showModal && (
                <div className="compact-modal" onClick={closeModal}>
                    <div
                        className="compact-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="compact-modal-close" onClick={closeModal}>
                            ×
                        </button>
                        <img
                            src={selectedImage}
                            alt="Ejemplo"
                            className="compact-modal-image"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default GraduationPhotography;
