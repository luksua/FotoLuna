/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import "../styles/docs.css";
import Button from "../../../../../components/Home/Button";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface DocumentPromotion {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string;
    features: string[];
    gradient: string;
}

const ProfessionalPhotoPromotions: React.FC = () => {
    const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [promotions, setPromotions] = useState<DocumentPromotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${API_BASE}/api/document-types`);
                const docs = res.data;

                const mapped = docs.map((doc: any) => ({
                    id: doc.id,
                    title: doc.name,
                    description: doc.description ?? "Fotografía profesional",
                    price: `$${doc.price.toLocaleString()}`,
                    image: doc.photoUrl ?? "/img/bautizo.jpg",
                    features: [
                        `${doc.number_photos} fotos entregadas`,
                        doc.requiresUpload ? "Requiere subir foto" : "Foto presencial",
                        doc.requiresPresence ? "Se toma en el estudio" : "Fotógrafo a domicilio",
                    ],
                    gradient: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
                }));

                setPromotions(mapped);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los documentos.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentTypes();
    }, []);

    const handleImageClick = (image: string) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedImage("");
    };

    const handleReserve = (documentTypeId: number) => {
        navigate("/nuevaCita", {
            state: {
                eventId: 6,
                documentTypeId,
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
            <section className="professional-promotions-section" id="documents">
                <div className="professional-background">
                    <div className="bg-pattern"></div>
                </div>

                <div className="container py-5">
                    <div className="text-center mb-6">
                        <div className="professional-title-container">
                            <motion.h1
                                className="professional-main-title"
                                initial={{ opacity: 0, y: -30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Sesiones Fotográficas Profesionales
                            </motion.h1>
                            <div className="title-divider"></div>
                            <p className="professional-subtitle">
                                Fotografía especializada para documentos oficiales
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <p className="text-center text-muted">Cargando opciones...</p>
                    )}

                    {error && (
                        <p className="text-center text-danger">{error}</p>
                    )}

                    <div className="row g-4 justify-content-center">
                        {!loading &&
                            !error &&
                            promotions.map((promotion, index) => (
                                <motion.div
                                    key={promotion.id}
                                    className="col-xl-6 col-lg-6 col-md-12"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        ease: "easeOut",
                                    }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    onMouseEnter={() => setSelectedPromotion(promotion.id)}
                                    onMouseLeave={() => setSelectedPromotion(null)}
                                >
                                    <div
                                        className={`professional-promotion-card horizontal-layout ${selectedPromotion === promotion.id ? "card-hover" : ""
                                            }`}
                                    >
                                        <div className="card-horizontal-content">
                                            {/* Columna izquierda */}
                                            <div className="left-column">
                                                <div
                                                    className="reference-image-container horizontal-image"
                                                    onClick={() => handleImageClick(promotion.image)}
                                                >
                                                    <img
                                                        src={promotion.image}
                                                        alt={`Ejemplo de foto para ${promotion.title}`}
                                                        className="reference-image"
                                                    />
                                                    <div className="image-overlay">
                                                        <span className="view-reference">Ver ejemplo</span>
                                                    </div>
                                                </div>

                                                <div className="pricing-section image-pricing">
                                                    <div className="current-price">
                                                        ${formatPrice(promotion.price)}
                                                        <span className="price-label">Instantáneas</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Columna derecha */}
                                            <div className="right-column">
                                                <div className="card-header horizontal-header">
                                                    <div className="service-info">
                                                        <h3 className="service-title">{promotion.title}</h3>
                                                        <p className="service-description">
                                                            {promotion.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="features-section horizontal-features">
                                                    <h4 className="features-title">Incluye:</h4>
                                                    <div className="features-grid-doc">
                                                        {promotion.features.map((feature, i) => (
                                                            <div key={i} className="feature-item">
                                                                <div className="feature-check">✓</div>
                                                                <span className="feature-text">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="card-actions horizontal-actions d-flex justify-content-center">
                                                    <Button
                                                        className="shiny-text-doc"
                                                        onClick={() => handleReserve(promotion.id)}
                                                    >
                                                        <div className="button-content">
                                                            <span className="button-text">Agendar Cita</span>
                                                        </div>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            </section>

            {/* Modal para ver imagen de referencia */}
            {showModal && (
                <div className="image-modal" onClick={closeModal}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={closeModal}>
                            x
                        </button>
                        <img
                            src={selectedImage}
                            alt="Referencia"
                            className="modal-image"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfessionalPhotoPromotions;
