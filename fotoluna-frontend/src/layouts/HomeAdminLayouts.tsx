import React from "react";
import EmployeeSidebar from "../components/Admin&Employees/EmployeeSidebar";
import EmployeeNavbar from "../components/Admin&Employees/EmployeeNavbar";
import "../styles/ScrollAdmin.css";

type Props = {
    children: React.ReactNode;
};

const HomeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="layout-root">
            <EmployeeSidebar />
            <div className="main-content">
                <EmployeeNavbar />
                <main className="scrollspy-example-2">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default HomeLayout;