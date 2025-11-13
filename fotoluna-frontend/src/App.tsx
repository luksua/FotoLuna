import { useLocation, useRoutes } from "react-router-dom";
import { routes } from "./routes/routes";
import { employeeRoutes } from "./routes/employeesRoutes";
import { useEffect } from "react";

const App = () => {
  const location = useLocation();
  const element = useRoutes([...routes, ...employeeRoutes]);

  useEffect(() => {
    // Limpia clases previas
    document.body.classList.remove("mod-customers", "mod-empleados");

    // Asigna clase según ruta
    if (location.pathname.startsWith("/")) {
      document.body.classList.add("mod-customers");
    } else if (location.pathname.startsWith("/empleados")) {
      document.body.classList.add("mod-empleados");
    }
  }, [location.pathname]);

  return element;
};

export default App;
