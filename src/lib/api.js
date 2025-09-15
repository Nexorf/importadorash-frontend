import axios from "axios";
import { useAuth } from "@/store/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    timeout: 60000,
});

api.interceptors.request.use((config) => {
    try {
        const token = useAuth.getState().token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}

    const isFormData =
        typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
        if (config.headers && "Content-Type" in config.headers) {
            delete config.headers["Content-Type"];
        }
    } else {
        config.headers = {
            "Content-Type": "application/json",
            ...(config.headers || {}),
        };
    }

    return config;
});

api.interceptors.response.use(
    (res) => {
        const payload = res?.data ?? {};
        return {
            ok: payload?.status === "success",
            message: payload?.message,
            data: payload?.data,
            meta: payload?.meta,
            raw: payload,
        };
    },
    (err) => {
        const status = err?.response?.status;
        const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Error de red o del servidor";

        // 🔒 Si el backend responde 401/403: cerrar sesión y redirigir a /login
        if (status === 401 || status === 403) {
            try {
                useAuth.getState().logout();
            } catch {}
            if (!/\/login$/.test(window.location.pathname)) {
                window.location.replace("/login");
            }
        }

        return Promise.reject(new Error(msg));
    }
);
