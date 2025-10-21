import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { usePatients as usePatientsList } from "../hooks/usePatients";
// import { apiRequest } from "../services/api";
import { useDoctors as useDoctorsCached } from "../hooks/useOptimizedData";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCPF } from "../hooks/useFormValidation";
import Button from "../components/Button";
import DiagnosisForm from "../components/DiagnosisForm";
import PrescriptionForm from "../components/PrescriptionForm";
import ConfirmationModal from "../components/ConfirmationModal";

type MedicalRecordFormPageProps = Record<string, never>;

// Patient é obtido via hook usePatientsList

interface Doctor {
    id: number;
    name: string;
}
// type DoctorsResponse = Doctor[] | { success: boolean; data: Doctor[] };

interface FormData {
    patient_id: number;
    user_id: number;
    data_consulta: string;
    horario_consulta: string;
    tipo_consulta: "consulta" | "retorno" | "emergencia" | "exame" | "cirurgia";
    queixa_principal: string;
    hipotese_diagnostica: string;
    status?: "rascunho" | "finalizado" | "assinado";
}

const MedicalRecordFormPage: React.FC<MedicalRecordFormPageProps> = () => {
    const navigate = useNavigate();
    const { recordId } = useParams<{ recordId: string }>();
    const isEdit = !!recordId;
    const { getMedicalRecord, createMedicalRecord, updateMedicalRecord } =
        useMedicalRecords();
    const { patients } = usePatientsList();
    const [formData, setFormData] = useState<FormData>({
        patient_id: 0,
        user_id: 0,
        data_consulta: new Date().toISOString().split("T")[0],
        horario_consulta: new Date().toTimeString().slice(0, 5),
        tipo_consulta: "consulta",
        queixa_principal: "",
        hipotese_diagnostica: "",
        status: "rascunho",
    });

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const { data: doctorsData } = useDoctorsCached();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<
        "basic" | "diagnoses" | "prescriptions"
    >("basic");

    const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [saveModal, setSaveModal] = useState(false);

    const { showSuccess, showError } = useToast();

    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            // Pacientes são carregados automaticamente pelo hook usePatientsList
            // Médicos serão aplicados via efeito quando doctorsData atualizar

            // Se for edição, carregar dados reais do prontuário
            if (isEdit && recordId) {
                const rec = await getMedicalRecord(Number(recordId));
                if (rec) {
                    setFormData({
                        patient_id: rec.patient_id,
                        user_id: rec.user_id,
                        data_consulta: rec.data_consulta,
                        horario_consulta: rec.horario_consulta,
                        tipo_consulta: rec.tipo_consulta,
                        queixa_principal: rec.queixa_principal || "",
                        hipotese_diagnostica: rec.hipotese_diagnostica || "",
                        status: rec.status,
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showError("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, [isEdit, recordId, showError, getMedicalRecord]);

    useEffect(() => {
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId]);

    // Aplicar médicos do hook cacheado e pré-selecionar médico padrão
    useEffect(() => {
        const list: Doctor[] = Array.isArray(doctorsData)
            ? (doctorsData as Doctor[])
            : (doctorsData as { data?: Doctor[] })?.data || [];
        setDoctors(list);
        if (list.length > 0) {
            setFormData((prev) => {
                if (prev.user_id && list.some((d) => d.id === prev.user_id)) {
                    return prev; // já selecionado e válido
                }
                const storedUserId = localStorage.getItem("userId");
                const defaultDoctorId =
                    storedUserId &&
                    list.some((d) => String(d.id) === String(storedUserId))
                        ? Number(storedUserId)
                        : list[0].id;
                return { ...prev, user_id: defaultDoctorId };
            });
        } else {
            // Sem médicos disponíveis, resetar seleção
            setFormData((prev) => ({ ...prev, user_id: 0 }));
        }
    }, [doctorsData]);

    const handleInputChange = (
        field: keyof FormData,
        value: string | number
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.patient_id) {
            showError("Selecione um paciente");
            return false;
        }

        if (!formData.user_id) {
            showError("Selecione um médico");
            return false;
        }

        if (!formData.data_consulta) {
            showError("Informe a data da consulta");
            return false;
        }

        if (!formData.horario_consulta) {
            showError("Informe o horário da consulta");
            return false;
        }

        if (!formData.queixa_principal.trim()) {
            showError("Informe a queixa principal");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);
            setSaveModal(false);
            if (isEdit && recordId) {
                const updated = await updateMedicalRecord(
                    Number(recordId),
                    formData
                );
                if (updated) {
                    showSuccess("Prontuário atualizado com sucesso!");
                    navigate(`/medical-records/${updated.id}`);
                }
            } else {
                const created = await createMedicalRecord(formData);
                if (created) {
                    showSuccess("Prontuário criado com sucesso!");
                    navigate(`/medical-records/${created.id}`);
                }
            }
        } catch (error) {
            console.error("Erro ao salvar prontuário:", error);
            showError("Erro ao salvar prontuário");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/medical-records");
    };

    if (loading) {
        return <LoadingSpinner message="Carregando dados..." />;
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white px-6 py-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {isEdit ? "Editar Prontuário" : "Novo Prontuário"}
                        </h1>
                        <p className="text-sm text-gray-500 m-0">
                            {isEdit
                                ? "Atualize as informações do prontuário médico"
                                : "Registre uma nova consulta médica"}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => setSaveModal(true)}
                            disabled={doctors.length === 0}
                        >
                            {isEdit ? "Atualizar" : "Salvar"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navegação por Seções */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="flex border-b border-gray-200">
                    {[
                        { key: "basic", label: "Informações Básicas" },
                        { key: "diagnoses", label: "Diagnósticos" },
                        { key: "prescriptions", label: "Prescrições" },
                    ].map((section) => (
                        <button
                            key={section.key}
                            onClick={() =>
                                setActiveSection(
                                    section.key as typeof activeSection
                                )
                            }
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex-1 ${
                                activeSection === section.key
                                    ? "border-blue-500 text-blue-600 bg-gray-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Seção: Informações Básicas */}
                    {activeSection === "basic" && (
                        <div className="grid gap-6">
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                {/* Seleção de Paciente */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Paciente *
                                    </label>
                                    <select
                                        value={formData.patient_id}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "patient_id",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    >
                                        <option value={0}>
                                            Selecione um paciente
                                        </option>
                                        {patients.map((patient) => (
                                            <option
                                                key={patient.id}
                                                value={patient.id}
                                            >
                                                {patient.nome_completo} -{" "}
                                                {patient.cpf
                                                    ? formatCPF(patient.cpf)
                                                    : "—"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Seleção de Médico */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Médico *
                                    </label>
                                    <select
                                        value={formData.user_id}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "user_id",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    >
                                        <option value={0}>
                                            {doctors.length === 0
                                                ? "Nenhum médico disponível"
                                                : "Selecione um médico"}
                                        </option>
                                        {doctors.map((doctor) => (
                                            <option
                                                key={doctor.id}
                                                value={doctor.id}
                                            >
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                    {doctors.length === 0 && (
                                        <p className="mt-1 text-xs text-red-700">
                                            Não há médicos cadastrados ou
                                            disponíveis. Cadastre um médico para
                                            prosseguir.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                {/* Data da Consulta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data da Consulta *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.data_consulta}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "data_consulta",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Horário da Consulta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Horário *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.horario_consulta}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "horario_consulta",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Tipo de Consulta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Consulta *
                                    </label>
                                    <select
                                        value={formData.tipo_consulta}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "tipo_consulta",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    >
                                        <option value="consulta">
                                            Consulta
                                        </option>
                                        <option value="retorno">Retorno</option>
                                        <option value="emergencia">
                                            Emergência
                                        </option>
                                        <option value="exame">Exame</option>
                                        <option value="cirurgia">
                                            Cirurgia
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Queixa Principal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Queixa Principal *
                                </label>
                                <textarea
                                    value={formData.queixa_principal}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "queixa_principal",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Descreva a queixa principal do paciente..."
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                                />
                            </div>

                            {/* Avaliação Médica */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Avaliação Médica
                                </label>
                                <textarea
                                    value={formData.hipotese_diagnostica}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "hipotese_diagnostica",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Descrição da avaliação médica, diagnóstico diferencial, plano de tratamento..."
                                    rows={6}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                                />
                            </div>
                        </div>
                    )}

                    {/* Seção: Diagnósticos */}
                    {activeSection === "diagnoses" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900 m-0">
                                    Diagnósticos
                                </h3>
                                <Button
                                    onClick={() => setShowDiagnosisForm(true)}
                                >
                                    + Adicionar Diagnóstico
                                </Button>
                            </div>

                            <div className="text-center py-8 text-gray-500">
                                Nenhum diagnóstico adicionado ainda.
                                <br />
                                Clique em "Adicionar Diagnóstico" para começar.
                            </div>

                            {showDiagnosisForm && (
                                <DiagnosisForm
                                    onSubmit={() => {
                                        showSuccess(
                                            "Diagnóstico adicionado com sucesso!"
                                        );
                                        setShowDiagnosisForm(false);
                                    }}
                                    onCancel={() => setShowDiagnosisForm(false)}
                                />
                            )}
                        </div>
                    )}

                    {/* Seção: Prescrições */}
                    {activeSection === "prescriptions" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900 m-0">
                                    Prescrições Médicas
                                </h3>
                                <Button
                                    onClick={() =>
                                        setShowPrescriptionForm(true)
                                    }
                                >
                                    + Adicionar Prescrição
                                </Button>
                            </div>

                            <div className="text-center py-8 text-gray-500">
                                Nenhuma prescrição adicionada ainda.
                                <br />
                                Clique em "Adicionar Prescrição" para começar.
                            </div>

                            {showPrescriptionForm && (
                                <PrescriptionForm
                                    onSubmit={() => {
                                        showSuccess(
                                            "Prescrição adicionada com sucesso!"
                                        );
                                        setShowPrescriptionForm(false);
                                    }}
                                    onCancel={() =>
                                        setShowPrescriptionForm(false)
                                    }
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Salvamento */}
            <ConfirmationModal
                isOpen={saveModal}
                title={isEdit ? "Atualizar Prontuário" : "Salvar Prontuário"}
                message={
                    isEdit
                        ? "Tem certeza que deseja atualizar este prontuário? As alterações serão salvas permanentemente."
                        : "Tem certeza que deseja salvar este prontuário? Você poderá editá-lo posteriormente se necessário."
                }
                type="info"
                confirmText={isEdit ? "Atualizar" : "Salvar"}
                cancelText="Cancelar"
                onConfirm={handleSave}
                onCancel={() => setSaveModal(false)}
                loading={saving}
            />
        </div>
    );
};

export default MedicalRecordFormPage;
