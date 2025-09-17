import React from "react";

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
    padding?: "none" | "small" | "medium" | "large";
    hover?: boolean;
    loading?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    title,
    subtitle,
    actions,
    className = "",
    padding = "medium",
    hover = false,
    loading = false,
}) => {
    const getPadding = () => {
        switch (padding) {
            case "none":
                return "0";
            case "small":
                return "1rem";
            case "medium":
                return "1.5rem";
            case "large":
                return "2rem";
            default:
                return "1.5rem";
        }
    };

    const cardStyles: React.CSSProperties = {
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
    };

    if (hover) {
        cardStyles.cursor = "pointer";
    }

    return (
        <div
            className={className}
            style={cardStyles}
            onMouseEnter={(e) => {
                if (hover) {
                    e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                }
            }}
            onMouseLeave={(e) => {
                if (hover) {
                    e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                }
            }}
        >
            {loading && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background:
                            "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                        backgroundSize: "200% 100%",
                        animation: "loading 2s ease-in-out infinite",
                    }}
                />
            )}

            {(title || subtitle || actions) && (
                <div
                    style={{
                        padding: getPadding(),
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "1rem",
                    }}
                >
                    <div>
                        {title && (
                            <h3
                                style={{
                                    margin: "0 0 0.25rem 0",
                                    fontSize: "1.125rem",
                                    fontWeight: "600",
                                    color: "#111827",
                                    lineHeight: "1.4",
                                }}
                            >
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "0.875rem",
                                    color: "#6b7280",
                                    lineHeight: "1.4",
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
                </div>
            )}

            <div
                style={{
                    padding:
                        title || subtitle || actions
                            ? getPadding()
                            : getPadding(),
                }}
            >
                {children}
            </div>

            <style>
                {`
                    @keyframes loading {
                        0% {
                            background-position: 200% 0;
                        }
                        100% {
                            background-position: -200% 0;
                        }
                    }
                `}
            </style>
        </div>
    );
};

// Componente de Card com estatísticas
interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        direction: "up" | "down";
        label?: string;
    };
    color?: "blue" | "green" | "yellow" | "red" | "purple";
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = "blue",
}) => {
    const colors = {
        blue: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
        green: { bg: "#dcfce7", text: "#166534", border: "#10b981" },
        yellow: { bg: "#fef3c7", text: "#b45309", border: "#f59e0b" },
        red: { bg: "#fee2e2", text: "#b91c1c", border: "#ef4444" },
        purple: { bg: "#f3e8ff", text: "#7c3aed", border: "#8b5cf6" },
    };

    const colorScheme = colors[color];

    return (
        <Card padding="medium" hover>
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                }}
            >
                {icon && (
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: colorScheme.bg,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colorScheme.text,
                            fontSize: "24px",
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                        style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {title}
                    </h4>
                    <div
                        style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#111827",
                            lineHeight: "1",
                            marginBottom: "0.5rem",
                        }}
                    >
                        {value}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        {trend && (
                            <span
                                style={{
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    color:
                                        trend.direction === "up"
                                            ? "#10b981"
                                            : "#ef4444",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                }}
                            >
                                {trend.direction === "up" ? "↗" : "↘"}{" "}
                                {trend.value}%
                            </span>
                        )}
                        {subtitle && (
                            <span
                                style={{
                                    fontSize: "0.875rem",
                                    color: "#6b7280",
                                }}
                            >
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Card;
