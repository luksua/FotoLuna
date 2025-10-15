import HomeEmployee from "../features/HomeEmployee/pages/HomeEmployee";
import AppointmentsEmployee from "../features/HomeEmployee/pages/apoint";
import EmployeeUpload from "../features/HomeEmployee/pages/Upload";
import AdminEmployee from "../features/HomeEmployee/pages/AdminEmployee";
import CustomersEmployee from "../features/HomeEmployee/pages/CustomersEmployee";
import EmployeeNotifications from "../features/HomeEmployee/pages/NotificationsEmployee";



export const routes = [
    {
        path: "/",
        element: <HomeEmployee />
    },
    { path: "/employee/appointments", element: <AppointmentsEmployee /> },
    { path: "/employee/upload", element: <EmployeeUpload /> },
    { path: "/employee/admin", element: <AdminEmployee /> },
    { path: "/employee/customers", element: <CustomersEmployee /> },
    { path: "/employee/notifications", element: <EmployeeNotifications /> },


   
];