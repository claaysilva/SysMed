import React from "react";

interface LoadingSpinnerProps {
    size?: "small" | "medium" | "large";
    color?: string;
    message?: string;
    overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "medium",
    color = "#1e40af",
    message,
    overlay = false,
}) => {
    const sizeMap = {
        small: "24px",
        medium: "40px",
        large: "60px",
    };

    const spinnerSize = sizeMap[size];

    const spinner = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
            }}
        >
            <div
                style={{
                    width: spinnerSize,
                    height: spinnerSize,
                    border: `3px solid ${color}20`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                }}
            />
            {message && (
                <div
                    style={{
                        fontSize: size === "small" ? "0.875rem" : "1rem",
                        color: color,
                        fontWeight: "500",
                        textAlign: "center",
                    }}
                >
                    {message}
                </div>
            )}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );

    if (overlay) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255, 255, 255, 0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9998,
                    backdropFilter: "blur(2px)",
                }}
            >
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
