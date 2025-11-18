import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/baptisms.css";
import { motion } from "framer-motion";
import Button from "../../../../../components/Home/Button";

const Baptisms = () => {
  const paquetes = [
    {
      id: 1,
      nombre: "Esencial",
      precio: "€299",
      descripcion: "Para momentos simples pero especiales",
      caracteristicas: [
        "1 hora de sesión",
        "15 fotos digitales",
        "Álbum digital",
        "Entrega en 7 días"
      ],
      destacado: false
    },
    {
      id: 2,
      nombre: "Premium",
      precio: "€499",
      descripcion: "La elección perfecta para familias",
      caracteristicas: [
        "2 horas de sesión",
        "30 fotos digitales",
        "Álbum físico",
        "5 impresiones",
        "Video slideshow"
      ],
      destacado: true
    },
    {
      id: 3,
      nombre: "Completo",
      precio: "€799",
      descripcion: "La elección perfecta para familias",
      caracteristicas: [
        "4 horas de sesión",
        "50+ fotos digitales",
        "Álbum premium",
        "10 impresiones",
        "Video profesional"
      ],
      destacado: false
    }
  ];

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
              {/* <div className="bg-custom-2">
                <h1 className="main-title">
                  Momentos Sagrados,
                  <span className="highlight"> Recuerdos Eternos</span>
                </h1>
              </div> */}

              <p className="main-description">
                Capturamos la esencia espiritual y la inocencia de los momentos
                más especiales en la vida de tu familia.
              </p>

              {/* Features Grid */}
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

              <div className="packages-grid">
                {paquetes.map((paquete) => (
                  <div key={paquete.id} className={`package-card ${paquete.destacado ? 'featured' : ''}`}>
                    {paquete.destacado && <div className="popular-badge">MÁS POPULAR</div>}

                    <div className="package-header">
                      <h3>{paquete.nombre}</h3>
                      <div className="price">{paquete.precio}</div>
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

                    <Button className={`shiny-text-sacraments ${paquete.destacado ? 'shiny-text-sacraments' : ''}`}>
                      Reservar Ahora
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Baptisms;
