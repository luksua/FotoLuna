import React, { useState, useMemo, useEffect } from "react";
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
    const [formValues, setFormValues] = useState<any>(null);
    useEffect(() => {
        if (editingItem) {
            // clone to avoid direct mutation
            setFormValues({ ...editingItem.item });
        } else {
            setFormValues(null);
        }
    }, [editingItem]);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Convert numeric fields to number where appropriate
        const numericKeys = ["precio", "cantidad_eventos", "cantidad"];
        setFormValues((prev: any) => ({
            ...prev,
            [name]: numericKeys.includes(name) && value !== "" ? Number(value) : value,
        }));
    };
    return (
        <HomeAdminLayout>
            <div className="admin-events container p-3">
                <h2>Administrar Eventos / Paquetes / Documentos</h2>
                <div className="mb-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="form-control"
                    />
                </div>
                <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-sm btn-primary" onClick={() => handleAddNew("event")}>Agregar Evento</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleAddNew("package")}>Agregar Paquete</button>
                    <button className="btn btn-sm btn-info" onClick={() => handleAddNew("documentType")}>Agregar Documento</button>
                </div>
                <section className="mb-4">
                    <div className="section-header">
                        <h4>Eventos</h4>
                        <div>
                            <button className="admin-events-btn edit" onClick={() => handleAddNew("event")}>Agregar Evento</button>
                        </div>
                    </div>
                    {filteredEvents.length === 0 ? <p className="admin-events-no-results">No hay eventos.</p> : (
                        <div className="card-grid">
                            {filteredEvents.map(e => (
                                <div key={e.id} className={`admin-card ${e.estado ? '' : 'disabled'}`}>
                                    <div className="card-title">{e.nombre}</div>
                                    <div className="card-body">
                                        <p className="muted">{e.descripcion}</p>
                                        <p><strong>Duración:</strong> {e.duracion}</p>
                                        <p><strong>Precio:</strong> ${e.precio}</p>
                                    </div>
                                    <div className="card-actions">
                                        <button className="admin-events-btn edit" onClick={() => handleEdit('event', e)}>Editar</button>
                                        <button className={`admin-events-btn toggle ${e.estado ? 'enabled' : 'disabled'}`} onClick={() => handleToggleStatus('event', e)}>{e.estado ? 'Activo' : 'Inactivo'}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <section className="mb-4">
                    <div className="section-header">
                        <h4>Paquetes</h4>
                        <div>
                            <button className="admin-events-btn edit" onClick={() => handleAddNew("package")}>Agregar Paquete</button>
                        </div>
                    </div>
                    {filteredPackages.length === 0 ? <p className="admin-events-no-results">No hay paquetes.</p> : (
                        <div className="card-grid">
                            {filteredPackages.map(p => (
                                <div key={p.id} className={`admin-card ${p.estado ? '' : 'disabled'}`}>
                                    <div className="card-title">{p.nombre}</div>
                                    <div className="card-body">
                                        <p className="muted">{p.descripcion}</p>
                                        <p><strong>Cantidad eventos:</strong> {p.cantidad_eventos}</p>
                                        <p><strong>Precio:</strong> ${p.precio}</p>
                                    </div>
                                    <div className="card-actions">
                                        <button className="admin-events-btn edit" onClick={() => handleEdit('package', p)}>Editar</button>
                                        <button className={`admin-events-btn toggle ${p.estado ? 'enabled' : 'disabled'}`} onClick={() => handleToggleStatus('package', p)}>{p.estado ? 'Activo' : 'Inactivo'}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <section className="mb-4">
                    <div className="section-header">
                        <h4>Tipos de Documento</h4>
                        <div>
                            <button className="admin-events-btn edit" onClick={() => handleAddNew("documentType")}>Agregar Documento</button>
                        </div>
                    </div>
                    {filteredDocumentTypes.length === 0 ? <p className="admin-events-no-results">No hay tipos de documento.</p> : (
                        <div className="card-grid">
                            {filteredDocumentTypes.map(d => (
                                <div key={d.id} className={`admin-card ${d.estado ? '' : 'disabled'}`}>
                                    <div className="card-title">{d.nombre}</div>
                                    <div className="card-body">
                                        <p className="muted">{d.descripcion}</p>
                                        <p><strong>Cantidad:</strong> {d.cantidad}</p>
                                        <p><strong>Precio:</strong> ${d.precio}</p>
                                    </div>
                                    <div className="card-actions">
                                        <button className="admin-events-btn edit" onClick={() => handleEdit('documentType', d)}>Editar</button>
                                        <button className={`admin-events-btn toggle ${d.estado ? 'enabled' : 'disabled'}`} onClick={() => handleToggleStatus('documentType', d)}>{d.estado ? 'Activo' : 'Inactivo'}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                {/* Modal / Inline form para editar/crear */}
                {editingItem && formValues && (
                    <div className="card p-3 mt-4">
                        <h5>{editingItem.isNew ? "Crear nuevo" : "Editar"} {editingItem.type}</h5>
                        <div className="mb-2">
                            <label className="form-label">Nombre</label>
                            <input name="nombre" value={formValues.nombre ?? ""} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Descripción</label>
                            <textarea name="descripcion" value={formValues.descripcion ?? ""} onChange={handleInputChange} className="form-control" />
                        </div>
                        {editingItem.type === "event" && (
                            <div className="mb-2">
                                <label className="form-label">Duración</label>
                                <input name="duracion" value={formValues.duracion ?? ""} onChange={handleInputChange} className="form-control" />
                            </div>
                        )}
                        {(editingItem.type === "package") && (
                            <div className="mb-2">
                                <label className="form-label">Cantidad de eventos</label>
                                <input name="cantidad_eventos" type="number" value={formValues.cantidad_eventos ?? ""} onChange={handleInputChange} className="form-control" />
                            </div>
                        )}
                        {(editingItem.type === "documentType") && (
                            <div className="mb-2">
                                <label className="form-label">Cantidad</label>
                                <input name="cantidad" type="number" value={formValues.cantidad ?? ""} onChange={handleInputChange} className="form-control" />
                            </div>
                        )}
                        <div className="mb-2">
                            <label className="form-label">Precio</label>
                            <input name="precio" type="number" value={formValues.precio ?? ""} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="d-flex gap-2 mt-2">
                            <button className="btn btn-sm btn-success" onClick={() => handleSave(formValues)}>Guardar</button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={handleCloseModal}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </HomeAdminLayout>
    );
};

export default AdminEvents;