// App.tsx
import { memo, useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { routes } from "./routes/routes";
import { employeeRoutes } from "./routes/employeesRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { setupInterceptors } from "./lib/api";
import { useAuth } from "./context/useAuth";
import { SessionExpiredModal } from "./components/SessionExpiredModal";
import "./App.css";

const App = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sessionExpired, setSessionExpired] = useState(false);

  const element = useRoutes([...routes, ...employeeRoutes, ...adminRoutes]);

  // Interceptores: cuando Sanctum responda 401/419 → mostrar modal
  useEffect(() => {
    setupInterceptors(() => {
      setSessionExpired(true);
    });
  }, []);

  // Clases del body (tu código)
  useEffect(() => {
    const pathname = location.pathname;
    const bodyClassList = document.body.classList;

    bodyClassList.remove("mod-customers", "mod-empleados");

    if (pathname.startsWith("/empleados")) {
      bodyClassList.add("mod-empleados");
    } else {
      bodyClassList.add("mod-customers");
    }
  }, [location.pathname]);

  const handleLoginAgain = async () => {
    setSessionExpired(false);
    await logout();                 // tu logout limpia token, user, etc.
    navigate("/iniciarSesion", { replace: true });
  };

  const handleCloseModal = () => {
    // solo oculta el modal; si el usuario sigue intentando usar la app,
    // las peticiones seguirán devolviendo 401 y el modal volverá a salir.
    setSessionExpired(false);
  };

  return (
    <>
      {element}
      <SessionExpiredModal
        open={sessionExpired}
        onLoginAgain={handleLoginAgain}
        onClose={handleCloseModal}
      />
    </>
  );
});

export default App;
