import React, { useState, useCallback } from "react";
import {
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { NotificationContext } from "./notificationContext";
import type { NotificationContextType } from "./notificationContext";

// Tipos de notificação
export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    persistent?: boolean;
}

// Contexto e hook foram movidos para notificationContext.ts para atender a regra de Fast Refresh

// Componente individual de notificação
const NotificationItem: React.FC<{
    notification: NotificationData;
    onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
    const { id, type, title, message, persistent } = notification;

    // Cores e ícones por tipo
    const getTypeClasses = () => {
        switch (type) {
            case "success":
                return {
                    container: "bg-green-50 border-green-200",
                    title: "text-green-800",
                    message: "text-green-700",
                    icon: CheckCircleIcon,
                    iconColor: "text-green-400",
                };
            case "error":
                return {
                    container: "bg-red-50 border-red-200",
                    title: "text-red-800",
                    message: "text-red-700",
                    icon: ExclamationTriangleIcon,
                    iconColor: "text-red-400",
                };
            case "warning":
                return {
                    container: "bg-yellow-50 border-yellow-200",
                    title: "text-yellow-800",
                    message: "text-yellow-700",
                    icon: ExclamationTriangleIcon,
                    iconColor: "text-yellow-400",
                };
            case "info":
                return {
                    container: "bg-blue-50 border-blue-200",
                    title: "text-blue-800",
                    message: "text-blue-700",
                    icon: InformationCircleIcon,
                    iconColor: "text-blue-400",
                };
            default:
                return {
                    container: "bg-gray-50 border-gray-200",
                    title: "text-gray-800",
                    message: "text-gray-700",
                    icon: InformationCircleIcon,
                    iconColor: "text-gray-400",
                };
        }
    };

    const classes = getTypeClasses();
    const IconComponent = classes.icon;

    return (
        <div
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${classes.container} border`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <IconComponent
                            className={`h-6 w-6 ${classes.iconColor}`}
                        />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className={`text-sm font-medium ${classes.title}`}>
                            {title}
                        </p>
                        {message && (
                            <p className={`mt-1 text-sm ${classes.message}`}>
                                {message}
                            </p>
                        )}
                    </div>
                    {!persistent && (
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => onRemove(id)}
                            >
                                <span className="sr-only">Fechar</span>
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Container de notificações
const NotificationContainer: React.FC<{
    notifications: NotificationData[];
    onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
    if (notifications.length === 0) return null;

    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
};

// Provider de notificações
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
        );
    }, []);

    const addNotification = useCallback(
        (notification: Omit<NotificationData, "id">) => {
            const id = Date.now().toString();
            const newNotification: NotificationData = {
                id,
                duration: 5000, // 5 segundos por padrão
                ...notification,
            };

            setNotifications((prev) => [...prev, newNotification]);

            // Auto remover após duração especificada (se não for persistente)
            if (
                !newNotification.persistent &&
                newNotification.duration &&
                newNotification.duration > 0
            ) {
                setTimeout(() => {
                    removeNotification(id);
                }, newNotification.duration);
            }
        },
        [removeNotification]
    );

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showError = useCallback(
        (title: string, message?: string) => {
            addNotification({ type: "error", title, message });
        },
        [addNotification]
    );

    const showSuccess = useCallback(
        (title: string, message?: string) => {
            addNotification({ type: "success", title, message });
        },
        [addNotification]
    );

    const showWarning = useCallback(
        (title: string, message?: string) => {
            addNotification({ type: "warning", title, message });
        },
        [addNotification]
    );

    const showInfo = useCallback(
        (title: string, message?: string) => {
            addNotification({ type: "info", title, message });
        },
        [addNotification]
    );

    const contextValue: NotificationContextType = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showError,
        showSuccess,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
