import React, { useRef, useCallback, useMemo } from "react";
import type { ExtendedCitaFormData } from "../Components/Types/types";

// Asumimos que CustomerOption, EventOption, PackageOption y DocumentTypeOption están definidos en types.ts
interface CustomerOption { id: number; name: string; }
interface EventOption { id: number; name: string; }
interface PackageOption { id: number; name: string; documentTypeIdFK: number | null; } // Puede tener null si es un paquete normal
interface DocumentTypeOption { id: number; name: string; } // Lista completa de la BD

interface AppointmentModalProps {
    show: boolean;
    isEditing: boolean;
    form: ExtendedCitaFormData;
    errors: Record<string, string>;
    success: string;

    customers: CustomerOption[];
    events: EventOption[];
    packages: PackageOption[]; // Lista de Paquetes/Documentos filtrada por Evento
    documentTypes: DocumentTypeOption[]; // Lista global de Tipos de Documento (solo si se necesita)

    onClientSelect: (id: number, name: string) => void;
    onSearchClient: (query: string) => void;

    onChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = React.memo(({
    show,
    isEditing,
    form,
    errors,
    success,
    onChange,
    onSubmit,
    onClose,
    customers,
    events,
    packages,
    documentTypes, // 🟢 USAR ESTA PROP
    onClientSelect,
    onSearchClient,
}) => {
    if (!show) return null;

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const DOCUMENT_EVENT_ID = 6;

    // Lógica para determinar si el campo Tipo Documento debe mostrarse
    const selectedPackageNeedsDocumentField = useMemo(() => {
        if (!form.packageIdFK) return false;

        // Si el Evento es "Documento" (ID 6), el campo Tipo Documento NO SE MUESTRA, 
        // porque el select de Paquetes ya es la lista de Tipos de Documento.
        if (form.eventIdFK === DOCUMENT_EVENT_ID) {
            return false;
        }

        // Si es un Evento normal, verificamos si el paquete seleccionado tiene documentTypeIdFK no nulo.
        const pkg = packages.find(p => p.id === form.packageIdFK);
        return pkg?.documentTypeIdFK !== null;
    }, [form.packageIdFK, packages, form.eventIdFK, DOCUMENT_EVENT_ID]);


    // 1. Handler con Debounce para la Búsqueda de Cliente
    const handleClientChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        onChange(e);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (query.length > 2) {
            searchTimeout.current = setTimeout(() => {
                onSearchClient(query);
            }, 300);
        } else {
            onSearchClient('');
        }
    }, [onChange, onSearchClient]);

    // 2. Handler al seleccionar un cliente de la lista
    const handleSelectCustomer = useCallback((id: number, name: string) => {
        onClientSelect(id, name);
    }, [onClientSelect]);


