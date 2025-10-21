// Tipos de erro customizados
export interface ApiError {
    message: string;
    status?: number;
    field?: string;
    code?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: ApiError[];
}

interface AxiosError {
    response?: {
        status: number;
        data: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
    message: string;
}

// Classe para tratamento de erros de API
export class ApiErrorHandler {
    static handle(error: AxiosError | Error | unknown): ApiError {
        // Verificar se é um erro conhecido
        if (
            typeof error === "object" &&
            error !== null &&
            "response" in error
        ) {
            const axiosError = error as AxiosError;

            // Erro de rede
            if (!axiosError.response) {
                return {
                    message: "Erro de conexão. Verifique sua internet.",
                    code: "NETWORK_ERROR",
                };
            }

            const { status, data } = axiosError.response;

            // Erro 401 - Não autorizado
            if (status === 401) {
                return {
                    message: "Sessão expirada. Faça login novamente.",
                    status: 401,
                    code: "UNAUTHORIZED",
                };
            }

            // Erro 403 - Proibido
            if (status === 403) {
                return {
                    message: "Você não tem permissão para esta ação.",
                    status: 403,
                    code: "FORBIDDEN",
                };
            }

            // Erro 404 - Não encontrado
            if (status === 404) {
                return {
                    message: "Recurso não encontrado.",
                    status: 404,
                    code: "NOT_FOUND",
                };
            }

            // Erro 422 - Validação/negócio
            if (status === 422) {
                const validationErrors = data.errors || {};
                const hasFieldErrors =
                    validationErrors &&
                    typeof validationErrors === "object" &&
                    Object.keys(validationErrors).length > 0;

                if (hasFieldErrors) {
                    const firstField = Object.keys(validationErrors)[0];
                    const firstError = validationErrors[firstField]?.[0];
                    return {
                        message: firstError || "Dados inválidos.",
                        status: 422,
                        field: firstField,
                        code: "VALIDATION_ERROR",
                    };
                }

                // Quando o backend envia apenas message (ex.: conflito de horário)
                const rawMessage = data.message || "Dados inválidos.";
                const lower = rawMessage.toLowerCase();
                if (lower.includes("conflito") || lower.includes("ocupado")) {
                    return {
                        message: ErrorMessages.appointment.timeConflict,
                        status: 422,
                        code: "TIME_CONFLICT",
                    };
                }
                return {
                    message: rawMessage,
                    status: 422,
                    code: "VALIDATION_ERROR",
                };
            }

            // Erro 500 - Servidor
            if (status >= 500) {
                return {
                    message:
                        data.message ||
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    status,
                    code: "SERVER_ERROR",
                };
            }

            // Erro genérico
            return {
                message: data.message || "Ocorreu um erro inesperado.",
                status,
                code: "UNKNOWN_ERROR",
            };
        }

        // Erro genérico para outros tipos
        const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
        return {
            message: errorMessage,
            code: "UNKNOWN_ERROR",
        };
    }

    static getErrorMessage(error: AxiosError | Error | unknown): string {
        const apiError = this.handle(error);
        return apiError.message;
    }

    static isAuthError(error: AxiosError | Error | unknown): boolean {
        const apiError = this.handle(error);
        return apiError.status === 401;
    }

    static isValidationError(error: AxiosError | Error | unknown): boolean {
        const apiError = this.handle(error);
        return apiError.status === 422;
    }
}

// Mensagens de erro amigáveis por contexto
export const ErrorMessages = {
    patient: {
        notFound: "Paciente não encontrado.",
        createFailed: "Erro ao cadastrar paciente.",
        updateFailed: "Erro ao atualizar dados do paciente.",
        deleteFailed: "Erro ao excluir paciente.",
    },
    appointment: {
        notFound: "Consulta não encontrada.",
        createFailed: "Erro ao agendar consulta.",
        updateFailed: "Erro ao atualizar consulta.",
        deleteFailed: "Erro ao cancelar consulta.",
        timeConflict: "Horário já ocupado. Escolha outro horário.",
    },
    medicalRecord: {
        notFound: "Prontuário não encontrado.",
        createFailed: "Erro ao criar prontuário.",
        updateFailed: "Erro ao atualizar prontuário.",
        deleteFailed: "Erro ao excluir prontuário.",
    },
    auth: {
        loginFailed: "Email ou senha incorretos.",
        sessionExpired: "Sua sessão expirou. Faça login novamente.",
        unauthorized: "Você não tem permissão para esta ação.",
    },
    general: {
        networkError: "Erro de conexão. Verifique sua internet.",
        serverError: "Erro interno do servidor. Tente novamente.",
        unknownError: "Ocorreu um erro inesperado.",
    },
};

export default ApiErrorHandler;
