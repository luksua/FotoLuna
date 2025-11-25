// import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import Dashboard from "../features/Admin/Dashboard/pages/Dashboard";
import RegisterUsers from "../features/Admin/RegisterUsers/pages/RegisterUsers";
import HomeAdmin from "../features/Admin/HomeAdmin/pages/HomeAdmin";
import AdminUsers from "../features/Admin/AdminUsers/pages/AdminUsers";
import AdminEmployee from "../features/Admin/AdminEmployee/pages/AdminEmployee";
import NotificationsEmployee from "../features/Admin/Notification/Pages/NotificationsEmployee";
import AdminEvents from "../features/Admin/AdminEvents/pages/AdminEvents";

export const adminRoutes = [
    {
        path: "/admin",
        element: <HomeAdmin />
    },
    { path: "/dashboard", element: <Dashboard/> },
    { path: "/RegisterUsers", element: <RegisterUsers/> },
    { path: "/AdminUsers", element: <AdminUsers /> },
    { path: "/AdminEmployee", element: <AdminEmployee /> },
    { path: "/notifications", element: <NotificationsEmployee /> },
    { path: "/AdminEvents", element: <AdminEvents /> },

]; 