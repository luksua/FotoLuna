import React, { useState } from 'react';
import '../styles/graduation.css';
import { motion } from 'framer-motion';

// Imágenes de ejemplo
import gradPhoto1 from '/img/bautizo.jpg';
import gradPhoto2 from '/img/bautizo.jpg';
import gradPhoto3 from '/img/bautizo.jpg';
import gradPhoto4 from '/img/bautizo.jpg';

interface Package {
    id: number;
    name: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    popular?: boolean;
    image: string;
    category: 'basic' | 'standard' | 'premium' | 'deluxe';
    duration: string;
    photos: string;
}

const GraduationPhotography: React.FC = () => {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const packages: Package[] = [
        {
            id: 1,
            name: "Esencial",
            price: "$150.000",
            originalPrice: "$180.000",
            description: "Sesión básica para recuerdos",
            features: ["20 fotos digitales", "1 hora de sesión", "2 cambios de atuendo", "Fondo estudio"],
            category: 'basic',
            image: gradPhoto1,
            duration: "1 hora",
            photos: "20 fotos"
        },
        {
            id: 2,
            name: "Estándar",
            price: "$250.000",
            originalPrice: "$300.000",
            description: "Cobertura completa de graduación",
            features: ["40 fotos digitales", "2 horas de sesión", "3 cambios de atuendo", "Locación exterior", "Album digital"],
            popular: true,
            category: 'standard',
            image: gradPhoto2,
            duration: "2 horas",
            photos: "40 fotos"
        },
        {
            id: 3,
            name: "Premium",
            price: "$380.000",
            description: "Experiencia fotográfica premium",
            features: ["60 fotos profesionales", "3 horas de sesión", "Estudio + exteriores", "Book digital", "Video slideshow"],
            category: 'premium',
            image: gradPhoto3,
            duration: "3 horas",
            photos: "60 fotos"
        },
        {
            id: 4,
            name: "Familiar",
            price: "$550.000",
            originalPrice: "$650.000",
            description: "Paquete completo familiar",
            features: ["100+ fotos editadas", "4 horas de sesión", "Fotos grupales", "Book físico", "Video profesional"],
            category: 'premium',
            image: gradPhoto4,
            duration: "4 horas",
            photos: "100+ fotos"
        },
        {
            id: 5,
            name: "Express",
            price: "$120.000",
            description: "Sesión rápida y económica",
            features: ["15 fotos digitales", "30 min de sesión", "1 cambio de atuendo", "Entrega en 24h"],
            category: 'basic',
            image: gradPhoto1,
            duration: "30 min",
            photos: "15 fotos"
        },
        {
            id: 6,
            name: "Grupal",
            price: "$450.000",
            description: "Perfecto para grupos de amigos",
            features: ["80 fotos digitales", "3 horas de sesión", "Fotos individuales/grupales", "3 locaciones", "Album grupal"],
            category: 'premium',
            image: gradPhoto3,
            duration: "3 horas",
            photos: "80 fotos"
        }
    ];

    const categories = [
        { id: 'all', name: 'Todos' },
        { id: 'basic', name: 'Básico' },
        { id: 'standard', name: 'Estándar' },
        { id: 'premium', name: 'Premium' }
    ];

    const filteredPackages = activeCategory === 'all'
        ? packages
        : packages.filter(pkg => pkg.category === activeCategory);

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
            <section className="compact-graduation-section" id='graduation'>
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
                                Elige el paquete perfecto para immortalizar tu logro académico
                            </p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="compact-categories mb-4 text-center">
                        <div className="compact-filter-container d-inline-flex gap-2">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`compact-filter-btn ${activeCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(category.id)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid animado */}
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
                                    ease: "easeOut"
                                }}
                                viewport={{ once: true, amount: 0.2 }}
                                whileHover={{ scale: 1.03 }}
                            >
                                <div
                                    className={`compact-package-card ${pkg.popular ? 'featured' : ''} ${selectedPackage === pkg.id ? 'card-hover' : ''}`}
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
                                            <p className="compact-package-desc">{pkg.description}</p>

                                            <div className="compact-pricing">
                                                <div className="compact-current-price">{pkg.price}</div>
                                            </div>

                                            <div className="compact-features">
                                                {pkg.features.slice(0, 3).map((feature, index) => (
                                                    <div key={index} className="compact-feature">
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
                                                <button className="compact-primary-btn">Reservar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div className="compact-modal" onClick={closeModal}>
                    <div className="compact-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="compact-modal-close" onClick={closeModal}>×</button>
                        <img src={selectedImage} alt="Ejemplo" className="compact-modal-image" />
                    </div>
                </div>
            )}
        </>
    );
};

export default GraduationPhotography;
