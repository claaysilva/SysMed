import React, { useState, useEffect } from "react";
import {
    BellIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    EyeIcon,
    ArrowPathIcon,
    TrashIcon,
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../hooks/useNotifications";
import type {
    Notification,
    NotificationFilters,
} from "../hooks/useNotifications";

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
    onRetry: (id: number) => void;
    onCancel: (id: number) => void;
    onDelete: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onMarkAsRead,
    onRetry,
    onCancel,
    onDelete,
}) => {
    const getTypeIcon = () => {
        switch (notification.type) {
            case "email":
                return <EnvelopeIcon className="w-5 h-5" />;
            case "sms":
                return <DevicePhoneMobileIcon className="w-5 h-5" />;
            case "whatsapp":
                return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
            case "push":
                return <BellIcon className="w-5 h-5" />;
            default:
                return <BellIcon className="w-5 h-5" />;
        }
    };

    const getStatusIcon = () => {
        switch (notification.status) {
            case "sent":
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case "failed":
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case "pending":
                return <ClockIcon className="w-5 h-5 text-yellow-500" />;
            case "cancelled":
                return <XCircleIcon className="w-5 h-5 text-gray-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPriorityColor = () => {
        switch (notification.priority) {
            case "urgent":
                return "border-l-red-500 bg-red-50";
            case "high":
                return "border-l-orange-500 bg-orange-50";
            case "normal":
                return "border-l-blue-500 bg-blue-50";
            case "low":
                return "border-l-gray-500 bg-gray-50";
            default:
                return "border-l-blue-500 bg-blue-50";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR");
    };

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getPriorityColor()} ${
                !notification.read ? "ring-2 ring-blue-200" : ""
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">{getTypeIcon()}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <h3
                                className={`text-sm font-medium ${
                                    !notification.read
                                        ? "text-gray-900"
                                        : "text-gray-600"
                                }`}
                            >
                                {notification.title}
                            </h3>
                            {!notification.read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Novo
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                {getStatusIcon()}
                                <span className="capitalize">
                                    {notification.status}
                                </span>
                            </div>
                            <span>•</span>
                            <span>Prioridade: {notification.priority}</span>
                            {notification.patient && (
                                <>
                                    <span>•</span>
                                    <span>
                                        Paciente:{" "}
                                        {notification.patient.nome_completo}
                                    </span>
                                </>
                            )}
                            <span>•</span>
                            <span>{formatDate(notification.created_at)}</span>
                        </div>
                        {notification.scheduled_for && (
                            <div className="mt-2 text-xs text-gray-500">
                                <ClockIcon className="inline w-4 h-4 mr-1" />
                                Agendado para:{" "}
                                {formatDate(notification.scheduled_for)}
                            </div>
                        )}
                        {notification.failure_reason && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                <ExclamationTriangleIcon className="inline w-4 h-4 mr-1" />
                                {notification.failure_reason}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                        <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Marcar como lida"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    )}
                    {notification.status === "failed" &&
                        notification.retry_count < notification.max_retries && (
                            <button
                                onClick={() => onRetry(notification.id)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Tentar novamente"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                        )}
                    {notification.status === "pending" && (
                        <button
                            onClick={() => onCancel(notification.id)}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                            title="Cancelar"
                        >
                            <XCircleIcon className="w-4 h-4" />
                        </button>
                    )}
                    {notification.status !== "sent" && (
                        <button
                            onClick={() => onDelete(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    color,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

const NotificationsPage: React.FC = () => {
    const {
        notifications,
        stats,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markMultipleAsRead,
        retryNotification,
        cancelNotification,
        deleteNotification,
        clearError,
    } = useNotifications();

    const [filters, setFilters] = useState<NotificationFilters>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNotifications, setSelectedNotifications] = useState<
        number[]
    >([]);

    // Apply filters
    useEffect(() => {
        fetchNotifications(filters);
    }, [filters, fetchNotifications]);

    const handleFilterChange = (
        key: keyof NotificationFilters,
        value: string | boolean
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "" ? undefined : value,
        }));
    };

    const handleSelectAll = () => {
        if (selectedNotifications.length === notifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifications.map((n) => n.id));
        }
    };

    const handleSelectNotification = (id: number) => {
        setSelectedNotifications((prev) =>
            prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
        );
    };

    const handleMarkSelectedAsRead = async () => {
        if (selectedNotifications.length > 0) {
            try {
                await markMultipleAsRead(selectedNotifications);
                setSelectedNotifications([]);
            } catch (error) {
                console.error("Erro ao marcar notificações como lidas:", error);
            }
        }
    };

    const filteredNotifications = notifications.filter(
        (notification) =>
            searchTerm === "" ||
            notification.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            notification.message
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            notification.patient?.nome_completo
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Erro ao carregar notificações
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => {
                                            clearError();
                                            fetchNotifications();
                                        }}
                                        className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Sistema de Notificações
                            </h1>
                            <p className="text-gray-600">
                                Gerencie e monitore todas as notificações do
                                sistema
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                console.log("Criar nova notificação")
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Nova Notificação
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <StatCard
                            title="Total"
                            value={stats.total}
                            icon={BellIcon}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Pendentes"
                            value={stats.pending}
                            icon={ClockIcon}
                            color="bg-yellow-500"
                        />
                        <StatCard
                            title="Enviadas"
                            value={stats.sent}
                            icon={CheckCircleIcon}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Falharam"
                            value={stats.failed}
                            icon={XCircleIcon}
                            color="bg-red-500"
                        />
                        <StatCard
                            title="Não Lidas"
                            value={stats.unread}
                            icon={ExclamationTriangleIcon}
                            color="bg-orange-500"
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                                Filtros:
                            </span>
                        </div>

                        <select
                            value={filters.type || ""}
                            onChange={(e) =>
                                handleFilterChange("type", e.target.value)
                            }
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todos os tipos</option>
                            <option value="email">E-mail</option>
                            <option value="sms">SMS</option>
                            <option value="push">Push</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>

                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                handleFilterChange("status", e.target.value)
                            }
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todos os status</option>
                            <option value="pending">Pendente</option>
                            <option value="sent">Enviado</option>
                            <option value="failed">Falhou</option>
                            <option value="cancelled">Cancelado</option>
                        </select>

                        <select
                            value={filters.priority || ""}
                            onChange={(e) =>
                                handleFilterChange("priority", e.target.value)
                            }
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todas as prioridades</option>
                            <option value="low">Baixa</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={filters.unread_only || false}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "unread_only",
                                        e.target.checked
                                    )
                                }
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Apenas não lidas
                        </label>
                    </div>

                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar notificações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                {selectedNotifications.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-indigo-700">
                                {selectedNotifications.length} notificação(ões)
                                selecionada(s)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleMarkSelectedAsRead}
                                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Marcar como lidas
                                </button>
                                <button
                                    onClick={() => setSelectedNotifications([])}
                                    className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar seleção
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {/* Notifications List */}
                {!loading && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Notificações ({filteredNotifications.length})
                            </h2>
                            {filteredNotifications.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                    {selectedNotifications.length ===
                                    notifications.length
                                        ? "Desselecionar todas"
                                        : "Selecionar todas"}
                                </button>
                            )}
                        </div>

                        {filteredNotifications.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhuma notificação encontrada
                                </h3>
                                <p className="text-gray-600">
                                    {searchTerm ||
                                    Object.keys(filters).length > 0
                                        ? "Tente ajustar os filtros de busca"
                                        : "Não há notificações no sistema ainda."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="relative"
                                    >
                                        <div className="absolute left-4 top-6 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(
                                                    notification.id
                                                )}
                                                onChange={() =>
                                                    handleSelectNotification(
                                                        notification.id
                                                    )
                                                }
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="ml-8">
                                            <NotificationCard
                                                notification={notification}
                                                onMarkAsRead={markAsRead}
                                                onRetry={retryNotification}
                                                onCancel={cancelNotification}
                                                onDelete={deleteNotification}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
