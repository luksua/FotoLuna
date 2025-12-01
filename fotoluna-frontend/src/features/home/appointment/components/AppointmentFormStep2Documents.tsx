import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import Button from "../../../../components/Home/Button";
import "../styles/appointment.css";
import api from "../../../../lib/api";

interface Step3Props {
    appointmentId: number;
    eventId: number;
    onBack: () => void;
    onConfirm: (data: { bookingId: number }) => void;
    place?: string;
    preselectedDocumentTypeId?: number;
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
    place,
    preselectedDocumentTypeId,
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

    // lugar y archivo
    const [localPlace, setLocalPlace] = useState(place ?? "");
    const [file, setFile] = useState<File | null>(null);

    const selectedDocObj = documents.find((d) => d.id === selectedDoc);
    const requiresUpload = !!selectedDocObj?.requiresUpload;
    const requiresPresence = !!selectedDocObj?.requiresPresence;
    const needsPhotographerVisit =
        !!selectedDocObj && !requiresUpload && !requiresPresence;

    // useEffect(() => {
    //     api.get("/api/document-types").then(({ data }) => setDocuments(data));
    // }, []);
    useEffect(() => {
        api.get("/api/document-types").then(({ data }) => {
            setDocuments(data);

            // 👇 si viene un documentType preseleccionado, lo marcamos
            if (preselectedDocumentTypeId) {
                setSelectedDoc(preselectedDocumentTypeId);
            } else if (data.length > 0) {
                // opcional: seleccionar el primero por defecto
                setSelectedDoc(data[0].id);
            }
        });
    }, [preselectedDocumentTypeId]);


    // Duplicar para scroll infinito
    const items = documents.length > 0 ? [...documents, ...documents] : [];

