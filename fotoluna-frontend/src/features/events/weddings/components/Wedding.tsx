import { useState } from 'react';
import { motion } from 'framer-motion'; // 👈 añadimos la importación
import '../styles/wedding.css';
import Button from '../../../../components/Home/Button';

const weddingThemes = [
    {
        id: 1,
        name: "Clásico",
        description: "Elegancia atemporal",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&auto=format&fit=crop",
        packages: [
            { id: 1, name: "Básico", price: "$1,200", features: ["4 horas", "100 fotos", "Sesión pre-boda"] },
            { id: 2, name: "Estándar", price: "$2,500", features: ["8 horas", "300 fotos", "2 fotógrafos", "Álbum físico"], popular: true }
        ]
    },
    {
        id: 2,
        name: "Rústico",
        description: "Naturaleza y campo",
        image: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&auto=format&fit=crop",
        packages: [
            { id: 1, name: "Esencial", price: "$1,500", features: ["5 horas", "150 fotos", "Exteriores"] },
            { id: 2, name: "Completo", price: "$2,800", features: ["10 horas", "400 fotos", "Drone", "Álbum personalizado"], popular: true }
        ]
    },
    {
        id: 3,
        name: "Urbano",
        description: "Moderno y citadino",
        image: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=400&auto=format&fit=crop",
        packages: [
            { id: 1, name: "Urbano", price: "$1,800", features: ["6 horas", "200 fotos", "Locaciones city"] },
            { id: 2, name: "VIP", price: "$3,500", features: ["12 horas", "500 fotos", "Video", "Rooftops"], popular: true }
        ]
    },
    {
        id: 4,
        name: "Bohemio",
        description: "Romántico y soñador",
        image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&auto=format&fit=crop",
        packages: [
            { id: 1, name: "Dreamy", price: "$1,600", features: ["5 horas", "180 fotos", "Estilo film"] },
            { id: 2, name: "Romántico", price: "$3,200", features: ["10 horas", "450 fotos", "Atardecer", "Polaroid"], popular: true }
        ]
    }
];

const Wedding = () => {
    const [activeTheme, setActiveTheme] = useState(weddingThemes[0]);

    return (
        <section className="elegant-wedding-section" id='wedding'>
            {/* Background decorative elements */}
            <div className="elegant-bg-element elegant-bg-1"></div>
            <div className="elegant-bg-element elegant-bg-2"></div>
            <div className="elegant-bg-element elegant-bg-3"></div>

            <div className="container elegant-container">
                {/* Header */}
                <div className="text-center elegant-header">
                    <div className="elegant-title-wrapper">
                        <motion.h1
                            className="bg-custom-7"
                            initial={{ opacity: 0, y: -30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Bodas
                        </motion.h1>
                        <div className="elegant-title-underline">
                            <div className="elegant-underline-dot"></div>
                            <div className="elegant-underline-line"></div>
                            <div className="elegant-underline-dot"></div>
                        </div>
                    </div>
                    <p className="elegant-subtitle">Donde cada momento se convierte en eternidad</p>
                </div>

                {/* Tabs */}
                <div className="row justify-content-center">

                    <div className="col-12">
                        <motion.div
                            className="elegant-tabs-container bg-custom-9"
                            initial={{ opacity: 0, x: 0 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            viewport={{ once: true }}
                        >{weddingThemes.map((theme) => (
                            <button
                                key={theme.id}
                                className={`elegant-tab ${activeTheme.id === theme.id ? 'elegant-tab-active' : ''}`}
                                onClick={() => setActiveTheme(theme)}
                            >
                                <span className="elegant-tab-icon">✦</span>
                                {theme.name}
                            </button>
                        ))}</motion.div>

                    </div>
                </div>

                {/* Main Content */}
                <div className="row elegant-content-row">
                    {/* Image Section */}
                    <div className="col-lg-5 elegant-image-section">
                        <div className="elegant-image-wrapper">
                            <div className="elegant-image-frame">
                                <img
                                    src={activeTheme.image}
                                    alt={activeTheme.name}
                                    className="elegant-main-image"
                                />
                                <div className="elegant-image-overlay">
                                    <div className="elegant-theme-badge">{activeTheme.name}</div>
                                    <p className="elegant-theme-description">{activeTheme.description}</p>
                                </div>
                            </div>
                            <div className="elegant-image-decoration"></div>
                        </div>
                    </div>

                    {/* Packages Section */}
                    <div className="col-lg-7 elegant-packages-section">
                        <div className="elegant-packages-grid bg-custom-5">
                            <div className="row align-items-stretch">
                                {activeTheme.packages.map((pkg, index) => (
                                    <motion.div
                                        key={pkg.id}
                                        className="col-12 col-md-6 elegant-package-card-wrapper d-flex justify-content-center"
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: index * 0.2 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className={`elegant-package-card ${pkg.popular ? 'elegant-package-featured' : ''}`}>
                                            {pkg.popular && (
                                                <div className="elegant-featured-badge">
                                                    <span className="elegant-featured-star">★</span>
                                                    Más Elegido
                                                </div>
                                            )}

                                            <div className="elegant-package-header">
                                                <div className="elegant-package-name-section">
                                                    <h4 className="elegant-package-name">{pkg.name}</h4>
                                                    <div className="elegant-package-price">{pkg.price}</div>
                                                </div>
                                            </div>

                                            <div className="elegant-package-features">
                                                {pkg.features.map((feature, i) => (
                                                    <div key={i} className="elegant-feature-item">
                                                        <div className="elegant-feature-icon">◈</div>
                                                        <span className="elegant-feature-text">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button className="elegant-book-button">
                                                <span className="elegant-button-text">Reservar Experiencia</span>
                                                <span className="elegant-button-arrow">→</span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Wedding;
