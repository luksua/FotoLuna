import React from "react";
import "../../styles/homeFooter.css";

const HomeFooter: React.FC = () => {
    return (
        <footer>
            <hr className="my-4 border-dark border-2" />

            {/* Carrusel */}
            <div id="multiCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    <div className="carousel-item active" data-bs-interval="4000">
                        <div className="d-flex justify-content-center gap-2">
                            <img src="img/piedepag1.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag2.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag3.png" className="img-fluid w-100 image" />
                        </div>
                    </div>

                    <div className="carousel-item" data-bs-interval="4000">
                        <div className="d-flex justify-content-center gap-2">
                            <img src="img/piedepag4.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag5.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag6.png" className="img-fluid w-100 image" />
                        </div>
                    </div>

                    <div className="carousel-item" data-bs-interval="4000">
                        <div className="d-flex justify-content-center gap-2">
                            <img src="img/piedepag7.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag8.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag9.png" className="img-fluid w-100 image" />
                        </div>
                    </div>

                    <div className="carousel-item" data-bs-interval="4000">
                        <div className="d-flex justify-content-center gap-2">
                            <img src="img/piedepag10.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag11.png" className="img-fluid w-100 image" />
                            <img src="img/piedepag12.png" className="img-fluid w-100 image" />
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- Botón WhatsApp --> */}
            <a href="https://wa.me/3142756935" target="_blank" className="whatsapp-btn">
                <i className="bi bi-whatsapp"></i>
            </a>

            {/* <!--Línea entre carrusel y footer--> */}
            <hr className="my-4 border-dark border-2" />

            <div className="container-fluid">
                <div className="mb-3">
                    <a href="https://www.facebook.com/?locale=es_LA" target="_blank" className="text-dark me-3"><i
                        className="bi bi-facebook fs-3"></i></a>
                    <a href="https://www.instagram.com/" target="_blank" className="text-dark me-3"><i
                        className="bi bi-instagram fs-3"></i></a>
                    <a href="https://x.com/?lang=es" target="_blank" className="text-dark"><i className="bi bi-twitter-x fs-3"></i></a>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    <p className="text-start">&copy; FotoLuna </p>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;