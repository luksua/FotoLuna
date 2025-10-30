// import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import Dashboard from "../features/HomeEmployee/pages/Dashboard";
import RegisterUsers from "../features/HomeEmployee/pages/RegisterUsers";
import HomeEmployee from "../features/HomeEmployee/pages/HomeEmployee";
import AppointmentsEmployee from "../features/HomeEmployee/pages/AppointmentsEmployee";
import UploadEmployee from "../features/HomeEmployee/pages/UploadEmployee";
import AdminUsers from "../features/HomeEmployee/pages/AdminUsers";
import AdminEmployee from "../features/HomeEmployee/pages/AdminEmployee";
import NotificationsEmployee from "../features/HomeEmployee/pages/notiprueba";



export const routes = [
    {
        path: "/",
        element: <HomeEmployee />
    },
    { path: "/dashboard", element: <Dashboard/> },
    { path: "/RegisterUsers", element: <RegisterUsers/> },
    { path: "/appointments", element: <AppointmentsEmployee /> },
    { path: "/upload", element: <UploadEmployee /> },
    { path: "/AdminUsers", element: <AdminUsers /> },
    { path: "/AdminEmployee", element: <AdminEmployee /> },
    { path: "/notifications", element: <NotificationsEmployee /> }, 
]; 
