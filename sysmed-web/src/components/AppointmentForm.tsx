import React, { useState, useEffect } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";
import Button from "./Button";

interface Appointment {
    id?: number;
    patient_id: number;
    user_id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    observacoes?: string;
    tipo_consulta?: "consulta" | "retorno" | "emergencia" | "exame";
    valor?: number;
}

interface AppointmentFormProps {
    appointment?: Appointment;
    onSubmit: () => void;
    onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    appointment,
    onSubmit,
    onCancel,
}) => {
    const { createAppointment, updateAppointment, loading, error } =
        useAppointments();
    const { patients, loading: patientsLoading } = usePatients();
    const [formData, setFormData] = useState({
        patient_id: "",
        user_id: "1", // Por enquanto hardcoded para o médico logado
        data_hora_inicio: "",
        data_hora_fim: "",
        observacoes: "",
        tipo_consulta: "consulta" as
            | "consulta"
            | "retorno"
            | "emergencia"
            | "exame",
        valor: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (appointment) {
            setFormData({
                patient_id: appointment.patient_id?.toString() || "",
                user_id: appointment.user_id?.toString() || "1",
                data_hora_inicio:
                    appointment.data_hora_inicio?.slice(0, 16) || "",
                data_hora_fim: appointment.data_hora_fim?.slice(0, 16) || "",
                observacoes: appointment.observacoes || "",
                tipo_consulta: appointment.tipo_consulta || "consulta",
                valor: appointment.valor?.toString() || "",
            });
        }
    }, [appointment]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.patient_id) {
            errors.patient_id = "Selecione um paciente";
        }

        if (!formData.data_hora_inicio) {
            errors.data_hora_inicio = "Data e hora de início são obrigatórias";
        }

        if (!formData.data_hora_fim) {
            errors.data_hora_fim = "Data e hora de fim são obrigatórias";
        }

        if (formData.data_hora_inicio && formData.data_hora_fim) {
            const inicio = new Date(formData.data_hora_inicio);
            const fim = new Date(formData.data_hora_fim);

            if (fim <= inicio) {
                errors.data_hora_fim =
                    "Data/hora de fim deve ser posterior ao início";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const submitData = {
                patient_id: Number(formData.patient_id),
                user_id: Number(formData.user_id),
                data_hora_inicio: formData.data_hora_inicio,
                data_hora_fim: formData.data_hora_fim,
                observacoes: formData.observacoes,
                tipo_consulta: formData.tipo_consulta,
                valor: formData.valor ? Number(formData.valor) : undefined,
            };

            if (appointment && appointment.id) {
                await updateAppointment(appointment.id, submitData);
            } else {
                await createAppointment(submitData);
            }
            onSubmit();
        } catch (err) {
            console.error("Erro ao salvar consulta:", err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Limpar erro do campo quando o usuário começar a digitar
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {appointment ? "Editar Consulta" : "Nova Consulta"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paciente *
                        </label>
                        <select
                            name="patient_id"
                            value={formData.patient_id}
                            onChange={handleChange}
                            required
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.patient_id
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            disabled={patientsLoading}
                        >
                            <option value="">
                                {patientsLoading
                                    ? "Carregando pacientes..."
                                    : "Selecione um paciente"}
                            </option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.nome_completo}
                                </option>
                            ))}
                        </select>
                        {formErrors.patient_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.patient_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Consulta
                        </label>
                        <select
                            name="tipo_consulta"
                            value={formData.tipo_consulta}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="consulta">Consulta</option>
                            <option value="retorno">Retorno</option>
                            <option value="emergencia">Emergência</option>
                            <option value="exame">Exame</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data e Hora de Início *
                        </label>
                        <input
                            type="datetime-local"
                            name="data_hora_inicio"
                            value={formData.data_hora_inicio}
                            onChange={handleChange}
                            required
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.data_hora_inicio
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {formErrors.data_hora_inicio && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.data_hora_inicio}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data e Hora de Fim *
                        </label>
                        <input
                            type="datetime-local"
                            name="data_hora_fim"
                            value={formData.data_hora_fim}
                            onChange={handleChange}
                            required
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.data_hora_fim
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {formErrors.data_hora_fim && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.data_hora_fim}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor (R$)
                        </label>
                        <input
                            type="number"
                            name="valor"
                            value={formData.valor}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações
                    </label>
                    <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Observações sobre a consulta..."
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button variant="outline" onClick={onCancel} type="button">
                        Cancelar
                    </Button>
                    <Button type="submit" loading={loading}>
                        {appointment ? "Atualizar" : "Criar"} Consulta
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
