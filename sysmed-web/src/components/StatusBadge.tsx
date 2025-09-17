import React from "react";

interface StatusBadgeProps {
    children: React.ReactNode;
    status:
        | "draft"
        | "completed"
        | "signed"
        | "active"
        | "inactive"
        | "pending"
        | "approved"
        | "rejected";
    variant?: "blue" | "green" | "yellow" | "red" | "gray" | "purple";
    size?: "small" | "medium" | "large";
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
    children,
    status,
    variant,
    size = "medium",
    className = "",
}) => {
    // Mapear status para cores se variant não for fornecido
    const getVariantFromStatus = (status: string) => {
        switch (status) {
            case "draft":
            case "pending":
                return "yellow";
            case "completed":
            case "active":
                return "blue";
            case "signed":
            case "approved":
                return "green";
            case "rejected":
            case "inactive":
                return "red";
            default:
                return "gray";
        }
    };

    const finalVariant = variant || getVariantFromStatus(status);

    const getVariantClasses = (variant: string) => {
        switch (variant) {
            case "blue":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "green":
                return "bg-green-100 text-green-800 border-green-200";
            case "yellow":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "red":
                return "bg-red-100 text-red-800 border-red-200";
            case "purple":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "gray":
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getSizeClasses = (size: string) => {
        switch (size) {
            case "small":
                return "px-2 py-0.5 text-xs";
            case "large":
                return "px-4 py-2 text-sm";
            case "medium":
            default:
                return "px-3 py-1 text-xs";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "draft":
                return "📝";
            case "completed":
                return "✅";
            case "signed":
                return "🔏";
            case "active":
                return "🟢";
            case "inactive":
                return "🔴";
            case "pending":
                return "⏳";
            case "approved":
                return "✅";
            case "rejected":
                return "❌";
            default:
                return "";
        }
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1 
                font-medium rounded-full border
                ${getVariantClasses(finalVariant)}
                ${getSizeClasses(size)}
                ${className}
            `}
        >
            <span className="text-xs">{getStatusIcon(status)}</span>
            {children}
        </span>
    );
};

export default StatusBadge;
