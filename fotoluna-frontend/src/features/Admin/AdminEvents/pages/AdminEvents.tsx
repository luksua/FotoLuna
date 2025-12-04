import React, { useState, useMemo, useEffect } from 'react';
import HomeAdminLayout from '../../../../layouts/HomeAdminLayout';
import EventModal from '../components/EventModal';
import PackageModal from '../components/PackageModal';
import DocumentModal from '../components/DocumentModal';
import SuccessAlert from '../components/SuccessAlert';
import '../styles/AdminEvents.css';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

interface Event {
    id: number;
    nombre: string;
    descripcion: string;
    duracion?: string;
    precio?: number;
    estado?: boolean;
}

interface Package {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad_eventos: number;
    precio: number;
    evento_nombre?: string;
    estado?: boolean;
}

interface DocumentType {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    requiereSubida?: boolean;
    requierePresencial?: boolean;
    estado?: boolean;
}

const AdminEvents: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal states for events
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

    // Modal states for packages
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [packageModalMode, setPackageModalMode] = useState<'add' | 'edit'>('add');
    const [selectedPackage, setSelectedPackage] = useState<Package | undefined>(undefined);

    // Modal states for documents
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [documentModalMode, setDocumentModalMode] = useState<'add' | 'edit'>('add');
    const [selectedDocument, setSelectedDocument] = useState<DocumentType | undefined>(undefined);

    // Alert states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const headers = getAuthHeaders();
                
                // Fetch eventos
                const eventsRes = await fetch('/api/admin/events', { headers });
                if (!eventsRes.ok) throw new Error(`Events: ${eventsRes.status}`);
                const eventsData = await eventsRes.json();
                console.log('Events data:', eventsData);
                if (eventsData && Array.isArray(eventsData)) {
                    setEvents(eventsData);
                }

                // Fetch paquetes
                const packagesRes = await fetch('/api/admin/packages', { headers });
                if (!packagesRes.ok) throw new Error(`Packages: ${packagesRes.status}`);
                const packagesData = await packagesRes.json();
                console.log('Packages data:', packagesData);
                if (packagesData && Array.isArray(packagesData)) {
                    setPackages(packagesData);
                }

                // Fetch tipos de documentos
                const docsRes = await fetch('/api/admin/document-types', { headers });
                if (!docsRes.ok) throw new Error(`Docs: ${docsRes.status}`);
                const docsData = await docsRes.json();
                console.log('Docs data:', docsData);
                if (docsData && Array.isArray(docsData)) {
                    setDocumentTypes(docsData);
                }

                setError(null);
            } catch (err: any) {
                console.error('Error cargando datos:', err);
                setError(err.message || 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Función auxiliar para mostrar alertas
    const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

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
            const newState = !events.find(e => e.id === id)?.estado;
            setEvents(events.map(e => e.id === id ? { ...e, estado: newState } : e));
            // Guardar en base de datos
            updateEventStatus(id, newState);
        } else if (type === "package") {
            const newState = !packages.find(p => p.id === id)?.estado;
            setPackages(packages.map(p => p.id === id ? { ...p, estado: newState } : p));
            updatePackageStatus(id, newState);
        } else if (type === "documentType") {
            const newState = !documentTypes.find(d => d.id === id)?.estado;
            setDocumentTypes(documentTypes.map(d => d.id === id ? { ...d, estado: newState } : d));
            updateDocumentStatus(id, newState);
        }
    };

    const updateEventStatus = async (eventId: number, newStatus: boolean | undefined) => {
        try {
            const response = await fetch(`/api/admin/events/${eventId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ estado: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            console.log(`Event ${eventId} status updated to ${newStatus}`);
        } catch (err: any) {
            console.error('Error updating event status:', err);
            alert('Error al actualizar el estado del evento');
        }
    };

    const updatePackageStatus = async (packageId: number, newStatus: boolean | undefined) => {
        try {
            const response = await fetch(`/api/admin/packages/${packageId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ estado: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            console.log(`Package ${packageId} status updated to ${newStatus}`);
        } catch (err: any) {
            console.error('Error updating package status:', err);
            alert('Error al actualizar el estado del paquete');
        }
    };

    const updateDocumentStatus = async (documentId: number, newStatus: boolean | undefined) => {
        try {
            const response = await fetch(`/api/admin/document-types/${documentId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ estado: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            console.log(`Document ${documentId} status updated to ${newStatus}`);
        } catch (err: any) {
            console.error('Error updating document status:', err);
            alert('Error al actualizar el estado del documento');
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (event: Event) => {
        setModalMode('edit');
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    // Packages modal handlers
    const openAddPackageModal = () => {
        setPackageModalMode('add');
        setSelectedPackage(undefined);
        setIsPackageModalOpen(true);
    };

    const openEditPackageModal = (pkg: Package) => {
        setPackageModalMode('edit');
        setSelectedPackage(pkg);
        setIsPackageModalOpen(true);
    };

    const handlePackageModalSubmit = async (data: { nombre: string; descripcion: string; precio: number; eventId?: number }) => {
        if (packageModalMode === 'add') {
            await addPackage(data);
        } else {
            if (selectedPackage) {
                await editPackage(selectedPackage.id, data);
            }
        }
    };

    const addPackage = async (data: { nombre: string; descripcion: string; precio: number; eventId?: number }) => {
        try {
            const response = await fetch('/api/admin/packages', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: data.nombre, descripcion: data.descripcion, precio: data.precio, eventId: data.eventId }),
            });

            if (!response.ok) {
                let errorData = null;
                try { errorData = await response.json(); } catch(e) { /* ignore */ }
                const msg = errorData?.error || errorData?.message || JSON.stringify(errorData) || `Error: ${response.status}`;
                throw new Error(msg);
            }

            const newPkg = await response.json();
            console.log('Package added:', newPkg);
            fetchPackages();
            showAlert(`Paquete "${data.nombre}" agregado exitosamente`, 'success');
        } catch (err: any) {
            console.error('Error adding package:', err);
            showAlert(`Error al agregar paquete: ${err.message}`, 'error');
            throw err;
        }
    };

    const editPackage = async (packageId: number, data: { nombre: string; descripcion: string; precio: number; eventId?: number }) => {
        try {
            const response = await fetch(`/api/admin/packages/${packageId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: data.nombre, descripcion: data.descripcion, precio: data.precio, eventId: data.eventId }),
            });

            if (!response.ok) {
                let errorData = null;
                try { errorData = await response.json(); } catch(e) { /* ignore */ }
                const msg = errorData?.error || errorData?.message || JSON.stringify(errorData) || `Error: ${response.status}`;
                throw new Error(msg);
            }

            const updated = await response.json();
            console.log('Package updated:', updated);
            setPackages(packages.map(p => p.id === packageId ? { ...p, nombre: data.nombre, descripcion: data.descripcion, precio: data.precio, evento_nombre: updated.evento_nombre } : p));
            showAlert(`Paquete "${data.nombre}" editado exitosamente`, 'success');
        } catch (err: any) {
            console.error('Error editing package:', err);
            showAlert(`Error al editar paquete: ${err.message}`, 'error');
            throw err;
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await fetch('/api/admin/packages', { headers: getAuthHeaders() });
            if (!response.ok) throw new Error(`Packages: ${response.status}`);
            const data = await response.json();
            console.log('Packages data:', data);
            if (data && Array.isArray(data)) {
                setPackages(data);
            }
        } catch (err: any) {
            console.error('Error fetching packages:', err);
        }
    };
    
    const openAddDocumentModal = () => {
        setDocumentModalMode('add');
        setSelectedDocument(undefined);
        setIsDocumentModalOpen(true);
    };

    const openEditDocumentModal = (doc: DocumentType) => {
        setDocumentModalMode('edit');
        setSelectedDocument(doc);
        setIsDocumentModalOpen(true);
    };

    const handleDocumentModalSubmit = async (data: { nombre: string; descripcion: string; cantidad: number; precio: number; requiereSubida: boolean; requierePresencial: boolean }) => {
        if (documentModalMode === 'add') {
            await addDocument(data);
        } else {
            if (selectedDocument) {
                await editDocument(selectedDocument.id, data);
            }
        }
    };

    const addDocument = async (data: { nombre: string; descripcion: string; cantidad: number; precio: number; requiereSubida: boolean; requierePresencial: boolean }) => {
        try {
            const response = await fetch('/api/admin/document-types', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: data.nombre, descripcion: data.descripcion, cantidad: data.cantidad, precio: data.precio, requiereSubida: data.requiereSubida, requierePresencial: data.requierePresencial }),
            });

            if (!response.ok) {
                let errorData = null;
                try { errorData = await response.json(); } catch(e) { /* ignore */ }
                const msg = errorData?.error || errorData?.message || JSON.stringify(errorData) || `Error: ${response.status}`;
                throw new Error(msg);
            }

            const newDoc = await response.json();
            console.log('Document added:', newDoc);
            fetchDocuments();
            showAlert(`Documento "${data.nombre}" agregado exitosamente`, 'success');
        } catch (err: any) {
            console.error('Error adding document:', err);
            showAlert(`Error al agregar documento: ${err.message}`, 'error');
            throw err;
        }
    };

    const editDocument = async (documentId: number, data: { nombre: string; descripcion: string; cantidad: number; precio: number; requiereSubida: boolean; requierePresencial: boolean }) => {
        try {
            const response = await fetch(`/api/admin/document-types/${documentId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: data.nombre, descripcion: data.descripcion, cantidad: data.cantidad, precio: data.precio, requiereSubida: data.requiereSubida, requierePresencial: data.requierePresencial }),
            });

            if (!response.ok) {
                let errorData = null;
                try { errorData = await response.json(); } catch(e) { /* ignore */ }
                const msg = errorData?.error || errorData?.message || JSON.stringify(errorData) || `Error: ${response.status}`;
                throw new Error(msg);
            }

            const updated = await response.json();
            console.log('Document updated:', updated);
            setDocumentTypes(documentTypes.map(d => d.id === documentId ? { ...d, nombre: data.nombre, descripcion: data.descripcion, cantidad: data.cantidad, precio: data.precio, requiereSubida: data.requiereSubida, requierePresencial: data.requierePresencial } : d));
            showAlert(`Documento "${data.nombre}" editado exitosamente`, 'success');
        } catch (err: any) {
            console.error('Error editing document:', err);
            showAlert(`Error al editar documento: ${err.message}`, 'error');
            throw err;
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/admin/document-types', { headers: getAuthHeaders() });
            if (!response.ok) throw new Error(`Documents: ${response.status}`);
            const data = await response.json();
            console.log('Documents data:', data);
            if (data && Array.isArray(data)) {
                setDocumentTypes(data);
            }
        } catch (err: any) {
            console.error('Error fetching documents:', err);
        }
    };

    const handleModalSubmit = async (data: { nombre: string; descripcion: string }) => {
        if (modalMode === 'add') {
            await addEvent(data);
        } else {
            if (selectedEvent) {
                await editEvent(selectedEvent.id, data);
            }
        }
    };

    const addEvent = async (data: { nombre: string; descripcion: string }) => {
        try {
            const response = await fetch('/api/admin/events', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const newEvent = await response.json();
            console.log('Event added:', newEvent);
        
            fetchEvents();
            showAlert(`Evento "${data.nombre}" agregado exitosamente`, 'success');
        } catch (err: any) {
            console.error('Error adding event:', err);
            showAlert(`Error al agregar evento: ${err.message}`, 'error');
            throw err;
        }
    };

    const editEvent = async (eventId: number, data: { nombre: string; descripcion: string }) => {
        try {
            const response = await fetch(`/api/admin/events/${eventId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const updatedEvent = await response.json();
            console.log('Event updated:', updatedEvent);

            setEvents(events.map(e => e.id === eventId ? { ...e, ...data } : e));
            showAlert(`Evento "${data.nombre}" editado exitosamente`, 'success');
        } catch (err: any) {
            console.error('Error editing event:', err);
            showAlert(`Error al editar evento: ${err.message}`, 'error');
            throw err;
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/admin/events', { headers: getAuthHeaders() });
            if (!response.ok) throw new Error(`Events: ${response.status}`);
            const data = await response.json();
            console.log('Events data:', data);
            if (data && Array.isArray(data)) {
                setEvents(data);
            }
        } catch (err: any) {
            console.error('Error fetching events:', err);
        }
    };

    return (
        <HomeAdminLayout>
            <SuccessAlert
                message={alertMessage}
                visible={alertVisible}
                onClose={() => setAlertVisible(false)}
                type={alertType}
            />
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedEvent}
                mode={modalMode}
            />
            <PackageModal
                isOpen={isPackageModalOpen}
                onClose={() => setIsPackageModalOpen(false)}
                onSubmit={handlePackageModalSubmit}
                initialData={selectedPackage as any}
                eventsList={events.map(ev => ({ id: ev.id, nombre: ev.nombre }))}
                mode={packageModalMode}
            />
            <DocumentModal
                isOpen={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                onSubmit={handleDocumentModalSubmit}
                initialData={selectedDocument}
                mode={documentModalMode}
            />
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

                {error && <div style={{ color: 'red', padding: '12px', margin: '12px 0', borderRadius: '8px', backgroundColor: '#ffebee' }}>{error}</div>}
                {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Cargando datos...</div>}

                {!loading && (
                <>
                {/* EVENTOS SECTION */}
                <section className="admin-events-section">
                    <div className="admin-events-header">
                        <h3 className="admin-events-title">Eventos</h3>
                        <button className="admin-events-add-btn" onClick={openAddModal}>Agregar +</button>
                    </div>
                    
                    {filteredEvents.length === 0 ? (
                        <p className="admin-events-empty">No hay eventos.</p>
                    ) : (
                        <div className="admin-events-grid">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="admin-events-card">
                                    <h5 className="card-title">{event.nombre}</h5>
                                    <p className="card-detail">{event.descripcion}</p>
                                    <div className="card-actions">
                                        <button className="btn-edit" onClick={() => openEditModal(event)}>Editar</button>
                                        <button 
                                            className={`btn-toggle ${event.estado ? 'enabled' : 'disabled'}`}
                                            onClick={() => handleToggleStatus('event', event.id)}
                                        >
                                            {event.estado ? 'Habilitado' : 'Deshabilitado'}
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
                        <button className="admin-events-add-btn" onClick={openAddPackageModal}>Agregar +</button>
                    </div>
                    
                    {filteredPackages.length === 0 ? (
                        <p className="admin-events-empty">No hay paquetes.</p>
                    ) : (
                        <div className="admin-events-grid">
                            {filteredPackages.map(pkg => (
                                <div key={pkg.id} className="admin-events-card">
                                    <h5 className="card-title">{pkg.nombre}</h5>
                                    <p className="card-detail">{pkg.descripcion}</p>
                                    <p className="card-detail" style={{ fontSize: '0.85rem', color: '#6b7280' }}>Evento: {pkg.evento_nombre}</p>
                                    <p className="card-price">${pkg.precio.toLocaleString()}</p>
                                    <div className="card-actions">
                                        <button className="btn-edit" onClick={() => openEditPackageModal(pkg)}>Editar</button>
                                        <button 
                                            className={`btn-toggle ${pkg.estado ? 'enabled' : 'disabled'}`}
                                            onClick={() => handleToggleStatus('package', pkg.id)}
                                        >
                                            {pkg.estado ? 'Habilitado' : 'Deshabilitado'}
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
                        <button className="admin-events-add-btn" onClick={openAddDocumentModal}>Agregar +</button>
                    </div>
                    
                    {filteredDocumentTypes.length === 0 ? (
                        <p className="admin-events-empty">No hay documentos.</p>
                    ) : (
                        <div className="admin-events-grid">
                            {filteredDocumentTypes.map(doc => (
                                <div key={doc.id} className="admin-events-card">
                                    <h5 className="card-title">{doc.nombre}</h5>
                                    <p className="card-detail">{doc.descripcion}</p>
                                    <p className="card-detail" style={{ fontSize: '0.85rem' }}>{doc.cantidad} fotos</p>
                                    <p className="card-price">${doc.precio.toLocaleString()}</p>
                                    <div style={{ display: 'flex', gap: '12px', margin: '8px 0', fontSize: '0.85rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={doc.requiereSubida ?? false}
                                                readOnly
                                            />
                                            Requiere subida
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={doc.requierePresencial ?? false}
                                                readOnly
                                            />
                                            Presencial
                                        </label>
                                    </div>
                                    <div className="card-actions">
                                        <button className="btn-edit" onClick={() => openEditDocumentModal(doc)}>Editar</button>
                                        <button 
                                            className={`btn-toggle ${doc.estado ? 'enabled' : 'disabled'}`}
                                            onClick={() => handleToggleStatus('documentType', doc.id)}
                                        >
                                            {doc.estado ? 'Habilitado' : 'Deshabilitado'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                </>
                )}
            </div>
        </HomeAdminLayout>
    );
};

export default AdminEvents;