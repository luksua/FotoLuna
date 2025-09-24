import Home from "../features/home/pages/Home";
import SignUp from "../features/auth/pages/SignUp";
import Login from "../features/auth/pages/Login";

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
    }
];
