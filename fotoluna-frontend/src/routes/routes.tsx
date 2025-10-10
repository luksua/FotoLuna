
import HomeAdmin from "../features/HomeEmployee/pages/HomeAdmin";
import Dashboard from "../features/HomeEmployee/pages/Dashboard";
import RegisterUsers from "../features/HomeEmployee/pages/RegisterUsers";

export const routes = [
    {
        path: "/",
        element: <HomeAdmin />
    },
    { path: "dashboard", element: <Dashboard/> },
    { path: "RegisterUsers", element: <RegisterUsers/> },



];
    