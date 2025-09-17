import React from "react";

interface StatCardProps {
    title: string;
    value: number;
    icon: string;
    color: string;
    growth?: number;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color,
    growth,
    subtitle,
}) => {
    return (
        <div
            style={{
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                color: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    fontSize: "4rem",
                    opacity: 0.2,
                }}
            >
                {icon}
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
                <h3
                    style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        opacity: 0.9,
                    }}
                >
                    {title}
                </h3>

                <div
                    style={{
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        marginBottom: "0.5rem",
                    }}
                >
                    {value.toLocaleString()}
                </div>

                {subtitle && (
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            opacity: 0.8,
                        }}
                    >
                        {subtitle}
                    </p>
                )}

                {growth !== undefined && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginTop: "0.5rem",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.75rem",
                                opacity: 0.9,
                            }}
                        >
                            {growth >= 0 ? "📈" : "📉"} {Math.abs(growth)} este
                            mês
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
