/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactNode, useEffect, useState } from "react";
import { AuthContext, type AuthContextType, type User } from "./authContextCore";
import api, { setAuthToken } from "../lib/api";

type Props = { children: ReactNode };

// Helper para construir URL pública de la foto (si backend guarda solo el path)
const buildAvatarUrl = (photo?: string | null) => {
    if (!photo) return "";
    if (typeof photo !== "string") return "";
    // si ya es data:... o url absoluta la usamos tal cual
    if (photo.startsWith("data:") || photo.startsWith("http://") || photo.startsWith("https://")) {
        return photo;
    }
    // si es un path relativo guardado por Laravel (ej: customers/abc.jpg) lo expone en /storage/...
    const API_BASE = import.meta.env.VITE_API_URL ?? "";
    return `${API_BASE.replace(/\/$/, "")}/storage/${photo.replace(/^\/+/, "")}`;
};

// Normaliza el user que viene del servidor para siempre exponer
// firstName, lastName, displayName y avatar
const normalizeUser = (serverUser: any): User => {
    // Intentar obtener firstName y lastName de campos específicos
    let firstName =
        serverUser?.firstNameCustomer ??
        serverUser?.firstNameEmployee ??
        serverUser?.first_name ??
        serverUser?.firstName ??
        "";

    let lastName =
        serverUser?.lastNameCustomer ??
        serverUser?.lastNameEmployee ??
        serverUser?.last_name ??
        serverUser?.lastName ??
        "";

    // Si no tenemos firstName/lastName separados pero tenemos name, intentar dividir
    if (!firstName && !lastName && typeof serverUser?.name === "string") {
        const nameParts = serverUser.name.split(" ");
        firstName = nameParts[0] ?? "";
        lastName = nameParts.slice(1).join(" ") ?? "";
    }

    // displayName es la combinación de firstName y lastName
    const displayName = `${firstName}${lastName ? " " + lastName : ""}`.trim() || serverUser?.name || "";

    const photo =
        serverUser?.photoCustomer ?? serverUser?.photoEmployee ?? serverUser?.photo ?? serverUser?.avatar ?? null;
    const avatar = buildAvatarUrl(photo);

    // retornamos una copia del serverUser con campos normalizados
    return {
        ...serverUser,
        firstName,
        lastName,
        displayName,
        avatar,
    } as User;
};

// Helper para obtener el usuario almacenado de forma síncrona al cargar/recargar
const getStoredUser = (): User | null => {
    try {
        const token = localStorage.getItem("token");
        // Si no hay token en localStorage, el usuario cerró sesión
        if (!token) return null;

        const stored = localStorage.getItem("user");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === "object") {
                return normalizeUser(parsed);
            }
        }
        if (token.includes("admin")) {
            return normalizeUser({
                id: 1,
                name: "Administrador FotoLuna",
                first_name: "Administrador",
                last_name: "FotoLuna",
                email: "admin@fotoluna.com",
                role: "admin",
            });
        }
        if (token.includes("empleado")) {
            return normalizeUser({
                id: 2,
                name: "Carlos Fotógrafo",
                first_name: "Carlos",
                last_name: "Fotógrafo",
                email: "empleado@fotoluna.com",
                role: "empleado",
                employeeType: "Fotógrafo",
            });
        }
        if (token.includes("cliente")) {
            return normalizeUser({
                id: 3,
                name: "Laura Gómez",
                first_name: "Laura",
                last_name: "Gómez",
                email: "cliente@fotoluna.com",
                role: "cliente",
            });
        }
    } catch (e) {
        console.warn("Error leyendo usuario de localStorage:", e);
    }
    return null;
};

const AuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getStoredUser);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    // Si ya existe token y usuario en localStorage, loading es false de inmediato para evitar redirecciones
    const [loading, setLoading] = useState<boolean>(() => !localStorage.getItem("token"));

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (t) {
            setAuthToken(t);
            (async () => {
                try {
                    const res = await api.get("/me");
                    const serverUser = res.data || {};
                    const normalized = normalizeUser(serverUser);
                    setUser(normalized);
                    setToken(t);
                    localStorage.setItem("user", JSON.stringify(normalized));
                } catch (err) {
                    console.warn("No se pudo restaurar sesión desde backend:", err);
                    const localUser = getStoredUser();
                    if (localUser) {
                        setUser(localUser);
                    } else {
                        setUser(null);
                        setToken(null);
                        setAuthToken(null);
                        localStorage.removeItem("token");
                    }
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setLoading(false);
        }
    }, []);

    const loginWithToken = async (t: string) => {
        localStorage.setItem("token", t);
        setAuthToken(t);
        setToken(t);
        try {
            const res = await api.get("/me");
            const serverUser = res.data || {};
            const normalized = normalizeUser(serverUser);
            setUser(normalized);
            localStorage.setItem("user", JSON.stringify(normalized));
        } catch (err) {
            const localUser = getStoredUser();
            if (localUser) {
                setUser(localUser);
            } else {
                setUser(null);
                setToken(null);
                setAuthToken(null);
                localStorage.removeItem("token");
                throw err;
            }
        }
    };

    // const logout = async () => {
    //     try {
    //         await api.post("/api/logout");
    //     } catch (err) {
    //         console.warn("Logout backend error:", err);
    //     }
    //     setUser(null);
    //     setToken(null);
    //     setAuthToken(null);
    //     localStorage.removeItem("token");
    // };

    const logout = async (auto = false) => {
        try {
            const token = localStorage.getItem("token");

            if (!auto) {
                // Logout manual → sí enviamos la petición al backend
                await api.post(
                    "/logout",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );
            }
        } catch (err) {
            console.warn("Logout backend error:", err);
        }

        // limpiar estado completamente
        setUser(null);
        setToken(null);
        setAuthToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_email");
        localStorage.removeItem("fotoluna_demo_mode");

        // redirigir al inicio
        window.location.href = "/";
    };


    const value: AuthContextType = {
        user,
        token,
        loading,
        loginWithToken,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;