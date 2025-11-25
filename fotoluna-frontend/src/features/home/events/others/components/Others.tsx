import React from 'react';
import '../styles/other.css';

const OtherServices: React.FC = () => {

    const handleViewAllContact = () => {
        window.location.href = '/contacto';
    };

    const handleWhatsAppGeneral = () => {
        const message = "Hola, me gustaría obtener más información sobre sus servicios de fotografía";
        const whatsappUrl = `https://wa.me/+573206706877?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <section className="other-services-section" id='others'>
            {/* Call to Action General */}
            <div className="other-services-cta bg-custom-2">
                <div className="cta-content">
                    <h3 className="cta-title">¿No encuentras lo que buscas?</h3>
                    <p className="cta-description">
                        Contáctanos directamente y cuéntanos tus necesidades específicas.
                        Estamos aquí para ayudarte a crear el servicio perfecto para ti.
                    </p>
                    <div className="cta-buttons">
                        <button className="cta-btn primary" onClick={handleViewAllContact}>
                            <span className="cta-btn-content bg-custom-2">
                                <span className="cta-btn-text">Contactanos</span>
                            </span>
                        </button>
                        <button className="cta-btn whatsapp bg-custom-2" onClick={handleWhatsAppGeneral}>
                            <span className="cta-btn-content">
                                <i className="bi bi-whatsapp"></i>
                                <span className="cta-btn-text">Escribir por WhatsApp</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OtherServices;