import "../styles/comments.css";
import { useState } from "react";

const Comments = () => {
    const [rating, setRating] = useState(0);

    const handleClick = (index: number) => {
        setRating(index + 1);
    };

    return (
        <div className="bg-light">
            <div className="container my-5 py-5">
                <h2 className="text-center mb-4">Comentarios</h2>

                <div className="comentario-box">
                    <form className="form-section">
                        <textarea
                            className="form-control mb-3"
                            rows={3}
                            name="comment"
                            placeholder="Escriba aquí un comentario..."
                        ></textarea>

                        <div className="row align-items-center mb-3">
                            <div className="col-md-4">
                                <label className="form-label text-muted small">
                                    Sube una foto (opcional)
                                </label>
                                <br />
                                <label
                                    htmlFor="profileImage"
                                    className="btn custom-upload-btn custom-file-upload mt-3"
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className="bi bi-camera"></i>
                                </label>
                                <input
                                    type="file"
                                    id="profileImage"
                                    className="form-control"
                                    accept="image/*"
                                    hidden
                                />
                            </div>

                            <div className="col-md-4 text-center">
                                <div className="mb-2 fw-semibold">¡Puntúanos!</div>
                                <div id="rating">
                                    {[...Array(5)].map((_, index) => (
                                        <i
                                            key={index}
                                            className={`bi ${index < rating ? "bi-camera-fill" : "bi-camera"
                                                } icono-camara`}
                                            onClick={() => handleClick(index)}
                                            style={{ cursor: "pointer", fontSize: "1.5rem" }}
                                        ></i>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-4 col-lg-3 text-start">
                                <label className="form-check-label me-2">Anónimo</label>
                                <div className="form-check form-switch d-inline">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="anonimoSwitch"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-enviar w-100">
                            Enviar comentario
                        </button>
                    </form>
                </div>

                <hr className="my-5" />

                {/* Aquí comentarios */}
                <div className="comentarios-scroll">
                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Fulanito</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i
                                className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Fulanita</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i
                                className="bi bi-camera-fill"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Matt Bellamy</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i
                                className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comments;
