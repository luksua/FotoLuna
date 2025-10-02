import React from "react";
import EmployeeNav from "../components/Admin&Employees/EmployeeNavbar";
import AdminSidebar from "../components/Admin&Employees/AdminSidebar";

type Props = {
    children: React.ReactNode;
};

const EmployeeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <AdminSidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <EmployeeNav />
                <main style={{ flex: 1, padding: "20px" }}>{children}</main>
            </div>
        </div>
    );
};

export default EmployeeLayout;