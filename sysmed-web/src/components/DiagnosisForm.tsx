import React, { useState } from "react";
import Card from "./Card";

export interface Diagnosis {
    id?: number;
    code_icd10?: string;
    description: string;
    details?: string;
    type: "primary" | "secondary" | "differential";
    status: "active" | "resolved" | "chronic" | "suspected";
    diagnosed_at: string;
    resolved_at?: string;
    severity?: "mild" | "moderate" | "severe";
    prognosis?: string;
}

interface DiagnosisFormProps {
    diagnosis?: Diagnosis;
    onSubmit: (diagnosis: Omit<Diagnosis, "id">) => void;
    onCancel: () => void;
    loading?: boolean;
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({
    diagnosis,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [formData, setFormData] = useState<Omit<Diagnosis, "id">>({
        code_icd10: diagnosis?.code_icd10 || "",
        description: diagnosis?.description || "",
        details: diagnosis?.details || "",
        type: diagnosis?.type || "primary",
        status: diagnosis?.status || "active",
        diagnosed_at:
            diagnosis?.diagnosed_at || new Date().toISOString().split("T")[0],
        resolved_at: diagnosis?.resolved_at || "",
        severity: diagnosis?.severity || "mild",
        prognosis: diagnosis?.prognosis || "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Limpar campos vazios opcionais
        const cleanedData = {
            ...formData,
            code_icd10: formData.code_icd10 || undefined,
            details: formData.details || undefined,
            resolved_at: formData.resolved_at || undefined,
            severity: formData.severity || undefined,
            prognosis: formData.prognosis || undefined,
        };

        onSubmit(cleanedData);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "primary":
                return "Principal";
            case "secondary":
                return "Secundário";
            case "differential":
                return "Diferencial";
            default:
                return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active":
                return "Ativo";
            case "resolved":
                return "Resolvido";
            case "chronic":
                return "Crônico";
            case "suspected":
                return "Suspeito";
            default:
                return status;
        }
    };

    const getSeverityLabel = (severity: string) => {
        switch (severity) {
            case "mild":
                return "Leve";
            case "moderate":
                return "Moderado";
            case "severe":
                return "Grave";
            default:
                return severity;
        }
    };

    return (
        <Card title={diagnosis ? "Editar Diagnóstico" : "Novo Diagnóstico"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Código CID-10 e Descrição */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Código CID-10
                        </label>
                        <input
                            type="text"
                            name="code_icd10"
                            value={formData.code_icd10}
                            onChange={handleChange}
                            placeholder="Ex: M54.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Opcional - Código de classificação internacional
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição do Diagnóstico *
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Dorsalgia não especificada"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Tipo e Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo do Diagnóstico
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="primary">
                                {getTypeLabel("primary")}
                            </option>
                            <option value="secondary">
                                {getTypeLabel("secondary")}
                            </option>
                            <option value="differential">
                                {getTypeLabel("differential")}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">
                                {getStatusLabel("active")}
                            </option>
                            <option value="suspected">
                                {getStatusLabel("suspected")}
                            </option>
                            <option value="chronic">
                                {getStatusLabel("chronic")}
                            </option>
                            <option value="resolved">
                                {getStatusLabel("resolved")}
                            </option>
                        </select>
                    </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data do Diagnóstico *
                        </label>
                        <input
                            type="date"
                            name="diagnosed_at"
                            value={formData.diagnosed_at}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {formData.status === "resolved" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Resolução
                            </label>
                            <input
                                type="date"
                                name="resolved_at"
                                value={formData.resolved_at}
                                onChange={handleChange}
                                min={formData.diagnosed_at}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                {/* Gravidade */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gravidade
                    </label>
                    <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Não especificado</option>
                        <option value="mild">{getSeverityLabel("mild")}</option>
                        <option value="moderate">
                            {getSeverityLabel("moderate")}
                        </option>
                        <option value="severe">
                            {getSeverityLabel("severe")}
                        </option>
                    </select>
                </div>

                {/* Detalhes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detalhes Adicionais
                    </label>
                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Informações complementares sobre o diagnóstico..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Prognóstico */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prognóstico
                    </label>
                    <textarea
                        name="prognosis"
                        value={formData.prognosis}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Prognóstico esperado para este diagnóstico..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Botões */}
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
                        {loading
                            ? "Salvando..."
                            : diagnosis
                            ? "Atualizar"
                            : "Salvar"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default DiagnosisForm;
