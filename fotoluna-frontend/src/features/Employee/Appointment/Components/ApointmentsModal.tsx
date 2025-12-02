import React, { useRef, useCallback } from "react";
// 🚨 CORRECCIÓN 1: Importar TODOS los tipos necesarios desde el archivo central types.ts
import type {ExtendedCitaFormData } from "../Components/Types/types";

// Asumimos que CustomerOption y EventOption se definen e importan desde types.ts
interface CustomerOption { id: number; name: string; }
interface EventOption { id: number; name: string; }

// 🚨 CORRECCIÓN 2: ELIMINAR type ExtendedCitaFormData de este archivo.
// ELIMINAR:
/*
type ExtendedCitaFormData = CitaFormData & {
    customerIdFK: number | null;
    eventIdFK: number | null;
    appointmentDuration: number;
    employeeIdFK: number | null;
};
*/


// 🚨 CORRECCIÓN 3: La interfaz de props usa el tipo importado/definido
interface AppointmentModalProps {
    show: boolean;
    isEditing: boolean;
    form: ExtendedCitaFormData; // Usa el tipo ExtendedCitaFormData (debe estar importado/definido)
    errors: Record<string, string>;
    success: string;

    customers: CustomerOption[]; // Resultados de la búsqueda
    events: EventOption[];       // Lista de eventos
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
    onClientSelect,
    onSearchClient,
}) => {
    if (!show) return null;

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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
                        {/* El campo employeeIdFK NO es visible, viaja en el payload */}
                        {/* <input type="hidden" name="employeeIdFK" value={form.employeeIdFK ?? ''} /> */}


                        {errors.client && (<div className="text-danger small">{errors.client}</div>)}

                        {/* Dropdown de Resultados */}
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

                    {/* 3. DURACIÓN (appointmentDuration) */}
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