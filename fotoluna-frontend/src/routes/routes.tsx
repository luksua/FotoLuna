import { lazy, Suspense } from "react";
import Spinner from "../features/Employee/Appointment/Components/Spinner";

const Home = lazy(() => import("../features/home/home/pages/Home"));
const SignUp = lazy(() => import("../features/home/auth/pages/SignUp"));
const Login = lazy(() => import("../features/home/auth/pages/Login"));
const ForgotPassword = lazy(() => import("../features/home/auth/pages/ForgotPassword"));
const AboutMe = lazy(() => import("../features/home/home/pages/AboutMe"));
const Contact = lazy(() => import("../features/home/home/pages/Contact"));
const Appointment = lazy(() => import("../features/home/appointment/pages/Appointment"));
const AppointmentForm = lazy(() => import("../features/home/appointment/pages/AppointmentForm"));
const Notification = lazy(() => import("../features/home/notification/pages/NotificationCustomer"));
const Quinces = lazy(() => import("../features/home/events/quinces/pages/Quinces"));
const ProfilePage = lazy(() => import("../features/home/home/pages/Account"));
const Photos = lazy(() => import("../features/home/home/pages/Photos"));

const routes = [
    {
        path: "/",
        element: (
            <Suspense fallback={<Spinner />}>
                <Home />
            </Suspense>
        ),
    },
    {
        path: "/registrarse",
        element: (
            <Suspense fallback={<Spinner />}>
                <SignUp />
            </Suspense>
        ),
    },
    {
        path: "/iniciarSesion",
        element: (
            <Suspense fallback={<Spinner />}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: "/recuperarContrasena",
        element: (
            <Suspense fallback={<Spinner />}>
                <ForgotPassword />
            </Suspense>
        ),
    },
    {
        path: "/sobreMi",
        element: (
            <Suspense fallback={<Spinner />}>
                <AboutMe />
            </Suspense>
        ),
    },
    {
        path: "/contacto",
        element: (
            <Suspense fallback={<Spinner />}>
                <Contact />
            </Suspense>
        ),
    },
    {
        path: "/citas",
        element: (
            <Suspense fallback={<Spinner />}>
                <Appointment />
            </Suspense>
        ),
    },
    {
        path: "/nuevaCita",
        element: (
            <Suspense fallback={<Spinner />}>
                <AppointmentForm />
            </Suspense>
        ),
    },
    {
        path: "/notificaciones",
        element: (
            <Suspense fallback={<Spinner />}>
                <Notification />
            </Suspense>
        ),
    },
    {
        path: "/quince",
        element: (
            <Suspense fallback={<Spinner />}>
                <Quinces />
            </Suspense>
        ),
    },
    {
        path: "/miCuenta",
        element: (
            <Suspense fallback={<Spinner />}>
                <ProfilePage />
            </Suspense>
        ),
    },
    {
        path: "/fotos",
        element: (
            <Suspense fallback={<Spinner />}>
                <Photos />
            </Suspense>
        ),
    },
];

export { routes };