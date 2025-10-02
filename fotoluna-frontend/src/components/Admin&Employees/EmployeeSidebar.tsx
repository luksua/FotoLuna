import React from "react";
import "../../styles/EmployeeSidebar.css";

const EmployeeSidebar: React.FC = () => {
    return (
        <aside className="employee-sidebar">

            <div className="EmployeeSidebar-header-row">
                <button type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                    <i className="Employee-sidebar-icon-person bi bi-person-circle"></i>
                    <span className="EmployeeSidebar-header">Admin</span>
                </button>
                <i className="Employee-sidebar-icon-notification bi bi-bell-fill"></i>
            </div>

            <hr />

            <nav className="EmployeeSidebar-nav">
                <div className="EmployeeSidebar-header-dashboard">
                    <i className="Employee-sidebar-icon-dashboard bi bi-speedometer2"></i>
                    <li><a href="#">Dashboard</a></li>
                </div>

                <hr />
                <span className="EmployeeSidebar-header-usuarios">Usuarios</span>

                <div className="EmployeeSidebar-header-registrar">
                    <i className="Employee-sidebar-icon-register bi bi-journal-plus"></i>
                    <li><a href="#">Registrar</a></li>
                </div>
                <div className="EmployeeSidebar-header-administrar">
                    <i className="Employee-sidebar-icon-settings bi bi-people"></i>
                    <li><a href="#">Administrar</a></li>
                </div>
                <hr />
                <span className="EmployeeSidebar-header-usuarios">Roles</span>
                <div className="EmployeeSidebar-header-administrar">
                    <i className="Employee-sidebar-icon-settings bi bi-person-gear"></i>
                    <li><a href="#">Administrar</a></li>
                </div>
                <div className="EmployeeSidebar-header-clientes">
                    <i className="Employee-sidebar-icon-clients bi bi-people-fill"></i>
                    <li><a href="#">Clientes</a></li>
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