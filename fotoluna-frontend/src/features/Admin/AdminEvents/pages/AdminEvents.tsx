import React, { useState, useMemo } from "react";
import HomeAdminLayout from "../../../../layouts/HomeAdminLayout";
import "../styles/AdminEvents.css";

interface Event {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: string;
    precio: number;
    estado?: boolean;
}

interface Package {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad_eventos: number;
    precio: number;
    estado?: boolean;
}

interface DocumentType {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    estado?: boolean;
}

// Datos de ejemplo
const sampleEvents: Event[] = [
    { id: 1, nombre: "Sesión de Retrato", descripcion: "Sesión de retrato", duracion: "150 Fotos", precio: 250000, estado: true },
    { id: 2, nombre: "Boda Completa", descripcion: "Boda completa", duracion: "800 Fotos", precio: 500000, estado: true },
    { id: 3, nombre: "Evento Corporativo", descripcion: "Evento corporativo", duracion: "400 Fotos", precio: 300000, estado: true },
];

const samplePackages: Package[] = [
    { id: 1, nombre: "Paquete Básico", descripcion: "Paquete básico", cantidad_eventos: 1, precio: 200000, estado: true },
    { id: 2, nombre: "Paquete Premium", descripcion: "Paquete premium", cantidad_eventos: 5, precio: 800000, estado: true },
];

const sampleDocumentTypes: DocumentType[] = [
    { id: 1, nombre: "Contrato de Boda", descripcion: "Contrato de boda", cantidad: 1, precio: 50000, estado: true },
    { id: 2, nombre: "Release de Modelo", descripcion: "Release de modelo", cantidad: 1, precio: 30000, estado: true },
    { id: 3, nombre: "Permiso de Locación", descripcion: "Permiso de locación", cantidad: 1, precio: 40000, estado: true },
];

const AdminEvents: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [events, setEvents] = useState<Event[]>(sampleEvents);
    const [packages, setPackages] = useState<Package[]>(samplePackages);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(sampleDocumentTypes);

    // Filtrar datos
    const filteredEvents = useMemo(
        () => events.filter(e => e.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery, events]
    );

    const filteredPackages = useMemo(
        () => packages.filter(p => p.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery, packages]
    );

    const filteredDocumentTypes = useMemo(
        () => documentTypes.filter(d => d.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery, documentTypes]
    );

    const handleToggleStatus = (type: string, id: number) => {
        if (type === "event") {
            setEvents(events.map(e => e.id === id ? { ...e, estado: !e.estado } : e));
        } else if (type === "package") {
            setPackages(packages.map(p => p.id === id ? { ...p, estado: !p.estado } : p));
        } else if (type === "documentType") {
            setDocumentTypes(documentTypes.map(d => d.id === id ? { ...d, estado: !d.estado } : d));
        }
    };

    return (
        <HomeAdminLayout>
            <div className="admin-events-page">
                {/* Search Bar */}
                <div className="admin-events-search-container">
                    <input
                        type="text"
                        placeholder="Buscar en eventos, paquetes y documentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-events-search-input"
                    />
                </div>

                {/* EVENTOS SECTION */}
                <section className="admin-events-section">
                    <div className="admin-events-header">
                        <h3 className="admin-events-title">Eventos</h3>
                        <button className="admin-events-add-btn">Agregar +</button>
                    </div>
                    
                    {filteredEvents.length === 0 ? (
                        <p className="admin-events-empty">No hay eventos.</p>
                    ) : (
                        <div className="admin-events-grid">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="admin-events-card">
                                    <h5 className="card-title">{event.nombre}</h5>
                                    <p className="card-detail">{event.duracion}</p>
                                    <p className="card-price">${event.precio.toLocaleString()}</p>
                                    <div className="card-actions">
                                        <button className="btn-edit">Editar</button>
                                        <button 
                                            className={`btn-toggle ${event.estado ? 'enabled' : 'disabled'}`}
                                            onClick={() => handleToggleStatus('event', event.id)}
                                        >
                                            {event.estado ? 'Habilitar' : 'Deshabilitar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* PAQUETES SECTION */}
                <section className="admin-events-section">
                    <div className="admin-events-header">
                        <h3 className="admin-events-title">Paquetes</h3>
                        <button className="admin-events-add-btn">Agregar +</button>
                    </div>
                    
                    {filteredPackages.length === 0 ? (
                        <p className="admin-events-empty">No hay paquetes.</p>
                    ) : (
                        <div className="admin-events-grid">
                            {filteredPackages.map(pkg => (
                                <div key={pkg.id} className="admin-events-card">
                                    <h5 className="card-title">{pkg.nombre}</h5>
                                    <p className="card-detail">{pkg.cantidad_eventos} fotos</p>
                                    <p className="card-price">${pkg.precio.toLocaleString()}</p>
                                    <div className="card-actions">
                                        <button className="btn-edit">Editar</button>
                                        <button 
                                            className={`btn-toggle ${pkg.estado ? 'enabled' : 'disabled'}`}
                                            onClick={() => handleToggleStatus('package', pkg.id)}
                                        >
                                            {pkg.estado ? 'Habilitar' : 'Deshabilitar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* DOCUMENTOS SECTION */}
                <section className="admin-events-section">
                    <div className="admin-events-header">
                        <h3 className="admin-events-title">Documentos</h3>
                        <button className="admin-events-add-btn">Agregar +</button>
                    </div>
                    
                    {filteredDocumentTypes.length === 0 ? (
                        <p className="admin-events-empty">No hay documentos.</p>
                    ) : (
                        <div className="admin-events-grid">
                            {filteredDocumentTypes.map(doc => (
                                <div key={doc.id} className="admin-events-card">
                                    <h5 className="card-title">{doc.nombre}</h5>
                                    <p className="card-detail">{doc.cantidad} documento</p>
                                    <p className="card-price">${doc.precio.toLocaleString()}</p>
                                    <div className="card-actions">
                                        <button className="btn-edit">Editar</button>
                                        <button 
                                            className={`btn-toggle ${doc.estado ? 'enabled' : 'disabled'}`}
                                            onClick={() => handleToggleStatus('documentType', doc.id)}
                                        >
                                            {doc.estado ? 'Habilitar' : 'Deshabilitar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </HomeAdminLayout>
    );
};

export default AdminEvents;