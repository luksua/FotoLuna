/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import '../styles/EventModal.css';

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { nombre: string; descripcion: string; cantidad: number; precio: number; requiereSubida: boolean; requierePresencial: boolean }) => Promise<void>;
    initialData?: {
        id?: number;
        nombre: string;
        descripcion: string;
        cantidad: number;
        precio: number;
        requiereSubida?: boolean;
        requierePresencial?: boolean;
    };
    mode: 'add' | 'edit';
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        cantidad: '',
        precio: '',
        requiereSubida: false,
        requierePresencial: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                cantidad: String(initialData.cantidad || ''),
                precio: initialData.precio !== undefined && initialData.precio !== null ? String(initialData.precio) : '',
                requiereSubida: initialData.requiereSubida ?? false,
                requierePresencial: initialData.requierePresencial ?? false,
            });
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                cantidad: '',
                precio: '',
                requiereSubida: false,
                requierePresencial: false,
            });
        }
        setError(null);
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === 'requiereSubida') {
                // Si selecciono requiereSubida, deselecciono requierePresencial
                setFormData(prev => ({ ...prev, requiereSubida: checked, requierePresencial: checked ? false : prev.requierePresencial }));
            } else if (name === 'requierePresencial') {
                // Si selecciono requierePresencial, deselecciono requiereSubida
                setFormData(prev => ({ ...prev, requierePresencial: checked, requiereSubida: checked ? false : prev.requiereSubida }));
            }
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

        const cantidadNum = parseInt(String(formData.cantidad || '0'), 10) || 0;
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            setError('La cantidad debe ser un número mayor a 0');
            return;
        }

        const precioNum = parseFloat(String(formData.precio || '').replace(/,/g, '.'));
        if (isNaN(precioNum) || precioNum < 0) {
            setError('El precio debe ser un número válido');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await onSubmit({
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                cantidad: cantidadNum,
                precio: precioNum,
                requiereSubida: formData.requiereSubida,
                requierePresencial: formData.requierePresencial,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el documento');
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
                        <h3 className="event-modal-title">{mode === 'add' ? 'Agregar Documento' : 'Editar Documento'}</h3>
                        <button type="button" className="event-modal-close" onClick={onClose} disabled={loading}>✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="event-modal-form">
                        {error && <div className="event-modal-error">{error}</div>}

                        <div className="event-modal-group">
                            <label className="event-modal-label">Nombre</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange} className="event-modal-input" placeholder="Ej: Cédula" />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="event-modal-textarea" rows={3} placeholder="Descripción del tipo de documento" />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Cantidad de Fotos</label>
                            <input name="cantidad" type="number" value={formData.cantidad} onChange={handleChange} className="event-modal-input" placeholder="Ej: 5" />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Precio</label>
                            <input name="precio" type="number" step="0.01" value={formData.precio} onChange={handleChange} className="event-modal-input" placeholder="0.00" />
                        </div>

                        <div className="event-modal-group">
                            <label className="event-modal-label">Tipo de Requerimiento (selecciona uno)</label>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="requiereSubida"
                                        checked={formData.requiereSubida}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    Requiere Subida
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="requierePresencial"
                                        checked={formData.requierePresencial}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    Presencial
                                </label>
                            </div>
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

export default DocumentModal;
