import React from "react";
import AdminSidebar from "../components/Admin&Employees/AdminSidebar";
import EmployeeNavbar from "../components/Admin&Employees/EmployeeNavbar";
import "../styles/HomeEmployeeLayout.css";

type Props = {
    children: React.ReactNode;
    contentClassName?: string;
};

const HomeLayout: React.FC<Props> = ({ children, contentClassName = "" }) => {     
    return (
        <div className="layout-root">
            <EmployeeNavbar />
            <div className="main-content">
                <AdminSidebar />
                <main className={`scrollspy-example-2 ${contentClassName}`.trim()}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default HomeLayout;