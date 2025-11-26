import { useState, useEffect } from 'react';
import "../styles/home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from 'react-router-dom';

const SCROLL_NAVBAR_HEIGHT = 80;

const scrollToHash = (hash: string) => {
    if (!hash) return;
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    const el = document.getElementById(id);
    if (el) {
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - SCROLL_NAVBAR_HEIGHT;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    } else {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
            attempts++;
            const el2 = document.getElementById(id);
            if (el2) {
                clearInterval(interval);
                const elementPosition = el2.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - SCROLL_NAVBAR_HEIGHT;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 150);
    }
};

const Home = () => {
    const location = useLocation();
    const images = [
        {
            src: "img/maternidad.jpg",
            alt: "Maternidad",
            title: "Maternidad",
            description: "Conserva los recuerdos de esta hermosa etapa",
            sectionId: "maternity"
        },
        {
            src: "img/birthday2.jpg",
            alt: "Cumpleaños",
            title: "Cumpleaños",
            description: "Celebraciones llenas de alegría y diversión",
            sectionId: "birthday"
        },
        {
            src: "img/quinces1.png",
            alt: "Quinceañeras",
            title: "Quinceañeras",
            description: "Momentos únicos en tu paso a la juventud",
            sectionId: "quinces"
        },
        {
            src: "img/boda.jpg",
            alt: "Boda",
            title: "Boda",
            description: "Capturamos el amor y la magia de tu día especial",
            sectionId: "wedding"
        },
        {
            src: "img/bautizo.jpg",
            alt: "Sacramentos",
            title: "Sacramentos",
            description: "Un día especial en tu vida espiritual",
            sectionId: "sacraments"
        },
        {
            src: "img/folclor.jpg",
            alt: "Documento",
            title: "Documento",
            description: "La belleza de nuestras tradiciones",
            sectionId: "documents"
        },
        {
            src: "img/folclor.jpg",
            alt: "Grados",
            title: "Grados",
            description: "Celebra y recuerda tu grado con fotografías",
            sectionId: "graduation"
        },
        {
            src: "img/folclor.jpg",
            alt: "Otros",
            title: "Otros",
            description: "Muchas más sesiones de fotos",
            sectionId: "others"
        },
    ];

    const handleImageClick = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const totalItems = images.length;

    const [screenSize, setScreenSize] = useState({
        isMobile: window.innerWidth <= 768,
        isSmallMobile: window.innerWidth <= 425,
    });

    const visibleItems = screenSize.isSmallMobile ? 1 : screenSize.isMobile ? 2 : 3;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const autoplayTime = 3000;

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                isMobile: window.innerWidth <= 768,
                isSmallMobile: window.innerWidth <= 425,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getTranslateX = () => {
        if (screenSize.isSmallMobile) {
            return currentIndex * (100 / visibleItems);
        }
        return (currentIndex * 100) / visibleItems;
    };

    const handleNext = () => {
        if (currentIndex < totalItems - visibleItems) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        } else {
            setCurrentIndex(totalItems - visibleItems);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoplay) {
            interval = setInterval(() => {
                handleNext();
            }, autoplayTime);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    });

    const getItemClass = (index: number) => {
        if (screenSize.isSmallMobile) {
            return index === currentIndex ? "large" : "small-mobile";
        } else if (screenSize.isMobile) {
            if (index === currentIndex + 1) return "large";
            if (index === currentIndex || index === currentIndex + 2) return "small";
            return "hidden";
        } else {
            if (index === currentIndex + 1) return "large";
            if (index === currentIndex || index === currentIndex + 2) return "small";
            return "hidden";
        }
    };

    const handleMouseEnter = () => setAutoplay(false);
    const handleMouseLeave = () => setAutoplay(true);

    useEffect(() => {
        // 1) Si viene un hash, hacer scroll
        if (location.hash) {
            // Pequeño timeout para asegurar montaje; si tus secciones ya están montadas puede no ser necesario
            setTimeout(() => scrollToHash(location.hash), 50);
            return;
        }

        // 2) Soporte para ?section=birthday
        const params = new URLSearchParams(location.search);
        const section = params.get("section");
        if (section) {
            setTimeout(() => scrollToHash(`#${section}`), 50);
        }
    }, [location]);

    return (
        <div className="container-fluid">
            <div
                className="slider-container position-relative overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="slider-track d-flex transition-transform"
                    style={{
                        transform: `translateX(-${getTranslateX()}%)`,
                        transition: "transform 0.7s ease-in-out",
                    }}
                >
                    {images.map((img, index) => (
                        <div className={`slider-item ${getItemClass(index)}`} key={index}>
                            <div
                                className="image-container-home"
                                onClick={() => handleImageClick(img.sectionId)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img src={img.src} alt={img.alt} className="img-fluid" />
                                <div className="hover-text">
                                    <h3 className="bg-custom-1">{img.title}</h3>
                                    <p className="bg-custom-2">{img.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="slider-buttons position-absolute top-50 start-0 end-0 d-flex justify-content-between px-3">
                    <button
                        onClick={handlePrev}
                        className="btn btn-lg rounded-circle slider-btn"
                        disabled={currentIndex === 0 && !screenSize.isSmallMobile}
                    >
                        <i className="bi bi-caret-left-fill"></i>
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn btn-lg rounded-circle slider-btn"
                        disabled={currentIndex >= totalItems - visibleItems && !screenSize.isSmallMobile}
                    >
                        <i className="bi bi-caret-right-fill"></i>
                    </button>
                </div>

                {screenSize.isMobile && (
                    <div className="slider-indicators position-absolute bottom-0 start-50 translate-middle-x mb-2">
                        {Array.from({ length: totalItems - visibleItems + 1 }).map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;