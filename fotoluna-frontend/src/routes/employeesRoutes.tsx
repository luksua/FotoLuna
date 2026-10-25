import { lazy, Suspense } from "react";
import Spinner from "../features/Employee/Appointment/Components/Spinner";
import { ProtectedRoute } from "../components/ProtectedRoute";

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
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <HomeEmployee />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/employee/appointments",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <AppointmentsEmployee />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/employee/upload",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <EmployeeUpload />
                </Suspense>
            </ProtectedRoute >
        ),
    },
    {
        path: "/employee/admin",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminEmployee />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/employee/customers",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <CustomersEmployee />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/employee/payments",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <Payments />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    // =========================================================
    // ✅ RUTAS NUEVAS PARA EL HISTORIAL DE FOTOS DEL EMPLEADO
    // =========================================================
    {
        // 1. Vista de resumen/tarjetas (GET /api/employee/photos/summary)
        path: "/employee/photos",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <EmployeePhotosPage />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        // 2. Vista de galería detallada de fotos recientes de un cliente
        // (GET /api/employee/customers/{customerId}/photos/recent)
        path: "/employee/customers/:customerId/photos/recent",
        element: (
            <ProtectedRoute allowedRoles={["empleado"]}>
                <Suspense fallback={<Spinner />}>
                    <EmployeeCustomerRecentPhotosPage />
                </Suspense>
            </ProtectedRoute>
        ),
    },
];

export { employeeRoutes };