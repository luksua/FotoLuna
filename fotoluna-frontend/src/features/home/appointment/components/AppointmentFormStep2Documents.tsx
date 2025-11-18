import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import Button from "../../../../components/Home/Button";
import "../styles/appointment.css";
import api from "../../../../lib/api";

interface Step3Props {
    appointmentId: number;
    eventId: number;
    onBack: () => void;
    onConfirm: (data: { bookingId: number }) => void;
}

interface DocumentType {
    id: number;
    name: string;
    description?: string;
    price: number;
    number_photos: number;
    photoUrl?: string | null;
    requiresUpload: boolean;
    requiresPresence: boolean;
}

const AppointmentStep2Documents: React.FC<Step3Props> = ({
    appointmentId,
    onConfirm,
    onBack,
}) => {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Carrusel refs y estados
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);

    const rafRef = useRef<number | null>(null);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const lastXRef = useRef(0);
    const velocityRef = useRef(0);
    const offsetRef = useRef(0);
    const halfWidthRef = useRef(0);
    const autoRef = useRef(true);
    const speedRef = useRef(0.3);
    const clickGuardRef = useRef(false);

    // 🔹 Cargar tipos de documento
    useEffect(() => {
        api.get("/api/document-types").then(({ data }) => setDocuments(data));
    }, []);

    // 🔁 Duplicar para scroll infinito
    const items = documents.length > 0 ? [...documents, ...documents] : [];

    // 🔹 Medir ancho del track
    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        requestAnimationFrame(() => {
            halfWidthRef.current = track.scrollWidth / 2;
        });
    }, [items.length]);

    // 🔄 Auto-scroll + inercia
    useEffect(() => {
        if (documents.length <= 3) return;

        const step = () => {
            if (autoRef.current) {
                offsetRef.current -= speedRef.current;
            } else if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.02) {
                offsetRef.current += velocityRef.current;
                velocityRef.current *= 0.95;
            }

            const half = halfWidthRef.current;
            if (half > 0) {
                if (offsetRef.current <= -half) offsetRef.current += half;
                else if (offsetRef.current > 0) offsetRef.current -= half;
            }

            if (trackRef.current) {
                trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
            }

            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [documents.length]);

    // 🔹 Selección
    const handleCardClick = (docId: number) => {
        if (!clickGuardRef.current) setSelectedDoc(docId);
    };

    // 🔹 Confirmar selección
    const handleConfirm = async () => {
        if (!selectedDoc) return alert("Selecciona un tipo de documento");

        setLoading(true);
        try {
            const { data } = await api.post(`/api/appointments/${appointmentId}/booking`, {
                documentTypeId: selectedDoc,
            });
            onConfirm({ bookingId: data.id });
        } catch (err) {
            console.error("Error al confirmar cita:", err);
            alert("No se pudo confirmar la cita");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Render
    return (
        <div className="container py-4 appointment-step2 bg-custom-2">
            <h3 className="mb-4 fw-semibold text-center">Selecciona el tipo de documento</h3>

            {documents.length > 3 ? (
                <div
                    className="carousel-viewport"
                    ref={viewportRef}
                    onPointerDown={(e) => {
                        const vp = viewportRef.current;
                        if (!vp) return;
                        vp.setPointerCapture(e.pointerId);
                        isDraggingRef.current = true;
                        autoRef.current = false;
                        dragStartXRef.current = e.clientX;
                        lastXRef.current = e.clientX;
                        clickGuardRef.current = false;
                        vp.classList.add("dragging");
                    }}
                    onPointerMove={(e) => {
                        if (!isDraggingRef.current) return;
                        e.preventDefault();

                        const dx = e.clientX - lastXRef.current;
                        lastXRef.current = e.clientX;
                        if (Math.abs(e.clientX - dragStartXRef.current) > 5)
                            clickGuardRef.current = true;

                        offsetRef.current += dx;
                        velocityRef.current = dx;

                        if (trackRef.current)
                            trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
                    }}
                    onPointerUp={(e) => {
                        const vp = viewportRef.current;
                        if (vp && vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
                        if (!isDraggingRef.current) return;

                        isDraggingRef.current = false;
                        vp?.classList.remove("dragging");

                        const waitInertia = () => {
                            if (Math.abs(velocityRef.current) > 0.4) requestAnimationFrame(waitInertia);
                            else setTimeout(() => (autoRef.current = true), 900);
                        };
                        requestAnimationFrame(waitInertia);

                        if (!clickGuardRef.current) {
                            const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
                            el?.closest(".carousel-card")?.dispatchEvent(
                                new MouseEvent("click", { bubbles: true })
                            );
                        }
                    }}
                    onPointerCancel={() => {
                        isDraggingRef.current = false;
                        viewportRef.current?.classList.remove("dragging");
                        clickGuardRef.current = false;
                        setTimeout(() => (autoRef.current = true), 900);
                    }}
                >
                    <div className="carousel-track" ref={trackRef}>
                        {items.map((doc, i) => (
                            <div
                                key={`${doc.id}-${i}`}
                                className={`carousel-card document-card ${selectedDoc === doc.id ? "selected" : ""
                                    }`}
                                onClick={() => handleCardClick(doc.id)}
                            >
                                {doc.photoUrl ? (
                                    <img
                                        src={doc.photoUrl}
                                        alt={doc.name}
                                        className="package-image"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="package-image placeholder">Sin imagen</div>
                                )}
                                <div className="package-info">
                                    <h5 className="mb-1">{doc.name}</h5>
                                    <p className="text-muted mb-2">{doc.description}</p>
                                    <p className="fw-bold">${doc.price.toLocaleString()}</p>
                                    <p className="">Fotos a entregar: {doc.number_photos}</p>
                                    {doc.requiresUpload && <small>Requiere subir foto</small>}
                                    {doc.requiresPresence && <small> En estudio</small>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Fallback si hay 3 o menos documentos
                <div className="row g-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="col-12 col-md-4">
                            <div
                                className={`static-package-card ${selectedDoc === doc.id ? "selected" : ""
                                    }`}
                                onClick={() => setSelectedDoc(doc.id)}
                            >
                                {doc.photoUrl ? (
                                    <img
                                        src={doc.photoUrl}
                                        alt={doc.name}
                                        className="static-package-image"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="static-package-image placeholder">Sin imagen</div>
                                )}
                                <div className="package-info">
                                    <h5 className="mb-1">{doc.name}</h5>
                                    <p className="text-muted mb-2">{doc.description}</p>
                                    <p className="fw-bold">${doc.price.toLocaleString()}</p>
                                    {doc.requiresUpload && <small>Requiere subir foto</small>}
                                    {doc.requiresPresence && <small>En estudio</small>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="d-flex justify-content-between mt-4">
                <Button value="Atrás" onClick={onBack} />
                <Button value={loading ? "Cargando..." : "Siguiente"} onClick={handleConfirm} />
            </div>
        </div>
    );
};

export default AppointmentStep2Documents;
