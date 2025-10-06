import { useState } from 'react';
import "../styles/home.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
    const images = [
        { src: "img/boda.jpg", alt: "1" },
        { src: "img/cumple.jpg", alt: "2" },
        { src: "img/quince.jpg", alt: "3" },
        { src: "img/bautizo.jpg", alt: "4" },
        { src: "img/primerac.jpg", alt: "5" },
        { src: "img/folclor.jpg", alt: "6" },
    ];

    const totalItems = images.length;
    const visibleItems = 3;
    const [currentIndex, setCurrentIndex] = useState(0);

    const updatePercent = () => (100 / visibleItems) * currentIndex;

    const handleNext = () => {
        if (currentIndex < totalItems - visibleItems) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="container-fluid my-5">
            <div className="slider-container position-relative overflow-hidden">
                {/* Track */}
                <div
                    className="slider-track d-flex transition-transform"
                    style={{
                        transform: `translateX(-${updatePercent()}%)`,
                        transition: "transform 0.5s ease-in-out",
                    }}
                >
                    {images.map((img, index) => {
                        let extraClass = "";
                        if (index === currentIndex + 1) {
                            extraClass = "large";
                        } else if (
                            index === currentIndex ||
                            index === currentIndex + 2
                        ) {
                            extraClass = "small";
                        }

                        return (
                            <div className={`slider-item ${extraClass}`} key={index}>
                                <img src={img.src} alt={img.alt} className="img-fluid" />
                            </div>
                        );
                    })}
                </div>

                {/* Buttons */}
                <div className="slider-buttons position-absolute top-50 start-0 end-0 d-flex justify-content-between px-3">
                    <button
                        onClick={handlePrev}
                        className="btn btn-lg rounded-circle"
                    >
                        <i className="bi bi-caret-left-fill"></i>
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn btn-lg rounded-circle"
                    >
                        <i className="bi bi-caret-right-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;