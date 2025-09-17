import React, { useState, useEffect } from "react";
import Card from "./Card";

interface ReportTemplate {
    id: number;
    name: string;
    type: "medical" | "financial" | "statistical";
    category: string;
    description?: string;
    fields: string[];
    default_filters?: Record<string, string | number | boolean>;
}

interface ReportFormProps {
    templates?: ReportTemplate[];
    onSubmit: (data: FormData) => void;
    onCancel: () => void;
    onExport?: (data: FormData) => void;
    loading?: boolean;
    showExportOptions?: boolean;
}

interface FormData {
    title: string;
    type: string;
    category: string;
    description: string;
    format: string;
    template_id: number | null;
    filters: Record<string, string | number | boolean>;
    expires_at: string;
}

const ReportForm: React.FC<ReportFormProps> = ({
    templates = [],
    onSubmit,
    onCancel,
    onExport,
    loading = false,
    showExportOptions = false,
}) => {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        type: "medical",
        category: "",
        description: "",
        format: "pdf",
        template_id: null,
        filters: {},
        expires_at: "",
    });

    const [selectedTemplate, setSelectedTemplate] =
        useState<ReportTemplate | null>(null);

    useEffect(() => {
        if (formData.template_id) {
            const template = templates.find(
                (t) => t.id === formData.template_id
            );
            setSelectedTemplate(template || null);

            if (template) {
                setFormData((prev) => ({
                    ...prev,
                    type: template.type,
                    category: template.category,
                    title: template.name,
                    filters: template.default_filters || {},
                }));
            }
        } else {
            setSelectedTemplate(null);
        }
    }, [formData.template_id, templates]);

    const handleInputChange = (
        field: keyof FormData,
        value: string | number | boolean | null
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFilterChange = (
        filterKey: string,
        value: string | number | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            filters: {
                ...prev.filters,
                [filterKey]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Limpar filtros vazios
        const cleanedFilters = Object.fromEntries(
            Object.entries(formData.filters).filter(
                ([, value]) =>
                    value !== null && value !== "" && value !== undefined
            )
        );

        const submissionData = {
            ...formData,
            filters: cleanedFilters,
            template_id: formData.template_id || undefined,
            expires_at: formData.expires_at || undefined,
        };

        onSubmit(submissionData as FormData);
    };

    const typeOptions = [
        { value: "medical", label: "Médico" },
        { value: "financial", label: "Financeiro" },
        { value: "statistical", label: "Estatístico" },
        { value: "custom", label: "Personalizado" },
    ];

    const formatOptions = [
        { value: "pdf", label: "PDF" },
        { value: "excel", label: "Excel (XLSX)" },
        { value: "csv", label: "CSV" },
        { value: "html", label: "HTML" },
    ];

    const filteredTemplates = templates.filter(
        (t) => !formData.type || t.type === formData.type
    );

    return (
        <Card title="Gerar Novo Relatório">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Template Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template (Opcional)
                    </label>
                    <select
                        value={formData.template_id || ""}
                        onChange={(e) =>
                            handleInputChange(
                                "template_id",
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Relatório personalizado</option>
                        {filteredTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {selectedTemplate?.description && (
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedTemplate.description}
                        </p>
                    )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                handleInputChange("title", e.target.value)
                            }
                            required
                            placeholder="Ex: Relatório Mensal de Consultas"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                handleInputChange("type", e.target.value)
                            }
                            required
                            disabled={!!selectedTemplate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                            {typeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoria *
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) =>
                                handleInputChange("category", e.target.value)
                            }
                            required
                            disabled={!!selectedTemplate}
                            placeholder="Ex: consultas, pacientes, financeiro"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Formato *
                        </label>
                        <select
                            value={formData.format}
                            onChange={(e) =>
                                handleInputChange("format", e.target.value)
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {formatOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            handleInputChange("description", e.target.value)
                        }
                        rows={3}
                        placeholder="Descrição opcional do relatório..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Filters */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Filtros
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date Filters */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Data de Início
                            </label>
                            <input
                                type="date"
                                value={String(formData.filters.date_from || "")}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_from",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Data de Fim
                            </label>
                            <input
                                type="date"
                                value={String(formData.filters.date_to || "")}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_to",
                                        e.target.value
                                    )
                                }
                                min={
                                    typeof formData.filters.date_from ===
                                    "string"
                                        ? formData.filters.date_from
                                        : undefined
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Consultation Type Filter */}
                        {(formData.type === "medical" ||
                            formData.category === "appointments") && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Tipo de Consulta
                                </label>
                                <select
                                    value={String(
                                        formData.filters.consultation_type || ""
                                    )}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "consultation_type",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Todos os tipos</option>
                                    <option value="consulta">Consulta</option>
                                    <option value="retorno">Retorno</option>
                                    <option value="urgencia">Urgência</option>
                                </select>
                            </div>
                        )}

                        {/* Age Filters */}
                        {formData.type === "statistical" && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Idade Mínima
                                    </label>
                                    <input
                                        type="number"
                                        value={String(
                                            formData.filters.age_min || ""
                                        )}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "age_min",
                                                e.target.value
                                            )
                                        }
                                        min="0"
                                        max="150"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Idade Máxima
                                    </label>
                                    <input
                                        type="number"
                                        value={String(
                                            formData.filters.age_max || ""
                                        )}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "age_max",
                                                e.target.value
                                            )
                                        }
                                        min={
                                            typeof formData.filters.age_min ===
                                            "number"
                                                ? formData.filters.age_min
                                                : 0
                                        }
                                        max="150"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Gênero
                                    </label>
                                    <select
                                        value={String(
                                            formData.filters.gender || ""
                                        )}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "gender",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Todos os gêneros
                                        </option>
                                        <option value="masculino">
                                            Masculino
                                        </option>
                                        <option value="feminino">
                                            Feminino
                                        </option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Expiration */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Expiração (Opcional)
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) =>
                            handleInputChange("expires_at", e.target.value)
                        }
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Se não especificado, o relatório expirará em 30 dias
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Gerando..." : "Gerar Relatório"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default ReportForm;
