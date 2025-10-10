import React from "react";
import AdminSidebar from "../components/Admin&Employees/AdminSidebar";
import EmployeeNavbar from "../components/Admin&Employees/EmployeeNavbar";
import "../styles/ScrollAdmin.css";

type Props = {
    children: React.ReactNode;
};

const HomeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="layout-root">
            <AdminSidebar />
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