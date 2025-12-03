// import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import { lazy, Suspense } from "react";
import Spinner from "../features/Employee/Appointment/Components/Spinner";

const Dashboard = lazy(() => import("../features/Admin/Dashboard/pages/Dashboard"));
const RegisterUsers = lazy(() => import("../features/Admin/RegisterUsers/pages/RegisterUsers"));
const HomeAdmin = lazy(() => import("../features/Admin/HomeAdmin/pages/HomeAdmin"));
const AdminUsers = lazy(() => import("../features/Admin/AdminUsers/pages/AdminUsers"));
const AdminEmployee = lazy(() => import("../features/Admin/AdminEmployee/pages/AdminEmployee"));
const NotificationsEmployee = lazy(() => import("../features/Admin/Notification/Pages/NotificationsEmployee"));
const AdminEvents = lazy(() => import("../features/Admin/AdminEvents/pages/AdminEvents"));
const AdminAppointments = lazy(() => import("../features/Admin/AdminApointments/pages/AdminAppointments"));
import PaymentsAndSubscriptions from "../features/Admin/AdminPayments/pages/PaymentsAndSubscriptions";
import SubscriptionsPage from "../features/Admin/AdminPayments/components/Subscriptions";

const adminRoutes = [
    {
        path: "/admin",
        element: (
            <Suspense fallback={<Spinner />}>
                <HomeAdmin />
            </Suspense>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <Suspense fallback={<Spinner />}>
                <Dashboard />
            </Suspense>
        ),
    },
    {
        path: "/RegisterUsers",
        element: (
            <Suspense fallback={<Spinner />}>
                <RegisterUsers />
            </Suspense>
        ),
    },
    {
        path: "/AdminUsers",
        element: (
            <Suspense fallback={<Spinner />}>
                <AdminUsers />
            </Suspense>
        ),
    },
    {
        path: "/AdminEmployee",
        element: (
            <Suspense fallback={<Spinner />}>
                <AdminEmployee />
            </Suspense>
        ),
    },
    {
        path: "/notifications",
        element: (
            <Suspense fallback={<Spinner />}>
                <NotificationsEmployee />
            </Suspense>
        ),
    },
    {
        path: "/AdminEvents",
        element: (
            <Suspense fallback={<Spinner />}>
                <AdminEvents />
            </Suspense>
        ),
    },
    {
        path: "/AdminAppointments",
        element: (
            <Suspense fallback={<Spinner />}>
                <AdminAppointments />
            </Suspense>
        ),
        
    },
    { path: "/adminPayments", element: <PaymentsAndSubscriptions /> },
    { path: "/storage-plan", element: <SubscriptionsPage /> },
];

export { adminRoutes };