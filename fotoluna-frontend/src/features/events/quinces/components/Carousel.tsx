import React, { useState, useEffect, useCallback } from 'react';
import '../styles/carousel.css';

interface CarouselImage {
    id: number;
    url: string;
    alt: string;
}

interface CarouselProps {
    images: CarouselImage[];
    autoPlay?: boolean;
    interval?: number;
}

const Carousel: React.FC<CarouselProps> = ({
    images,
    autoPlay = true,
    interval = 3000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    }, [images.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || !autoPlay || images.length <= 1) return;

        const slideInterval = setInterval(nextSlide, interval);
        return () => clearInterval(slideInterval);
    }, [isAutoPlaying, autoPlay, interval, nextSlide, images.length]);

    const handleMouseEnter = () => {
        setIsAutoPlaying(false);
    };

    const handleMouseLeave = () => {
        setIsAutoPlaying(autoPlay);
    };

    if (images.length === 0) {
        return <div className="carousel-empty">No hay imágenes para mostrar</div>;
    }

    return (
        <div
            className="instagram-carousel"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="carousel-container">
                {/* Flecha izquierda */}
                {images.length > 1 && (
                    <button
                        className="carousel-arrow carousel-arrow-left"
                        onClick={prevSlide}
                        aria-label="Imagen anterior"
                    >
                        ‹
                    </button>
                )}

                {/* Imagen actual */}
                <div className="carousel-slide">
                    <img
                        src={images[currentIndex].url}
                        alt={images[currentIndex].alt}
                        className="carousel-image"
                    />
                </div>

                {/* Flecha derecha */}
                {images.length > 1 && (
                    <button
                        className="carousel-arrow carousel-arrow-right"
                        onClick={nextSlide}
                        aria-label="Siguiente imagen"
                    >
                        ›
                    </button>
                )}

                {/* Indicadores */}
                {images.length > 1 && (
                    <div className="carousel-indicators">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`carousel-indicator ${index === currentIndex ? 'active' : ''
                                    }`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Ir a imagen ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Contador de imágenes */}
                {images.length > 1 && (
                    <div className="image-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Carousel;