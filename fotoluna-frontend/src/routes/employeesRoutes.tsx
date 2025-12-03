import { lazy, Suspense } from "react";
import Spinner from "../features/Employee/Appointment/Components/Spinner";

const HomeEmployee = lazy(() => import("../features/Employee/Home/Pages/HomeEmployee"));
const AppointmentsEmployee = lazy(() => import("../features/Employee/Appointment/Pages/ApointmentsEmploye"));
const EmployeeUpload = lazy(() => import("../features/Employee/Upload/Pages/Upload"));
const AdminEmployee = lazy(() => import("../features/Employee/PhotoAdmin/Pages/PhotoAdmin"));
const CustomersEmployee = lazy(() => import("../features/Employee/Customers/Pages/CustomersEmployee"));
const Payments = lazy(() => import("../features/Employee/Payment/Pages/PaymentEmployee"));

const employeeRoutes = [
    {
        path: "/empleado",
        element: (
            <Suspense fallback={<Spinner />}>
                <HomeEmployee />
            </Suspense>
        ),
    },
    {
        path: "/employee/appointments",
        element: (
            <Suspense fallback={<Spinner />}>
                <AppointmentsEmployee />
            </Suspense>
        ),
    },
    {
        path: "/employee/upload",
        element: (
            <Suspense fallback={<Spinner />}>
                <EmployeeUpload />
            </Suspense>
        ),
    },
    {
        path: "/employee/admin",
        element: (
            <Suspense fallback={<Spinner />}>
                <AdminEmployee />
            </Suspense>
        ),
    },
    {
        path: "/employee/customers",
        element: (
            <Suspense fallback={<Spinner />}>
                <CustomersEmployee />
            </Suspense>
        ),
    },
    {
        path: "/employee/payments",
        element: (
            <Suspense fallback={<Spinner />}>
                <Payments />
            </Suspense>
        ),
    },
];

export { employeeRoutes };