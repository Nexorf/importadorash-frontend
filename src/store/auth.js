// src/store/auth.js
import { create } from "zustand";
import { loginRequest, verifyTokenRequest } from "@/services/auth.service";

const TOKEN_KEY = "auth_token_v1";

const getStoredToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const useAuth = create((set, get) => ({
    // Estado
    token: getStoredToken(),
    user: null,
    isAuth: !!getStoredToken(),
    loading: false,
    error: null,

    // Guarda token/usuario y sincroniza localStorage
    setAuth: ({ token, user }) => {
        try {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            else localStorage.removeItem(TOKEN_KEY);
        } catch {}
        set({
            token: token ?? null,
            user: user ?? null,
            isAuth: !!token,
        });
    },

    // Cierra sesión completamente
    logout: () => {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {}
        set({
            token: null,
            user: null,
            isAuth: false,
            error: null,
        });
    },

    async login({ username, password }) {
        set({ loading: true, error: null });
        try {
            const { token, user } = await loginRequest({ username, password });
            get().setAuth({ token, user });

            if (!user) {
                try {
                    const { user: verified } = await verifyTokenRequest();
                    if (verified) set({ user: verified });
                } catch {
                }
            }

            set({ loading: false });
            return { token: get().token, user: get().user };
        } catch (err) {
            set({
                loading: false,
                error: err?.message || "Error de autenticación",
            });
            throw err;
        }
    },

    // Verifica el token actual; si es inválido, cierra sesión
    async verify() {
        const token = get().token;
        if (!token) {
            set({ isAuth: false, user: null });
            return { user: null, isAuth: false };
        }

        set({ loading: true, error: null });
        try {
            const { user } = await verifyTokenRequest();
            if (user) {
                set({ user, isAuth: true, loading: false });
            } else {
                // Si no llegó user pero el token existe, mantenemos isAuth true
                set({ isAuth: true, loading: false });
            }
            return { user: get().user, isAuth: get().isAuth };
        } catch (err) {
            // Token inválido/expirado
            get().logout();
            set({
                loading: false,
                error: err?.message || "Sesión expirada",
            });
            return { user: null, isAuth: false };
        }
    },

    // Llamar idealmente al arrancar la app para hidratar el estado desde el token
    async init() {
        const token = get().token;
        if (token) {
            try {
                await get().verify();
            } catch {
                // si falla, verify ya hace logout y limpia
            }
        }
    },
}));
