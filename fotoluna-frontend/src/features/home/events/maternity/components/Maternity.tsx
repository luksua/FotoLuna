/* eslint-disable @typescript-eslint/no-explicit-any */
import '../styles/maternity.css';
import SplitText from "./SplitText";
import "../styles/shinyText.css";
import { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import Card from "react-bootstrap/Card";
import Button from '../../../../../components/Home/Button';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Maternity = () => {
    const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
    const MATERNITY_EVENT_ID = 1;

    const contentRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    interface MaternityPackage {
        id: number;
        title: string;
        description: string;
        price: string;
        img: string;
        isGeneral?: boolean;
    }

    const [packages, setPackages] = useState<MaternityPackage[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [error, setError] = useState<string | null>(null);


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

    useEffect(() => {
        const fetchPackages = async () => {
            setLoadingPackages(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${API_BASE}/api/events/${MATERNITY_EVENT_ID}/packages`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const general = res.data.general ?? [];
                const specific = res.data.specific ?? [];

                const combined = [...specific, ...general].map((pkg: any) => ({
                    id: pkg.id,
                    title: pkg.packageName,
                    description: pkg.packageDescription,
                    price: pkg.packagePrice,
                    img: pkg.photos?.[0]?.url ?? "/img/maternitycard5.jpg", // fallback
                    isGeneral: pkg.isGeneral ?? false,
                }));

                setPackages(combined);
            } catch (err) {
                console.error("Error cargando paquetes de maternidad:", err);
                setError("No se pudieron cargar los paquetes en este momento.");
            } finally {
                setLoadingPackages(false);
            }
        };

        fetchPackages();
    }, [API_BASE]);

    const handleReserve = (pkgId: number) => {
        navigate("/nuevaCita", {
            state: {
                eventId: MATERNITY_EVENT_ID,
                packageId: pkgId,
            },
        });
    };

    const formatPrice = (value: string | number) => {
        const n = Number(String(value).replace(/[^0-9.-]+/g, ""));
        if (Number.isNaN(n)) return String(value);
        // sin decimales:
        return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        // si quieres decimales, usa:
        // return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <>
            <div className="container-ad">
                <div className="content" ref={contentRef}>
                    <div className="ad-title">
                        <h1 className="bg-custom-11">
                            <SplitText
                                text="Captura Momentos Únicos"
                                className="text-2xl font-semibold text-center"
                                delay={200}
                                duration={2}
                                ease="elastic.out(1, 0.3)"
                                splitType="lines"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                            />
                        </h1>
                    </div>
                    <div className="row pt-5 bg-custom-2">
                        <div className="col-lg-8">
                            <div className="content-box p-4">
                                <p className="ad-text">
                                    Inmortaliza la dulce espera con fotografías profesionales que
                                    capturen la belleza y emoción de este momento especial.
                                    Creamos recuerdos que atesorarás para siempre.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-3">
                            <div className="shape-dots"></div>
                            <div className="shape-square"></div>
                            <div className="camera-container">
                                <img
                                    src="/img/cam.png"
                                    alt="Cámara profesional"
                                    className="cam-image img-fluid"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className='container-maternity'>
                <div className="maternity-title">
                    <AnimatedContent
                        distance={150}
                        direction="horizontal"
                        reverse={false}
                        duration={1.4}
                        ease="power3.out"
                        initialOpacity={0.2}
                        animateOpacity
                        scale={2.1}
                        threshold={0.2}
                        delay={0.2}
                    >
                        <div>
                            <h1 className=''>
                                Maternidad
                            </h1>
                        </div>
                    </AnimatedContent>
                </div>
            </div> */}
            <br /><br /><br /><br />
            <section className="maternity-section text-center py-5" id='maternity'>
                <div className="container">

                    {/* Título */}
                    <motion.h2
                        className="maternity-title mb-3 bg-custom-1"
                        initial={{ opacity: 0, y: -30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        Maternidad
                    </motion.h2>

                    {/* Descripción */}
                    <motion.p
                        className="maternity-description mb-5"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        Captura la dulzura de este capítulo tan especial con nuestras sesiones
                        diseñadas para resaltar la belleza y conexión entre mamá y bebé.
                        Iluminación suave, escenarios naturales y detalles que cuentan una historia única.
                    </motion.p>


                    <div className="row justify-content-center cards">
                        {loadingPackages && (
                            <p className="text-muted">Cargando paquetes...</p>
                        )}
                        {error && (
                            <p className="text-danger">{error}</p>
                        )}
                        {/* {packages.map((pkg, i) => (
                            <motion.div
                                key={pkg.title}
                                className="col-md-4 mb-4 d-flex justify-content-center bg-custom-2"
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <Card className="package-card border-0 rounded-4 bg-custom-2">
                                    <Card.Img variant="top" src={pkg.img} className="card-img-top rounded-top-4" />
                                    <Card.Body>
                                        <Card.Title className="fw-bold text-pink">{pkg.title}</Card.Title>
                                        <Card.Text className="text-muted">{pkg.description}</Card.Text>
                                        <h5 className="price-maternity mb-3">{pkg.price}</h5>
                                        <Button className="shiny-text">Reservar</Button>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        ))} */}

                        {!loadingPackages && !error && packages.map((pkg, i) => (
                            <motion.div
                                key={pkg.id}
                                className="col-md-4 mb-4 d-flex justify-content-center bg-custom-2"
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <Card className="package-card border-0 rounded-4 bg-custom-2">
                                    <Card.Img
                                        variant="top"
                                        src={pkg.img}
                                        className="card-img-top rounded-top-4"
                                    />
                                    <Card.Body>
                                        <Card.Title className="fw-bold text-pink">
                                            {pkg.title}
                                        </Card.Title>
                                        <Card.Text className="text-muted">
                                            {pkg.description}
                                        </Card.Text>
                                        <h5 className="price-maternity mb-3">${formatPrice(pkg.price)}</h5>

                                        {/* Opcional: marcar si es general */}
                                        {/* {pkg.isGeneral && (
                                            <span className="badge bg-secondary d-block mb-2">
                                            Paquete general
                                            </span>
                                        )} */}

                                        <Button
                                            className="shiny-text"
                                            onClick={() => handleReserve(pkg.id)}
                                        >
                                            Reservar
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Maternity;