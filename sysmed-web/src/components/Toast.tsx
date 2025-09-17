import React, { useEffect, useState } from "react";

export interface ToastProps {
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type,
    duration = 5000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - 100 / (duration / 100);
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 100);

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [id, duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = {
            transform: isVisible ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            opacity: isVisible ? 1 : 0,
        };

        switch (type) {
            case "success":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    borderLeft: "4px solid #047857",
                };
            case "error":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    borderLeft: "4px solid #b91c1c",
                };
            case "warning":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    borderLeft: "4px solid #b45309",
                };
            case "info":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    borderLeft: "4px solid #1d4ed8",
                };
            default:
                return baseStyles;
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return "✅";
            case "error":
                return "❌";
            case "warning":
                return "⚠️";
            case "info":
                return "ℹ️";
            default:
                return "📢";
        }
    };

    return (
        <div
            style={{
                ...getToastStyles(),
                color: "white",
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                marginBottom: "0.75rem",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                minWidth: "320px",
                maxWidth: "500px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    }}
                >
                    <span style={{ fontSize: "1.25rem" }}>{getIcon()}</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                        {message}
                    </span>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose(id), 300);
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "1.25rem",
                        opacity: 0.7,
                        transition: "opacity 0.2s",
                        padding: "0.25rem",
                        borderRadius: "4px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0.7")
                    }
                >
                    ×
                </button>
            </div>

            {/* Barra de progresso */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "3px",
                    width: `${progress}%`,
                    background: "rgba(255, 255, 255, 0.8)",
                    transition: "width 0.1s linear",
                }}
            />
        </div>
    );
};

export default Toast;
