import React, { useState } from 'react';
import '../styles/docs.css';
import Button from '../../../../components/Home/Button';
import { motion } from 'framer-motion';

interface Promotion {
    id: number;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    features: string[];
    popular?: boolean;
    image: string;
    gradient: string;
}

const ProfessionalPhotoPromotions: React.FC = () => {
    const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>('');

    const promotions: Promotion[] = [
        {
            id: 1,
            title: "Licencia de Conducción",
            description: "Fotos oficiales cumpliendo normativas",
            price: "$25.000",
            originalPrice: "$35.000",
            features: ["2 fotos 3x4", "Fondo blanco oficial", "Retoque básico", "Entrega en 15 min"],
            popular: true,
            image: "/img/bautizo.jpg",
            gradient: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)"
        },
        {
            id: 2,
            title: "Visa & Pasaporte",
            description: "Cumpliendo requisitos internacionales",
            price: "$30.000",
            originalPrice: "$40.000",
            features: ["Fondo blanco profesional", "Cumple normativas", "2 copias digitales", "Asesoría"],
            image: "/img/bautizo.jpg",
            gradient: "linear-gradient(135deg, #16A085 0%, #1ABC9C 100%)"
        },
        {
            id: 3,
            title: "Documentos Escolares",
            description: "Fotos para colegio y universidad",
            price: "$20.000",
            features: ["Fondo azul/blanco", "Formato requerido", "Entrega inmediata", "Aprobación garantizada"],
            image: "/img/bautizo.jpg",
            gradient: "linear-gradient(135deg, #2980B9 0%, #3498DB 100%)"
        },
        {
            id: 4,
            title: "Tarjeta Profesional",
            description: "Imagen corporativa profesional",
            price: "$35.000",
            features: ["Fondo neutro", "Retoque profesional", "Versión digital HD", "Look ejecutivo"],
            image: "/img/bautizo.jpg",
            gradient: "linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)"
        },
        {
            id: 5,
            title: "Hoja de Vida",
            description: "Foto profesional para CV",
            price: "$40.000",
            originalPrice: "$50.000",
            features: ["Fondo profesional", "Retoque avanzado", "Varias poses", "Asesoría de imagen"],
            image: "/img/bautizo.jpg",
            gradient: "linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)"
        },
        {
            id: 6,
            title: "Fuerzas Armadas",
            description: "Incorporación militar",
            price: "$28.000",
            features: ["Cumple normativas", "Fondo específico", "Formato oficial", "Asesoría militar"],
            image: "/img/bautizo.jpg",
            gradient: "linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)"
        }
    ];

    const handleImageClick = (image: string) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedImage('');
    };

    return (
        <>
            <section className="professional-promotions-section" id='documents'>
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

                    <div className="row g-4 justify-content-center">
                        {promotions.map((promotion, index) => (
                            <motion.div
                                key={promotion.id}
                                className="col-xl-6 col-lg-6 col-md-12"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.15, // animación escalonada
                                    ease: "easeOut",
                                }}
                                viewport={{ once: true, amount: 0.2 }}
                                onMouseEnter={() => setSelectedPromotion(promotion.id)}
                                onMouseLeave={() => setSelectedPromotion(null)}
                            >
                                <div
                                    className={`professional-promotion-card horizontal-layout featured" : ""
                                        } ${selectedPromotion === promotion.id ? "card-hover" : ""}`}
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
                                                    {promotion.price}
                                                    <span className="price-label">Instantáneas</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna derecha */}
                                        <div className="right-column">
                                            <div className="card-header horizontal-header">
                                                <div className="service-info">
                                                    <h3 className="service-title">{promotion.title}</h3>
                                                    <p className="service-description">{promotion.description}</p>
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
                                                <Button className="shiny-text-doc">
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <img src={selectedImage} alt="Referencia" className="modal-image" />
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfessionalPhotoPromotions;