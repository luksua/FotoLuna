/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type InternalAxiosRequestConfig } from "axios";
import api from "../lib/api";
import {
    DEMO_USERS,
    DEMO_EVENTS,
    GENERAL_PACKAGES,
    SPECIFIC_PACKAGES,
    DEMO_DOCUMENT_TYPES,
    DEMO_STORAGE_PLANS,
    DEMO_APPOINTMENTS,
    DEMO_DASHBOARD_STATS,
    DEMO_NOTIFICATIONS,
    DEMO_PAYMENTS,
} from "./demoData";

/**
 * Determina si debemos interceptar y responder con mock inmediatamente
 */
export function isDemoEnvironment(): boolean {
    if (typeof window === "undefined") return false;

    // Forzar modo demo en localStorage si el usuario lo activó
    if (localStorage.getItem("fotoluna_demo_mode") === "true") return true;

    // Si está desplegado en Netlify
    const host = window.location.hostname;
    if (host.includes("netlify.app")) return true;

    // Si no hay VITE_API_URL configurada o está vacía
    const envApi = import.meta.env.VITE_API_URL;
    if (!envApi || envApi.trim() === "") return true;

    return false;
}

/**
 * Normaliza una URL eliminando querystrings y prefijos
 */
function cleanUrl(rawUrl: string): string {
    if (!rawUrl) return "";
    let url = rawUrl;
    // Si viene url completa tipo http://localhost... o http://.../api
    try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            const parsed = new URL(url);
            url = parsed.pathname;
        }
    } catch {
        // fallback
    }
    // Quitar query params
    url = url.split("?")[0];
    // Asegurar que empiece con /
    if (!url.startsWith("/")) {
        url = "/" + url;
    }
    return url;
}

export interface MockResult {
    data: any;
    status?: number;
}

/**
 * Enrutador de respuestas simuladas para FotoLuna
 */
