import "../styles/quinces.css";
import Carousel from '../components/Carousel';
import Button from "../../../../components/Home/Button";
import { motion } from "framer-motion";
import { useEffect, useRef } from 'react';

export default function Quinces() {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    } else {
                        entry.target.classList.remove('visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '-50px'
            }
        );

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => observer.disconnect();
    }, []);


    const instagramImages = [
        {
            id: 1,
            url: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf',
            alt: 'Paisaje colorido'
        },
        {
            id: 2,
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
            alt: 'Montañas nevadas'
        },
        {
            id: 3,
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            alt: 'Bosque encantado'
        },
        {
            id: 4,
            url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
            alt: 'Atardecer en la playa'
        }
    ];
    return (
        <div className="quince-container my-5" id="quinces">
            <header className="promo-hero rounded-4">
                <div className="container py-5">
                    <div className="row align-items-center ">
                        <div className="col-lg-7">
                            <div className="glass-card">
                                <div className="camera-badge d-flex align-items-center gap-2">
                                    <i className="bi bi-camera-fill fs-4"></i>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>FotoLuna</div>
                                        <small className="text-muted">Ibagué • Estudio móvil</small>
                                    </div>
                                </div>
                                <motion.h1
                                    className="display-5 headline-big mt-2"
                                    initial={{ opacity: 0, y: -30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                ><div className="bg-custom-6">Captura la magia de tus <span className="quince"> Quince Años</span></div>
                                </motion.h1>

                                <motion.p
                                    className="lead text-muted bg-custom-2"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    Sesiones divertidas, modernas y llenas de estilo. Paquetes todo incluido para que sólo tengas que sonreír.
                                </motion.p>
                                <div className="row">
                                    <motion.div
                                        className="col-12 col-md-6 mb-3"
                                        initial={{ opacity: 0, x: -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="options plan">
                                            <ul className="list-unstyled bg-custom-2">
                                                <li className=""><i className="bi bi-check-circle-fill me-2 circle-check"></i> Fotos en locación + estudio</li>
                                                <li className=""><i className="bi bi-check-circle-fill me-2 circle-check"></i> Maquillaje y asesoría de poses</li>
                                                <li className=""><i className="bi bi-check-circle-fill me-2 circle-check"></i> Álbum y galería privada</li>
                                            </ul>

                                            <div className="d-flex justify-content-center align-items-center pt-3">
                                                <Button className="shiny-text-quince">Reservar</Button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="col-12 col-md-6 mb-3"
                                        initial={{ opacity: 0, x: 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.6 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="options plan">
                                            <ul className="list-unstyled bg-custom-2">
                                                <li className=""><i className="bi bi-check-circle-fill me-2 circle-check"></i> Fotos en locación + estudio</li>
                                                <li className=""><i className="bi bi-check-circle-fill me-2 circle-check"></i> Maquillaje y asesoría de poses</li>
                                                <li className=""><i className="bi bi-check-circle-fill me-2 circle-check"></i> Álbum y galería privada</li>
                                            </ul>

                                            <div className="d-flex justify-content-center align-items-center pt-3">
                                                <Button className="shiny-text-quince">Reservar</Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>


                        {/* Carousel section */}
                        <motion.div
                            className="col-lg-5 d-none d-lg-block position-relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <div className="justify-content-center carousel">
                                <div className="card shadow-sm">
                                    <div className="p-0">
                                        <motion.div
                                            className="d-flex align-items-center p-3 border-bottom"
                                            initial={{ opacity: 0, y: -20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 1 }}
                                            viewport={{ once: true }}
                                        >
                                            <div
                                                className="rounded-circle bg-secondary me-3"
                                                style={{ width: '32px', height: '32px' }}
                                            ></div>
                                            <div className="">
                                                <h6 className="bg-custom-2 fw-bold">danna</h6>
                                            </div>
                                        </motion.div>
                                        {/* Carrusel */}
                                        <Carousel
                                            images={instagramImages}
                                            autoPlay={true}
                                            interval={4000}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>
        </div>
    );
}
