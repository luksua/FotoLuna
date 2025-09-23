import Home from "../features/home/pages/Home";
import SignUp from "../features/auth/pages/SignUp";

export const routes = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/registrarse",
        element: <SignUp />
    }
];
