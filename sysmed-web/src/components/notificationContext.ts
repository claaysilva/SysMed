import { createContext, useContext } from "react";
import type { NotificationData } from "./NotificationProvider";

export interface NotificationContextType {
    notifications: NotificationData[];
    addNotification: (notification: Omit<NotificationData, "id">) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
    showError: (title: string, message?: string) => void;
    showSuccess: (title: string, message?: string) => void;
    showWarning: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;
}

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
};
