import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import { ApiErrorHandler } from "../utils/errorHandler";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 10000, // 10 segundos
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.error("Erro na requisição:", error);
        return Promise.reject(error);
    }
);

// Interceptor para lidar com respostas
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log de sucesso em desenvolvimento
        if (import.meta.env.DEV) {
            console.log(
                `✅ ${response.config.method?.toUpperCase()} ${
                    response.config.url
                }:`,
                response.status
            );
        }
        return response;
    },
    (error: AxiosError) => {
        // Log de erro em desenvolvimento
        if (import.meta.env.DEV) {
            console.error(
                `❌ ${error.config?.method?.toUpperCase()} ${
                    error.config?.url
                }:`,
                error.response?.status,
                error.message
            );
        }

        // Tratar erro de autenticação
        if (ApiErrorHandler.isAuthError(error)) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");

            // Redirecionar apenas se não estiver já na página de login
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/quick-login"
            ) {
                window.location.href = "/login";
            }
        }

        // Transformar erro em formato padronizado
        const apiError = ApiErrorHandler.handle(error);

        // Rejeitar com erro padronizado
        return Promise.reject({
            ...error,
            apiError,
            message: apiError.message,
        });
    }
);

// Funções utilitárias para requests
export const apiRequest = {
    get: async <T = unknown>(url: string, params?: Record<string, unknown>) => {
        const response = await api.get(url, { params });
        return response.data as T;
    },

    post: async <T = unknown>(url: string, data?: unknown) => {
        const response = await api.post(url, data);
        return response.data as T;
    },

    put: async <T = unknown>(url: string, data?: unknown) => {
        const response = await api.put(url, data);
        return response.data as T;
    },

    patch: async <T = unknown>(url: string, data?: unknown) => {
        const response = await api.patch(url, data);
        return response.data as T;
    },

    delete: async <T = unknown>(url: string) => {
        const response = await api.delete(url);
        return response.data as T;
    },
};

export default api;
