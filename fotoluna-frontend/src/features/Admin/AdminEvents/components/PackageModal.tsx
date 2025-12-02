/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import '../styles/EventModal.css';

interface PackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { nombre: string; descripcion: string; precio: number; eventId?: number }) => Promise<void>;
    initialData?: {
        id?: number;
        nombre: string;
        descripcion: string;
        precio: number;
        eventId?: number | null;
    };
    eventsList: Array<{ id: number; nombre: string }>;
    mode: 'add' | 'edit';
}

const PackageModal: React.FC<PackageModalProps> = ({ isOpen, onClose, onSubmit, initialData, eventsList, mode }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '', eventId: undefined as number | undefined });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                precio: initialData.precio !== undefined && initialData.precio !== null ? String(initialData.precio) : '',
                eventId: initialData.eventId ?? undefined,
            });
        } else {
            setFormData({ nombre: '', descripcion: '', precio: '', eventId: undefined });
        }
        setError(null);
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'precio') {
            setFormData(prev => ({ ...prev, precio: value }));
        } else if (name === 'eventId') {
            setFormData(prev => ({ ...prev, eventId: value ? Number(value) : undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        if (!formData.descripcion.trim()) {
            setError('La descripción es requerida');
            return;
        }
        const precioNum = parseFloat(String(formData.precio || '').replace(/,/g, '.'));
        if (isNaN(precioNum) || precioNum <= 0) {
            setError('El precio debe ser un número mayor a 0');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await onSubmit({ nombre: formData.nombre, descripcion: formData.descripcion, precio: precioNum, eventId: formData.eventId });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el paquete');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="event-modal-backdrop" onClick={onClose} />
            <div className="event-modal">
                <div className="event-modal-content">
                    <div className="event-modal-header">
                        <h3 className="event-modal-title">{mode === 'add' ? 'Agregar Paquete' : 'Editar Paquete'}</h3>
                        <button type="button" className="event-modal-close" onClick={onClose} disabled={loading}>✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="event-modal-form">
                        {error && <div className="event-modal-error">{error}</div>}

                        <div className="event-modal-group">
                            <label className="event-modal-label">Nombre</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange} className="event-modal-input" />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="event-modal-textarea" rows={3} />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Precio</label>
                            <input name="precio" type="number" step="0.01" value={formData.precio} onChange={handleChange} className="event-modal-input" placeholder="0.00" />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Evento</label>
                            <select name="eventId" value={formData.eventId ?? ''} onChange={handleChange} className="event-modal-input">
                                <option value="">-- Seleccionar evento --</option>
                                {eventsList.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="event-modal-footer">
                            <button type="button" className="event-modal-btn event-modal-btn-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
                            <button type="submit" className="event-modal-btn event-modal-btn-submit" disabled={loading}>{loading ? 'Guardando...' : (mode === 'add' ? 'Agregar' : 'Guardar')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PackageModal;
