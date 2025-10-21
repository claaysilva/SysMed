import React from "react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log para diagnóstico em desenvolvimento
        if (import.meta.env.DEV) {
            console.error("[ErrorBoundary]", error, errorInfo);
        }
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div
                        style={{
                            padding: "1rem",
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#991b1b",
                            borderRadius: 8,
                        }}
                    >
                        Ocorreu um erro ao exibir este conteúdo. Tente fechar e
                        abrir novamente.
                    </div>
                )
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
