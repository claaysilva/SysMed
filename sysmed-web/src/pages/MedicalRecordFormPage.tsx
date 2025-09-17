import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../hooks/useToast";
import LoadingSpinner from "../components/LoadingSpinner";
import DiagnosisForm from "../components/DiagnosisForm";
import PrescriptionForm from "../components/PrescriptionForm";
import ConfirmationModal from "../components/ConfirmationModal";

interface MedicalRecordFormPageProps {
    recordId?: number; // undefined = nova consulta, number = edição
}

interface Patient {
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    telefone: string;
}

interface Doctor {
    id: number;
    name: string;
}

interface FormData {
    patient_id: number;
    doctor_id: number;
    consultation_date: string;
    consultation_time: string;
    consultation_type: "consulta" | "retorno" | "urgencia";
    chief_complaint: string;
    assessment: string;
}

const MedicalRecordFormPage: React.FC<MedicalRecordFormPageProps> = ({
    recordId,
}) => {
    const [formData, setFormData] = useState<FormData>({
        patient_id: 0,
        doctor_id: 0,
        consultation_date: new Date().toISOString().split("T")[0],
        consultation_time: new Date().toTimeString().slice(0, 5),
        consultation_type: "consulta",
        chief_complaint: "",
        assessment: "",
    });

    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<
        "basic" | "diagnoses" | "prescriptions"
    >("basic");

    const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [saveModal, setSaveModal] = useState(false);

    const { showSuccess, showError, showInfo } = useToast();

    const isEdit = recordId !== undefined;

    useEffect(() => {
        loadInitialData();
    }, [recordId]);

    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);

            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Carregar pacientes e médicos (mockados)
            const mockPatients: Patient[] = [
                {
                    id: 1,
                    nome_completo: "Maria Silva Santos",
                    cpf: "123.456.789-00",
                    data_nascimento: "1980-05-15",
                    telefone: "(11) 99999-9999",
                },
                {
                    id: 2,
                    nome_completo: "Pedro Oliveira Costa",
                    cpf: "987.654.321-00",
                    data_nascimento: "1975-08-22",
                    telefone: "(11) 88888-8888",
                },
                {
                    id: 3,
                    nome_completo: "Carlos Eduardo Mendes",
                    cpf: "555.666.777-88",
                    data_nascimento: "1990-12-10",
                    telefone: "(11) 77777-7777",
                },
            ];

            const mockDoctors: Doctor[] = [
                { id: 1, name: "Dr. João Carvalho" },
                { id: 2, name: "Dra. Ana Paula Silva" },
                { id: 3, name: "Dr. Roberto Fernandes" },
            ];

            setPatients(mockPatients);
            setDoctors(mockDoctors);

            // Se for edição, carregar dados do prontuário
            if (isEdit) {
                const mockRecord = {
                    patient_id: 1,
                    doctor_id: 1,
                    consultation_date: "2025-09-17",
                    consultation_time: "14:30",
                    consultation_type: "consulta" as const,
                    chief_complaint:
                        "Dor nas costas há 3 dias, irradiando para a perna direita. Piora com movimentos e melhora com repouso.",
                    assessment:
                        "Provável distensão muscular lombar com comprometimento do nervo ciático. Paciente apresenta limitação funcional moderada. Recomenda-se repouso relativo, fisioterapia e acompanhamento.",
                };

                setFormData(mockRecord);
            } else {
                // Para nova consulta, definir médico padrão (primeiro da lista)
                setFormData((prev) => ({
                    ...prev,
                    doctor_id: mockDoctors[0]?.id || 0,
                }));
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showError("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, [isEdit, showError]);

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

        if (!formData.doctor_id) {
            showError("Selecione um médico");
            return false;
        }

        if (!formData.consultation_date) {
            showError("Informe a data da consulta");
            return false;
        }

        if (!formData.consultation_time) {
            showError("Informe o horário da consulta");
            return false;
        }

        if (!formData.chief_complaint.trim()) {
            showError("Informe a queixa principal");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setSaveModal(false);
            showSuccess(
                isEdit
                    ? "Prontuário atualizado com sucesso!"
                    : "Prontuário criado com sucesso!"
            );

            // Navegar de volta para a lista ou detalhes
            showInfo("Redirecionando...");
        } catch (error) {
            console.error("Erro ao salvar prontuário:", error);
            showError("Erro ao salvar prontuário");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        showInfo("Redirecionando para lista de prontuários...");
        // Navegar de volta
    };

    if (loading) {
        return <LoadingSpinner message="Carregando dados..." />;
    }

    return (
        <div
            style={{
                padding: "2rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    marginBottom: "1.5rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#111827",
                                margin: "0 0 0.5rem 0",
                            }}
                        >
                            {isEdit ? "Editar Prontuário" : "Novo Prontuário"}
                        </h1>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                margin: 0,
                            }}
                        >
                            {isEdit
                                ? "Atualize as informações do prontuário médico"
                                : "Registre uma nova consulta médica"}
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => setSaveModal(true)}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            {isEdit ? "Atualizar" : "Salvar"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navegação por Seções */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    marginBottom: "1.5rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #e5e7eb",
                    }}
                >
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
                            style={{
                                padding: "1rem 1.5rem",
                                backgroundColor:
                                    activeSection === section.key
                                        ? "#f9fafb"
                                        : "transparent",
                                color:
                                    activeSection === section.key
                                        ? "#3b82f6"
                                        : "#6b7280",
                                border: "none",
                                borderBottom:
                                    activeSection === section.key
                                        ? "2px solid #3b82f6"
                                        : "2px solid transparent",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                flex: 1,
                            }}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: "1.5rem" }}>
                    {/* Seção: Informações Básicas */}
                    {activeSection === "basic" && (
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(300px, 1fr))",
                                    gap: "1rem",
                                }}
                            >
                                {/* Seleção de Paciente */}
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
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
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                            backgroundColor: "white",
                                        }}
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
                                                {patient.cpf}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Seleção de Médico */}
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Médico *
                                    </label>
                                    <select
                                        value={formData.doctor_id}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "doctor_id",
                                                Number(e.target.value)
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <option value={0}>
                                            Selecione um médico
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
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "1rem",
                                }}
                            >
                                {/* Data da Consulta */}
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Data da Consulta *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.consultation_date}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "consultation_date",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                        }}
                                    />
                                </div>

                                {/* Horário da Consulta */}
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Horário *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.consultation_time}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "consultation_time",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                        }}
                                    />
                                </div>

                                {/* Tipo de Consulta */}
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Tipo de Consulta *
                                    </label>
                                    <select
                                        value={formData.consultation_type}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "consultation_type",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <option value="consulta">
                                            Consulta
                                        </option>
                                        <option value="retorno">Retorno</option>
                                        <option value="urgencia">
                                            Urgência
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Queixa Principal */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#374151",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Queixa Principal *
                                </label>
                                <textarea
                                    value={formData.chief_complaint}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "chief_complaint",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Descreva a queixa principal do paciente..."
                                    rows={4}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                        resize: "vertical",
                                        fontFamily: "inherit",
                                    }}
                                />
                            </div>

                            {/* Avaliação Médica */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#374151",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Avaliação Médica
                                </label>
                                <textarea
                                    value={formData.assessment}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "assessment",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Descrição da avaliação médica, diagnóstico diferencial, plano de tratamento..."
                                    rows={6}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                        resize: "vertical",
                                        fontFamily: "inherit",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Seção: Diagnósticos */}
                    {activeSection === "diagnoses" && (
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "1rem",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        color: "#111827",
                                        margin: 0,
                                    }}
                                >
                                    Diagnósticos
                                </h3>
                                <button
                                    onClick={() => setShowDiagnosisForm(true)}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "0.875rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    + Adicionar Diagnóstico
                                </button>
                            </div>

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "2rem",
                                    color: "#6b7280",
                                }}
                            >
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "1rem",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        color: "#111827",
                                        margin: 0,
                                    }}
                                >
                                    Prescrições Médicas
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowPrescriptionForm(true)
                                    }
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "0.875rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    + Adicionar Prescrição
                                </button>
                            </div>

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "2rem",
                                    color: "#6b7280",
                                }}
                            >
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
