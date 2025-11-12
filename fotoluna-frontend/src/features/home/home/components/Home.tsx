import { useState, useEffect } from 'react';
import "../styles/home.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
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
            sectionId: "document"
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