export function handleMockRoute(url: string, method = "GET", bodyData?: any): MockResult | null {
    const clean = cleanUrl(url);
    const upperMethod = method.toUpperCase();

    // ==========================================
    // 1. AUTENTICACIÓN
    // ==========================================

    // POST /login o /api/login
    if ((clean === "/login" || clean === "/api/login") && upperMethod === "POST") {
        let email = "cliente@fotoluna.com";

        if (typeof bodyData === "string") {
            try {
                const parsed = JSON.parse(bodyData);
                email = parsed.email || parsed.emailCustomer || email;
            } catch {
                // ignore
            }
        } else if (bodyData && typeof bodyData === "object") {
            email = bodyData.email || bodyData.emailCustomer || email;
        }

        const lowerEmail = email.toLowerCase().trim();
        let role = "cliente";
        let userObj = DEMO_USERS.cliente;
        let redirectTo = "/";

        if (lowerEmail.includes("admin")) {
            role = "admin";
            userObj = { ...DEMO_USERS.admin, email: lowerEmail };
            redirectTo = "/dashboard";
        } else if (lowerEmail.includes("empleado") || lowerEmail.includes("fotografo") || lowerEmail.includes("carlos")) {
            role = "empleado";
            userObj = { ...DEMO_USERS.empleado, email: lowerEmail };
            redirectTo = "/empleado";
        } else {
            role = "cliente";
            const namePart = lowerEmail.split("@")[0].replace(/[._-]/g, " ");
            const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            userObj = {
                ...DEMO_USERS.cliente,
                name: capitalized || "Cliente FotoLuna",
                first_name: capitalized.split(" ")[0] || "Cliente",
                last_name: capitalized.split(" ")[1] || "FotoLuna",
                email: lowerEmail,
            };
            redirectTo = "/";
        }

        const token = `fotoluna-demo-token-${role}-${Date.now()}`;

        // Guardar sesión demo en localStorage para persistencia
        try {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userObj));
            localStorage.setItem("user_email", userObj.email);
            localStorage.setItem("fotoluna_demo_mode", "true");
        } catch (e) {
            console.warn("Error guardando sesión demo:", e);
        }

        return {
            status: 200,
            data: {
                access_token: token,
                token_type: "Bearer",
                user: userObj,
                role: role,
                redirect_to: redirectTo,
            },
        };
    }

    // GET /me o /api/me
    if ((clean === "/me" || clean === "/api/me") && upperMethod === "GET") {
        let user = DEMO_USERS.cliente;
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                user = JSON.parse(stored);
            }
        } catch {
            // fallback
        }

        return {
            status: 200,
            data: {
                ...user,
                firstName: user.firstNameCustomer || user.firstNameEmployee || user.first_name || user.firstName || "Usuario",
                lastName: user.lastNameCustomer || user.lastNameEmployee || user.last_name || user.lastName || "Demo",
                displayName: user.name || "Usuario Demo",
                photo: user.avatar || user.photo || null,
                has_storage_subscription: true,
            },
        };
    }

    // POST /logout o /api/logout
    if ((clean === "/logout" || clean === "/api/logout") && upperMethod === "POST") {
        return {
            status: 200,
            data: { message: "Sesión cerrada correctamente (Modo Demo)" },
        };
    }

    // POST /register o /api/register
    if ((clean === "/register" || clean === "/api/register") && upperMethod === "POST") {
        const newUser = {
            id: Date.now(),
            name: "Nuevo Cliente FotoLuna",
            first_name: "Nuevo",
            last_name: "Cliente",
            email: "nuevo.cliente@fotoluna.com",
            role: "cliente",
            avatar: "",
        };
        const token = `fotoluna-demo-token-cliente-${Date.now()}`;
        return {
            status: 200,
            data: {
                access_token: token,
                token_type: "Bearer",
                user: newUser,
                role: "cliente",
                redirect_to: "/",
            },
        };
    }

    // POST /forgot-password o /recuperar-contrasena
    if (clean.includes("forgot-password") || clean.includes("recuperar")) {
        return {
            status: 200,
            data: { message: "Se ha enviado un enlace de recuperación a tu correo electrónico." },
        };
    }

    // ==========================================
    // 2. PAQUETES Y EVENTOS
    // ==========================================

    // GET /api/events/:id/packages o /events/:id/packages
    const eventPackagesMatch = clean.match(/(?:\/api)?\/events\/(\d+)\/packages/);
    if (eventPackagesMatch && upperMethod === "GET") {
        const eventId = Number(eventPackagesMatch[1]);
        const specific = SPECIFIC_PACKAGES[eventId] || [];
        return {
            status: 200,
            data: {
                general: GENERAL_PACKAGES,
                specific: specific,
            },
        };
    }

    // GET /api/events-with-packages o /events-with-packages
    if (clean.includes("/events-with-packages") && upperMethod === "GET") {
        const data = DEMO_EVENTS.map((e) => ({
            ...e,
            packages: [...(SPECIFIC_PACKAGES[e.id] || []), ...GENERAL_PACKAGES],
        }));
        return { status: 200, data };
    }

    // GET /api/events o /events
    if ((clean === "/events" || clean === "/api/events") && upperMethod === "GET") {
        return { status: 200, data: DEMO_EVENTS };
    }

    // GET /api/document-types o /document-types
    if (clean.includes("/document-types") && upperMethod === "GET") {
        return { status: 200, data: DEMO_DOCUMENT_TYPES };
    }

    // GET /api/storage-plans-customer o /storage-plans-customer
    if (clean.includes("/storage-plans-customer") && upperMethod === "GET") {
        return { status: 200, data: DEMO_STORAGE_PLANS };
    }

    // GET /api/storage/dashboard o /storage/dashboard
    if (clean.includes("/storage/dashboard") && upperMethod === "GET") {
        return {
            status: 200,
            data: {
                currentSubscription: {
                    id: 1,
                    planName: "Básico (15 GB)",
                    status: "active",
                    ends_at: "2026-12-31",
                },
                usage: {
                    usedMb: 2450,
                    totalMb: 15360,
                    percentage: 16,
                },
                plans: DEMO_STORAGE_PLANS,
            },
        };
    }

    // ==========================================
    // 3. ADMIN ENDPOINTS
    // ==========================================

    if (clean.includes("/admin/packages/stats")) {
        return { status: 200, data: DEMO_DASHBOARD_STATS.packages };
    }

    if (clean.includes("/admin/packages/sales/monthly")) {
        return { status: 200, data: DEMO_DASHBOARD_STATS.salesMonthly };
    }

    if (clean.includes("/admin/packages/count-booked")) {
        return {
            status: 200,
            data: [
                { packageName: "Boda Clásica", count: 24 },
                { packageName: "Maternidad Premium", count: 18 },
                { packageName: "Quince Glam", count: 15 },
                { packageName: "Cumpleaños Fiesta", count: 12 },
            ],
        };
    }

    if (clean.includes("/admin/packages") && upperMethod === "GET") {
        const allPackages = [
            ...GENERAL_PACKAGES,
            ...Object.values(SPECIFIC_PACKAGES).flat(),
        ];
        return { status: 200, data: allPackages };
    }

    if (clean.includes("/admin/events") && upperMethod === "GET") {
        return { status: 200, data: DEMO_EVENTS };
    }

    if (clean.includes("/admin/document-types") && upperMethod === "GET") {
        return { status: 200, data: DEMO_DOCUMENT_TYPES };
    }

    if (clean.includes("/admin/employees") && upperMethod === "GET") {
        return {
            status: 200,
            data: [
                DEMO_USERS.empleado,
                {
                    id: 4,
                    name: "Amalia Gómez",
                    first_name: "Amalia",
                    last_name: "Gómez",
                    firstNameEmployee: "Amalia",
                    lastNameEmployee: "Gómez",
                    email: "amalia@fotoluna.com",
                    role: "empleado",
                    employeeType: "Fotógrafa",
                    avatar: "",
                },
            ],
        };
    }

    if (clean.includes("/admin/customers") && upperMethod === "GET") {
        return {
            status: 200,
            data: [
                DEMO_USERS.cliente,
                {
                    id: 5,
                    name: "Valeria Ramos",
                    first_name: "Valeria",
                    last_name: "Ramos",
                    firstNameCustomer: "Valeria",
                    lastNameCustomer: "Ramos",
                    email: "valeria@gmail.com",
                    role: "cliente",
                    avatar: "",
                },
            ],
        };
    }

    if (clean.includes("/admin/cloud-photos/summary") && upperMethod === "GET") {
        return {
            status: 200,
            data: { total: 120, usedStorageMb: 2450, totalQuotaMb: 15000 },
        };
    }

    if (clean.includes("/admin/appointments/pending")) {
        return {
            status: 200,
            data: {
                data: DEMO_APPOINTMENTS,
                total: DEMO_APPOINTMENTS.length,
                current_page: 1,
                last_page: 1,
                per_page: 10,
            },
        };
    }

    // ==========================================
    // 4. CITAS, DISPONIBILIDAD Y EMPLEADOS
    // ==========================================

    if (clean.includes("/availability") && upperMethod === "GET") {
        return {
            status: 200,
            data: {
                allBlocked: false,
                availableTimes: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
                blockedTimes: ["13:00"],
                unavailableDays: [],
                busyDays: [],
            },
        };
    }

    if (clean.includes("/employees/available") && upperMethod === "GET") {
        return {
            status: 200,
            data: [
                {
                    id: 2,
                    name: "Carlos Fotógrafo",
                    specialty: "Bodas, Quinces y Retratos",
                    portfolioUrl: "#",
                    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                },
                {
                    id: 4,
                    name: "Amalia Gómez",
                    specialty: "Maternidad, Graduaciones y Sacramentos",
                    portfolioUrl: "#",
                    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
                },
            ],
        };
    }

    if (clean.includes("/employees/ratings") && upperMethod === "GET") {
        return { status: 200, data: DEMO_DASHBOARD_STATS.ratings };
    }

    if (clean.includes("/employees/all") && upperMethod === "GET") {
        return { status: 200, data: [DEMO_USERS.empleado] };
    }

    if (clean.includes("/employee") && clean.includes("/appointments") && upperMethod === "GET") {
        return { status: 200, data: DEMO_APPOINTMENTS };
    }

    if (clean.includes("/appointments-customer") && upperMethod === "GET") {
        return { status: 200, data: DEMO_APPOINTMENTS };
    }

    if (clean.includes("/appointments/draft") && upperMethod === "POST") {
        return { status: 200, data: { appointmentId: 101 } };
    }

    if (clean.includes("/appointments") && upperMethod === "POST") {
        return {
            status: 200,
            data: {
                message: "Cita guardada con éxito (Demo)",
                appointmentId: 101,
                appointment: DEMO_APPOINTMENTS[0],
            },
        };
    }

    // ==========================================
    // 5. FOTOS, COMENTARIOS, NOTIFICACIONES Y PAGOS
    // ==========================================

    if (clean.includes("/client/my-cloud-photos") || clean.includes("/cloud-photos")) {
        return {
            status: 200,
            data: [
                {
                    id: 1,
                    name: "Sesión_Boda_01.jpg",
                    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
                    size: "4.2 MB",
                    created_at: "2026-03-20",
                },
                {
                    id: 2,
                    name: "Sesión_Maternidad_02.jpg",
                    url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
                    size: "5.1 MB",
                    created_at: "2026-03-22",
                },
                {
                    id: 3,
                    name: "Sesión_Quince_03.jpg",
                    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
                    size: "3.8 MB",
                    created_at: "2026-03-25",
                },
            ],
        };
    }

    if (clean.includes("/comments") && upperMethod === "GET") {
        return {
            status: 200,
            data: [
                {
                    id: 1,
                    author: "Camila Valencia",
                    comment: "¡Excelente atención y las fotos quedaron hermosas! Carlos fue muy paciente y profesional.",
                    rating: 5,
                    date: "2026-03-15",
                },
                {
                    id: 2,
                    author: "Juan David Ríos",
                    comment: "Gran calidad en la sesión de bodas, capturaron cada momento especial.",
                    rating: 5,
                    date: "2026-03-20",
                },
            ],
        };
    }

    if (clean.includes("/notifications") && clean.includes("/read") && upperMethod === "POST") {
        return { status: 200, data: { success: true } };
    }

    if (clean.includes("/notifications") && upperMethod === "DELETE") {
        return { status: 204, data: null };
    }

    if (clean.includes("/notifications") && upperMethod === "GET") {
        return {
            status: 200,
            data: DEMO_NOTIFICATIONS,
        };
    }

    if (clean.includes("/mercadopago/preference") && upperMethod === "POST") {
        return {
            status: 200,
            data: {
                id: "demo-pref-12345",
                init_point: "#pago-demo-completado",
            },
        };
    }

    // ==========================================
    // 6. PAGOS Y FACTURACIÓN (EMPLOYEE & ADMIN)
    // ==========================================

    if ((clean.includes("/employee/payments") || clean.includes("/admin/booking-payments") || clean.includes("/admin/payments")) && upperMethod === "GET") {
        if (clean.includes("/summary")) {
            return {
                status: 200,
                data: {
                    totalApprovedAmount: 175000,
                    totalPendingAmount: 410000,
                    totalCount: DEMO_PAYMENTS.length,
                },
            };
        }

        return {
            status: 200,
            data: {
                data: DEMO_PAYMENTS,
                meta: {
                    current_page: 1,
                    last_page: 1,
                    per_page: 10,
                    total: DEMO_PAYMENTS.length,
                },
                current_page: 1,
                last_page: 1,
                total: DEMO_PAYMENTS.length,
            },
        };
    }

    // Si es cualquier otra ruta bajo /api/ en modo demo, devolver genérico según método
    if (clean.startsWith("/api/") || clean.startsWith("/storage")) {
        if (upperMethod === "GET") {
            const emptyList: any = [];
            emptyList.data = [];
            emptyList.meta = { current_page: 1, last_page: 1, total: 0, per_page: 10 };
            emptyList.last_page = 1;
            emptyList.total = 0;
            emptyList.current_page = 1;
            return { status: 200, data: emptyList };
        }
        return { status: 200, data: { success: true, message: "Operación simulada en modo demostración" } };
    }

    return null;
}

