import React from "react";
import { useNotification } from "./NotificationProvider";
import { ApiErrorHandler } from "../utils/errorHandler";

interface FormFeedbackProps {
    onSubmit: (data: FormData) => Promise<void>;
    children: React.ReactNode;
    successMessage?: string;
    resetOnSuccess?: boolean;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({
    onSubmit,
    children,
    successMessage = "Operação realizada com sucesso!",
    resetOnSuccess = false,
}) => {
    const { showSuccess, showError } = useNotification();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            await onSubmit(formData);

            showSuccess("Sucesso", successMessage);

            if (resetOnSuccess) {
                (e.target as HTMLFormElement).reset();
            }
        } catch (error: unknown) {
            const errorMessage = ApiErrorHandler.getErrorMessage(error);
            showError("Erro", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {children}

            {/* Indicador de loading pode ser usado por child components */}
            <div style={{ display: "none" }} data-submitting={isSubmitting} />
        </form>
    );
};

interface LoadingButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    loadingText = "Carregando...",
    disabled,
    children,
    className = "",
    ...props
}) => {
    return (
        <button
            {...props}
            disabled={loading || disabled}
            className={`
                relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                    loading || disabled
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
                }
                ${className}
            `}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {loading ? loadingText : children}
        </button>
    );
};

interface ValidationSummaryProps {
    errors: Array<{ field: string; message: string }>;
    title?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
    errors,
    title = "Por favor, corrija os seguintes erros:",
}) => {
    if (errors.length === 0) return null;

    return (
        <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                        {title}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>
                                    <strong>{error.field}:</strong>{" "}
                                    {error.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    type?: "danger" | "warning" | "info";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    type = "danger",
}) => {
    const [isLoading, setIsLoading] = React.useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };

    const getColors = () => {
        switch (type) {
            case "danger":
                return {
                    bg: "bg-red-50",
                    iconColor: "text-red-600",
                    buttonColor:
                        "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                };
            case "warning":
                return {
                    bg: "bg-yellow-50",
                    iconColor: "text-yellow-600",
                    buttonColor:
                        "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                };
            case "info":
                return {
                    bg: "bg-blue-50",
                    iconColor: "text-blue-600",
                    buttonColor:
                        "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onCancel}
                />

                {/* Dialog */}
                <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                    <div
                        className={`px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ${colors.bg}`}
                    >
                        <div className="sm:flex sm:items-start">
                            <div
                                className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colors.bg} sm:mx-0 sm:h-10 sm:w-10`}
                            >
                                <svg
                                    className={`h-6 w-6 ${colors.iconColor}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <LoadingButton
                            loading={isLoading}
                            onClick={handleConfirm}
                            className={`w-full justify-center sm:ml-3 sm:w-auto ${colors.buttonColor}`}
                        >
                            {confirmText}
                        </LoadingButton>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormFeedback;