    return (
        <div className="modal-cita-backdrop" onClick={onClose}>
            <div className="modal-cita" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-3">
                    <i
                        className={`fas ${isEditing ? "fa-edit" : "fa-calendar-plus"} me-2`}
                    />
                    {isEditing ? "Editar Cita" : "Registrar Nueva Cita"}
                </h2>

                <form
                    className="row g-3 needs-validation appointment-form"
                    onSubmit={onSubmit}
                >
                    {/* 1. CLIENTE (AUTOCOMPLETADO) */}
                    <div className="col-mb-4 position-relative">
                        <label className="form-label col-lg-3">Cliente:</label>
                        <input
                            type="text"
                            className="col-lg-9 form-control-s"
                            name="client"
                            value={form.client}
                            onChange={handleClientChange}
                            disabled={isEditing && form.customerIdFK !== null}
                            autoComplete="off"
                            placeholder="Nombre o Documento del Cliente"
                            required={!isEditing}
                        />

                        <input type="hidden" name="customerIdFK" value={form.customerIdFK ?? ''} />
                        {errors.client && (<div className="text-danger small">{errors.client}</div>)}

                        {customers.length > 0 && !isEditing && (
                            <ul className="autocomplete-dropdown list-group shadow">
                                {customers.map((c) => (
                                    <li
                                        key={c.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => handleSelectCustomer(c.id, c.name)}
                                    >
                                        {c.name} (ID: {c.id})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {form.customerIdFK && (
                            <div className="text-success small mt-1">
                                Cliente ID: **{form.customerIdFK}** seleccionado.
                            </div>
                        )}
                    </div>

                    {/* 2. EVENTO (eventIdFK) - SELECT */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Evento:</label>

                        <select
                            name="eventIdFK"
                            className="col-lg-9 form-select-s"
                            value={form.eventIdFK ?? ''}
                            onChange={onChange}
                            required={!isEditing}
                            disabled={isEditing}
                        >
                            <option key="select-event-placeholder" value="">
                                Seleccione un evento...
                            </option>

                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.name}
                                </option>
                            ))}
                        </select>
                        {errors.eventIdFK && (
                            <div className="text-danger small">{errors.eventIdFK}</div>
                        )}
                    </div>

                    {/* 🟢 3. PAQUETE / TIPO DE DOCUMENTO PRINCIPAL (packageIdFK) - SELECT */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">
                            {form.eventIdFK === DOCUMENT_EVENT_ID ? 'Tipo Doc. Principal:' : 'Paquete:'}
                        </label>
                        <select
                            name="packageIdFK"
                            className="col-lg-9 form-select-s"
                            value={form.packageIdFK ?? ''}
                            onChange={onChange}
                            required={!isEditing && !!form.eventIdFK}
                            disabled={isEditing || !form.eventIdFK}
                        >
                            <option value="">
                                {form.eventIdFK === DOCUMENT_EVENT_ID ? 'Seleccione un documento...' : 'Seleccione un paquete...'}
                            </option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </option>
                            ))}
                        </select>
                        {errors.packageIdFK && (<div className="text-danger small">{errors.packageIdFK}</div>)}
                    </div>

                    {/* 🟢 4. TIPO DE DOCUMENTO SECUNDARIO (documentTypeIdFK) - SELECT */}
                    {/* Solo se muestra si NO es el Evento Documento Y si el paquete seleccionado lo exige */}
                    {!isEditing && selectedPackageNeedsDocumentField && (
                        <div className="col-mb-4">
                            <label className="form-label col-lg-3">Tipo Doc. Requerido:</label>
                            <select
                                name="documentTypeIdFK"
                                className="col-lg-9 form-select-s"
                                value={form.documentTypeIdFK ?? ''}
                                onChange={onChange}
                                required={!isEditing} // Si se muestra, es requerido
                                disabled={isEditing}
                            >
                                <option value="">Seleccione tipo de documento...</option>
                                {/* USAMOS LA LISTA GLOBAL documentTypes */}
                                {documentTypes.map((docType) => (
                                    <option key={docType.id} value={docType.id}>
                                        {docType.name}
                                    </option>
                                ))}
                            </select>
                            {errors.documentTypeIdFK && (<div className="text-danger small">{errors.documentTypeIdFK}</div>)}
                        </div>
                    )}

                    {/* ... (Duración, Fecha, Hora, Estado, Localización, Notas) ... */}

                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Duración (min):</label>
                        <input
                            type="number"
                            className="col-lg-9 form-control-s"
                            name="appointmentDuration"
                            value={form.appointmentDuration ?? 60}
                            onChange={onChange}
                            min="15"
                            step="15"
                            required
                            disabled={isEditing}
                        />
                        {errors.appointmentDuration && (
                            <div className="text-danger small">{errors.appointmentDuration}</div>
                        )}
                    </div>

                    {/* FECHA */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Fecha:</label>
                        <input
                            type="date"
                            className="col-lg-9 form-control-s"
                            name="date"
                            value={form.date}
                            onChange={onChange}
                            required
                        />
                        {errors.date && (<div className="text-danger small">{errors.date}</div>)}
                    </div>

                    {/* HORA DE INICIO */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Hora de Inicio:</label>
                        <input
                            type="time"
                            className="col-lg-9 form-control-s"
                            name="startTime"
                            value={form.startTime}
                            onChange={onChange}
                            required
                        />
                        {errors.startTime && (<div className="text-danger small">{errors.startTime}</div>)}
                    </div>

                    {/* ESTADO (SOLO AL EDITAR) */}
                    {isEditing && (
                        <div className="col-mb-4">
                            <label className="form-label col-lg-3">Estado:</label>
                            <select
                                name="status"
                                className="col-lg-9 form-select-s"
                                value={form.status}
                                onChange={onChange}
                            >
                                <option key="status-pending" value="Pendiente">Pendiente</option>
                                <option key="status-scheduled" value="Confirmada">Confirmada</option>
                                <option key="status-cancelled" value="Cancelada">Cancelada</option>
                                <option key="status-completed" value="Completada">Completada</option>
                            </select>
                        </div>
                    )}

                    {/* LOCALIZACIÓN */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Localización:</label>
                        <input
                            className="col-lg-9 form-control-s"
                            name="location"
                            value={form.location}
                            onChange={onChange}
                            placeholder="Localización"
                            required
                        />
                        {errors.location && (<div className="text-danger small">{errors.location}</div>)}
                    </div>

                    {/* NOTAS */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Notas:</label>
                        <textarea
                            className="col-lg-9 form-control-s"
                            name="notes"
                            rows={3}
                            placeholder="Notas adicionales..."
                            value={form.notes}
                            onChange={onChange}
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="appointment-form-buttons">
                        <button type="submit" className="accept-btn">
                            <i className="fas fa-save me-1" />
                            {isEditing ? "Actualizar" : "Guardar"}
                        </button>
                        <button
                            type="button"
                            className="reject-btn"
                            onClick={onClose}
                        >
                            <i className="fas fa-times me-1" />
                            Cancelar
                        </button>
                    </div>

                    {success && (
                        <div className="alert alert-success mt-3 text-center">
                            <i className="fas fa-check-circle me-2" />
                            {success}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
});

export default AppointmentModal;