    // Medir ancho del track
    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        requestAnimationFrame(() => {
            halfWidthRef.current = track.scrollWidth / 2;
        });
    }, [items.length]);

    // Auto-scroll + inercia
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

    // Selección
    const handleCardClick = (docId: number) => {
        if (!clickGuardRef.current) setSelectedDoc(docId);
    };

    // Confirmar selección
    const handleConfirm = async () => {
        if (!selectedDoc) return alert("Selecciona un tipo de documento");

        const doc = documents.find((d) => d.id === selectedDoc);
        if (!doc) return;

        let resolvedPlace: string | null = place ?? null;

        if (requiresPresence && !requiresUpload) {
            resolvedPlace = "Estudio";
        } else if (needsPhotographerVisit) {
            if (!localPlace.trim()) {
                alert("Ingresa el lugar donde debe ir el fotógrafo.");
                return;
            }
            resolvedPlace = localPlace.trim();
        } else if (requiresUpload && !requiresPresence) {
            resolvedPlace = null; // o "Online"
        }

        if (requiresUpload && !file) {
            alert("Por favor adjunta la foto para este documento.");
            return;
        }

        const formData = new FormData();
        formData.append("documentTypeId", String(selectedDoc));

        if (resolvedPlace !== null) {
            formData.append("place", resolvedPlace);
        }

        if (file) {
            formData.append("photo", file);
        }

        setLoading(true);
        try {
            const { data } = await api.post(
                `/api/appointments/${appointmentId}/booking`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Respuesta completa del backend:", data);

            // 👇 Intentar todas las variantes razonables
            const bookingId =
                data.bookingId ??
                data.booking?.bookingId ??
                data.booking?.id ??
                data.id;

            if (!bookingId) {
                console.error("No llegó bookingId en la respuesta:", data);
                alert("No se pudo obtener el identificador de la reserva.");
                return;
            }

            onConfirm({ bookingId });
        } catch (err) {
            console.error("Error al confirmar cita:", err);
            alert("No se pudo confirmar la cita");
        } finally {
            setLoading(false);
        }
    };

    // const handleConfirm = async () => {
    //     if (!selectedDoc) return alert("Selecciona un tipo de documento");

    //     const doc = documents.find((d) => d.id === selectedDoc);
    //     if (!doc) return;

    //     // decidir el lugar según el tipo de documento
    //     let resolvedPlace: string | null = place ?? null;

    //     if (requiresPresence && !requiresUpload) {
    //         // Se toma en estudio, no necesitamos lugar del cliente
    //         resolvedPlace = "Estudio";
    //     } else if (needsPhotographerVisit) {
    //         // El fotógrafo va donde el cliente → necesitamos lugar
    //         if (!localPlace.trim()) {
    //             alert("Ingresa el lugar donde debe ir el fotógrafo.");
    //             return;
    //         }
    //         resolvedPlace = localPlace.trim();
    //     } else if (requiresUpload && !requiresPresence) {
    //         // Todo online, podrías marcarlo como Online o dejar null
    //         resolvedPlace = null; // o "Online"
    //     }

    //     // si requiere upload, obligamos archivo
    //     if (requiresUpload && !file) {
    //         alert("Por favor adjunta la foto para este documento.");
    //         return;
    //     }

    //     // ---- construir FormData ----
    //     const formData = new FormData();
    //     formData.append("documentTypeId", String(selectedDoc));

    //     if (resolvedPlace !== null) {
    //         formData.append("place", resolvedPlace);
    //     }

    //     if (file) {
    //         // usa el nombre de campo que espere tu backend, por ejemplo "photo"
    //         formData.append("photo", file);
    //     }

    //     setLoading(true);
    //     try {
    //         const { data } = await api.post(
    //             `/api/appointments/${appointmentId}/booking`,
    //             formData,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             }
    //         );
    //         // onConfirm({ bookingId: data.id });
    //         console.log("Respuesta completa del backend:", data);

    //         const bookingId = data.bookingId ?? data.id; // por si acaso
    //         if (!bookingId) {
    //             console.error("No llegó bookingId en la respuesta:", data);
    //             alert("No se pudo obtener el identificador de la reserva.");
    //             return;
    //         }

    //         onConfirm({ bookingId });
    //     } catch (err) {
    //         console.error("Error al confirmar cita:", err);
    //         alert("No se pudo confirmar la cita");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const formatPrice = (value: string | number) => {
        const n = Number(String(value).replace(/[^0-9.-]+/g, ""));
        if (Number.isNaN(n)) return String(value);
        // sin decimales:
        return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        // si quieres decimales, usa:
        // return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // const handleConfirm = async () => {
    //     if (!selectedDoc) return alert("Selecciona un tipo de documento");

    //     setLoading(true);
    //     try {
    //         const { data } = await api.post(`/api/appointments/${appointmentId}/booking`, {
    //             documentTypeId: selectedDoc,
    //             place,
    //         });
    //         onConfirm({ bookingId: data.id });
    //     } catch (err) {
    //         console.error("Error al confirmar cita:", err);
    //         alert("No se pudo confirmar la cita");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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
                                    <p className="fw-bold">${formatPrice(doc.price)}</p>
                                    <p className="">Fotos a entregar: {doc.number_photos}</p>
                                    {!!doc.requiresUpload && <small>Requiere subir foto</small>}
                                    {!!doc.requiresPresence && <small> Se toma en el estudio</small>}
                                    {!doc.requiresUpload && !doc.requiresPresence && (
                                        <small>Un fotógrafo irá a tu ubicación</small>
                                    )}
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
                                    {!!doc.requiresUpload && <small>Requiere subir foto</small>}
                                    {!!doc.requiresPresence && <small>En estudio</small>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDocObj && (
                <div className="mt-4">
                    {requiresUpload && (
                        <div className="mb-3">
                            <label className="form-label">Adjunta tu foto</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                            <small className="text-muted">
                                Podrás adjuntar tu foto desde casa.
                            </small>
                        </div>
                    )}

                    {needsPhotographerVisit && (
                        <div className="mb-3">
                            <label className="form-label">Lugar donde se tomará la foto</label>
                            <input
                                type="text"
                                className="form-control"
                                value={localPlace}
                                onChange={(e) => setLocalPlace(e.target.value)}
                                placeholder="Ej. Tu dirección o lugar de trabajo"
                            />
                            <small className="text-muted">
                                Un fotógrafo irá a este lugar para tomar la foto.
                            </small>
                        </div>
                    )}

                    {requiresPresence && !requiresUpload && (
                        <small className="text-muted">
                            Esta foto se toma en el estudio.
                        </small>
                    )}
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
