import React from "react";
import EmployeeNav from "../components/Admin&Employees/EmployeeNavbar";
import EmployeeSidebar from "../components/Admin&Employees/EmployeeSidebar";
import "../styles/HomeEmployeeLayout.css";
type Props = {
    children: React.ReactNode;
};

const HomeEmployeeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="layout-root">
            <EmployeeNav/>
            <div className="main-content">
                <EmployeeSidebar />
                <main className="scrollspy-example-2">
                    {children}
                </main>
            </div>
        </div>
    );
};


export default HomeEmployeeLayout;