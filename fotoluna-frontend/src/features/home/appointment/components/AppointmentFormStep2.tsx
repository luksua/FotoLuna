import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import Button from "../../../../components/Home/Button";
import "../styles/appointment.css";
import axios from "axios";
// import AppointmentStep2Documents from "./AppointmentFormStep2Documents";

interface Photo {
    id: number;
    url: string;
}

interface Package {
    id: number;
    packageName: string;
    packagePrice: string;
    packageDescription: string;
    photos?: Photo[];
}

interface Step2Props {
    appointmentId: number;
    eventId: number;
    onBack: () => void;
    onConfirm: (data: { bookingId: number }) => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const AppointmentStep2Packages: React.FC<Step2Props> = ({
    appointmentId,
    eventId,
    onBack,
    onConfirm,
}) => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // 🔹 Cargar paquetes del backend
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE}/api/events/${eventId}/packages`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });
                setPackages(res.data);
            } catch (err) {
                console.error("Error al cargar paquetes:", err);
                setError("No se pudieron cargar los paquetes.");
            }
        };

        if (eventId) fetchPackages();
    }, [eventId]);

    // 🔁 Duplicar paquetes para scroll infinito
    const items = packages.length > 0 ? [...packages, ...packages] : [];

    // 🔹 Medir el ancho del track
    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        requestAnimationFrame(() => {
            halfWidthRef.current = track.scrollWidth / 2;
        });
    }, [items.length]);

    // 🔄 Animación de auto-scroll + loop infinito
    useEffect(() => {
        if (packages.length <= 3) return;

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
    }, [packages.length]);

    // 🔹 Click en un paquete
    const handleCardClick = (pkgId: number) => {
        if (!clickGuardRef.current) setSelectedPackage(pkgId);
    };

    // 🔹 Confirmar paquete seleccionado
    const handleConfirm = async () => {
        if (!selectedPackage) {
            setError("Selecciona un paquete antes de confirmar.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${API_BASE}/api/appointments/${appointmentId}/booking`,
                { packageIdFK: selectedPackage },
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const bookingId = res?.data?.id ?? res?.data?.bookingId ?? 0;
            onConfirm({ bookingId });
        } catch (err) {
            console.error("Error al confirmar cita:", err);
            setError("No se pudo confirmar la cita. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Render
    return (
        <div className="container py-4 appointment-step2 bg-custom-2">
            <h3 className="mb-4 fw-semibold text-center">Selecciona un paquete</h3>
            {error && <div className="alert alert-danger">{error}</div>}

            {packages.length > 3 ? (
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
                        if (Math.abs(e.clientX - dragStartXRef.current) > 5) clickGuardRef.current = true;

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
                            el?.closest(".carousel-card")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
                        {items.map((pkg, i) => (
                            <div
                                key={`${pkg.id}-${i}`}
                                className={`carousel-card package-card ${selectedPackage === pkg.id ? "selected" : ""
                                    }`}
                                onClick={() => handleCardClick(pkg.id)}
                            >
                                {pkg.photos?.length ? (
                                    <img
                                        src={pkg.photos[0].url}
                                        alt={pkg.packageName}
                                        className="package-image"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="package-image placeholder">Sin imágenes</div>
                                )}
                                <div className="package-info">
                                    <h5 className="mb-1">{pkg.packageName}</h5>
                                    <p className="text-muted mb-2">{pkg.packageDescription}</p>
                                    <p className="fw-bold">{pkg.packagePrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Fallback si hay 3 o menos paquetes
                <div className="row g-4">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="col-12 col-md-4">
                            <div
                                className={`static-package-card ${selectedPackage === pkg.id ? "selected" : ""
                                    }`}
                                onClick={() => setSelectedPackage(pkg.id)}
                            >
                                {pkg.photos?.length ? (
                                    <img
                                        src={pkg.photos[0].url}
                                        alt={pkg.packageName}
                                        className="static-package-image"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="static-package-image placeholder">Sin imágenes</div>
                                )}
                                <div className="package-info">
                                    <h5 className="mb-1">{pkg.packageName}</h5>
                                    <p className="text-muted mb-2">{pkg.packageDescription}</p>
                                    <p className="fw-bold">{pkg.packagePrice}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* // Fallback si hay 3 o menos paquetes
  <div className="row g-4">
    {packages.map((pkg) => (
      <div key={pkg.id} className="col-12 col-md-4">
        <div
          className={`static-package-card ${
            selectedPackage === pkg.id ? "selected" : ""
          }`}
          onClick={() => setSelectedPackage(pkg.id)}
        >
          {pkg.photos?.length ? (
            <img
              src={pkg.photos[0].url}
              alt={pkg.packageName}
              className="static-package-image"
              draggable={false}
            />
          ) : (
            <div className="static-package-image placeholder">Sin imágenes</div>
          )}
          <div className="package-info">
            <h5 className="mb-1">{pkg.packageName}</h5>
            <p className="text-muted mb-2">{pkg.packageDescription}</p>
            <p className="fw-bold">{pkg.packagePrice}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
) */}

            <div className="d-flex justify-content-between mt-4">
                <Button value="Atrás" onClick={onBack} />
                <Button value={loading ? "Cargando..." : "Siguiente"} onClick={handleConfirm} />
            </div>
        </div>
    );
};

export default AppointmentStep2Packages;
