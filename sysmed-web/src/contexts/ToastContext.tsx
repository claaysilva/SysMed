import React, { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import Toast from "../components/Toast";
import type { ToastProps } from "../components/Toast";

interface ToastContextProps {
    showToast: (
        message: string,
        type: ToastProps["type"],
        duration?: number
    ) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(
    undefined
);

interface ToastProviderProps {
    children: ReactNode;
}

interface ToastItem {
    id: string;
    message: string;
    type: ToastProps["type"];
    duration: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const showToast = useCallback(
        (message: string, type: ToastProps["type"], duration = 5000) => {
            const id = generateId();
            const newToast: ToastItem = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback(
        (message: string) => showToast(message, "success"),
        [showToast]
    );
    const showError = useCallback(
        (message: string) => showToast(message, "error"),
        [showToast]
    );
    const showWarning = useCallback(
        (message: string) => showToast(message, "warning"),
        [showToast]
    );
    const showInfo = useCallback(
        (message: string) => showToast(message, "info"),
        [showToast]
    );

    return (
        <ToastContext.Provider
            value={{ showToast, showSuccess, showError, showWarning, showInfo }}
        >
            {children}

            {/* Container de Toasts */}
            <div
                style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    zIndex: 9999,
                    pointerEvents: "none",
                }}
            >
                {toasts.map((toast) => (
                    <div key={toast.id} style={{ pointerEvents: "auto" }}>
                        <Toast
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
