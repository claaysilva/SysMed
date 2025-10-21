import React, { useState, useEffect } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import type { ValidationRule } from "../../hooks/useFormValidation";
import {
    isValidCPF,
    isValidEmail,
    isValidPhone,
    formatCPF,
    formatPhone,
} from "../../hooks/useFormValidation";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    validationRules?: ValidationRule;
    onValidation?: (isValid: boolean, error?: string) => void;
    mask?: "cpf" | "phone" | "currency";
    helpText?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    validationRules = {},
    onValidation,
    mask,
    helpText,
    className = "",
    onChange,
    onBlur,
    value,
    ...props
}) => {
    const [internalValue, setInternalValue] = useState(value || "");
    const [isTouched, setIsTouched] = useState(false);
    const [validationError, setValidationError] = useState<string>("");

    // Função de validação
    const validateValue = (val: string): string => {
        const stringValue = String(val || "");

        // Required
        if (
            validationRules.required &&
            (!stringValue || stringValue.trim() === "")
        ) {
            return `${label} é obrigatório`;
        }

        // Se o campo está vazio e não é obrigatório, não valida o resto
        if (!stringValue.trim() && !validationRules.required) {
            return "";
        }

        // MinLength
        if (
            validationRules.minLength &&
            stringValue.length < validationRules.minLength
        ) {
            return `${label} deve ter pelo menos ${validationRules.minLength} caracteres`;
        }

        // MaxLength
        if (
            validationRules.maxLength &&
            stringValue.length > validationRules.maxLength
        ) {
            return `${label} deve ter no máximo ${validationRules.maxLength} caracteres`;
        }

        // Email
        if (validationRules.email && !isValidEmail(stringValue)) {
            return `${label} deve ser um email válido`;
        }

        // CPF
        if (validationRules.cpf && !isValidCPF(stringValue)) {
            return `${label} deve ser um CPF válido`;
        }

        // Phone
        if (validationRules.phone && !isValidPhone(stringValue)) {
            return `${label} deve ser um telefone válido`;
        }

        // Pattern
        if (
            validationRules.pattern &&
            !validationRules.pattern.test(stringValue)
        ) {
            return `${label} tem formato inválido`;
        }

        // Number validation
        if (validationRules.number && isNaN(Number(stringValue))) {
            return `${label} deve ser um número válido`;
        }

        // Min (para números)
        if (
            validationRules.min !== undefined &&
            Number(stringValue) < validationRules.min
        ) {
            return `${label} deve ser maior ou igual a ${validationRules.min}`;
        }

        // Max (para números)
        if (
            validationRules.max !== undefined &&
            Number(stringValue) > validationRules.max
        ) {
            return `${label} deve ser menor ou igual a ${validationRules.max}`;
        }

        // Custom validation
        if (validationRules.custom && !validationRules.custom(stringValue)) {
            return `${label} é inválido`;
        }

        return "";
    };

    // Aplicar máscara de formatação
    const applyMask = (val: string): string => {
        if (!mask) return val;

        switch (mask) {
            case "cpf":
                return formatCPF(val);
            case "phone":
                return formatPhone(val);
            case "currency": {
                // Simples formatação de moeda
                const numbers = val.replace(/[^\d]/g, "");
                const currency = (Number(numbers) / 100).toFixed(2);
                return `R$ ${currency}`.replace(".", ",");
            }
            default:
                return val;
        }
    };

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Aplicar máscara se necessário
        if (mask) {
            newValue = applyMask(newValue);
        }

        setInternalValue(newValue);

        // Validar se o campo foi tocado
        if (isTouched) {
            const error = validateValue(newValue);
            setValidationError(error);
            onValidation?.(error === "", error);
        }

        // Chamar onChange original
        if (onChange) {
            const syntheticEvent = {
                ...e,
                target: { ...e.target, value: newValue },
            };
            onChange(syntheticEvent);
        }
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsTouched(true);
        const error = validateValue(internalValue.toString());
        setValidationError(error);
        onValidation?.(error === "", error);

        if (onBlur) {
            onBlur(e);
        }
    };

    // Sincronizar valor externo
    useEffect(() => {
        setInternalValue(value || "");
    }, [value]);

    // Determinar se há erro
    const hasError = error || validationError;
    const showError = isTouched && hasError;

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            <div className="relative">
                <input
                    {...props}
                    value={internalValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${
                            showError
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }
                        ${className}
                    `}
                />

                {showError && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                )}
            </div>

            {/* Texto de ajuda */}
            {helpText && !showError && (
                <p className="mt-1 text-sm text-gray-500">{helpText}</p>
            )}

            {/* Mensagem de erro */}
            {showError && (
                <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
        </div>
    );
};

export default Input;
