// import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import { lazy, Suspense } from "react";
import Spinner from "../features/Employee/Appointment/Components/Spinner";
import { ProtectedRoute } from "../components/ProtectedRoute";

const Dashboard = lazy(() => import("../features/Admin/Dashboard/pages/Dashboard"));
const RegisterUsers = lazy(() => import("../features/Admin/RegisterUsers/pages/RegisterUsers"));
const HomeAdmin = lazy(() => import("../features/Admin/HomeAdmin/pages/HomeAdmin"));
const AdminUsers = lazy(() => import("../features/Admin/AdminUsers/pages/AdminUsers"));
const AdminEmployee = lazy(() => import("../features/Admin/AdminEmployee/pages/AdminEmployee"));
const NotificationsEmployee = lazy(() => import("../features/Admin/Notification/Pages/NotificationsEmployee"));
const AdminEvents = lazy(() => import("../features/Admin/AdminEvents/pages/AdminEvents"));
const AdminAppointments = lazy(() => import("../features/Admin/AdminApointments/pages/AdminAppointments"));

const AdminPhotosPage = lazy(() => import("../features/Admin/AdminPhotos/pages/AdminPhotosPage"));
const AdminCustomerPhotosPage = lazy(() => import("../features/Admin/AdminPhotos/pages/AdminCustomerPhotosPage"));

const PaymentsAndSubscriptions = lazy(() => import("../features/Admin/AdminPayments/pages/PaymentsAndSubscriptions"));
const SubscriptionsPage = lazy(() => import("../features/Admin/AdminPayments/components/Subscriptions"));

const adminRoutes = [
    {
        path: "/admin",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <HomeAdmin />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <Dashboard />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/RegisterUsers",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <RegisterUsers />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/AdminUsers",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminUsers />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/AdminEmployee",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminEmployee />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/notifications",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <NotificationsEmployee />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/AdminEvents",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminEvents />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/AdminAppointments",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminAppointments />
                </Suspense>
            </ProtectedRoute>
        ),

    },
    {
        path: "/AdminPhotos",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminPhotosPage />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    // 🚨 RUTA AGREGADA PARA LA GALERÍA COMPLETA DEL CLIENTE
    {
        path: "/admin/customers/:customerId/photos",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <AdminCustomerPhotosPage />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/adminPayments",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <PaymentsAndSubscriptions />
                </Suspense>
            </ProtectedRoute>
        ),
    },
    {
        path: "/storage-plan",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<Spinner />}>
                    <SubscriptionsPage />
                </Suspense>
            </ProtectedRoute>
        ),
    },
];

export { adminRoutes };