/**
 * Verifica si una respuesta devuelta por Netlify es el fallback HTML del SPA
 */
function isHtmlSpaFallback(data: any): boolean {
    if (typeof data === "string") {
        const trimmed = data.trim();
        return (
            trimmed.startsWith("<!DOCTYPE") ||
            trimmed.startsWith("<!doctype") ||
            trimmed.startsWith("<html")
        );
    }
    return false;
}

/**
 * Instala interceptores para Axios (tanto en la instancia api como en el axios por defecto)
 */
function setupAxiosMock(instance: typeof axios | any) {
    // 1. Interceptor de Request: En modo demo, interceptar antes de enviar a la red
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        if (isDemoEnvironment()) {
            const mock = handleMockRoute(config.url || "", config.method || "GET", config.data);
            if (mock) {
                config.adapter = () =>
                    Promise.resolve({
                        data: mock.data,
                        status: mock.status || 200,
                        statusText: "OK",
                        headers: {},
                        config,
                    });
            }
        }
        return config;
    });

    // 2. Interceptor de Response: Capturar HTML de SPA fallback o errores de red/404
    instance.interceptors.response.use(
        (response: any) => {
            const url = response.config?.url || "";
            // Si Netlify respondió con HTML en una ruta API, reemplazar por mock data
            if (isHtmlSpaFallback(response.data)) {
                const mock = handleMockRoute(url, response.config?.method || "GET", response.config?.data);
                if (mock) {
                    return {
                        ...response,
                        data: mock.data,
                        status: mock.status || 200,
                    };
                }
            }
            return response;
        },
        (error: any) => {
            const url = error.config?.url || "";
            const mock = handleMockRoute(url, error.config?.method || "GET", error.config?.data);
            if (mock) {
                return Promise.resolve({
                    data: mock.data,
                    status: mock.status || 200,
                    statusText: "OK",
                    headers: {},
                    config: error.config,
                });
            }
            return Promise.reject(error);
        }
    );
}

