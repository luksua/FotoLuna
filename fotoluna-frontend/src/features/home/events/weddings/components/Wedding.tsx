/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/wedding.css";
import Button from "../../../../../components/Home/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// 👈 Cambia este valor por el eventId real de BODAS en tu base de datos
const WEDDING_EVENT_ID = 4;

const weddingThemes = [
  {
    id: 1,
    name: "Clásico",
    description: "Elegancia atemporal",
    image:
      "img/boda2.jpg",
  },
  {
    id: 2,
    name: "Rústico",
    description: "Naturaleza y campo",
    image:
      "img/boda3.jpg",
  },
  {
    id: 3,
    name: "Urbano",
    description: "Moderno y citadino",
    image:
      "img/boda4.jpg",
  },
  {
    id: 4,
    name: "Bohemio",
    description: "Romántico y soñador",
    image:
      "img/boda.jpg",
  },
];

const Wedding = () => {
  const [activeTheme, setActiveTheme] = useState(weddingThemes[0]);

  const [packages, setPackages] = useState<
    { id: number; name: string; price: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // 🔹 Cargar paquetes desde Laravel (generales + específicos)
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/api/events/${WEDDING_EVENT_ID}/packages`,
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
          name: pkg.packageName,
          description: pkg.packageDescription,
          price: pkg.packagePrice,
        }));

        setPackages(combined);
      } catch (err) {
        console.error("Error cargando paquetes de bodas:", err);
        setError("No se pudieron cargar los paquetes.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // 🔹 Ir al wizard con el paquete preseleccionado
  const handleReserve = (packageId: number) => {
    navigate("/nuevaCita", {
      state: {
        eventId: WEDDING_EVENT_ID,
        packageId,
        skipPackageSelection: true,
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
    <section className="elegant-wedding-section" id="wedding">
      {/* Background decorative elements */}
      <div className="elegant-bg-element elegant-bg-1"></div>
      <div className="elegant-bg-element elegant-bg-2"></div>
      <div className="elegant-bg-element elegant-bg-3"></div>

      <div className="container elegant-container">
        {/* Header */}
        <div className="text-center elegant-header">
          <div className="elegant-title-wrapper">
            <motion.h1
              className="bg-custom-7"
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Bodas
            </motion.h1>
            <div className="elegant-title-underline">
              <div className="elegant-underline-dot"></div>
              <div className="elegant-underline-line"></div>
              <div className="elegant-underline-dot"></div>
            </div>
          </div>
          <p className="elegant-subtitle">
            Donde cada momento se convierte en eternidad
          </p>
        </div>

        {/* Tabs */}
        <div className="row justify-content-center">
          <div className="col-12">
            <motion.div
              className="elegant-tabs-container bg-custom-9"
              initial={{ opacity: 0, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {weddingThemes.map((theme) => (
                <button
                  key={theme.id}
                  className={`elegant-tab ${activeTheme.id === theme.id ? "elegant-tab-active" : ""
                    }`}
                  onClick={() => setActiveTheme(theme)}
                >
                  <span className="elegant-tab-icon">✦</span>
                  {theme.name}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row elegant-content-row">
          {/* Image Section */}
          <div className="col-lg-4 elegant-image-section">
            <div className="elegant-image-wrapper">
              <div className="elegant-image-frame">
                <img
                  src={activeTheme.image}
                  alt={activeTheme.name}
                  className="elegant-main-image"
                />
                <div className="elegant-image-overlay">
                  <div className="elegant-theme-badge">{activeTheme.name}</div>
                  <p className="elegant-theme-description">
                    {activeTheme.description}
                  </p>
                </div>
              </div>
              <div className="elegant-image-decoration"></div>
            </div>
          </div>

          {/* Packages Section */}
          <div className="col-lg-8 elegant-packages-section">
            <div className="elegant-packages-grid bg-custom-5">
              <div className="row align-items-stretch">
                {loading && (
                  <p className="text-muted px-3 pt-3">
                    Cargando paquetes de bodas...
                  </p>
                )}

                {error && (
                  <p className="text-danger px-3 pt-3">{error}</p>
                )}

                {!loading &&
                  !error &&
                  packages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      className="col-12 col-md-6 elegant-package-card-wrapper d-flex justify-content-center"
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="elegant-package-card">
                        <div className="elegant-package-header">
                          <div className="elegant-package-name-section">
                            <h4 className="elegant-package-name">
                              {pkg.name}
                            </h4>
                            <div className="elegant-package-price">
                              ${formatPrice(pkg.price)}
                            </div>
                          </div>
                        </div>

                        <div className="elegant-package-features">
                          <div className="elegant-feature-item">
                            <div className="elegant-feature-icon">◈</div>
                            <span className="elegant-feature-text">
                              {pkg.description}
                            </span>
                          </div>
                          {/* Puedes añadir features fijos si quieres reforzar beneficios genéricos */}
                          <div className="elegant-feature-item">
                            <div className="elegant-feature-icon">◈</div>
                            <span className="elegant-feature-text">
                              Cobertura profesional del día de la boda
                            </span>
                          </div>
                          <div className="elegant-feature-item">
                            <div className="elegant-feature-icon">◈</div>
                            <span className="elegant-feature-text">
                              Entrega digital de las mejores fotografías
                            </span>
                          </div>
                        </div>

                        <Button
                          className="elegant-book-button"
                          onClick={() => handleReserve(pkg.id)}
                        >
                          <span className="elegant-button-text">
                            Reservar Experiencia
                          </span>
                          <span className="elegant-button-arrow">→</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                {!loading && !error && packages.length === 0 && (
                  <p className="text-muted px-3 pt-3">
                    Próximamente paquetes especiales de bodas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Wedding;
