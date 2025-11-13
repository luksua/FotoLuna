import Home from "../features/home/home/pages/Home";
import SignUp from "../features/home/auth/pages/SignUp";
import Login from "../features/home/auth/pages/Login";
import ForgotPassword from "../features/home/auth/pages/ForgotPassword";
import AboutMe from "../features/home/home/pages/AboutMe";
import Contact from "../features/home/home/pages/Contact";
import Appointment from "../features/home/appointment/pages/Appointment";
import AppointmentForm from "../features/home/appointment/pages/AppointmentForm";
import Notification from "../features/home/notification/pages/NotificationCustomer";
import Quinces from "../features/home/events/quinces/pages/Quinces";
import ProfilePage from "../features/home/home/pages/Account";
import Photos from "../features/home/home/pages/Photos";

export const routes = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/registrarse",
        element: <SignUp />
    }, {
        path: "/iniciarSesion",
        element: <Login />
    }, {
        path: "/recuperarContrasena",
        element: <ForgotPassword />
    }, {
        path: "/sobreMi",
        element: <AboutMe />
    }, {
        path: "/contacto",
        element: <Contact />
    }, {
        path: "/citas",
        element: <Appointment />
    }, {
        path: "/nuevaCita",
        element: <AppointmentForm />
    }, {
        path: "/notificaciones",
        element: <Notification />
    }, {
        path: "/quince",
        element: <Quinces />
    }, {
        path: "/miCuenta",
        element: <ProfilePage />
    }, {
        path: "/fotos",
        element: <Photos />
    },
];