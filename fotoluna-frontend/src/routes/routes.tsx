import { Routes, Route } from "react-router-dom";
import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import Dashboard from "../features/HomeEmployee/pages/Dashboard";
import HomeAdminLayout from "../layouts/HomeAdminLayout";

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<HomeAdminLayout />}>
            <Route index element={<HomeAdmin />} />
            <Route path="dashboard" element={<Dashboard />} />
        </Route>
    </Routes>
);

export default AppRoutes;