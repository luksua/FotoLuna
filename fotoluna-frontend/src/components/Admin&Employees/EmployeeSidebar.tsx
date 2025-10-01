import React from "react";
import "../../styles/EmployeeSidebar.css";

const EmployeeSidebar: React.FC = () => {
    return (
        <aside className="employee-sidebar">

            <div className="EmployeeSidebar-header-row">
                <button type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                    <i className="Employee-sidebar-icon-person bi bi-person-circle"></i>
                    <span className="EmployeeSidebar-header">Empleado</span>

                </button>



                <i className="Employee-sidebar-icon-notification bi bi-bell-fill"></i>
            </div>

            <hr />

            <nav className="EmployeeSidebar-nav">

                <div className="EmployeeSidebar-header-citas">
                    <i className="Employee-sidebar-icon-calendar bi bi-calendar-event"></i>
                    <li><a href="#">Citas</a>
                    </li>
                </div>

                <hr />
                <span className="EmployeeSidebar-header-nube">Nube</span>

                <div className="EmployeeSidebar-header-subir">
                    <i className="Employee-sidebar-icon-upload bi bi-upload"></i>
                    <li><a href="#">Subir</a>

                    </li>
                </div>
                <div className="EmployeeSidebar-header-admin">
                    <i className="Employee-sidebar-icon-settings bi bi-gear"></i>
                    <li><a href="#">Administrar</a>

                    </li>

                </div>
                <div className="EmployeeSidebar-header-clientes">
                    <i className="Employee-sidebar-icon-clients bi bi-person-lines-fill"></i>
                    <li><a href="#">Clientes</a>

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