import React, { useRef, useCallback, useMemo } from "react";
import type { ExtendedCitaFormData } from "../Components/Types/types";

interface CustomerOption { id: number; name: string; }
interface EventOption { id: number; name: string; }
interface PackageOption { id: number; name: string; documentTypeIdFK: number | null; }
interface DocumentTypeOption { id: number; name: string; }

interface AppointmentModalProps {
    show: boolean;
    isEditing: boolean;
    form: ExtendedCitaFormData;
    errors: Record<string, string>;
    success: string;
    allowedStatuses?: string[];
    canEditDateTime?: boolean;

    customers: CustomerOption[];
    events: EventOption[];
    packages: PackageOption[];
    documentTypes: DocumentTypeOption[];

    onClientSelect: (id: number, name: string) => void;
    onSearchClient: (query: string) => void;
    onAddCustomerClick: () => void;

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
    allowedStatuses = [],
    canEditDateTime = true,
    onChange,
    onSubmit,
    onClose,
    customers,
    events,
    packages,
    documentTypes,
    onClientSelect,
    onSearchClient,
    onAddCustomerClick,
}) => {
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const DOCUMENT_EVENT_ID = 6;

    const selectedPackageNeedsDocumentField = useMemo(() => {
        if (!form.packageIdFK) return false;
        if (form.eventIdFK === DOCUMENT_EVENT_ID) return false;
        const pkg = packages.find((p) => p.id === form.packageIdFK);
        return pkg?.documentTypeIdFK !== null;
    }, [form.packageIdFK, packages, form.eventIdFK]);

    const handleClientChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        onChange(e);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (query.length > 2) {
            searchTimeout.current = setTimeout(() => {
                onSearchClient(query);
            }, 300);
        } else {
            onSearchClient("");
        }
    }, [onChange, onSearchClient]);

    const handleSelectCustomer = useCallback((id: number, name: string) => {
        onClientSelect(id, name);
    }, [onClientSelect]);

    if (!show) return null;

    return (
        <div className="modal-cita-backdrop" onClick={onClose}>
            <div className="modal-cita-modern shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Cabecera del Modal */}
                <div className="modal-cita-header">
                    <div className="d-flex align-items-center gap-3">
                        <div className="modal-header-icon-box">
                            <i className={`bi ${isEditing ? "bi-pencil-square" : "bi-calendar-plus-fill"}`}></i>
                        </div>
                        <div>
                            <h4 className="modal-header-title mb-0">
                                {isEditing ? "Modificar Cita" : "Nueva Reserva de Cita"}
                            </h4>
                            <p className="modal-header-subtitle mb-0">
                                {isEditing
                                    ? "Actualiza los detalles y estado de la sesión"
                                    : "Agenda una sesión fotográfica o trámite de documento"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        title="Cerrar ventana"
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Formulario */}
                <form className="modal-cita-body appointment-form" onSubmit={onSubmit}>
                    {/* Búsqueda de Cliente */}
                    <div className="form-group-modern position-relative mb-3">
                        <label className="form-label-modern">
                            <i className="bi bi-person-fill text-purple me-1"></i>
                            Cliente <span className="text-danger">*</span>
                        </label>
                        <div className="input-group-modern">
                            <div className="input-with-icon flex-grow-1">
                                <i className="bi bi-search input-icon-left"></i>
                                <input
                                    type="text"
                                    className="form-control-modern with-icon"
                                    name="client"
                                    value={form.client}
                                    onChange={handleClientChange}
                                    disabled={isEditing && form.customerIdFK !== null}
                                    autoComplete="off"
                                    placeholder="Buscar por nombre o documento..."
                                    required={!isEditing}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn-add-client-fast"
                                onClick={onAddCustomerClick}
                                title="Crear nuevo cliente rápido"
                            >
                                <i className="bi bi-person-plus-fill me-1" />
                                <span>Nuevo</span>
                            </button>
                        </div>

                        <input type="hidden" name="customerIdFK" value={form.customerIdFK ?? ""} />
                        {errors.client && <div className="form-feedback-error">{errors.client}</div>}

                        {/* Autocomplete desplegable */}
                        {customers.length > 0 && !isEditing && (
                            <ul className="autocomplete-dropdown-modern shadow">
                                {customers.map((c) => (
                                    <li
                                        key={c.id}
                                        className="autocomplete-item"
                                        onClick={() => handleSelectCustomer(c.id, c.name)}
                                    >
                                        <div className="client-auto-avatar">
                                            <i className="bi bi-person"></i>
                                        </div>
                                        <div className="client-auto-info">
                                            <span className="client-auto-name">{c.name}</span>
                                            <span className="client-auto-id">ID: #{c.id}</span>
                                        </div>
                                        <i className="bi bi-check2 text-purple ms-auto"></i>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {form.customerIdFK && (
                            <div className="client-selected-badge mt-2">
                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                <span>Cliente seleccionado (ID: #{form.customerIdFK})</span>
                            </div>
                        )}
                    </div>

                    <div className="row g-3">
                        {/* Evento */}
                        <div className="col-md-6">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-camera-fill text-purple me-1"></i>
                                    Tipo de Evento <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="eventIdFK"
                                    className="form-select-modern"
                                    value={form.eventIdFK ?? ""}
                                    onChange={onChange}
                                    required={!isEditing}
                                    disabled={isEditing}
                                >
                                    <option value="">Seleccione un evento...</option>
                                    {events.map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.eventIdFK && <div className="form-feedback-error">{errors.eventIdFK}</div>}
                            </div>
                        </div>

                        {/* Paquete o Tipo Doc */}
                        <div className="col-md-6">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-box-seam-fill text-purple me-1"></i>
                                    {form.eventIdFK === DOCUMENT_EVENT_ID ? "Tipo Doc. Principal" : "Paquete"} <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="packageIdFK"
                                    className="form-select-modern"
                                    value={form.packageIdFK ?? ""}
                                    onChange={onChange}
                                    required={!isEditing && !!form.eventIdFK}
                                    disabled={isEditing || !form.eventIdFK}
                                >
                                    <option value="">
                                        {form.eventIdFK === DOCUMENT_EVENT_ID
                                            ? "Seleccione un documento..."
                                            : "Seleccione un paquete..."}
                                    </option>
                                    {packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.packageIdFK && <div className="form-feedback-error">{errors.packageIdFK}</div>}
                            </div>
                        </div>

                        {/* Tipo Doc. Requerido si aplica */}
                        {!isEditing && selectedPackageNeedsDocumentField && (
                            <div className="col-12">
                                <div className="form-group-modern">
                                    <label className="form-label-modern">
                                        <i className="bi bi-card-checklist text-purple me-1"></i>
                                        Tipo Doc. Requerido
                                    </label>
                                    <select
                                        name="documentTypeIdFK"
                                        className="form-select-modern"
                                        value={form.documentTypeIdFK ?? ""}
                                        onChange={onChange}
                                        required={!isEditing}
                                        disabled={isEditing}
                                    >
                                        <option value="">Seleccione tipo de documento...</option>
                                        {documentTypes.map((docType) => (
                                            <option key={docType.id} value={docType.id}>
                                                {docType.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.documentTypeIdFK && (
                                        <div className="form-feedback-error">{errors.documentTypeIdFK}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Fecha */}
                        <div className="col-md-6">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-calendar-date text-purple me-1"></i>
                                    Fecha <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control-modern"
                                    name="date"
                                    value={form.date}
                                    onChange={onChange}
                                    required
                                    disabled={isEditing && !canEditDateTime}
                                />
                                {errors.date && <div className="form-feedback-error">{errors.date}</div>}
                                {isEditing && !canEditDateTime && (
                                    <div className="form-feedback-hint">
                                        No se puede modificar fecha pasadas 24h.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hora de Inicio */}
                        <div className="col-md-6">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-clock-fill text-purple me-1"></i>
                                    Hora de Inicio <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="time"
                                    className="form-control-modern"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={onChange}
                                    required
                                    disabled={isEditing && !canEditDateTime}
                                />
                                {errors.startTime && <div className="form-feedback-error">{errors.startTime}</div>}
                                {isEditing && !canEditDateTime && (
                                    <div className="form-feedback-hint">
                                        No se puede modificar hora pasadas 24h.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Duración */}
                        <div className="col-md-6">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-hourglass-top text-purple me-1"></i>
                                    Duración Estimada (min) <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control-modern"
                                    name="appointmentDuration"
                                    value={form.appointmentDuration ?? 60}
                                    onChange={onChange}
                                    min="15"
                                    step="15"
                                    required
                                    disabled={isEditing}
                                />
                                {errors.appointmentDuration && (
                                    <div className="form-feedback-error">{errors.appointmentDuration}</div>
                                )}
                            </div>
                        </div>

                        {/* Estado (solo en edición) */}
                        {isEditing && (
                            <div className="col-md-6">
                                <div className="form-group-modern">
                                    <label className="form-label-modern">
                                        <i className="bi bi-flag-fill text-purple me-1"></i>
                                        Estado de la Cita
                                    </label>
                                    <select
                                        name="status"
                                        className="form-select-modern"
                                        value={form.status}
                                        onChange={onChange}
                                        disabled={allowedStatuses.length <= 1}
                                    >
                                        {allowedStatuses.length > 0 ? (
                                            allowedStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="Confirmada">Confirmada</option>
                                                <option value="Cancelada">Cancelada</option>
                                                <option value="Completada">Completada</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Localización */}
                        <div className="col-12">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-geo-alt-fill text-purple me-1"></i>
                                    Lugar / Dirección <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control-modern"
                                    name="location"
                                    value={form.location}
                                    onChange={onChange}
                                    placeholder="Ej: Estudio FotoLuna, Carrera 12 # 34-56..."
                                    required
                                    disabled={isEditing && !canEditDateTime}
                                />
                                {errors.location && <div className="form-feedback-error">{errors.location}</div>}
                                {isEditing && !canEditDateTime && (
                                    <div className="form-feedback-hint">
                                        No se puede modificar ubicación pasadas 24h.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notas */}
                        <div className="col-12">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="bi bi-chat-left-text-fill text-purple me-1"></i>
                                    Notas y Especificaciones
                                </label>
                                <textarea
                                    className="form-control-modern"
                                    name="notes"
                                    rows={3}
                                    placeholder="Detalles sobre vestuario, número de personas, requerimientos especiales..."
                                    value={form.notes}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Alertas */}
                    {success && (
                        <div className="alert-modal-success mt-3">
                            <i className="bi bi-check-circle-fill me-2" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="modal-actions-container mt-4">
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={onClose}
                        >
                            <i className="bi bi-x-circle me-1" />
                            Cancelar
                        </button>
                        <button type="submit" className="btn-modal-submit">
                            <i className={`bi ${isEditing ? "bi-check2-circle" : "bi-save-fill"} me-1`} />
                            {isEditing ? "Guardar Cambios" : "Confirmar Cita"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AppointmentModal;
