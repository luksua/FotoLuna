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
    const [editingItem, setEditingItem] = useState<{ type: string; item: any; isNew: boolean } | null>(null);
    const [events, setEvents] = useState<Event[]>(sampleEvents.map(e => ({ ...e, estado: true })));
    const [packages, setPackages] = useState<Package[]>(samplePackages.map(p => ({ ...p, estado: true })));
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(sampleDocumentTypes.map(d => ({ ...d, estado: true })));

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

    const handleEdit = (type: string, item: any) => {
        setEditingItem({ type, item, isNew: false });
    };

    const handleAddNew = (type: string) => {
        let newItem;
        if (type === "event") {
            newItem = { id: events.length + 1, nombre: "", descripcion: "", duracion: "", precio: "", estado: true };
        } else if (type === "package") {
            newItem = { id: packages.length + 1, nombre: "", descripcion: "", cantidad_eventos: "", precio: "", estado: true };
        } else {
            newItem = { id: documentTypes.length + 1, nombre: "", descripcion: "", cantidad: "", precio: "", estado: true };
        }
        setEditingItem({ type, item: newItem, isNew: true });
    };

    const handleCloseModal = () => {
        setEditingItem(null);
    };

    const handleSave = (formData: any) => {
        if (editingItem?.type === "event") {
            if (editingItem.isNew) {
                setEvents([...events, { ...formData, estado: true }]);
            } else {
                setEvents(events.map(e => e.id === formData.id ? formData : e));
            }
        } else if (editingItem?.type === "package") {
            if (editingItem.isNew) {
                setPackages([...packages, { ...formData, estado: true }]);
            } else {
                setPackages(packages.map(p => p.id === formData.id ? formData : p));
            }
        } else if (editingItem?.type === "documentType") {
            if (editingItem.isNew) {
                setDocumentTypes([...documentTypes, { ...formData, estado: true }]);
            } else {
                setDocumentTypes(documentTypes.map(d => d.id === formData.id ? formData : d));
            }
        }
        handleCloseModal();
    };

    const handleToggleStatus = (type: string, item: any) => {
        const updatedItem = { ...item, estado: !item.estado };
        
        if (type === "event") {
            setEvents(events.map(e => e.id === item.id ? updatedItem : e));
        } else if (type === "package") {
            setPackages(packages.map(p => p.id === item.id ? updatedItem : p));
        } else if (type === "documentType") {
            setDocumentTypes(documentTypes.map(d => d.id === item.id ? updatedItem : d));
        }
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
                        <div className="section-header">
                            <h2>Eventos</h2>
                            <button className="btn-add-new" onClick={() => handleAddNew("event")}>
                                + Agregar Evento
                            </button>
                        </div>
                        <div className="items-grid">
                            {filteredEvents.map((event) => (
                                <div className={`item-card ${!event.estado ? 'disabled' : ''}`} key={event.id}>
                                    <div className="item-content">
                                        <h3>{event.nombre}</h3>
                                        <p><strong>Descripción:</strong> {event.descripcion}</p>
                                        <p><strong>Duración:</strong> {event.duracion}</p>
                                        <p><strong>Precio:</strong> ${event.precio.toLocaleString()}</p>
                                        <span className={`status-badge ${event.estado ? 'active' : 'inactive'}`}>
                                            {event.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit("event", event)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className={`btn-disable ${!event.estado ? 'active' : ''}`}
                                            onClick={() => handleToggleStatus("event", event)}
                                        >
                                            {event.estado ? 'Deshabilitar' : 'Habilitar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Paquetes */}
                    <section className="admin-section">
                        <div className="section-header">
                            <h2>Paquetes</h2>
                            <button className="btn-add-new" onClick={() => handleAddNew("package")}>
                                + Agregar Paquete
                            </button>
                        </div>
                        <div className="items-grid">
                            {filteredPackages.map((pkg) => (
                                <div className={`item-card ${!pkg.estado ? 'disabled' : ''}`} key={pkg.id}>
                                    <div className="item-content">
                                        <h3>{pkg.nombre}</h3>
                                        <p><strong>Descripción:</strong> {pkg.descripcion}</p>
                                        <p><strong>Cantidad de eventos:</strong> {pkg.cantidad_eventos}</p>
                                        <p><strong>Precio:</strong> ${pkg.precio.toLocaleString()}</p>
                                        <span className={`status-badge ${pkg.estado ? 'active' : 'inactive'}`}>
                                            {pkg.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit("package", pkg)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className={`btn-disable ${!pkg.estado ? 'active' : ''}`}
                                            onClick={() => handleToggleStatus("package", pkg)}
                                        >
                                            {pkg.estado ? 'Deshabilitar' : 'Habilitar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tipos de Documentos */}
                    <section className="admin-section">
                        <div className="section-header">
                            <h2>Tipos de Documentos</h2>
                            <button className="btn-add-new" onClick={() => handleAddNew("documentType")}>
                                + Agregar Documento
                            </button>
                        </div>
                        <div className="items-grid">
                            {filteredDocumentTypes.map((docType) => (
                                <div className={`item-card ${!docType.estado ? 'disabled' : ''}`} key={docType.id}>
                                    <div className="item-content">
                                        <h3>{docType.nombre}</h3>
                                        <p><strong>Descripción:</strong> {docType.descripcion}</p>
                                        <p><strong>Cantidad:</strong> {docType.cantidad}</p>
                                        <p><strong>Precio:</strong> ${docType.precio.toLocaleString()}</p>
                                        <span className={`status-badge ${docType.estado ? 'active' : 'inactive'}`}>
                                            {docType.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit("documentType", docType)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className={`btn-disable ${!docType.estado ? 'active' : ''}`}
                                            onClick={() => handleToggleStatus("documentType", docType)}
                                        >
                                            {docType.estado ? 'Deshabilitar' : 'Habilitar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Modal */}
                    {editingItem && (
                        <div className="modal-overlay" onClick={handleCloseModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>
                                        {editingItem.isNew ? "Crear " : "Editar "}
                                        {editingItem.type === "event" ? "Evento" : editingItem.type === "package" ? "Paquete" : "Tipo de Documento"}
                                    </h2>
                                    <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                                </div>
                                <EditForm
                                    type={editingItem.type}
                                    item={editingItem.item}
                                    isNew={editingItem.isNew}
                                    onSave={handleSave}
                                    onCancel={handleCloseModal}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HomeAdminLayout>
    );
};

interface EditFormProps {
    type: string;
    item: any;
    isNew: boolean;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ type, item, isNew, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Para precio, cantidad y cantidad_eventos, permitir string vacío
        if (name === "precio" || name === "cantidad" || name === "cantidad_eventos") {
            setFormData({
                ...formData,
                [name]: value === "" ? "" : Number(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = () => {
        // Validar que los campos numéricos no estén vacíos
        let validData = { ...formData };
        if (validData.precio === "") validData.precio = 0;
        if (validData.cantidad === "") validData.cantidad = 0;
        if (validData.cantidad_eventos === "") validData.cantidad_eventos = 0;
        
        onSave(validData);
    };

    return (
        <>
            <div className="modal-body">
                {type === "event" && (
                    <>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre del evento"
                        />
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                        ></textarea>
                        <input
                            type="text"
                            name="duracion"
                            value={formData.duracion}
                            onChange={handleChange}
                            placeholder="Duración"
                        />
                        <input
                            type="text"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="Precio"
                        />
                    </>
                )}
                {type === "package" && (
                    <>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre del paquete"
                        />
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                        ></textarea>
                        <input
                            type="text"
                            name="cantidad_eventos"
                            value={formData.cantidad_eventos}
                            onChange={handleChange}
                            placeholder="Cantidad de eventos"
                        />
                        <input
                            type="text"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="Precio"
                        />
                    </>
                )}
                {type === "documentType" && (
                    <>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre"
                        />
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                        ></textarea>
                        <input
                            type="text"
                            name="cantidad"
                            value={formData.cantidad}
                            onChange={handleChange}
                            placeholder="Cantidad"
                        />
                        <input
                            type="text"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="Precio"
                        />
                    </>
                )}
            </div>
            <div className="modal-footer">
                <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
                <button className="btn-save" onClick={handleSubmit}>Guardar cambios</button>
            </div>
        </>
    );
};

export default AdminEvents;