import React, { useState, useMemo } from "react";
import HomeAdminLayout from "../../../../layouts/HomeAdminLayout";
import "../styles/AdminEvents.css";

interface Event {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: string;
    precio: number;
}

interface Package {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad_eventos: number;
    precio: number;
}

interface DocumentType {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio: number;
}

// Datos de ejemplo
const sampleEvents: Event[] = [
    { id: 1, nombre: "Bodas", descripcion: "Cobertura completa de bodas", duracion: "8 horas", precio: 500000 },
    { id: 2, nombre: "Cumpleaños", descripcion: "Evento de cumpleaños", duracion: "4 horas", precio: 200000 },
    { id: 3, nombre: "Bautizos", descripcion: "Cobertura de bautizos", duracion: "3 horas", precio: 150000 },
    { id: 4, nombre: "Quinceañeras", descripcion: "Evento de quinceañera", duracion: "6 horas", precio: 400000 },
];

const samplePackages: Package[] = [
    { id: 1, nombre: "Paquete Básico", descripcion: "Cobertura de 1 evento", cantidad_eventos: 1, precio: 200000 },
    { id: 2, nombre: "Paquete Estándar", descripcion: "Cobertura de 3 eventos", cantidad_eventos: 3, precio: 500000 },
    { id: 3, nombre: "Paquete Premium", descripcion: "Cobertura de 5 eventos", cantidad_eventos: 5, precio: 800000 },
    { id: 4, nombre: "Paquete Anual", descripcion: "Cobertura ilimitada por un año", cantidad_eventos: 999, precio: 2000000 },
];

const sampleDocumentTypes: DocumentType[] = [
    { id: 1, nombre: "Licencia de Conducción", descripcion: "Fotografía para licencia de conducción", cantidad: 1, precio: 50000 },
    { id: 2, nombre: "Visa & Pasaporte", descripcion: "Fotografía para visa y pasaporte", cantidad: 1, precio: 75000 },
    { id: 3, nombre: "Documentos Escolares", descripcion: "Fotografía para documentos escolares", cantidad: 1, precio: 40000 },
    { id: 4, nombre: "Tarjeta Profesional", descripcion: "Fotografía para tarjeta profesional", cantidad: 1, precio: 60000 },
    { id: 5, nombre: "Hoja de Vida", descripcion: "Fotografía profesional para hoja de vida", cantidad: 1, precio: 80000 },
    { id: 6, nombre: "Fuerzas Armadas", descripcion: "Fotografía para fuerzas armadas", cantidad: 1, precio: 70000 },
];

const AdminEvents: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState<{ type: string; item: any } | null>(null);

    // Filtrar datos
    const filteredEvents = useMemo(
        () => sampleEvents.filter(e => e.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery]
    );

    const filteredPackages = useMemo(
        () => samplePackages.filter(p => p.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery]
    );

    const filteredDocumentTypes = useMemo(
        () => sampleDocumentTypes.filter(d => d.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery]
    );

    const handleEdit = (type: string, item: any) => {
        setEditingItem({ type, item });
    };

    const handleCloseModal = () => {
        setEditingItem(null);
    };

    return (
        <HomeAdminLayout>
            <div className="scrollspy-example-2">
                <div className="admin-events-container">
                    <h1>Gestión de Eventos y Paquetes</h1>

                    {/* Barra de búsqueda */}
                    <div className="search-filter">
                        <input
                            type="text"
                            placeholder="Buscar eventos, paquetes o tipos de documento..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-events"
                        />
                    </div>

                    {/* Eventos */}
                    <section className="admin-section">
                        <h2>Eventos</h2>
                        <div className="items-grid">
                            {filteredEvents.map((event) => (
                                <div className="item-card" key={event.id}>
                                    <div className="item-content">
                                        <h3>{event.nombre}</h3>
                                        <p><strong>Descripción:</strong> {event.descripcion}</p>
                                        <p><strong>Duración:</strong> {event.duracion}</p>
                                        <p><strong>Precio:</strong> ${event.precio.toLocaleString()}</p>
                                    </div>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit("event", event)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Paquetes */}
                    <section className="admin-section">
                        <h2>Paquetes</h2>
                        <div className="items-grid">
                            {filteredPackages.map((pkg) => (
                                <div className="item-card" key={pkg.id}>
                                    <div className="item-content">
                                        <h3>{pkg.nombre}</h3>
                                        <p><strong>Descripción:</strong> {pkg.descripcion}</p>
                                        <p><strong>Cantidad de eventos:</strong> {pkg.cantidad_eventos}</p>
                                        <p><strong>Precio:</strong> ${pkg.precio.toLocaleString()}</p>
                                    </div>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit("package", pkg)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tipos de Documentos */}
                    <section className="admin-section">
                        <h2>Tipos de Documentos</h2>
                        <div className="items-grid">
                            {filteredDocumentTypes.map((docType) => (
                                <div className="item-card" key={docType.id}>
                                    <div className="item-content">
                                        <h3>{docType.nombre}</h3>
                                        <p><strong>Descripción:</strong> {docType.descripcion}</p>
                                        <p><strong>Cantidad:</strong> {docType.cantidad}</p>
                                        <p><strong>Precio:</strong> ${docType.precio.toLocaleString()}</p>
                                    </div>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit("documentType", docType)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Modal */}
                    {editingItem && (
                        <div className="modal-overlay" onClick={handleCloseModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Editar {editingItem.type === "event" ? "Evento" : editingItem.type === "package" ? "Paquete" : "Tipo de Documento"}</h2>
                                    <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    {editingItem.type === "event" && (
                                        <>
                                            <input type="text" defaultValue={editingItem.item.nombre} placeholder="Nombre del evento" />
                                            <textarea defaultValue={editingItem.item.descripcion} placeholder="Descripción"></textarea>
                                            <input type="text" defaultValue={editingItem.item.duracion} placeholder="Duración" />
                                            <input type="number" defaultValue={editingItem.item.precio} placeholder="Precio" />
                                        </>
                                    )}
                                    {editingItem.type === "package" && (
                                        <>
                                            <input type="text" defaultValue={editingItem.item.nombre} placeholder="Nombre del paquete" />
                                            <textarea defaultValue={editingItem.item.descripcion} placeholder="Descripción"></textarea>
                                            <input type="number" defaultValue={editingItem.item.cantidad_eventos} placeholder="Cantidad de eventos" />
                                            <input type="number" defaultValue={editingItem.item.precio} placeholder="Precio" />
                                        </>
                                    )}
                                    {editingItem.type === "documentType" && (
                                        <>
                                            <input type="text" defaultValue={editingItem.item.nombre} placeholder="Nombre" />
                                            <textarea defaultValue={editingItem.item.descripcion} placeholder="Descripción"></textarea>
                                            <input type="number" defaultValue={editingItem.item.cantidad} placeholder="Cantidad" />
                                            <input type="number" defaultValue={editingItem.item.precio} placeholder="Precio" />
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                                    <button className="btn-save">Guardar cambios</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HomeAdminLayout>
    );
};

export default AdminEvents;