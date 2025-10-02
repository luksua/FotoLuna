import React from "react";
import "../../styles/AdminSidebar.css";

const AdminSidebar: React.FC = () => {
    return (
        <aside className="Admin-sidebar">

            <div className="AdminSidebar-header-row">
                <button type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                    <i className="Admin-sidebar-icon-person bi bi-person-circle"></i>
                    <span className="AdminSidebar-header">Admin</span>
                </button>
                <i className="Admin-sidebar-icon-notification bi bi-bell-fill"></i>
            </div>

            <hr />

            <nav className="AdminSidebar-nav">
                <div className="AdminSidebar-header-dashboard">
                    <i className="Admin-sidebar-icon-dashboard bi bi-speedometer2"></i>
                    <li><a href="#">Dashboard</a></li>
                </div>

                <hr />
                <span className="AdminSidebar-header-usuarios">Usuarios</span>

                <div className="AdminSidebar-header-registrar">
                    <i className="Admin-sidebar-icon-register bi bi-journal-plus"></i>
                    <li><a href="#">Registrar</a></li>
                </div>
                <div className="AdminSidebar-header-administrar">
                    <i className="Admin-sidebar-icon-settings bi bi-people"></i>
                    <li><a href="#">Administrar</a></li>
                </div>
                <hr />
                <span className="AdminSidebar-header-usuarios">Roles</span>
                <div className="AdminSidebar-header-administrar">
                    <i className="Admin-sidebar-icon-settings bi bi-person-gear"></i>
                    <li><a href="#">Administrar</a></li>
                </div>
                <div className="AdminSidebar-header-clientes">
                    <i className="Admin-sidebar-icon-clients bi bi-people-fill"></i>
                    <li><a href="#">Clientes</a></li>
                </div>
                <hr />
            </nav>
            <div className="AdminSidebar-header-logout">
                <button> <i className="bi bi-door-closed-fill"></i></button>
            </div>
        </aside>
    );
};

export default AdminSidebar;