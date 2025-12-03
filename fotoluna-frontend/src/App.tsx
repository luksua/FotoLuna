import { memo, useEffect } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import { routes } from "./routes/routes";
import { employeeRoutes } from "./routes/employeesRoutes";
import { adminRoutes } from "./routes/adminRoutes";

const App = memo(() => {
  const location = useLocation();
  const element = useRoutes([...routes, ...employeeRoutes, ...adminRoutes]);

  useEffect(() => {
    const { pathname } = location;
    const bodyClassList = document.body.classList;

    bodyClassList.remove("mod-customers", "mod-empleados");

    if (pathname.startsWith("/empleados")) {
      bodyClassList.add("mod-empleados");
    } else {
      bodyClassList.add("mod-customers");
    }
  }, [location.pathname]);

  return element;
});

export default App;
