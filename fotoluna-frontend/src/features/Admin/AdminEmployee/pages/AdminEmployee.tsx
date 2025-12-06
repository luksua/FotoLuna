/* eslint-disable @typescript-eslint/no-explicit-any */
// import AdminLayout from "../../../layouts/HomeAdminLayout";
import '../styles/AdminEmployee.css';
import { useEffect, useState } from "react";
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import SuccessAlert from "../components/SuccessAlert";
import ExportButton from "../../../../components/ExportButton";
import { exportEmployeesToExcel } from '../../../../services/exportService';


type Employee = {
    id: number;
    nombre: string;
    telefono: string;
    documento: string;
    correo: string;
    estado: boolean;
    puntuacion?: number;
    address?: string;
    EPS?: string;
};

type EditFormData = {
    firstNameEmployee: string;
    lastNameEmployee: string;
    phoneEmployee: string;
    emailEmployee: string;
    documentNumber: string;
    address: string;
    EPS: string;
};

const EmployeeCustomers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [ratings, setRatings] = useState<{[key: number]: number}>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [editForm, setEditForm] = useState<EditFormData>({
        firstNameEmployee: '',
        lastNameEmployee: '',
        phoneEmployee: '',
        emailEmployee: '',
        documentNumber: '',
        address: '',
        EPS: '',
    });
    const [savingEdit, setSavingEdit] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    
    const itemsPerPage = 10;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
    };

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/admin/employees', { headers: getAuthHeaders() })
            .then((res) => res.json())
            .then((data) => {
                if (!mounted) return;
                if (data && data.success) {
                    const mapped = data.data.map((e: any) => {
                        // Backend returns 'id' as 'emp_<id>' and 'uniqueId' as the numeric id.
                        // Use numeric uniqueId when available so PATCH routes that expect a numeric
                        // employeeId work correctly.
                        let numericId: number | null = null;
                        if (e.uniqueId !== undefined && e.uniqueId !== null) {
                            numericId = Number(e.uniqueId);
                        } else if (typeof e.id === 'string' && e.id.startsWith('emp_')) {
                            numericId = Number(e.id.replace(/^emp_/, ''));
                        } else {
                            numericId = Number(e.id);
                        }

                        return {
                            id: numericId,
                            nombre: e.name || '',
                            telefono: e.phone || '',
                            documento: e.document || '',
                            correo: e.email || '',
                            estado: !!e.isAvailable,
                            address: e.address || '',
                            EPS: e.EPS || '',
                        };
                    });
                    setEmployees(mapped);
                } else {
                    setError('No se pudieron cargar los empleados');
                }
            })
            .catch((err) => setError(err.message || 'Error al obtener empleados'))
            .finally(() => setLoading(false));

        return () => { mounted = false; };
    }, []);

    // Cargar ratings de fotografos
    useEffect(() => {
        let mounted = true;
        fetch('/api/employees/ratings', { headers: getAuthHeaders() })
            .then((res) => res.json())
            .then((data) => {
                if (!mounted) return;
                if (data && data.success && Array.isArray(data.data)) {
                    // Crear mapa de employeeId -> averageRating
                    const ratingsMap: {[key: number]: number} = {};
                    data.data.forEach((item: any) => {
                        ratingsMap[item.employeeId] = item.averageRating || 0;
                    });
                    setRatings(ratingsMap);
                }
            })
            .catch((err) => console.error('Error cargando ratings:', err));

        return () => { mounted = false; };
    }, []);

    //////////////////// Filtro 
    const filteredEmployees = employees.filter(emp => 
        Object.values(emp)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    //////////////////// Paginación
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    // Resetear a página 1 cuando se busca
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const toggleAvailability = async (empId: number) => {
        setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, estado: !emp.estado } : emp));

        try {
            const res = await fetch(`/api/admin/employees/${empId}/availability`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({})
            });

            if (!res.ok) throw new Error('No se pudo actualizar el estado');

            const data = await res.json();
            if (data && data.success) {
                setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, estado: !!data.isAvailable } : emp));
            }
        } catch (err: any) {
            setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, estado: !emp.estado } : emp));
            setError(err.message || 'Error actualizando estado');
        }
    };

    const openEditModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setEditForm({
            firstNameEmployee: employee.nombre.split(' ')[0],
            lastNameEmployee: employee.nombre.split(' ').slice(1).join(' '),
            phoneEmployee: employee.telefono,
            emailEmployee: employee.correo,
            documentNumber: employee.documento,
            address: employee.address || '',
            EPS: employee.EPS || '',
        });
    };

    const closeEditModal = () => {
        setSelectedEmployee(null);
        setEditForm({
            firstNameEmployee: '',
            lastNameEmployee: '',
            phoneEmployee: '',
            emailEmployee: '',
            documentNumber: '',
            address: '',
            EPS: '',
        });
    };

    const handleEditFormChange = (field: keyof EditFormData, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const saveEditChanges = async () => {
        if (!selectedEmployee) return;
        setSavingEdit(true);

        try {
            const res = await fetch(`/api/admin/employees/${selectedEmployee.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(editForm)
            });

            if (!res.ok) throw new Error('No se pudo guardar los cambios');

            const data = await res.json();
            if (data && data.success) {
                //////// Actualizar la lista con los nuevos datos
                setEmployees(prev => prev.map(emp => 
                    emp.id === selectedEmployee.id 
                        ? {
                            ...emp,
                            nombre: editForm.firstNameEmployee + ' ' + editForm.lastNameEmployee,
                            telefono: editForm.phoneEmployee,
                            correo: editForm.emailEmployee,
                            documento: editForm.documentNumber,
                            address: editForm.address,
                            EPS: editForm.EPS,
                        }
                        : emp
                ));
                setError(null);
                closeEditModal();
                // Mostrar alerta de éxito
                setShowSuccessAlert(true);
                // Autoocultar después de 5 segundos
                setTimeout(() => setShowSuccessAlert(false), 5000);
            }
        } catch (err: any) {
            setError(err.message || 'Error guardando cambios');
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <HomeLayout>
            <div className="employee-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div className="search-box" style={{ flex: 1 }}>
                        <input type="text"
                            placeholder="Buscar empleados..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)} />
                    </div>

                    <div>
                        <ExportButton onClick={async () => { await exportEmployeesToExcel(employees, 'Empleados_Todos'); }} label="Descargar Excel" />
                    </div>
                </div>

                {showSuccessAlert && (
                    <SuccessAlert 
                        message="¡Empleado Editado Exitosamente!"
                        visible={showSuccessAlert}
                        onClose={() => setShowSuccessAlert(false)}
                        type="success"
                    />
                )}

                {/* Tabla de empleados */}
                <div className="table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Documento</th>
                                <th>Correo</th>
                                <th>Puntuación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>Cargando...</td></tr>
                            ) : paginatedEmployees.length ? (
                                paginatedEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.nombre}</td>
                                        <td>{employee.telefono}</td>
                                        <td>{employee.documento}</td>
                                        <td>{employee.correo}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: '600',
                                                color: ratings[employee.id] ? '#ffc107' : '#999',
                                                fontSize: '14px'
                                            }}>
                                                {ratings[employee.id] ? `${ratings[employee.id].toFixed(1)} 📸` : 'Sin calificación'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`status ${employee.estado ? 'active' : 'inactive'}`}
                                                onClick={() => toggleAvailability(employee.id)}
                                            >
                                                {employee.estado ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => openEditModal(employee)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#d1a3e2',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>No se encontraron empleados.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Controles de paginación */}
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                ← Anterior
                            </button>
                            
                            <div className="pagination-info">
                                Página {currentPage} de {totalPages}
                            </div>
                            
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>
                {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
            </div>

            {/* Modal de edición (responsive, con scroll interno) */}
            {selectedEmployee && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Editar Empleado</h2>

                        <div className="modal-row">
                            <label>Nombre:</label>
                            <input
                                type="text"
                                value={editForm.firstNameEmployee}
                                onChange={(e) => handleEditFormChange('firstNameEmployee', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-row">
                            <label>Apellido:</label>
                            <input
                                type="text"
                                value={editForm.lastNameEmployee}
                                onChange={(e) => handleEditFormChange('lastNameEmployee', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-row">
                            <label>Teléfono:</label>
                            <input
                                type="text"
                                value={editForm.phoneEmployee}
                                onChange={(e) => handleEditFormChange('phoneEmployee', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-row">
                            <label>Correo:</label>
                            <input
                                type="email"
                                value={editForm.emailEmployee}
                                onChange={(e) => handleEditFormChange('emailEmployee', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-row">
                            <label>Documento:</label>
                            <input
                                type="text"
                                value={editForm.documentNumber}
                                onChange={(e) => handleEditFormChange('documentNumber', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-row">
                            <label>Dirección:</label>
                            <input
                                type="text"
                                value={editForm.address}
                                onChange={(e) => handleEditFormChange('address', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-row">
                            <label>EPS:</label>
                            <input
                                type="text"
                                value={editForm.EPS}
                                onChange={(e) => handleEditFormChange('EPS', e.target.value)}
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="modal-btn modal-btn-secondary" onClick={closeEditModal} type="button">Cancelar</button>
                            <button className="modal-btn modal-btn-primary" onClick={saveEditChanges} disabled={savingEdit} type="button">
                                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>
            
        </HomeLayout>
    );
};

export default EmployeeCustomers;

