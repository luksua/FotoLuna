// import AdminLayout from "../../../layouts/HomeAdminLayout";
import { useEffect, useState } from "react";
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import "../../../Admin/AdminEmployee/styles/AdminEmployee.css";


type Employee = {
    id: number;
    nombre: string;
    telefono: string;
    documento: string;
    correo: string;
    estado: boolean;
};

const EmployeeCustomers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/admin/employees')
            .then((res) => res.json())
            .then((data) => {
                if (!mounted) return;
                if (data && data.success) {
                    const mapped = data.data.map((e: any) => ({
                        id: e.id,
                        nombre: e.name || '',
                        telefono: e.phone || '',
                        documento: e.document || '',
                        correo: e.email || '',
                        estado: !!e.isAvailable,
                    }));
                    setEmployees(mapped);
                } else {
                    setError('No se pudieron cargar los empleados');
                }
            })
            .catch((err) => setError(err.message || 'Error al obtener empleados'))
            .finally(() => setLoading(false));

        return () => { mounted = false; };
    }, []);

    //////////////////// Filtro 
    const filteredEmployees = employees.filter(emp => 
        Object.values(emp)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const toggleAvailability = async (empId: number) => {
        setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, estado: !emp.estado } : emp));

        try {
            const res = await fetch(`/api/admin/employees/${empId}/availability`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
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

    return (
        <HomeLayout>
            <div className="employee-container">
                <div className="search-box">
                    <input type="text"
                        placeholder="Buscar empleados..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>

                {/* Tabla de empleados */}
                <div className="table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Documento</th>
                                <th>Correo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Cargando...</td></tr>
                            ) : filteredEmployees.length ? (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.nombre}</td>
                                        <td>{employee.telefono}</td>
                                        <td>{employee.documento}</td>
                                        <td>{employee.correo}</td>
                                        <td>
                                            <button
                                                className={`status ${employee.estado ? 'active' : 'inactive'}`}
                                                onClick={() => toggleAvailability(employee.id)}
                                            >
                                                {employee.estado ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No se encontraron empleados.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
                </div>
            </div>
        </HomeLayout>
    );
};

export default EmployeeCustomers;

