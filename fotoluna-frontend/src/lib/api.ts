import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_BASE || "",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

// helper para setear el header Authorization cuando tengas token
export function setAuthToken(token?: string | null) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}

export default api;