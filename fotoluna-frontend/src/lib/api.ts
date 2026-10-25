import axios from "axios";

const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = envApiUrl ? `${envApiUrl.replace(/\/+$/, "")}/api` : "/api";

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

// Normalizar rutas para evitar duplicar /api si ya está en baseURL
api.interceptors.request.use((config) => {
    if (config.url && config.url.startsWith("/api/")) {
        config.url = config.url.replace(/^\/api/, "");
    }
    return config;
});

// Helper para setear el header Authorization cuando tengas token
export function setAuthToken(token?: string | null) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}

// Configuración de interceptores de respuesta
export function setupInterceptors(onSessionExpired: () => void) {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status;

            if (status === 401 || status === 419) {
                console.warn("Sesión expirada o no válida");
                onSessionExpired();
            }

            return Promise.reject(error);
        }
    );
}

export default api;