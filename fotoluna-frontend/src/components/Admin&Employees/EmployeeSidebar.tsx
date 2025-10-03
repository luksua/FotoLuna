import React from "react";
import "../../styles/EmployeeSidebar.css";
import { Link } from "react-router-dom";

const EmployeeSidebar: React.FC = () => {
    return (
        <aside className="employee-sidebar">

            <div className="EmployeeSidebar-header-row">
                <button type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                    <i className="Employee-sidebar-icon-person bi bi-person-circle"></i>
                    <span className="EmployeeSidebar-header">Empleado</span>

                </button>


                <Link to="/employee/notifications" className="notification-link">
                    <i className="Employee-sidebar-icon-notification bi bi-bell-fill"></i>

                </Link>

            </div>

            <hr />

            <nav className="EmployeeSidebar-nav">


                <div className="EmployeeSidebar-header-citas">
                    <i className="Employee-sidebar-icon-calendar bi bi-calendar-event"></i>
                    <li>
                        <Link to="/employee/appointments">Citas</Link>
                    </li>
                </div>

                <hr />
                <span className="EmployeeSidebar-header-nube">Nube</span>

                <div className="EmployeeSidebar-header-subir">
                    <i className="Employee-sidebar-icon-upload bi bi-upload"></i>
                    <li>
                        <Link to="/employee/upload">Subir</Link>
                    </li>
                </div>
                <div className="EmployeeSidebar-header-admin">
                    <i className="Employee-sidebar-icon-settings bi bi-gear"></i>
                    <li>
                        <Link to="/employee/admin">Administrar</Link>
                    </li>

                </div>
                <div className="EmployeeSidebar-header-clientes">
                    <i className="Employee-sidebar-icon-clients bi bi-person-lines-fill"></i>
                    <li>
                        <Link to="/employee/customers">Clientes</Link>
                    </li>
                </div>
                <hr />

            </nav>
            <div className="EmployeeSidebar-header-logout">
                <button> <i className="bi bi-door-closed-fill"></i></button>
            </div>
        </aside>

    );
};


export default EmployeeSidebar;