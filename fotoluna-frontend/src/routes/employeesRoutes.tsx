import { lazy, Suspense } from "react";
import Spinner from "../features/Employee/Appointment/Components/Spinner";

const HomeEmployee = lazy(() => import("../features/Employee/Home/Pages/HomeEmployee"));
const AppointmentsEmployee = lazy(() => import("../features/Employee/Appointment/Pages/ApointmentsEmploye"));
const EmployeeUpload = lazy(() => import("../features/Employee/Upload/Pages/Upload"));
const AdminEmployee = lazy(() => import("../features/Employee/PhotoAdmin/Pages/EmployeePhotosPage"));
const CustomersEmployee = lazy(() => import("../features/Employee/Customers/Pages/CustomersEmployee"));
const Payments = lazy(() => import("../features/Employee/Payment/Pages/PaymentEmployee"));
// 🆕 NUEVAS PÁGINAS DE FOTOS
const EmployeePhotosPage = lazy(() => import("../features/Employee/PhotoAdmin/Pages/EmployeePhotosPage"));
const EmployeeCustomerRecentPhotosPage = lazy(() => import("../features/Employee/PhotoAdmin/Pages/EmployeeCustomerPhotosPage"));

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
    // =========================================================
    // ✅ RUTAS NUEVAS PARA EL HISTORIAL DE FOTOS DEL EMPLEADO
    // =========================================================
    {
        // 1. Vista de resumen/tarjetas (GET /api/employee/photos/summary)
        path: "/employee/photos",
        element: (
            <Suspense fallback={<Spinner />}>
                <EmployeePhotosPage />
            </Suspense>
        ),
    },
    {
        // 2. Vista de galería detallada de fotos recientes de un cliente
        // (GET /api/employee/customers/{customerId}/photos/recent)
        path: "/employee/customers/:customerId/photos/recent",
        element: (
            <Suspense fallback={<Spinner />}>
                <EmployeeCustomerRecentPhotosPage />
            </Suspense>
        ),
    },
];

export { employeeRoutes };