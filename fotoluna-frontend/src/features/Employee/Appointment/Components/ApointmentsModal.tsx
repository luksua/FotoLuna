import React from "react";
import type { CitaFormData, CitaStatus } from "../Components/Types/types";

interface AppointmentModalProps {
    show: boolean;
    isEditing: boolean;
    form: CitaFormData;
    errors: Record<string, string>;
    success: string;
    onChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
    
    show,
    isEditing,
    form,
    errors,
    success,
    onChange,
    onSubmit,
    onClose,
}) => {
    if (!show) return null;

    return (
        <div className="modal-cita-backdrop" onClick={onClose}>
            <div className="modal-cita" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-3">
                    <i
                        className={`fas ${isEditing ? "fa-edit" : "fa-calendar-plus"
                            } me-2`}
                    />
                    {isEditing ? "Editar Cita" : "Registrar Nueva Cita"}
                </h2>

                <form
                    className="row g-3 needs-validation appointment-form"
                    onSubmit={onSubmit}
                >
                    {/* CLIENTE */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">Cliente:</label>
                        <input
                            type="text"
                            className="col-lg-9 form-control-s"
                            name="client"
                            value={form.client}
                            onChange={onChange}
                            disabled={isEditing}
                            required
                        />
                        {errors.client && (
                            <div className="text-danger small">
                                {errors.client}
                            </div>
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
                        {errors.date && (
                            <div className="text-danger small">{errors.date}</div>
                        )}
                    </div>

                    {/* HORA DE INICIO */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">
                            Hora de Inicio:
                        </label>
                        <input
                            type="time"
                            className="col-lg-9 form-control-s"
                            name="startTime"
                            value={form.startTime}
                            onChange={onChange}
                            required
                        />
                        {errors.startTime && (
                            <div className="text-danger small">
                                {errors.startTime}
                            </div>
                        )}
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
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmada</option>
                                <option value="Cancelada">Cancelada</option>
                                <option value="Completada">Completada</option>
                            </select>
                        </div>
                    )}

                    {/* LOCALIZACIÓN */}
                    <div className="col-mb-4">
                        <label className="form-label col-lg-3">
                            Localización:
                        </label>
                        <input
                            className="col-lg-9 form-control-s"
                            name="location"
                            value={form.location}
                            onChange={onChange}
                            placeholder="Localización"
                            required
                        />
                        {errors.location && (
                            <div className="text-danger small">
                                {errors.location}
                            </div>
                        )}
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
};

export default AppointmentModal;

