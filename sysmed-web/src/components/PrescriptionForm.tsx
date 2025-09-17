import React, { useState } from "react";
import Card from "./Card";

export interface Prescription {
    id?: number;
    medication_name: string;
    generic_name?: string;
    dosage: string;
    form: string;
    frequency: string;
    quantity: number;
    administration_route: string;
    instructions?: string;
    start_date: string;
    end_date?: string;
    duration_days?: number;
    status: "active" | "completed" | "suspended" | "cancelled";
    is_controlled: boolean;
    generic_allowed: boolean;
    contraindications?: string;
    side_effects?: string;
    observations?: string;
}

interface PrescriptionFormProps {
    prescription?: Prescription;
    onSubmit: (prescription: Omit<Prescription, "id">) => void;
    onCancel: () => void;
    loading?: boolean;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
    prescription,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [formData, setFormData] = useState<Omit<Prescription, "id">>({
        medication_name: prescription?.medication_name || "",
        generic_name: prescription?.generic_name || "",
        dosage: prescription?.dosage || "",
        form: prescription?.form || "comprimido",
        frequency: prescription?.frequency || "",
        quantity: prescription?.quantity || 1,
        administration_route: prescription?.administration_route || "oral",
        instructions: prescription?.instructions || "",
        start_date:
            prescription?.start_date || new Date().toISOString().split("T")[0],
        end_date: prescription?.end_date || "",
        duration_days: prescription?.duration_days || undefined,
        status: prescription?.status || "active",
        is_controlled: prescription?.is_controlled || false,
        generic_allowed: prescription?.generic_allowed || true,
        contraindications: prescription?.contraindications || "",
        side_effects: prescription?.side_effects || "",
        observations: prescription?.observations || "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else if (type === "number") {
            setFormData((prev) => ({
                ...prev,
                [name]: parseInt(value) || 0,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calcular duration_days se end_date foi fornecido
        const calculatedData = { ...formData };
        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            const timeDiff = endDate.getTime() - startDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            calculatedData.duration_days = daysDiff > 0 ? daysDiff : undefined;
        }

        // Limpar campos vazios opcionais
        const cleanedData = {
            ...calculatedData,
            generic_name: calculatedData.generic_name || undefined,
            instructions: calculatedData.instructions || undefined,
            end_date: calculatedData.end_date || undefined,
            contraindications: calculatedData.contraindications || undefined,
            side_effects: calculatedData.side_effects || undefined,
            observations: calculatedData.observations || undefined,
        };

        onSubmit(cleanedData);
    };

    const medicationForms = [
        "comprimido",
        "cápsula",
        "xarope",
        "suspensão",
        "solução",
        "pomada",
        "creme",
        "gel",
        "injeção",
        "gotas",
        "spray",
        "aerossol",
        "patch",
    ];

    const administrationRoutes = [
        { value: "oral", label: "Via Oral" },
        { value: "intravenosa", label: "Intravenosa" },
        { value: "intramuscular", label: "Intramuscular" },
        { value: "subcutanea", label: "Subcutânea" },
        { value: "topica", label: "Tópica" },
        { value: "ocular", label: "Ocular" },
        { value: "nasal", label: "Nasal" },
        { value: "auricular", label: "Auricular" },
        { value: "retal", label: "Retal" },
        { value: "vaginal", label: "Vaginal" },
    ];

    return (
        <Card title={prescription ? "Editar Prescrição" : "Nova Prescrição"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medicamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Medicamento *
                        </label>
                        <input
                            type="text"
                            name="medication_name"
                            value={formData.medication_name}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Dipirona"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Genérico
                        </label>
                        <input
                            type="text"
                            name="generic_name"
                            value={formData.generic_name}
                            onChange={handleChange}
                            placeholder="Ex: Metamizol sódico"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Dosagem e Forma */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dosagem *
                        </label>
                        <input
                            type="text"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 500mg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Forma Farmacêutica *
                        </label>
                        <select
                            name="form"
                            value={formData.form}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {medicationForms.map((form) => (
                                <option key={form} value={form}>
                                    {form.charAt(0).toUpperCase() +
                                        form.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantidade *
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Frequência e Via de Administração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequência *
                        </label>
                        <input
                            type="text"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 2x ao dia, 8/8h"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Exemplos: 2x ao dia, 8/8h, 1x semana, conforme
                            necessário
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Via de Administração
                        </label>
                        <select
                            name="administration_route"
                            value={formData.administration_route}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {administrationRoutes.map((route) => (
                                <option key={route.value} value={route.value}>
                                    {route.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Período de Tratamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Início *
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Término
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            min={formData.start_date}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Deixe vazio para tratamento contínuo
                        </p>
                    </div>
                </div>

                {/* Instruções */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instruções de Uso
                    </label>
                    <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ex: Tomar após as refeições, com bastante água..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Controles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_controlled"
                            name="is_controlled"
                            checked={formData.is_controlled}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="is_controlled"
                            className="ml-2 text-sm text-gray-700"
                        >
                            Medicamento controlado
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="generic_allowed"
                            name="generic_allowed"
                            checked={formData.generic_allowed}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="generic_allowed"
                            className="ml-2 text-sm text-gray-700"
                        >
                            Permite medicamento genérico
                        </label>
                    </div>
                </div>

                {/* Contraindicações */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraindicações
                    </label>
                    <textarea
                        name="contraindications"
                        value={formData.contraindications}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Ex: Não use em caso de alergia a dipirona..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Efeitos Colaterais */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Possíveis Efeitos Colaterais
                    </label>
                    <textarea
                        name="side_effects"
                        value={formData.side_effects}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Ex: Sonolência, náusea, dor de cabeça..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Observações */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações
                    </label>
                    <textarea
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Observações adicionais sobre a prescrição..."
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
                            : prescription
                            ? "Atualizar"
                            : "Salvar"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default PrescriptionForm;
