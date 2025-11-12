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
    const firstName =
        serverUser?.firstNameCustomer ??
        serverUser?.firstNameEmployee ??
        serverUser?.first_name ??
        serverUser?.firstName ??
        (typeof serverUser?.name === "string" ? serverUser.name.split(" ")[0] : "") ??
        "";

    const lastName =
        serverUser?.lastNameCustomer ??
        serverUser?.lastNameEmployee ??
        serverUser?.last_name ??
        serverUser?.lastName ??
        (typeof serverUser?.name === "string" ? serverUser.name.split(" ").slice(1).join(" ") : "") ??
        "";

    const displayName = `${firstName}${lastName ? " " + lastName : ""}`.trim();

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

const AuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (t) {
            (async () => {
                try {
                    setAuthToken(t);
                    const res = await api.get("/api/me");
                    const serverUser = res.data || {};
                    const normalized = normalizeUser(serverUser);
                    setUser(normalized);
                    setToken(t);
                } catch (err) {
                    console.warn("No se pudo restaurar sesión:", err);
                    setUser(null);
                    setToken(null);
                    setAuthToken(null);
                    localStorage.removeItem("token");
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
            const res = await api.get("/api/me");
            const serverUser = res.data || {};
            const normalized = normalizeUser(serverUser);
            setUser(normalized);
        } catch (err) {
            setUser(null);
            setToken(null);
            setAuthToken(null);
            localStorage.removeItem("token");
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.post("/api/logout");
        } catch (err) {
            console.warn("Logout backend error:", err);
        }
        setUser(null);
        setToken(null);
        setAuthToken(null);
        localStorage.removeItem("token");
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