/**
 * Intercepta las llamadas a window.fetch globales
 */
function setupFetchMock() {
    if (typeof window === "undefined" || !window.fetch) return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const method = init?.method || "GET";
        const body = init?.body;

        // Si estamos en entorno demo y coincide la ruta mock
        if (isDemoEnvironment()) {
            const mock = handleMockRoute(url, method, body);
            if (mock) {
                return new Response(JSON.stringify(mock.data), {
                    status: mock.status || 200,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        try {
            const response = await originalFetch(input, init);
            // Si la respuesta no es OK o es un HTML de fallback de Netlify
            const isHtml = response.headers.get("content-type")?.includes("text/html");
            if (!response.ok || isHtml) {
                const mock = handleMockRoute(url, method, body);
                if (mock) {
                    return new Response(JSON.stringify(mock.data), {
                        status: mock.status || 200,
                        headers: { "Content-Type": "application/json" },
                    });
                }
            }
            return response;
        } catch (err) {
            const mock = handleMockRoute(url, method, body);
            if (mock) {
                return new Response(JSON.stringify(mock.data), {
                    status: mock.status || 200,
                    headers: { "Content-Type": "application/json" },
                });
            }
            throw err;
        }
    };
}

/**
 * Inicializador principal: Conecta el adaptador a api, axios y window.fetch
 */
export function initDemoAdapter() {
    setupAxiosMock(api);
    setupAxiosMock(axios);
    setupFetchMock();
    console.log("🚀 [FotoLuna] Adaptador Demo y Mock inicializado con éxito.");
}
