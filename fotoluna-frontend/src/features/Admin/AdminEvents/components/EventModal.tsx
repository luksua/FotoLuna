/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import '../styles/EventModal.css';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { nombre: string; descripcion: string }) => Promise<void>;
    initialData?: {
        id?: number;
        nombre: string;
        descripcion: string;
    };
    mode: 'add' | 'edit';
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre,
                descripcion: initialData.descripcion,
            });
        } else {
            setFormData({ nombre: '', descripcion: '' });
        }
        setError(null);
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (!formData.descripcion.trim()) {
            setError('La categoría es requerida');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el evento');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="event-modal-backdrop" onClick={onClose} />

            {/* Modal */}
            <div className="event-modal">
                <div className="event-modal-content">
                    {/* Header */}
                    <div className="event-modal-header">
                        <h3 className="event-modal-title">
                            {mode === 'add' ? 'Agregar Evento' : 'Editar Evento'}
                        </h3>
                        <button
                            type="button"
                            className="event-modal-close"
                            onClick={onClose}
                            disabled={loading}>
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="event-modal-form">
                        {error && <div className="event-modal-error">{error}</div>}

                        <div className="event-modal-group">
                            <label htmlFor="nombre" className="event-modal-label">
                                Nombre del Evento
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Cumpleaños, Boda, etc."
                                disabled={loading}
                                className="event-modal-input"
                            />
                        </div>

                        <div className="event-modal-group">
                            <label htmlFor="descripcion" className="event-modal-label">
                                Categoría
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Ej: Fotografía de estudio, Evento social, etc."
                                disabled={loading}
                                className="event-modal-textarea"
                                rows={3}
                            />
                        </div>

                        {/* Footer */}
                        <div className="event-modal-footer">
                            <button
                                type="button"
                                className="event-modal-btn event-modal-btn-cancel"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="event-modal-btn event-modal-btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : mode === 'add' ? 'Agregar' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EventModal;
