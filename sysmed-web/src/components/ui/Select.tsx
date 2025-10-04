import React, { useState, useEffect } from "react";
import {
    ExclamationCircleIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import type { ValidationRule } from "../../hooks/useFormValidation";

interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    label: string;
    options: SelectOption[];
    error?: string;
    validationRules?: ValidationRule;
    onValidation?: (isValid: boolean, error?: string) => void;
    helpText?: string;
    placeholder?: string;
    onChange?: (value: string | number) => void;
}

const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    validationRules = {},
    onValidation,
    helpText,
    placeholder = "Selecione uma opção...",
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
    const validateValue = (val: string | number): string => {
        const stringValue = String(val || "");

        // Required
        if (
            validationRules.required &&
            (!stringValue || stringValue.trim() === "")
        ) {
            return `${label} é obrigatório`;
        }

        // Custom validation
        if (validationRules.custom && !validationRules.custom(stringValue)) {
            return `${label} é inválido`;
        }

        return "";
    };

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);

        // Validar se o campo foi tocado
        if (isTouched) {
            const error = validateValue(newValue);
            setValidationError(error);
            onValidation?.(error === "", error);
        }

        // Chamar onChange personalizado
        onChange?.(newValue);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
        setIsTouched(true);
        const error = validateValue(String(internalValue));
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
                {validationRules.required && (
                    <span className="text-red-500 ml-1">*</span>
                )}
            </label>

            <div className="relative">
                <select
                    {...props}
                    value={internalValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none bg-white
                        ${
                            showError
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }
                        ${className}
                    `}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Ícone de dropdown */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    {showError ? (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                </div>
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

export default Select;
