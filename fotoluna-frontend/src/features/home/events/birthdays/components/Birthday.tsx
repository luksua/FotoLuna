import "../styles/birthday.css";
import { Card, Carousel } from "react-bootstrap";
import Button from "../../../../../components/Home/Button";
import { motion } from "framer-motion";
import { useEffect, useRef } from 'react';

const Birthday = () => {
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

    return (
        <section className="birthday-section py-5 p-5" id="birthday">
            <br /><br />
            <div className="container-fluid">
                <div className="row align-items-center justify-content-between">
                    <div className="col-lg-7 mb-4 mb-lg-0 text-center birthday-text">
                        {/* TEXTO Y PAQUETES */}
                        <motion.h2
                            className="fw-bold bg-custom-1 title"
                            initial={{ opacity: 0, y: -30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Cumpleaños
                        </motion.h2>

                        <motion.p
                            className="description mt-3 bg-custom-2"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Celebra tu día especial con una sesión llena de color, alegría y
                            diversión. Capturamos los mejores momentos para que revivas cada
                            sonrisa, cada gesto y cada vela apagada con amor.
                        </motion.p>

                        {/* <h1 className="fw-bold bg-custom-1">Cumpleaños</h1>
                        <p className="description mt-3">
                            Celebra tu día especial con una sesión llena de color, alegría y
                            diversión. Capturamos los mejores momentos para que revivas cada
                            sonrisa, cada gesto y cada vela apagada con amor.
                        </p> */}

                        <div className="packages card-grid mt-4">
                            {[
                                {
                                    title: "Paquete Básico",
                                    description: "10 fotografías editadas, 1 cambio de vestuario, fondo a elección y entrega digital.",
                                    price: "$120.000"
                                },
                                {
                                    title: "Paquete Premium",
                                    description: "25 fotografías editadas, 2 cambios de vestuario, props personalizados y mini video clip.",
                                    price: "$250.000"
                                }
                            ].map((pkg, i) => (
                                <motion.div
                                    key={pkg.title}
                                    initial={{ opacity: 0, y: 60 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: i * 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="package-card mb-3 bg-custom-2">
                                        <Card.Body>
                                            <Card.Title className="fw-bold text-blue">{pkg.title}</Card.Title>
                                            <Card.Text>{pkg.description}</Card.Text>
                                            <h5 className="price-birthday">{pkg.price}</h5>
                                            <Button className="shiny-text-birthday">Reservar</Button>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            ))}
                            {/* <Card className="package-card mb-3">
                                <Card.Body>
                                    <Card.Title className="fw-bold text-blue">Paquete Básico</Card.Title>
                                    <Card.Text>
                                        10 fotografías editadas, 1 cambio de vestuario, fondo a
                                        elección y entrega digital.
                                    </Card.Text>
                                    <h5 className="price-birthday">$120.000</h5>
                                    <Button className="shiny-text-birthday">Reservar</Button>
                                </Card.Body>
                            </Card> */}
                        </div>
                    </div>

                    {/* GALERÍA DE FOTOS SIMULADA */}
                    <motion.div
                        className="col-lg-5 col-md-6 birthday-gallery align-items-center justify-content-between"
                        initial={{ opacity: 0, x: 100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <Carousel>
                            <Carousel.Item>
                                <div className="gallery-item img1"></div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="gallery-item img2"></div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="gallery-item img3"></div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="gallery-item img4"></div>
                            </Carousel.Item>
                        </Carousel>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Birthday;