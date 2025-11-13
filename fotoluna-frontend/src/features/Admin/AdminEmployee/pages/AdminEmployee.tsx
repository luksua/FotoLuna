// import AdminLayout from "../../../layouts/HomeAdminLayout";
import { useState } from "react";
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




const sampleEmployees: Employee[] = [
    {
        id: 1,
        nombre: "Ana María Gómez",
        telefono: "+57 300 123 4567",
        documento: "CC 1234567890",
        correo: "ana.gomez@gmail.com",
        estado: true
    },
    {
        id: 2,
        nombre: "Carlos Rodríguez",
        telefono: "+57 310 987 6543",
        documento: "CC 0987654321",
        correo: "carlos.rodriguez@gmail.com",
        estado: true
    },
    {
        id: 3,
        nombre: "Wendy yuyie",
        telefono: "+57 316 402 1627",
        documento: "CC 1072099798",
        correo: "wendyyuyie@gmail.com",
        estado: false
    },
    {
        id: 4,
        nombre: "Daniel Diaz",
        telefono: "+57 316 406 7657",
        documento: "CC 1234567891",
        correo: "ElDiablaso@gmail.com",
        estado: true
    },
];

const EmployeeCustomers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filtro
    const filteredEmployees = sampleEmployees.filter(emp => 
        Object.values(emp)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

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
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>{employee.nombre}</td>
                                    <td>{employee.telefono}</td>
                                    <td>{employee.documento}</td>
                                    <td>{employee.correo}</td>
                                    <td>
                                        <span className={`status ${employee.estado ? 'active' : 'inactive'}`}>
                                            {employee.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                </div>
            </div>
        </HomeLayout>
    );
};

export default EmployeeCustomers;

