import React from "react";
import "../../styles/EmployeeNavbar.css";
import logoFotoluna from "../../assets/img/logo.png";
import { Link } from "react-router-dom";

const EmployeeNavbar: React.FC = () => {
    return (
        <nav className="EmployeeNavbar navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center">
                    <form
                        className="d-flex my-2 my-lg-0 EmployeeNavbar-center-search"
                        role="search"
                    >
                        <input
                            className="EmployeeNavbar-search form-control me-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            style={{ minWidth: 300, maxWidth: 500 }}
                        />
                        <button className="EmployeeNavbar-icon btn" type="submit">
                            <i className="bi bi-search"></i>
                        </button>


                    </form>
                    <ul className="navbar-nav mb-2 mb-lg-0 ms-3">
                        <li className="EmployeeNavbar-item-home nav-item">
                            <a className="EmployeeNavbar-item-home-ini nav-link active" aria-current="page" href="#">
                                <li>
                                    <Link to="/employee/HomeEmployee">Inicio</Link>
                                </li>
                            </a>
                        </li>
                    </ul>
                </div>

                <a
                    className="navbar-brand d-flex flex-column align-items-center ms-3"
                    href="#"
                    style={{ lineHeight: 0.3 }}
                >
                    <img src={logoFotoluna} alt="Logo" className="EmployeeNavbar-logo mb-1" />
                    <span className="EmployeeNavbar-item-name-text">Fotoluna</span>
                </a>
            </div>
        </nav>
    );
};

export default EmployeeNavbar;