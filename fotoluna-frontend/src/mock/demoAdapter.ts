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
 * Helpers para almacenar y recuperar datos en localStorage (persistencia sencilla sin BD)
 */
function getStoredJson<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch (e) {
        console.warn(`Error leyendo ${key} de localStorage:`, e);
    }
    return defaultValue;
}

function setStoredJson<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Error guardando ${key} en localStorage:`, e);
    }
}

function parsePayload(bodyData: any): Record<string, any> {
    if (!bodyData) return {};
    if (typeof bodyData === "string") {
        try {
            return JSON.parse(bodyData);
        } catch {
            return {};
        }
    }
    if (typeof FormData !== "undefined" && bodyData instanceof FormData) {
        const obj: Record<string, any> = {};
        bodyData.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    if (typeof bodyData === "object") {
        return bodyData;
    }
    return {};
}

// -------------------------------------------------------------
// COLECCIONES DEMO BASE
// -------------------------------------------------------------

const DEFAULT_CUSTOMERS = [
    {
        id: 3,
        userId: 3,
        name: "Laura Gómez",
        firstNameCustomer: "Laura",
        lastNameCustomer: "Gómez",
        first_name: "Laura",
        last_name: "Gómez",
        email: "cliente@fotoluna.com",
        emailCustomer: "cliente@fotoluna.com",
        phone: "3115550192",
        phoneCustomer: "3115550192",
        document: "1020304050",
        documentType: "CC",
        documentNumber: "1020304050",
        role: "cliente",
        avatar: "",
    },
    {
        id: 5,
        userId: 5,
        name: "Valeria Ramos",
        firstNameCustomer: "Valeria",
        lastNameCustomer: "Ramos",
        first_name: "Valeria",
        last_name: "Ramos",
        email: "valeria@gmail.com",
        emailCustomer: "valeria@gmail.com",
        phone: "3124445566",
        phoneCustomer: "3124445566",
        document: "1098765432",
        documentType: "CC",
        documentNumber: "1098765432",
        role: "cliente",
        avatar: "",
    },
    {
        id: 6,
        userId: 6,
        name: "Andrés Felipe Castro",
        firstNameCustomer: "Andrés",
        lastNameCustomer: "Castro",
        first_name: "Andrés",
        last_name: "Castro",
        email: "andres.castro@gmail.com",
        emailCustomer: "andres.castro@gmail.com",
        phone: "3158889900",
        phoneCustomer: "3158889900",
        document: "1032890123",
        documentType: "CC",
        documentNumber: "1032890123",
        role: "cliente",
        avatar: "",
    },
];

const DEFAULT_EMPLOYEES = [
    {
        id: 2,
        uniqueId: 2,
        name: "Carlos Fotógrafo",
        firstNameEmployee: "Carlos",
        lastNameEmployee: "Fotógrafo",
        first_name: "Carlos",
        last_name: "Fotógrafo",
        email: "empleado@fotoluna.com",
        emailEmployee: "empleado@fotoluna.com",
        phone: "3101234567",
        phoneEmployee: "3101234567",
        document: "987654321",
        documentNumber: "987654321",
        role: "empleado",
        employeeType: "Fotógrafo",
        specialty: "Bodas, Quinces y Retratos",
        isAvailable: 1,
        estado: true,
        address: "Calle 10 # 25-14",
        EPS: "Sura",
        avatar: "",
    },
    {
        id: 4,
        uniqueId: 4,
        name: "Amalia Gómez",
        firstNameEmployee: "Amalia",
        lastNameEmployee: "Gómez",
        first_name: "Amalia",
        last_name: "Gómez",
        email: "amalia@fotoluna.com",
        emailEmployee: "amalia@fotoluna.com",
        phone: "3189998877",
        phoneEmployee: "3189998877",
        document: "52341678",
        documentNumber: "52341678",
        role: "empleado",
        employeeType: "Fotógrafa",
        specialty: "Maternidad, Graduaciones y Sacramentos",
        isAvailable: 1,
        estado: true,
        address: "Carrera 45 # 12-30",
        EPS: "Sanitas",
        avatar: "",
    },
];

const DEFAULT_EVENTS = DEMO_EVENTS.map((e) => ({
    id: e.id,
    eventId: e.id,
    nombre: e.eventType,
    eventType: e.eventType,
    descripcion: `Sesiones fotográficas especializadas para ${e.eventType}.`,
    duracion: "60 min",
    precio: 80000,
    estado: true,
}));

const DEFAULT_PACKAGES = [
    ...GENERAL_PACKAGES.map((p) => ({
        id: p.id,
        nombre: p.packageName,
        packageName: p.packageName,
        descripcion: p.packageDescription,
        cantidad_eventos: 1,
        precio: p.packagePrice,
        evento_nombre: "General",
        estado: true,
        durationMinutes: p.durationMinutes,
        documentTypeIdFK: null,
    })),
    ...Object.entries(SPECIFIC_PACKAGES).flatMap(([eventId, pkgs]) =>
        pkgs.map((p: any) => ({
            id: p.id,
            nombre: p.packageName,
            packageName: p.packageName,
            descripcion: p.packageDescription,
            cantidad_eventos: 1,
            precio: p.packagePrice,
            evento_nombre: DEMO_EVENTS.find((e) => e.id === Number(eventId))?.eventType || "Específico",
            estado: true,
            durationMinutes: p.durationMinutes,
            documentTypeIdFK: p.documentTypeIdFK || null,
        }))
    ),
];

const DEFAULT_DOC_TYPES = DEMO_DOCUMENT_TYPES.map((d) => ({
    id: d.id,
    documentTypeId: d.id,
    nombre: d.name,
    name: d.name,
    descripcion: `Fotografías reglamentarias para ${d.name}.`,
    cantidad: 6,
    precio: d.price || 15000,
    requiereSubida: false,
    requierePresencial: true,
    estado: true,
}));

const DEFAULT_PHOTO_SUMMARIES = [
    {
        customerId: 3,
        customerName: "Laura Gómez",
        totalPhotos: 12,
        lastUploadAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        recentPhotos: [
            {
                id: 101,
                url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
                uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                bookingId: 1,
            },
            {
                id: 102,
                url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80",
                uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                bookingId: 1,
            },
            {
                id: 103,
                url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
                uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                bookingId: 2,
            },
        ],
    },
    {
        customerId: 5,
        customerName: "Valeria Ramos",
        totalPhotos: 8,
        lastUploadAt: new Date(Date.now() - 86400000).toISOString(),
        recentPhotos: [
            {
                id: 201,
                url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                uploadedAt: new Date(Date.now() - 86400000).toISOString(),
                bookingId: 3,
            },
            {
                id: 202,
                url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                bookingId: 3,
            },
        ],
    },
    {
        customerId: 6,
        customerName: "Andrés Felipe Castro",
        totalPhotos: 15,
        lastUploadAt: new Date().toISOString(),
        recentPhotos: [
            {
                id: 301,
                url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                uploadedAt: new Date().toISOString(),
                bookingId: 4,
            },
        ],
    },
];

/**
 * Normaliza una URL eliminando querystrings y prefijos
 */
function cleanUrl(rawUrl: string): string {
    if (!rawUrl) return "";
    let url = rawUrl;
    try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            const parsed = new URL(url);
            url = parsed.pathname;
        }
    } catch {
        // fallback
    }
    url = url.split("?")[0];
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
 * Enrutador de respuestas simuladas para FotoLuna con persistencia en localStorage
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
        const payload = parsePayload(bodyData);
        if (payload.email || payload.emailCustomer) {
            email = payload.email || payload.emailCustomer;
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
            } else {
                const t = localStorage.getItem("token") || "";
                if (t.includes("admin")) user = DEMO_USERS.admin;
                else if (t.includes("empleado")) user = DEMO_USERS.empleado;
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
        const payload = parsePayload(bodyData);
        const customers = getStoredJson("fotoluna_demo_customers", DEFAULT_CUSTOMERS);
        const newId = customers.length > 0 ? Math.max(...customers.map((c) => Number(c.id) || 0)) + 1 : 10;
        const firstName = payload.firstNameCustomer || payload.first_name || (payload.name ? payload.name.split(" ")[0] : "Cliente");
        const lastName = payload.lastNameCustomer || payload.last_name || (payload.name ? payload.name.split(" ").slice(1).join(" ") : "FotoLuna");
        const fullName = `${firstName} ${lastName}`.trim();
        const email = payload.email || payload.emailCustomer || `cliente_${newId}@fotoluna.com`;
        const phone = payload.phoneCustomer || payload.phone || "3001234567";
        const docNum = payload.documentNumber || payload.document || "1000000000";
        const docType = payload.documentType || "CC";

        const newCustomer = {
            id: newId,
            userId: newId,
            name: fullName,
            firstNameCustomer: firstName,
            lastNameCustomer: lastName,
            first_name: firstName,
            last_name: lastName,
            email: email,
            emailCustomer: email,
            phone: phone,
            phoneCustomer: phone,
            document: docNum,
            documentType: docType,
            documentNumber: docNum,
            role: "cliente",
            avatar: "",
        };

        customers.unshift(newCustomer);
        setStoredJson("fotoluna_demo_customers", customers);

        const token = `fotoluna-demo-token-cliente-${Date.now()}`;
        try {
            localStorage.setItem("user", JSON.stringify(newCustomer));
            localStorage.setItem("token", token);
        } catch (e) {
            console.warn(e);
        }

        return {
            status: 201,
            data: {
                success: true,
                message: "Cliente registrado exitosamente (Modo Demo)",
                access_token: token,
                token_type: "Bearer",
                user: newCustomer,
                customer: newCustomer,
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
    // 2. CLIENTES (CUSTOMERS) CON PERSISTENCIA
    // ==========================================

    if (clean.includes("/customers/search") && upperMethod === "GET") {
        const queryMatch = url.match(/[?&]query=([^&]+)/);
        const q = queryMatch ? decodeURIComponent(queryMatch[1]).toLowerCase() : "";
        const customers = getStoredJson("fotoluna_demo_customers", DEFAULT_CUSTOMERS);
        const filtered = q
            ? customers.filter(
                  (c) =>
                      c.name.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      (c.documentNumber && c.documentNumber.includes(q))
              )
            : customers;
        return { status: 200, data: filtered };
    }

    const customerDetailsMatch = clean.match(/(?:\/api)?\/customers\/(\d+)(?!\/)/);
    if (customerDetailsMatch && upperMethod === "GET") {
        const id = Number(customerDetailsMatch[1]);
        const customers = getStoredJson("fotoluna_demo_customers", DEFAULT_CUSTOMERS);
        const found = customers.find((c) => c.id === id) || {
            id,
            name: `Cliente #${id}`,
            email: `cliente${id}@fotoluna.com`,
            phone: "3000000000",
            documentNumber: "1000000000",
        };
        return {
            status: 200,
            data: {
                ...found,
                fullName: found.name,
            },
        };
    }

    if (clean.includes("/admin/customers/count") && upperMethod === "GET") {
        const customers = getStoredJson("fotoluna_demo_customers", DEFAULT_CUSTOMERS);
        return { status: 200, data: { count: customers.length } };
    }

    if ((clean.includes("/admin/customers") || clean === "/customers" || clean === "/api/customers") && upperMethod === "GET") {
        const customers = getStoredJson("fotoluna_demo_customers", DEFAULT_CUSTOMERS);
        return {
            status: 200,
            data: {
                success: true,
                data: customers,
                total: customers.length,
            },
        };
    }

    if ((clean.includes("/admin/customers") || clean === "/customers" || clean === "/api/customers") && upperMethod === "POST") {
        const payload = parsePayload(bodyData);
        const customers = getStoredJson("fotoluna_demo_customers", DEFAULT_CUSTOMERS);
        const newId = customers.length > 0 ? Math.max(...customers.map((c) => Number(c.id) || 0)) + 1 : 10;
        const firstName = payload.firstNameCustomer || payload.first_name || (payload.name ? payload.name.split(" ")[0] : "Cliente");
        const lastName = payload.lastNameCustomer || payload.last_name || (payload.name ? payload.name.split(" ").slice(1).join(" ") : "Demo");
        const fullName = `${firstName} ${lastName}`.trim();
        const newCustomer = {
            id: newId,
            userId: newId,
            name: fullName,
            firstNameCustomer: firstName,
            lastNameCustomer: lastName,
            first_name: firstName,
            last_name: lastName,
            email: payload.email || payload.emailCustomer || `cliente_${newId}@fotoluna.com`,
            emailCustomer: payload.email || payload.emailCustomer || `cliente_${newId}@fotoluna.com`,
            phone: payload.phoneCustomer || payload.phone || "3001234567",
            phoneCustomer: payload.phoneCustomer || payload.phone || "3001234567",
            document: payload.documentNumber || payload.document || "1000000000",
            documentType: payload.documentType || "CC",
            documentNumber: payload.documentNumber || payload.document || "1000000000",
            role: "cliente",
            avatar: "",
        };
        customers.unshift(newCustomer);
        setStoredJson("fotoluna_demo_customers", customers);
        return {
            status: 201,
            data: {
                success: true,
                data: newCustomer,
                customer: newCustomer,
                message: "Cliente registrado exitosamente (Demo)",
            },
        };
    }

    // ==========================================
    // 3. EMPLEADOS (EMPLOYEES) CON PERSISTENCIA
    // ==========================================

    if ((clean.includes("/admin/employees") || clean === "/employees" || clean === "/api/employees") && upperMethod === "GET") {
        const employees = getStoredJson("fotoluna_demo_employees", DEFAULT_EMPLOYEES);
        return {
            status: 200,
            data: {
                success: true,
                data: employees,
                total: employees.length,
            },
        };
    }

    if ((clean.includes("/admin/employees") || clean === "/employees" || clean === "/api/employees") && upperMethod === "POST") {
        const payload = parsePayload(bodyData);
        const employees = getStoredJson("fotoluna_demo_employees", DEFAULT_EMPLOYEES);
        const newId = employees.length > 0 ? Math.max(...employees.map((e) => Number(e.id) || 0)) + 1 : 10;
        const firstName = payload.firstNameEmployee || payload.first_name || (payload.name ? payload.name.split(" ")[0] : "Empleado");
        const lastName = payload.lastNameEmployee || payload.last_name || (payload.name ? payload.name.split(" ").slice(1).join(" ") : "Demo");
        const fullName = `${firstName} ${lastName}`.trim();

        const newEmployee = {
            id: newId,
            uniqueId: newId,
            name: fullName,
            firstNameEmployee: firstName,
            lastNameEmployee: lastName,
            first_name: firstName,
            last_name: lastName,
            email: payload.emailEmployee || payload.email || `empleado_${newId}@fotoluna.com`,
            emailEmployee: payload.emailEmployee || payload.email || `empleado_${newId}@fotoluna.com`,
            phone: payload.phoneEmployee || payload.phone || "3100000000",
            phoneEmployee: payload.phoneEmployee || payload.phone || "3100000000",
            document: payload.documentNumber || payload.document || "12345678",
            documentNumber: payload.documentNumber || payload.document || "12345678",
            role: "empleado",
            employeeType: payload.employeeType || "Fotógrafo",
            specialty: payload.specialty || "Fotografía General",
            isAvailable: 1,
            estado: true,
            address: payload.address || "Dirección Demo",
            EPS: payload.EPS || "Sura",
            avatar: "",
        };

        employees.unshift(newEmployee);
        setStoredJson("fotoluna_demo_employees", employees);

        return {
            status: 201,
            data: {
                success: true,
                data: newEmployee,
                message: "Empleado registrado exitosamente (Modo Demo)",
            },
        };
    }

    // Toggle status empleado
    const empStatusMatch = clean.match(/(?:\/api)?\/admin\/employees\/(\d+)\/status/);
    if (empStatusMatch && (upperMethod === "PATCH" || upperMethod === "PUT" || upperMethod === "POST")) {
        const id = Number(empStatusMatch[1]);
        const employees = getStoredJson("fotoluna_demo_employees", DEFAULT_EMPLOYEES);
        const emp = employees.find((e) => e.id === id);
        if (emp) {
            emp.isAvailable = emp.isAvailable ? 0 : 1;
            emp.estado = !emp.estado;
            setStoredJson("fotoluna_demo_employees", employees);
        }
        return { status: 200, data: { success: true, message: "Estado actualizado" } };
    }

    if (clean.includes("/employees/available") && upperMethod === "GET") {
        const employees = getStoredJson("fotoluna_demo_employees", DEFAULT_EMPLOYEES);
        return {
            status: 200,
            data: employees.map((e) => ({
                id: e.id,
                name: e.name,
                specialty: e.specialty || "Fotografía Profesional",
                portfolioUrl: "#",
                photo: e.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            })),
        };
    }

    if (clean.includes("/employees/all") && upperMethod === "GET") {
        const employees = getStoredJson("fotoluna_demo_employees", DEFAULT_EMPLOYEES);
        return { status: 200, data: employees };
    }

    if (clean.includes("/employees/ratings") && upperMethod === "GET") {
        return { status: 200, data: DEMO_DASHBOARD_STATS.ratings };
    }

    // ==========================================
    // 4. EVENTOS (EVENTS) CON PERSISTENCIA
    // ==========================================

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

    if (clean.includes("/events-with-packages") && upperMethod === "GET") {
        const events = getStoredJson("fotoluna_demo_events", DEFAULT_EVENTS);
        const data = events.map((e) => ({
            ...e,
            packages: [...(SPECIFIC_PACKAGES[e.id] || []), ...GENERAL_PACKAGES],
        }));
        return { status: 200, data };
    }

    if ((clean.includes("/admin/events") || clean === "/events" || clean === "/api/events") && upperMethod === "GET") {
        const events = getStoredJson("fotoluna_demo_events", DEFAULT_EVENTS);
        return { status: 200, data: events };
    }

    if (clean.includes("/admin/events") && upperMethod === "POST") {
        const payload = parsePayload(bodyData);
        const events = getStoredJson("fotoluna_demo_events", DEFAULT_EVENTS);
        const newId = events.length > 0 ? Math.max(...events.map((e) => Number(e.id) || 0)) + 1 : 10;
        const newEvent = {
            id: newId,
            eventId: newId,
            nombre: payload.nombre || payload.eventType || "Nuevo Evento",
            eventType: payload.nombre || payload.eventType || "Nuevo Evento",
            descripcion: payload.descripcion || "",
            duracion: payload.duracion || "60 min",
            precio: Number(payload.precio) || 50000,
            estado: true,
        };
        events.push(newEvent);
        setStoredJson("fotoluna_demo_events", events);
        return { status: 201, data: newEvent };
    }

    const eventStatusMatch = clean.match(/(?:\/api)?\/admin\/events\/(\d+)/);
    if (eventStatusMatch && (upperMethod === "PATCH" || upperMethod === "PUT")) {
        const id = Number(eventStatusMatch[1]);
        const payload = parsePayload(bodyData);
        const events = getStoredJson("fotoluna_demo_events", DEFAULT_EVENTS);
        const ev = events.find((e) => e.id === id);
        if (ev) {
            if (payload.estado !== undefined) ev.estado = Boolean(payload.estado);
            if (payload.nombre) ev.nombre = payload.nombre;
            if (payload.precio !== undefined) ev.precio = Number(payload.precio);
            setStoredJson("fotoluna_demo_events", events);
        }
        return { status: 200, data: { success: true, data: ev } };
    }

    // ==========================================
    // 5. PAQUETES (PACKAGES) CON PERSISTENCIA
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
        const packages = getStoredJson("fotoluna_demo_packages", DEFAULT_PACKAGES);
        return { status: 200, data: packages };
    }

    if (clean.includes("/admin/packages") && upperMethod === "POST") {
        const payload = parsePayload(bodyData);
        const packages = getStoredJson("fotoluna_demo_packages", DEFAULT_PACKAGES);
        const newId = packages.length > 0 ? Math.max(...packages.map((p) => Number(p.id) || 0)) + 1 : 10;
        const newPkg = {
            id: newId,
            nombre: payload.nombre || payload.packageName || "Nuevo Paquete",
            packageName: payload.nombre || payload.packageName || "Nuevo Paquete",
            descripcion: payload.descripcion || payload.packageDescription || "",
            cantidad_eventos: Number(payload.cantidad_eventos) || 1,
            precio: Number(payload.precio || payload.packagePrice) || 50000,
            evento_nombre: payload.evento_nombre || "General",
            estado: true,
            durationMinutes: Number(payload.durationMinutes) || 60,
            documentTypeIdFK: null,
        };
        packages.push(newPkg);
        setStoredJson("fotoluna_demo_packages", packages);
        return { status: 201, data: newPkg };
    }

    const packageStatusMatch = clean.match(/(?:\/api)?\/admin\/packages\/(\d+)/);
    if (packageStatusMatch && (upperMethod === "PATCH" || upperMethod === "PUT")) {
        const id = Number(packageStatusMatch[1]);
        const payload = parsePayload(bodyData);
        const packages = getStoredJson("fotoluna_demo_packages", DEFAULT_PACKAGES);
        const pkg = packages.find((p) => p.id === id);
        if (pkg) {
            if (payload.estado !== undefined) pkg.estado = Boolean(payload.estado);
            if (payload.nombre) pkg.nombre = payload.nombre;
            if (payload.precio !== undefined) pkg.precio = Number(payload.precio);
            setStoredJson("fotoluna_demo_packages", packages);
        }
        return { status: 200, data: { success: true, data: pkg } };
    }

    // ==========================================
    // 6. TIPOS DE DOCUMENTO (DOCUMENT TYPES)
    // ==========================================

    if ((clean.includes("/admin/document-types") || clean.includes("/document-types")) && upperMethod === "GET") {
        const docTypes = getStoredJson("fotoluna_demo_doc_types", DEFAULT_DOC_TYPES);
        return { status: 200, data: docTypes };
    }

    if (clean.includes("/admin/document-types") && upperMethod === "POST") {
        const payload = parsePayload(bodyData);
        const docTypes = getStoredJson("fotoluna_demo_doc_types", DEFAULT_DOC_TYPES);
        const newId = docTypes.length > 0 ? Math.max(...docTypes.map((d) => Number(d.id) || 0)) + 1 : 10;
        const newDoc = {
            id: newId,
            documentTypeId: newId,
            nombre: payload.nombre || payload.name || "Nuevo Documento",
            name: payload.nombre || payload.name || "Nuevo Documento",
            descripcion: payload.descripcion || "",
            cantidad: Number(payload.cantidad) || 6,
            precio: Number(payload.precio) || 15000,
            requiereSubida: Boolean(payload.requiereSubida),
            requierePresencial: Boolean(payload.requierePresencial ?? true),
            estado: true,
        };
        docTypes.push(newDoc);
        setStoredJson("fotoluna_demo_doc_types", docTypes);
        return { status: 201, data: newDoc };
    }

    const docStatusMatch = clean.match(/(?:\/api)?\/admin\/document-types\/(\d+)/);
    if (docStatusMatch && (upperMethod === "PATCH" || upperMethod === "PUT")) {
        const id = Number(docStatusMatch[1]);
        const payload = parsePayload(bodyData);
        const docTypes = getStoredJson("fotoluna_demo_doc_types", DEFAULT_DOC_TYPES);
        const doc = docTypes.find((d) => d.id === id);
        if (doc) {
            if (payload.estado !== undefined) doc.estado = Boolean(payload.estado);
            if (payload.nombre) doc.nombre = payload.nombre;
            if (payload.precio !== undefined) doc.precio = Number(payload.precio);
            setStoredJson("fotoluna_demo_doc_types", docTypes);
        }
        return { status: 200, data: { success: true, data: doc } };
    }

    // ==========================================
    // 7. CITAS (APPOINTMENTS) CON PERSISTENCIA
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

    if (clean.includes("/admin/appointments/pending")) {
        const appts = getStoredJson("fotoluna_demo_appointments", DEMO_APPOINTMENTS);
        return {
            status: 200,
            data: {
                data: appts,
                total: appts.length,
                current_page: 1,
                last_page: 1,
                per_page: 10,
            },
        };
    }

    if (
        (clean.includes("/employee") && clean.includes("/appointments") && upperMethod === "GET") ||
        (clean.includes("/appointments-customer") && upperMethod === "GET") ||
        (clean === "/appointments" && upperMethod === "GET") ||
        (clean === "/api/appointments" && upperMethod === "GET")
    ) {
        const appts = getStoredJson("fotoluna_demo_appointments", DEMO_APPOINTMENTS);
        return { status: 200, data: appts };
    }

    if (clean.includes("/appointments/draft") && upperMethod === "POST") {
        return { status: 200, data: { appointmentId: 101 } };
    }

    if (clean.includes("/appointments") && upperMethod === "POST") {
        const payload = parsePayload(bodyData);
        const appointments = getStoredJson("fotoluna_demo_appointments", DEMO_APPOINTMENTS);
        const newId = appointments.length > 0 ? Math.max(...appointments.map((a) => Number(a.appointmentId || a.id) || 0)) + 1 : 101;
        const newAppt = {
            appointmentId: newId,
            bookingId: newId,
            id: newId,
            clientName: payload.client || "Cliente FotoLuna",
            customerId: Number(payload.customerIdFK) || 3,
            eventName: payload.eventName || "Sesión Fotográfica",
            eventId: Number(payload.eventIdFK) || 1,
            date: payload.date || new Date().toISOString().split("T")[0],
            startTime: payload.startTime || "10:00",
            appointmentTime: payload.startTime || "10:00",
            duration: Number(payload.appointmentDuration) || 60,
            status: payload.status || "Pendiente",
            place: payload.location || "Estudio FotoLuna",
            comment: payload.notes || "",
            created_at: new Date().toISOString(),
        };
        appointments.unshift(newAppt);
        setStoredJson("fotoluna_demo_appointments", appointments);

        return {
            status: 200,
            data: {
                message: "Cita guardada con éxito (Modo Demo)",
                appointmentId: newId,
                appointment: newAppt,
            },
        };
    }

    // ==========================================
    // 8. FOTOS EN LA NUBE (CLOUD PHOTOS)
    // ==========================================

    // Summary para AdminPhotosPage
    if (clean.includes("/admin/cloud-photos/summary") && upperMethod === "GET") {
        const summaries = getStoredJson("fotoluna_demo_photos_summary", DEFAULT_PHOTO_SUMMARIES);
        return {
            status: 200,
            data: summaries,
        };
    }

    // Fotos de cliente específico (para galería admin y empleado)
    const customerPhotosMatch = clean.match(/(?:\/api)?\/(?:employee|admin)?\/customers\/(\d+)\/cloud-photos/);
    if (customerPhotosMatch && upperMethod === "GET") {
        const customerId = Number(customerPhotosMatch[1]);
        const samplePhotos = [
            {
                id: 1,
                name: `Sesion_Boda_${customerId}_01.jpg`,
                url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
                size: "4.2 MB",
                created_at: "2026-03-20T10:00:00Z",
                uploadedAt: "2026-03-20T10:00:00Z",
                event_name: "Bodas",
                bookingId: 1,
            },
            {
                id: 2,
                name: `Sesion_Maternidad_${customerId}_02.jpg`,
                url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80",
                size: "5.1 MB",
                created_at: "2026-03-22T14:30:00Z",
                uploadedAt: "2026-03-22T14:30:00Z",
                event_name: "Maternidad",
                bookingId: 1,
            },
            {
                id: 3,
                name: `Sesion_Quince_${customerId}_03.jpg`,
                url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
                size: "3.8 MB",
                created_at: "2026-03-25T09:15:00Z",
                uploadedAt: "2026-03-25T09:15:00Z",
                event_name: "Quince años",
                bookingId: 2,
            },
            {
                id: 4,
                name: `Sesion_Retrato_${customerId}_04.jpg`,
                url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                size: "4.5 MB",
                created_at: "2026-04-01T16:00:00Z",
                uploadedAt: "2026-04-01T16:00:00Z",
                event_name: "Retratos",
                bookingId: 3,
            },
        ];

        return {
            status: 200,
            data: {
                data: samplePhotos,
                current_page: 1,
                last_page: 1,
                total: samplePhotos.length,
                events: ["Todos", "Bodas", "Maternidad", "Quince años", "Retratos"],
                years: ["Todos", "2026", "2025"],
            },
        };
    }

    if (clean.includes("/photos/recent") && upperMethod === "GET") {
        const summaries = getStoredJson("fotoluna_demo_photos_summary", DEFAULT_PHOTO_SUMMARIES);
        return {
            status: 200,
            data: summaries[0]?.recentPhotos || [],
        };
    }

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

    // ==========================================
    // 9. PAGOS, PLANES Y ALMACENAMIENTO
    // ==========================================

    if (clean.includes("/storage-plans-customer") && upperMethod === "GET") {
        return { status: 200, data: DEMO_STORAGE_PLANS };
    }

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

    if (clean.includes("/employee/payments") || clean.includes("/admin/booking-payments") || clean.includes("/admin/payments")) {
        return {
            status: 200,
            data: {
                data: DEMO_PAYMENTS,
                total: DEMO_PAYMENTS.length,
                current_page: 1,
                last_page: 1,
                per_page: 10,
                meta: {
                    total: DEMO_PAYMENTS.length,
                    current_page: 1,
                    last_page: 1,
                },
            },
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

    return null;
}

/**
 * Detecta si una respuesta recibida de un servidor (como Netlify) es el HTML
 * de redirección del SPA (index.html) en lugar de una respuesta JSON de API.
 */
function isHtmlSpaFallback(data: any): boolean {
    if (typeof data === "string" && (data.includes("<!DOCTYPE html>") || data.includes("<html"))) {
        return true;
    }
    return false;
}

/**
 * Registra interceptores de Axios (tanto en instancia api como en axios global)
 */
function setupAxiosMock(instance: any) {
    if (!instance || !instance.interceptors) return;

    // 1. Interceptor de Request: En modo demo, interceptar antes de salir a la red
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        if (isDemoEnvironment()) {
            const url = config.url || "";
            const method = config.method || "get";
            const mock = handleMockRoute(url, method, config.data);

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
    console.log("🚀 [FotoLuna] Adaptador Demo y Mock con persistencia en localStorage inicializado con éxito.");
}
