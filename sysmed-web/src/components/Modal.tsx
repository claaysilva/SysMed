import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    closeOnOverlayClick?: boolean;
}

type Size = NonNullable<ModalProps["size"]>;

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    closeOnOverlayClick = true,
}) => {
    if (!isOpen) return null;
    if (import.meta.env.DEV) {
        console.log(`[Modal] Abrindo modal: ${title}`);
    }

    const sizeClasses: Record<Size, string> = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };
    const sizeMaxWidth: Record<Size, number> = {
        sm: 400,
        md: 560,
        lg: 720,
        xl: 960,
    };

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) onClose();
    };

    const modalNode = (
        <div
            className="fixed inset-0 z-[2147483647] overflow-y-auto"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483647,
                overflowY: "auto",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* Overlay */}
            <div
                className="fixed inset-0 transition-opacity"
                style={{ position: "fixed", inset: 0, zIndex: 1 }}
                onClick={handleOverlayClick}
            >
                <div
                    className="absolute inset-0 bg-gray-500 opacity-75"
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                    }}
                />
            </div>

            {/* Wrapper centralizado */}
            <div
                className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0"
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: "1rem",
                }}
            >
                {/* Conteúdo do modal */}
                <div
                    className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}
                    style={{
                        background: "#fff",
                        borderRadius: 12,
                        width: "100%",
                        maxWidth: sizeMaxWidth[size],
                        padding: 24,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#111827",
                                margin: 0,
                            }}
                        >
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: "transparent",
                                border: 0,
                                color: "#9CA3AF",
                                cursor: "pointer",
                            }}
                            aria-label="Fechar modal"
                            type="button"
                        >
                            <svg
                                style={{ width: 24, height: 24 }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalNode, document.body);
};

export default Modal;
