import { createContext, useContext } from "react";
import type { ToastProps } from "../components/Toast";

export interface ToastContextProps {
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

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx;
};
