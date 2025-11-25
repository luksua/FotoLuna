/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/baptisms.css";
import { motion } from "framer-motion";
import Button from "../../../../../components/Home/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const BAPTISM_EVENT_ID = 5;

interface BaptismPackage {
  id: number;
  nombre: string;
  precio: string;
  descripcion: string;
  caracteristicas: string[];
  destacado?: boolean;
}

const Baptisms = () => {
  const navigate = useNavigate();

  const [paquetes, setPaquetes] = useState<BaptismPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar paquetes desde el backend
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE}/api/events/${BAPTISM_EVENT_ID}/packages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        // 👉 Opción 1: backend devuelve { general: [...], specific: [...] }
        const general = res.data.general ?? [];
        const specific = res.data.specific ?? [];

        const combined = [...specific, ...general].map((pkg: any, index: number) => ({
          id: pkg.id,
          nombre: pkg.packageName,
          precio: pkg.packagePrice,
          descripcion: pkg.packageDescription,
          // si tienes features en el backend, ajusta esto.
          caracteristicas: pkg.features ?? [],
          // por ejemplo, marcamos el primero específico como destacado
          destacado: index === 0 && specific.length > 0,
        }));

        setPaquetes(combined);

        // 👉 Si tu backend en realidad devuelve solo un array plano (sin general/specific),
        // podrías usar algo así:
        //
        // const combined = res.data.map((pkg: any, index: number) => ({
        //   id: pkg.id,
        //   nombre: pkg.packageName,
        //   precio: pkg.packagePrice,
        //   descripcion: pkg.packageDescription,
        //   caracteristicas: pkg.features ?? [],
        //   destacado: index === 1, // por ejemplo
        // }));
        // setPaquetes(combined);

      } catch (err) {
        console.error("Error cargando paquetes de bautizos:", err);
        setError("No se pudieron cargar los paquetes en este momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleReserve = (paqueteId: number) => {
    navigate("/nuevaCita", {
      state: {
        eventId: BAPTISM_EVENT_ID,
        packageId: paqueteId,
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
    <section className="bautizos-comuniones-viewport" id="sacraments">
      <div className="container-fluid">
        <div className="row min-vh-100 align-items-center">

          {/* Left Side - Content */}
          <div className="col-lg-6 content-side">
            <div className="content-wrapper">
              <div className="badge-section">
                <span className="badge baptism">Bautizos</span>
                <span className="badge communion">Comuniones</span>
              </div>
              <motion.h1
                className="bg-custom-6 main-title"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Momentos Sagrados,
                <span className="highlight"> Recuerdos Eternos</span>
              </motion.h1>

              <p className="main-description">
                Capturamos la esencia espiritual y la inocencia de los momentos
                más especiales en la vida de tu familia.
              </p>

              <div className="features-grid">
                <motion.div
                  className="featured-image-container"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="row">
                    <div className="col image-col">
                      <div className="image-wrapper">
                        <img
                          src="img/primerac.jpg"
                          alt="Niña vestida de primera comunión con vestido blanco y sonrisa radiante"
                          className="featured-image"
                        />
                        <div className="image-gradient-overlay"></div>
                        <div className="image-frame"></div>
                      </div>
                      <div className="image-badge">
                        <i className="bi bi-star-fill"></i>
                        <span>Primera Comunión</span>
                      </div>
                    </div>

                    <div className="col image-col">
                      <div className="image-wrapper">
                        <img
                          src="img/primerac.jpg"
                          alt="Niña vestida de primera comunión con vestido blanco y sonrisa radiante"
                          className="featured-image"
                        />
                        <div className="image-gradient-overlay"></div>
                        <div className="image-frame"></div>
                      </div>
                      <div className="image-badge">
                        <i className="bi bi-star-fill"></i>
                        <span>Bautizo</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Side - Packages */}
          <div className="col-lg-6 packages-side">
            <div className="packages-wrapper">
              <h2 className="packages-title">Nuestros Paquetes</h2>
              <p className="packages-subtitle">Elige el perfecto para tu celebración</p>

              {loading && <p className="text-muted">Cargando paquetes...</p>}
              {error && <p className="text-danger">{error}</p>}

              {!loading && !error && (
                <div className="packages-grid">
                  {paquetes.map((paquete) => (
                    <div
                      key={paquete.id}
                      className={`package-card ${paquete.destacado ? "featured" : ""}`}
                    >
                      {paquete.destacado && (
                        <div className="popular-badge">MÁS POPULAR</div>
                      )}

                      <div className="package-header">
                        <h3>{paquete.nombre}</h3>
                        <div className="price">${formatPrice(paquete.precio)}</div>
                        <p className="package-desc">{paquete.descripcion}</p>
                      </div>

                      <div className="package-features">
                        <ul>
                          {paquete.caracteristicas.map((caracteristica, index) => (
                            <li key={index}>
                              <span className="check">✓</span>
                              {caracteristica}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className={`shiny-text-sacraments ${paquete.destacado ? "shiny-text-sacraments" : ""
                          }`}
                        onClick={() => handleReserve(paquete.id)}
                      >
                        Reservar Ahora
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Baptisms;
