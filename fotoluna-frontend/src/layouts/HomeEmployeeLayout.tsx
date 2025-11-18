import React from "react";
import EmployeeNav from "../components/Admin&Employees/EmployeeNavbar";
import EmployeeSidebar from "../components/Admin&Employees/EmployeeSidebar";
import "../styles/HomeEmployeeLayout.css";
type Props = {
    children: React.ReactNode;
};

const HomeEmployeeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="employee-layout">
            <EmployeeNav />
            <main className="main-content">
                <EmployeeSidebar />
                {children}
            </main>
        </div>
    );
};


export default HomeEmployeeLayout;