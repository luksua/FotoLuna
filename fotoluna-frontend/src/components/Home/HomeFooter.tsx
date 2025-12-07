import React from "react";
import "../../styles/homeFooter.css";

const HomeFooter: React.FC = () => {
    const scrollToId = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    const handleFooterClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string
    ) => {
        // Si estamos en la home, prevenimos la navegación y hacemos scroll suave
        if (location.pathname === "/" || location.pathname === "") {
            e.preventDefault();
            scrollToId(targetId);
        } 
        // Si no estamos en la home, dejamos que navegue a "/#id"
    };

    return (
        <footer className="home-footer">
            {/* CONTENEDOR DE LA ONDA SUPERIOR */}
            <div className="home-footer__wave-container">
                <svg
                    className="home-footer__wave-svg"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,96L60,112C120,128,240,160,360,170.7C480,181,600,171,720,165.3C840,160,960,160,1080,149.3C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                        fill="#7c52a1"
                    />
                </svg>
            </div>

            {/* FONDO MORADO + CONTENIDO */}
            <div className="home-footer__bg">
                <div className="container py-5">
                    {/* Columnas tipo sitemap */}
                    <div className="row gy-4 mb-4">
                        {/* Columna 1: Logo + descripción + redes */}
                        <div className="col-12 col-md-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="home-footer__logo-icon me-2">
                                    <i className="bi bi-camera-fill" />
                                </div>
                                <span className="home-footer__logo-text">FotoLuna</span>
                            </div>
                            <p className="home-footer__description mb-3">
                                La fotografía recuerda lo que la mente olvida.
                            </p>

                            <div className="home-footer__social d-flex gap-3">
                                <a
                                    href="https://www.facebook.com/?locale=es_LA"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="home-footer__social-link"
                                >
                                    <i className="bi bi-facebook" />
                                </a>
                                <a
                                    href="https://www.instagram.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="home-footer__social-link"
                                >
                                    <i className="bi bi-instagram" />
                                </a>
                                <a
                                    href="https://x.com/?lang=es"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="home-footer__social-link"
                                >
                                    <i className="bi bi-twitter-x" />
                                </a>
                            </div>
                        </div>

                        {/* Columna 2: Sitemap */}
                        <div className="col-6 col-md-2">
                            <h6 className="home-footer__column-title mb-3">Nosotros</h6>
                            <ul className="list-unstyled mb-0">
                                <li>
                                    <a href="/" className="home-footer__link">
                                        Portafolio
                                    </a>
                                </li>
                                <li>
                                    <a href="/sobreNosotros" className="home-footer__link">
                                        Sobre nosotros
                                    </a>
                                </li>
                                <li>
                                    <a href="/contacto" className="home-footer__link">
                                        Contacto
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Columna 3: Servicios */}
                        <div className="col-6 col-md-3">
                            <h6 className="home-footer__column-title mb-3">Servicios</h6>
                            <ul className="list-unstyled mb-0">
                                <li>
                                    <a
                                        href="/#maternity"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "maternity")}
                                    >
                                        Maternidad
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#birthday"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "birthday")}
                                    >
                                        Cumpleaños
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#quinces"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "quinces")}
                                    >
                                        Quinceaños
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#wedding"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "wedding")}
                                    >
                                        Bodas
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#sacraments"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "sacraments")}
                                    >
                                        Sacramentos
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#documents"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "documents")}
                                    >
                                        Fotos de documento
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#graduation"
                                        className="home-footer__link"
                                        onClick={(e) => handleFooterClick(e, "graduation")}
                                    >
                                        Grados y mucho más
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Columna 4: Contacto */}
                        <div className="col-12 col-md-3" id="contacto">
                            <h6 className="home-footer__column-title mb-3">Contacto</h6>
                            <ul className="list-unstyled mb-0 home-footer__contact-list">
                                <li className="d-flex align-items-start mb-2">
                                    <i className="bi bi-envelope me-2" />
                                    <a
                                        href="mailto:hola@fotoluna.com"
                                        className="home-footer__link"
                                    >
                                        info@fotoluna.com
                                    </a>
                                </li>
                                <li className="d-flex align-items-start mb-2">
                                    <i className="bi bi-telephone me-2" />
                                    <a href="tel:+573206706877" className="home-footer__link">
                                        +57 (320) 6706877
                                    </a>
                                </li>
                                <li className="d-flex align-items-start">
                                    <i className="bi bi-geo-alt me-2" />
                                    <span className="home-footer__text">
                                        Carrera 9A #37-20, Ibagué - Tolima
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Franja inferior */}
                <section className="home-footer__bottom">
                    <div className="container py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                        <p className="mb-0 small text-muted text-center text-md-start">
                            &copy; {new Date().getFullYear()} FotoLuna. Todos los derechos
                            reservados.
                        </p>
                    </div>
                </section>
            </div>

            {/* Botón WhatsApp flotante */}
            <a
                href="https://wa.me/3142756935"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-btn"
            >
                <i className="bi bi-whatsapp" />
            </a>
        </footer>
    );
};

export default HomeFooter;
