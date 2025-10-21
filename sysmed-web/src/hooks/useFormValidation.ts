import { useState } from "react";

// Tipos de validação
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean;
    email?: boolean;
    cpf?: boolean;
    phone?: boolean;
    date?: boolean;
    number?: boolean;
    min?: number;
    max?: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface FormData {
    [key: string]: string | number | boolean | null | undefined;
}

// Hook para validação de formulários
export const useFormValidation = () => {
    const [errors, setErrors] = useState<ValidationError[]>([]);

    // Validar um campo específico
    const validateField = (
        field: string,
        value: string | number,
        rules: ValidationRule
    ): string | null => {
        const stringValue = String(value || "");

        // Required
        if (rules.required && (!stringValue || stringValue.trim() === "")) {
            return `${field} é obrigatório`;
        }

        // Se o campo está vazio e não é obrigatório, não valida o resto
        if (!stringValue.trim() && !rules.required) {
            return null;
        }

        // MinLength
        if (rules.minLength && stringValue.length < rules.minLength) {
            return `${field} deve ter pelo menos ${rules.minLength} caracteres`;
        }

        // MaxLength
        if (rules.maxLength && stringValue.length > rules.maxLength) {
            return `${field} deve ter no máximo ${rules.maxLength} caracteres`;
        }

        // Email
        if (rules.email && !isValidEmail(stringValue)) {
            return `${field} deve ser um email válido`;
        }

        // CPF
        if (rules.cpf && !isValidCPF(stringValue)) {
            return `${field} deve ser um CPF válido`;
        }

        // Phone
        if (rules.phone && !isValidPhone(stringValue)) {
            return `${field} deve ser um telefone válido`;
        }

        // Date
        if (rules.date && !isValidDate(stringValue)) {
            return `${field} deve ser uma data válida`;
        }

        // Number
        if (rules.number && isNaN(Number(value))) {
            return `${field} deve ser um número válido`;
        }

        // Min (para números)
        if (rules.min !== undefined && Number(value) < rules.min) {
            return `${field} deve ser maior ou igual a ${rules.min}`;
        }

        // Max (para números)
        if (rules.max !== undefined && Number(value) > rules.max) {
            return `${field} deve ser menor ou igual a ${rules.max}`;
        }

        // Pattern
        if (rules.pattern && !rules.pattern.test(stringValue)) {
            return `${field} tem formato inválido`;
        }

        // Custom validation
        if (rules.custom && !rules.custom(stringValue)) {
            return `${field} é inválido`;
        }

        return null;
    };

    // Validar formulário completo
    const validateForm = (
        data: FormData,
        rules: Record<string, ValidationRule>
    ): boolean => {
        const newErrors: ValidationError[] = [];

        Object.keys(rules).forEach((field) => {
            const value = data[field];
            const fieldRules = rules[field];
            const error = validateField(
                field,
                value as string | number,
                fieldRules
            );

            if (error) {
                newErrors.push({ field, message: error });
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // Obter erro de um campo específico
    const getFieldError = (field: string): string | undefined => {
        return errors.find((error) => error.field === field)?.message;
    };

    // Limpar erros
    const clearErrors = () => {
        setErrors([]);
    };

    // Limpar erro de um campo específico
    const clearFieldError = (field: string) => {
        setErrors((prev) => prev.filter((error) => error.field !== field));
    };

    return {
        errors,
        validateField,
        validateForm,
        getFieldError,
        clearErrors,
        clearFieldError,
        hasErrors: errors.length > 0,
    };
};

// Funções de validação específicas
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidCPF = (cpf: string): boolean => {
    // Remove formatação
    const cleanCPF = cpf.replace(/[^\d]/g, "");

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Calcula dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
};

export const isValidPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    return cleanPhone.length === 10 || cleanPhone.length === 11;
};

export const isValidDate = (date: string): boolean => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
};

// Funções de formatação
export const formatCPF = (cpf: string): string => {
    const cleanCPF = cpf.replace(/[^\d]/g, "");
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    if (cleanPhone.length === 11) {
        return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
};

export const formatCEP = (cep: string): string => {
    const clean = cep.replace(/[^\d]/g, "");
    if (clean.length >= 8) {
        return clean.replace(/(\d{5})(\d{3}).*/, "$1-$2");
    }
    // Formatação parcial enquanto digita
    return clean.replace(/(\d{5})(\d{0,3})/, "$1-$2");
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return parsedDate.toLocaleDateString("pt-BR");
};

export const formatDateTime = (datetime: string | Date): string => {
    const parsedDate =
        typeof datetime === "string" ? new Date(datetime) : datetime;
    return parsedDate.toLocaleString("pt-BR");
};

export default useFormValidation;
