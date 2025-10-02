import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin&Employees/AdminSidebar";
import EmployeeNavbar from "../components/Admin&Employees/EmployeeNavbar";

const HomeAdminLayout = () => (
    <div style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <div style={{ flex: 1 }}>
            <EmployeeNavbar />
            <Outlet />
        </div>
    </div>
);

export default HomeAdminLayout;