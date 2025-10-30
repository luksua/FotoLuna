import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Photos() {
    const [filtro, setFiltro] = useState("Evento");
    const [orden, setOrden] = useState("Más recientes");

    // Ejemplo de fotos estáticas (puedes reemplazar por datos del backend más adelante)
    const fotos = [
        { id: 1, url: "https://picsum.photos/id/1025/300/200", evento: "Picnic", fecha: "2025-02-10" },
        { id: 2, url: "https://picsum.photos/id/1011/300/200", evento: "Reunión", fecha: "2025-02-15" },
        { id: 3, url: "https://picsum.photos/id/1005/300/200", evento: "Trabajo", fecha: "2025-03-01" },
        { id: 4, url: "https://picsum.photos/id/1015/300/200", evento: "Cumpleaños", fecha: "2025-03-08" },
        { id: 5, url: "https://picsum.photos/id/1020/300/200", evento: "Familia", fecha: "2025-03-22" },
    ];

    // Aquí podrías aplicar filtros dinámicos
    const fotosFiltradas = fotos.filter(f =>
        filtro === "Evento" ? true : f.evento === filtro
    );

    const handleDescargar = (url) => {
        alert(`Descargando imagen: ${url}`);
    };

    return (
        <div className="container py-5">
            {/* Título */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className=" bg-custom-2">Mis fotos</h2>

                <div className="d-flex align-items-center gap-3">
                    <div>
                        <label className="form-label me-2">Ordenar por:</label>
                        <select
                            className="form-select form-select-sm rounded-pill"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            style={{ backgroundColor: "#e8d9f4", color: "#333", border: "none" }}
                        >
                            <option>Más recientes</option>
                            <option>Más antiguas</option>
                            <option>Evento</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label me-2">Filtrar:</label>
                        <select
                            className="form-select form-select-sm rounded-pill"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            style={{ backgroundColor: "#e8d9f4", color: "#333", border: "none" }}
                        >
                            <option>Evento</option>
                            <option>Picnic</option>
                            <option>Reunión</option>
                            <option>Trabajo</option>
                            <option>Familia</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Galería */}
            <div className="row g-4">
                {fotosFiltradas.map((foto) => (
                    <div key={foto.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className="card border-0 shadow-sm position-relative">
                            <img
                                src={foto.url}
                                alt={foto.evento}
                                className="card-img-top rounded-3"
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <div className="card-body text-center">
                                <p className="fw-semibold mb-1">{foto.evento}</p>
                                <small className="text-muted">{foto.fecha}</small>
                            </div>

                            {/* Botón de descarga flotante */}
                            <button
                                className="btn btn-sm btn-pink position-absolute bottom-0 end-0 m-2 rounded-pill"
                                onClick={() => handleDescargar(foto.url)}
                            >
                                <i className="bi bi-download me-1"></i> Descargar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}