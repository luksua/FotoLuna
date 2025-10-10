import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/AdminSidebar.css";

const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <aside className="Admin-sidebar">
            <div className="AdminSidebar-header-row">
                <button type="button">
                    <i className="Admin-sidebar-icon-person bi bi-person-circle"></i>
                    <span className="AdminSidebar-header">Admin</span>
                </button>
                <i className="Admin-sidebar-icon-notification bi bi-bell-fill"></i>
            </div>
            <hr />
            <nav className="AdminSidebar-nav">
                <div
                    className="AdminSidebar-header-dashboard"
                    onClick={() => navigate("/dashboard")}>
                    <i className="Admin-sidebar-icon-dashboard bi bi-speedometer2"></i>
                    <span>Dashboard</span>
                </div>

                <span className="AdminSidebar-header-usuarios" >Usuarios</span>
                <div className="AdminSidebar-header-registrar"
                    onClick={() => navigate("/RegisterUsers")}>
                    <i className="Admin-sidebar-icon-register bi bi-journal-plus"></i>
                    <span>Registrar</span>
                </div>

                <div className="AdminSidebar-header-administrar">
                    <i className="Admin-sidebar-icon-settings bi bi-people"></i>
                    <span>Administrar</span>
                </div>

                <hr />

                <span className="AdminSidebar-header-usuarios">Roles</span>
                <div className="AdminSidebar-header-administrar">
                    <i className="Admin-sidebar-icon-settings bi bi-person-gear"></i>
                    <span>Administrar</span>
                </div>

                <div className="AdminSidebar-header-clientes">
                    <i className="Admin-sidebar-icon-clients bi bi-people-fill"></i>
                    <span>Clientes</span>
                </div>

                <hr />

            </nav>
            <div className="AdminSidebar-header-logout">
                <button>
                    <i className="bi bi-door-closed-fill"></i>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;