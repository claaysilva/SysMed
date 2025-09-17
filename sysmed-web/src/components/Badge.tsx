import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?:
        | "default"
        | "success"
        | "warning"
        | "error"
        | "info"
        | "purple"
        | "gray";
    size?: "small" | "medium" | "large";
    outlined?: boolean;
    rounded?: boolean;
    icon?: React.ReactNode;
    onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "default",
    size = "medium",
    outlined = false,
    rounded = false,
    icon,
    onRemove,
}) => {
    const getVariantStyles = () => {
        const variants = {
            default: {
                bg: "#f3f4f6",
                text: "#374151",
                border: "#d1d5db",
            },
            success: {
                bg: "#dcfce7",
                text: "#166534",
                border: "#10b981",
            },
            warning: {
                bg: "#fef3c7",
                text: "#b45309",
                border: "#f59e0b",
            },
            error: {
                bg: "#fee2e2",
                text: "#b91c1c",
                border: "#ef4444",
            },
            info: {
                bg: "#dbeafe",
                text: "#1e40af",
                border: "#3b82f6",
            },
            purple: {
                bg: "#f3e8ff",
                text: "#7c3aed",
                border: "#8b5cf6",
            },
            gray: {
                bg: "#f9fafb",
                text: "#4b5563",
                border: "#9ca3af",
            },
        };

        const colors = variants[variant];

        if (outlined) {
            return {
                backgroundColor: "white",
                color: colors.text,
                border: `1px solid ${colors.border}`,
            };
        }

        return {
            backgroundColor: colors.bg,
            color: colors.text,
            border: "1px solid transparent",
        };
    };

    const getSizeStyles = () => {
        switch (size) {
            case "small":
                return {
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    gap: "0.25rem",
                };
            case "medium":
                return {
                    fontSize: "0.875rem",
                    padding: "0.375rem 0.75rem",
                    gap: "0.375rem",
                };
            case "large":
                return {
                    fontSize: "1rem",
                    padding: "0.5rem 1rem",
                    gap: "0.5rem",
                };
            default:
                return {
                    fontSize: "0.875rem",
                    padding: "0.375rem 0.75rem",
                    gap: "0.375rem",
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                fontWeight: "500",
                borderRadius: rounded ? "9999px" : "6px",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                ...variantStyles,
                ...sizeStyles,
            }}
        >
            {icon && (
                <span
                    style={{
                        fontSize: size === "small" ? "0.875rem" : "1rem",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {icon}
                </span>
            )}
            {children}
            {onRemove && (
                <button
                    onClick={onRemove}
                    style={{
                        background: "none",
                        border: "none",
                        color: "currentColor",
                        cursor: "pointer",
                        padding: "0",
                        marginLeft: sizeStyles.gap,
                        fontSize: size === "small" ? "0.75rem" : "0.875rem",
                        opacity: 0.7,
                        transition: "opacity 0.2s",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "50%",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0.7")
                    }
                >
                    ✕
                </button>
            )}
        </span>
    );
};

// Componente especializado para status
interface StatusBadgeProps {
    status:
        | "ativo"
        | "inativo"
        | "pendente"
        | "cancelado"
        | "concluido"
        | "agendado";
    size?: "small" | "medium" | "large";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    size = "medium",
}) => {
    const statusConfig = {
        ativo: { variant: "success" as const, icon: "●", text: "Ativo" },
        inativo: { variant: "gray" as const, icon: "●", text: "Inativo" },
        pendente: { variant: "warning" as const, icon: "●", text: "Pendente" },
        cancelado: { variant: "error" as const, icon: "●", text: "Cancelado" },
        concluido: {
            variant: "success" as const,
            icon: "✓",
            text: "Concluído",
        },
        agendado: { variant: "info" as const, icon: "📅", text: "Agendado" },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} size={size} rounded icon={config.icon}>
            {config.text}
        </Badge>
    );
};

// Componente especializado para prioridades
interface PriorityBadgeProps {
    priority: "baixa" | "media" | "alta" | "urgente";
    size?: "small" | "medium" | "large";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
    priority,
    size = "medium",
}) => {
    const priorityConfig = {
        baixa: { variant: "gray" as const, icon: "⬇", text: "Baixa" },
        media: { variant: "info" as const, icon: "➡", text: "Média" },
        alta: { variant: "warning" as const, icon: "⬆", text: "Alta" },
        urgente: { variant: "error" as const, icon: "🔥", text: "Urgente" },
    };

    const config = priorityConfig[priority];

    return (
        <Badge variant={config.variant} size={size} rounded icon={config.icon}>
            {config.text}
        </Badge>
    );
};

export default Badge;
