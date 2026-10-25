// src/components/ProtectedRoute.tsx
import React from "react";
import { useAuth } from "../context/useAuth";
import { ForbiddenPage } from "./ForbiddenPage";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: string[]; // ej: ["admin"], ["cliente"], ["empleado"]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const { user, loading } = useAuth();

    // Mientras carga el user (si tienes un fetch inicial)
    if (loading) return null; // aquí podrías poner un spinner si quieres

    // 🚫 NO autenticado → FORBIDDEN (no lo mandamos a /login)
    if (!user) {
        return <ForbiddenPage />;
    }

    // Rol seguro como string
    const role = user.role ?? "";

    // 🚫 Autenticado pero rol NO permitido → FORBIDDEN
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <ForbiddenPage />;
    }

    // ✅ Todo bien → dejamos ver el componente
    return children;
};
