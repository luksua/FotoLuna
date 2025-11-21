/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import "../styles/graduation.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Si usas Vite:
const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// 👇 Ajusta este ID al id real del evento de graduación en tu tabla `events`
const GRADUATION_EVENT_ID = 6;

interface Package {
    id: number;
    name: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    popular?: boolean;
    image: string;
    category: "basic" | "standard" | "premium" | "deluxe";
    duration: string;
    photos: string;
}

const GraduationPhotography: React.FC = () => {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const categories = [
        { id: "all", name: "Todos" },
        { id: "basic", name: "Básico" },
        { id: "standard", name: "Estándar" },
        { id: "premium", name: "Premium" },
    ];

    // 🔹 Traer paquetes desde el backend
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

                // 👉 Caso 1: backend devuelve { general: [...], specific: [...] }
                const general = res.data.general ?? [];
                const specific = res.data.specific ?? [];

                const combinedRaw = [...specific, ...general];

                const mapped: Package[] = combinedRaw.map((pkg: any, index: number) => ({
                    id: pkg.id,
                    name: pkg.packageName,
                    price: pkg.packagePrice,
                    originalPrice: pkg.originalPrice ?? undefined,
                    description: pkg.packageDescription,
                    // si tu backend tiene un array de features, úsalo; si no, pon uno básico
                    features:
                        pkg.features ??
                        [
                            "Sesión fotográfica profesional",
                            "Edición básica de fotos",
                            "Entrega digital",
                        ],
                    popular: index === 0, // por ejemplo el primero como "popular"
                    image: pkg.photos?.[0]?.url ?? "/img/bautizo.jpg", // fallback
                    // si en el backend tienes un campo category, úsalo; si no, default:
                    category: (pkg.category as Package["category"]) ?? "standard",
                    duration: pkg.duration ?? "1 hora",
                    photos: pkg.photosCount
                        ? `${pkg.photosCount} fotos`
                        : "Fotos digitales",
                }));

                setPackages(mapped);

                // 👉 Si tu backend devuelve solo un array plano, sin general/specific:
                //
                // const mapped: Package[] = res.data.map((pkg: any, index: number) => ({
                //   id: pkg.id,
                //   name: pkg.packageName,
                //   price: pkg.packagePrice,
                //   originalPrice: pkg.originalPrice ?? undefined,
                //   description: pkg.packageDescription,
                //   features: pkg.features ?? ["Sesión fotográfica", "Entrega digital"],
                //   popular: index === 1,
                //   image: pkg.photos?.[0]?.url ?? "/img/bautizo.jpg",
                //   category: (pkg.category as Package["category"]) ?? "standard",
                //   duration: pkg.duration ?? "1 hora",
                //   photos: pkg.photosCount
                //     ? `${pkg.photosCount} fotos`
                //     : "Fotos digitales",
                // }));
                // setPackages(mapped);

            } catch (err) {
                console.error("Error cargando paquetes de graduación:", err);
                setError("No se pudieron cargar los paquetes en este momento.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // 🔹 Filtrado por categoría
    const filteredPackages =
        activeCategory === "all"
            ? packages
            : packages.filter((pkg) => pkg.category === activeCategory);

    // 🔹 Abrir modal de imagen
    const handleImageClick = (image: string) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedImage("");
    };

    // 🔹 Reservar → ir al wizard con eventId + packageId
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
        // sin decimales:
        return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        // si quieres decimales, usa:
        // return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

                    {/* Filtros */}
                    <div className="compact-categories mb-4 text-center">
                        <div className="compact-filter-container d-inline-flex gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    className={`compact-filter-btn ${activeCategory === category.id ? "active" : ""
                                        }`}
                                    onClick={() => setActiveCategory(category.id)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <p className="text-center text-muted">Cargando paquetes...</p>
                    )}
                    {error && (
                        <p className="text-center text-danger">{error}</p>
                    )}

                    {/* Grid animado */}
                    {!loading && !error && (
                        <div className="row g-4 justify-content-center">
                            {filteredPackages.map((pkg, index) => (
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
                                            } ${selectedPackage === pkg.id ? "card-hover" : ""
                                            }`}
                                        onMouseEnter={() => setSelectedPackage(pkg.id)}
                                        onMouseLeave={() => setSelectedPackage(null)}
                                    >
                                        <div className="compact-card-content">
                                            {/* Header */}
                                            <div className="compact-card-header">
                                                <div className={`compact-category-badge ${pkg.category}`}>
                                                    {pkg.category}
                                                </div>
                                                <div className="compact-package-meta">
                                                    <span className="duration">{pkg.duration}</span>
                                                    <span className="photos">{pkg.photos}</span>
                                                </div>
                                            </div>

                                            {/* Imagen */}
                                            <div
                                                className="compact-image-container"
                                                onClick={() => handleImageClick(pkg.image)}
                                            >
                                                <img
                                                    src={pkg.image}
                                                    alt={pkg.name}
                                                    className="compact-image"
                                                />
                                                <div className="compact-image-overlay"></div>
                                            </div>

                                            {/* Info */}
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
                                                        <div
                                                            key={index2}
                                                            className="compact-feature"
                                                        >
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

            {/* Modal */}
            {showModal && (
                <div className="compact-modal" onClick={closeModal}>
                    <div
                        className="compact-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="compact-modal-close"
                            onClick={closeModal}
                        >
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
