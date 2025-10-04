// PromoQuinceWithAnimations.jsx
// import { Fade, SlideUp, Zoom } from "@reactbits/animations";
import "../styles/quinces.css";

export default function Quinces() {
    return (
        <div className="container my-5">
            <header className="promo-hero rounded-4">
                <div className="shape pink floaty" style={{ animationDelay: "0s" }}></div>
                <div className="shape purple floaty" style={{ animationDelay: "1.5s" }}></div>
                <div className="shape small floaty" style={{ animationDelay: "0.8s" }}></div>


                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="glass-card">
                                <span className="accent-pill mb-3">Sesiones Quince • 2025</span>
                                <h1 className="display-5 headline-big mt-3">Captura la magia de tus <span style={{ color: "var(--accent)" }}>Quince Años</span></h1>
                                <p className="lead text-muted">Sesiones divertidas, modernas y llenas de estilo. Paquetes todo incluido para que sólo tengas que sonreír.</p>


                                <ul className="list-unstyled mt-3">
                                    <li className="mb-2"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--accent)" }}></i> Fotos en locación + estudio</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--accent-2)" }}></i> Maquillaje y asesoría de poses</li>
                                    <li className="mb-2"><i className="bi bi-check-circle-fill me-2" style={{ color: "#FFB3DA" }}></i> Álbum y galería privada</li>
                                </ul>


                                <div className="d-flex gap-2 mt-3">
                                    <a href="#contact" className="btn btn-lg btn-primary" style={{ background: "linear-gradient(90deg,var(--accent),var(--accent-2))", border: "none" }}>Reserva tu sesión</a>
                                    <a href="#galeria" className="btn btn-outline-secondary">Ver galería</a>
                                </div>
                            </div>
                        </div>


                        <div className="col-lg-6 d-none d-lg-block position-relative">
                            <div className="camera-badge d-flex align-items-center gap-2">
                                <i className="bi bi-camera-fill fs-4" style={{ color: "var(--accent-2)" }}></i>
                                <div>
                                    <div style={{ fontWeight: 700 }}>FotoLuna</div>
                                    <small className="text-muted">Ibagué • Estudio móvil</small>
                                </div>
                            </div>


                            <div className="row g-3 gallery mt-3">
                                <div className="col-6"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="quince1" /></div>
                                <div className="col-6"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="quince2" /></div>
                                <div className="col-6"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="quince3" /></div>
                                <div className="col-6"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="quince4" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}
