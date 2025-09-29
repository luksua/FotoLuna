const Comments = () => {
    return (
        <div className="bg-light">
            <div className="container my-5 py-5" >
                <h2 className="text-center mb-4">Comentarios</h2>

                <div className="comentario-box">
                    <form className="form-section">
                        <textarea className="form-control mb-3" name="comment" placeholder="Escriba aquí un comentario..."></textarea>

                        <div className="row align-items-center mb-3">
                            <div className="col-md-4">
                                <label className="form-label text-muted small">Sube una foto (opcional)</label><br />
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
                                    <i className="bi bi-camera-fill icono-camara" data-value="1"></i>
                                    <i className="bi bi-camera-fill icono-camara" data-value="2"></i>
                                    <i className="bi bi-camera-fill icono-camara" data-value="3"></i>
                                    <i className="bi bi-camera-fill icono-camara" data-value="4"></i>
                                    <i className="bi bi-camera-fill icono-camara" data-value="5"></i>
                                </div>
                            </div>
                            <div className="col-md-4 col-lg-3 text-start">
                                <label className="form-check-label me-2">Anónimo</label>
                                <div className="form-check form-switch d-inline">
                                    <input className="form-check-input" type="checkbox" id="anonimoSwitch" />
                                </div>

                            </div>
                        </div>

                        <button className="btn btn-enviar w-100">Enviar comentario</button>
                    </form>
                </div>

                <hr className="my-5" />

                <div className="comentarios-scroll">
                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Fulanito</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Fulanita</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Matt Bellamy</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>Kurt Cobain</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>yo</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera-fill"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                    </div>


                    <div className="comentario-card">
                        <div className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>joan</strong>
                        </div>
                        <div className="mb-2">
                            <i className="bi bi-camera-fill"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i><i className="bi bi-camera"></i>
                        </div>
                        <p className="mb-0 small">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Comments;
