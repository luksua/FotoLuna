import React from "react";
import EmployeeNav from "../components/Admin&Employees/EmployeeNavbar";
import EmployeeSidebar from "../components/Admin&Employees/AdminSidebar";
import "../styles/HomeEmployeeLayout.css";
type Props = {
    children: React.ReactNode;
};

const HomeEmployeeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="employee-layout">
            <EmployeeNav />
            <EmployeeSidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};


export default HomeEmployeeLayout;