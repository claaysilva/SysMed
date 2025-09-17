import React from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "info",
    onConfirm,
    onCancel,
    loading = false,
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case "danger":
                return {
                    iconColor: "#ef4444",
                    iconBg: "#fee2e2",
                    confirmBg: "#ef4444",
                    confirmHover: "#dc2626",
                    icon: "⚠️",
                };
            case "warning":
                return {
                    iconColor: "#f59e0b",
                    iconBg: "#fef3c7",
                    confirmBg: "#f59e0b",
                    confirmHover: "#d97706",
                    icon: "⚠️",
                };
            case "info":
            default:
                return {
                    iconColor: "#3b82f6",
                    iconBg: "#dbeafe",
                    confirmBg: "#3b82f6",
                    confirmHover: "#2563eb",
                    icon: "ℹ️",
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                backdropFilter: "blur(4px)",
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "2rem",
                    maxWidth: "500px",
                    width: "90%",
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                    transform: "scale(1)",
                    animation: "modalAppear 0.2s ease-out",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <style>
                    {`
                        @keyframes modalAppear {
                            from {
                                opacity: 0;
                                transform: scale(0.9);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                    `}
                </style>

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1rem",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: styles.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            flexShrink: 0,
                        }}
                    >
                        {styles.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                margin: "0 0 0.75rem 0",
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: "#111827",
                                lineHeight: "1.4",
                            }}
                        >
                            {title}
                        </h3>
                        <p
                            style={{
                                margin: "0 0 2rem 0",
                                fontSize: "1rem",
                                color: "#6b7280",
                                lineHeight: "1.6",
                            }}
                        >
                            {message}
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "white",
                                    color: "#374151",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    opacity: loading ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            "#f9fafb";
                                        e.currentTarget.style.borderColor =
                                            "#9ca3af";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            "white";
                                        e.currentTarget.style.borderColor =
                                            "#d1d5db";
                                    }
                                }}
                            >
                                {cancelText}
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    border: "none",
                                    backgroundColor: loading
                                        ? "#9ca3af"
                                        : styles.confirmBg,
                                    color: "white",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            styles.confirmHover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            styles.confirmBg;
                                    }
                                }}
                            >
                                {loading && (
                                    <div
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            border: "2px solid rgba(255, 255, 255, 0.3)",
                                            borderTop: "2px solid white",
                                            borderRadius: "50%",
                                            animation:
                                                "spin 1s linear infinite",
                                        }}
                                    />
                                )}
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
