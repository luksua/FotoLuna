import Home from "../features/home/pages/Home";
import SignUp from "../features/auth/pages/SignUp";
import Login from "../features/auth/pages/Login";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import AboutMe from "../features/home/pages/AboutMe";
import Contact from "../features/home/pages/Contact";
import Appointment from "../features/appointment/pages/Appointment";
import AppointmentForm from "../features/appointment/pages/AppointmentForm";
import Notification from "../features/notification/pages/NotificationCustomer";

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
    }
];
