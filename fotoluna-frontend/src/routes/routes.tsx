import HomeEmployee from "../features/Employee/Home/Pages/HomeEmployee";
import AppointmentsEmployee from "../features/Employee/Appointment/Pages/ApointmentsEmploye";
import EmployeeUpload from "../features/Employee/Upload/Pages/Upload";
import AdminEmployee from "../features/Employee/PhotoAdmin/Pages/PhotoAdmin";
import CustomersEmployee from "../features/Employee/Customers/Pages/CustomersEmployee";
import EmployeeNotifications from "../features/Employee/Notification/Pages/NotiFicationEmploye";



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