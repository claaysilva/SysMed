import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export interface Notification {
    id: number;
    type: "email" | "sms" | "push" | "whatsapp";
    title: string;
    message: string;
    data?: Record<string, unknown>;
    user_id?: number;
    patient_id?: number;
    recipient_email?: string;
    recipient_phone?: string;
    appointment_id?: number;
    medical_record_id?: number;
    status: "pending" | "sent" | "failed" | "cancelled";
    scheduled_for?: string;
    sent_at?: string;
    failure_reason?: string;
    retry_count: number;
    max_retries: number;
    template?: string;
    priority: "low" | "normal" | "high" | "urgent";
    read: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    patient?: {
        id: number;
        nome_completo: string;
        email?: string;
        telefone?: string;
    };
    appointment?: {
        id: number;
        data_hora_inicio: string;
        tipo_consulta: string;
    };
    formatted_type?: string;
    formatted_status?: string;
    formatted_priority?: string;
    is_overdue?: boolean;
}

export interface NotificationFilters {
    type?: string;
    status?: string;
    priority?: string;
    user_id?: number;
    patient_id?: number;
    unread_only?: boolean;
    per_page?: number;
}

export interface NotificationStats {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    cancelled: number;
    unread: number;
    by_type: Array<{ type: string; total: number }>;
    by_priority: Array<{ priority: string; total: number }>;
    recent_activity: Notification[];
}

export interface CreateNotificationData {
    type: "email" | "sms" | "push" | "whatsapp";
    title: string;
    message: string;
    user_id?: number;
    patient_id?: number;
    recipient_email?: string;
    recipient_phone?: string;
    appointment_id?: number;
    medical_record_id?: number;
    scheduled_for?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    template?: string;
    data?: Record<string, unknown>;
    send_immediately?: boolean;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch notifications with filters
    const fetchNotifications = useCallback(
        async (filters?: NotificationFilters) => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                if (filters?.type) params.append("type", filters.type);
                if (filters?.status) params.append("status", filters.status);
                if (filters?.priority)
                    params.append("priority", filters.priority);
                if (filters?.user_id)
                    params.append("user_id", filters.user_id.toString());
                if (filters?.patient_id)
                    params.append("patient_id", filters.patient_id.toString());
                if (filters?.unread_only) params.append("unread_only", "true");
                if (filters?.per_page)
                    params.append("per_page", filters.per_page.toString());

                const response = await api.get(
                    `/api/notifications?${params.toString()}`
                );

                if (response.data.success) {
                    setNotifications(response.data.data.data);
                    setCurrentPage(response.data.data.current_page);
                    setLastPage(response.data.data.last_page);
                    setTotal(response.data.data.total);
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Erro ao carregar notificações"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : (
                              err as {
                                  response?: { data?: { message?: string } };
                              }
                          )?.response?.data?.message ||
                          "Erro ao carregar notificações";
                setError(errorMessage);
                console.error("Erro ao carregar notificações:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Fetch notification stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get("/api/notifications/stats");

            if (response.data.success) {
                setStats(response.data.data);
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Erro ao carregar estatísticas"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao carregar estatísticas";
            console.error("Erro ao carregar estatísticas:", err);
            throw new Error(errorMessage);
        }
    }, []);

    // Create notification
    const createNotification = async (
        data: CreateNotificationData
    ): Promise<Notification> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post("/api/notifications", data);

            if (response.data.success) {
                // Add to local state
                setNotifications((prev) => [response.data.data, ...prev]);

                // Refresh stats
                await fetchStats();

                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Erro ao criar notificação"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao criar notificação";
            setError(errorMessage);
            console.error("Erro ao criar notificação:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get single notification
    const getNotification = async (id: number): Promise<Notification> => {
        try {
            const response = await api.get(`/api/notifications/${id}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Notificação não encontrada"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao carregar notificação";
            console.error("Erro ao carregar notificação:", err);
            throw new Error(errorMessage);
        }
    };

    // Update notification
    const updateNotification = async (
        id: number,
        data: Partial<CreateNotificationData>
    ): Promise<Notification> => {
        try {
            setLoading(true);
            const response = await api.put(`/api/notifications/${id}`, data);

            if (response.data.success) {
                // Update local state
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? response.data.data
                            : notification
                    )
                );

                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Erro ao atualizar notificação"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao atualizar notificação";
            setError(errorMessage);
            console.error("Erro ao atualizar notificação:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete notification
    const deleteNotification = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            const response = await api.delete(`/api/notifications/${id}`);

            if (response.data.success) {
                // Remove from local state
                setNotifications((prev) =>
                    prev.filter((notification) => notification.id !== id)
                );

                // Refresh stats
                await fetchStats();
            } else {
                throw new Error(
                    response.data.message || "Erro ao excluir notificação"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao excluir notificação";
            setError(errorMessage);
            console.error("Erro ao excluir notificação:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Mark as read
    const markAsRead = async (id: number): Promise<void> => {
        try {
            const response = await api.patch(`/api/notifications/${id}/read`);

            if (response.data.success) {
                // Update local state
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? { ...notification, read: true }
                            : notification
                    )
                );

                // Refresh stats
                await fetchStats();
            } else {
                throw new Error(
                    response.data.message || "Erro ao marcar como lida"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao marcar como lida";
            console.error("Erro ao marcar como lida:", err);
            throw new Error(errorMessage);
        }
    };

    // Mark multiple as read
    const markMultipleAsRead = async (
        notificationIds: number[]
    ): Promise<void> => {
        try {
            const response = await api.patch(
                "/api/notifications/mark-multiple-read",
                {
                    notification_ids: notificationIds,
                }
            );

            if (response.data.success) {
                // Update local state
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notificationIds.includes(notification.id)
                            ? { ...notification, read: true }
                            : notification
                    )
                );

                // Refresh stats
                await fetchStats();
            } else {
                throw new Error(
                    response.data.message || "Erro ao marcar notificações"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao marcar notificações";
            console.error("Erro ao marcar notificações:", err);
            throw new Error(errorMessage);
        }
    };

    // Retry failed notification
    const retryNotification = async (id: number): Promise<void> => {
        try {
            const response = await api.patch(`/api/notifications/${id}/retry`);

            if (response.data.success) {
                // Update local state
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? { ...notification, status: "pending" as const }
                            : notification
                    )
                );

                // Refresh stats
                await fetchStats();
            } else {
                throw new Error(
                    response.data.message || "Erro ao reenviar notificação"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao reenviar notificação";
            console.error("Erro ao reenviar notificação:", err);
            throw new Error(errorMessage);
        }
    };

    // Cancel notification
    const cancelNotification = async (id: number): Promise<void> => {
        try {
            const response = await api.patch(`/api/notifications/${id}/cancel`);

            if (response.data.success) {
                // Update local state
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? { ...notification, status: "cancelled" as const }
                            : notification
                    )
                );

                // Refresh stats
                await fetchStats();
            } else {
                throw new Error(
                    response.data.message || "Erro ao cancelar notificação"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao cancelar notificação";
            console.error("Erro ao cancelar notificação:", err);
            throw new Error(errorMessage);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [fetchNotifications, fetchStats]);

    return {
        // State
        notifications,
        stats,
        loading,
        error,
        currentPage,
        lastPage,
        total,

        // Actions
        fetchNotifications,
        fetchStats,
        createNotification,
        getNotification,
        updateNotification,
        deleteNotification,
        markAsRead,
        markMultipleAsRead,
        retryNotification,
        cancelNotification,

        // Utils
        clearError: () => setError(null),
        refreshData: () => {
            fetchNotifications();
            fetchStats();
        },
    };
};
