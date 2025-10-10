
import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import Dashboard from "../features/HomeEmployee/pages/Dashboard";
import RegisterUsers from "../features/HomeEmployee/pages/RegisterUsers";
import HomeEmployee from "../features/HomeEmployee/pages/HomeEmployee";
import AppointmentsEmployee from "../features/HomeEmployee/pages/AppointmentsEmployee";
import UploadEmployee from "../features/HomeEmployee/pages/UploadEmployee";
import AdminEmployee from "../features/HomeEmployee/pages/AdminEmployee";
import CustomersEmployee from "../features/HomeEmployee/pages/CustomersEmployee";
import EmployeeNotifications from "../features/HomeEmployee/pages/NotificationsEmployee";



export const routes = [
    {
        path: "/",
        element: <HomeEmployee />
    },
    { path: "dashboard", element: <Dashboard/> },
    { path: "RegisterUsers", element: <RegisterUsers/> },
    { path: "/employee/appointments", element: <AppointmentsEmployee /> },
    { path: "/employee/upload", element: <UploadEmployee /> },
    { path: "/employee/admin", element: <AdminEmployee /> },
    { path: "/employee/customers", element: <CustomersEmployee /> },
    { path: "/employee/notifications", element: <EmployeeNotifications /> }, 
];
