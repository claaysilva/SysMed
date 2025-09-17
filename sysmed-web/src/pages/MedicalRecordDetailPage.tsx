import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../hooks/useToast";
import { type MedicalRecord } from "../components/MedicalRecordCard";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";

interface MedicalRecordDetailPageProps {
    recordId?: number;
}

interface Diagnosis {
    id: number;
    code: string;
    description: string;
    type: "primary" | "secondary";
    created_at: string;
}

interface Prescription {
    id: number;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    created_at: string;
}

interface Attachment {
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    description?: string;
    created_at: string;
}

const MedicalRecordDetailPage: React.FC<MedicalRecordDetailPageProps> = ({
    recordId = 1,
}) => {
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
        null
    );
    const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<
        "overview" | "diagnoses" | "prescriptions" | "attachments"
    >("overview");

    const [signModal, setSignModal] = useState(false);
    const [signing, setSigning] = useState(false);

    const { showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        loadMedicalRecord();
    }, [recordId]);

    const loadMedicalRecord = useCallback(async () => {
        try {
            setLoading(true);

            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Dados mockados para demonstração
            const mockRecord: MedicalRecord = {
                id: recordId,
                patient: {
                    id: 1,
                    nome_completo: "Maria Silva Santos",
                    cpf: "123.456.789-00",
                },
                doctor: {
                    id: 1,
                    name: "Dr. João Carvalho",
                },
                consultation_date: "2025-09-17",
                consultation_time: "14:30",
                consultation_type: "consulta",
                status: "completed",
                chief_complaint:
                    "Dor nas costas há 3 dias, irradiando para a perna direita. Piora com movimentos e melhora com repouso.",
                assessment:
                    "Provável distensão muscular lombar com comprometimento do nervo ciático. Paciente apresenta limitação funcional moderada. Recomenda-se repouso relativo, fisioterapia e acompanhamento.",
                diagnoses_count: 2,
                prescriptions_count: 3,
                attachments_count: 1,
                created_at: "2025-09-17T14:30:00Z",
                updated_at: "2025-09-17T15:45:00Z",
            };

            const mockDiagnoses: Diagnosis[] = [
                {
                    id: 1,
                    code: "M54.5",
                    description: "Dor lombar baixa",
                    type: "primary",
                    created_at: "2025-09-17T14:45:00Z",
                },
                {
                    id: 2,
                    code: "M54.4",
                    description: "Lumbago com ciática",
                    type: "secondary",
                    created_at: "2025-09-17T14:46:00Z",
                },
            ];

            const mockPrescriptions: Prescription[] = [
                {
                    id: 1,
                    medication_name: "Ibuprofeno 600mg",
                    dosage: "600mg",
                    frequency: "8/8 horas",
                    duration: "7 dias",
                    instructions: "Tomar após as refeições",
                    created_at: "2025-09-17T14:50:00Z",
                },
                {
                    id: 2,
                    medication_name:
                        "Relaxante muscular (Ciclobenzaprina 10mg)",
                    dosage: "10mg",
                    frequency: "12/12 horas",
                    duration: "5 dias",
                    instructions: "Tomar à noite, pode causar sonolência",
                    created_at: "2025-09-17T14:51:00Z",
                },
                {
                    id: 3,
                    medication_name: "Pomada anti-inflamatória (Diclofenaco)",
                    dosage: "Uso tópico",
                    frequency: "3x ao dia",
                    duration: "10 dias",
                    instructions: "Aplicar na região lombar com massagem suave",
                    created_at: "2025-09-17T14:52:00Z",
                },
            ];

            const mockAttachments: Attachment[] = [
                {
                    id: 1,
                    filename: "radiografia_lombar.jpg",
                    file_type: "image/jpeg",
                    file_size: 1024000,
                    description: "Radiografia da coluna lombar",
                    created_at: "2025-09-17T14:55:00Z",
                },
            ];

            setMedicalRecord(mockRecord);
            setDiagnoses(mockDiagnoses);
            setPrescriptions(mockPrescriptions);
            setAttachments(mockAttachments);
        } catch (error) {
            console.error("Erro ao carregar prontuário:", error);
            showError("Erro ao carregar prontuário");
        } finally {
            setLoading(false);
        }
    }, [recordId, showError]);

    const handleSignRecord = async () => {
        try {
            setSigning(true);

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (medicalRecord) {
                setMedicalRecord({
                    ...medicalRecord,
                    status: "signed",
                    signed_at: new Date().toISOString(),
                });
            }

            setSignModal(false);
            showSuccess("Prontuário assinado digitalmente com sucesso!");
        } catch (error) {
            console.error("Erro ao assinar prontuário:", error);
            showError("Erro ao assinar prontuário");
        } finally {
            setSigning(false);
        }
    };

    const handleEditRecord = () => {
        showInfo("Redirecionando para edição...");
        // Navegar para página de edição
    };

    const handlePrintRecord = () => {
        showInfo("Preparando impressão...");
        // Implementar impressão
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString("pt-BR");
    };

    if (loading) {
        return <LoadingSpinner message="Carregando prontuário..." />;
    }

    if (!medicalRecord) {
        return (
            <div
                style={{
                    padding: "2rem",
                    backgroundColor: "#f8fafc",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        backgroundColor: "white",
                        padding: "3rem",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                        ❌
                    </div>
                    <h3
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#374151",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        Prontuário não encontrado
                    </h3>
                    <p style={{ color: "#6b7280", margin: 0 }}>
                        O prontuário solicitado não foi encontrado ou você não
                        tem permissão para acessá-lo.
                    </p>
                </div>
            </div>
        );
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
                        alignItems: "flex-start",
                        marginBottom: "1rem",
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
                            Prontuário - {medicalRecord.patient.nome_completo}
                        </h1>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    color: "#6b7280",
                                    fontSize: "0.875rem",
                                }}
                            >
                                CPF: {medicalRecord.patient.cpf}
                            </span>
                            <span
                                style={{
                                    color: "#6b7280",
                                    fontSize: "0.875rem",
                                }}
                            >
                                Médico: {medicalRecord.doctor.name}
                            </span>
                            <span
                                style={{
                                    color: "#6b7280",
                                    fontSize: "0.875rem",
                                }}
                            >
                                Data:{" "}
                                {new Date(
                                    medicalRecord.consultation_date
                                ).toLocaleDateString("pt-BR")}{" "}
                                às {medicalRecord.consultation_time}
                            </span>
                            <StatusBadge status={medicalRecord.status}>
                                {medicalRecord.status === "draft"
                                    ? "Rascunho"
                                    : medicalRecord.status === "completed"
                                    ? "Concluído"
                                    : "Assinado"}
                            </StatusBadge>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {medicalRecord.status !== "signed" && (
                            <>
                                <button
                                    onClick={handleEditRecord}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#f3f4f6",
                                        color: "#374151",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "6px",
                                        fontSize: "0.875rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => setSignModal(true)}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "0.875rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    Assinar
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePrintRecord}
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
                            Imprimir
                        </button>
                    </div>
                </div>

                {medicalRecord.signed_at && (
                    <div
                        style={{
                            padding: "0.75rem",
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            color: "#166534",
                        }}
                    >
                        ✅ Prontuário assinado digitalmente em{" "}
                        {formatDateTime(medicalRecord.signed_at)}
                    </div>
                )}
            </div>

            {/* Navegação por Abas */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #e5e7eb",
                    }}
                >
                    {[
                        { key: "overview", label: "Visão Geral" },
                        {
                            key: "diagnoses",
                            label: `Diagnósticos (${diagnoses.length})`,
                        },
                        {
                            key: "prescriptions",
                            label: `Prescrições (${prescriptions.length})`,
                        },
                        {
                            key: "attachments",
                            label: `Anexos (${attachments.length})`,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() =>
                                setActiveTab(tab.key as typeof activeTab)
                            }
                            style={{
                                padding: "1rem 1.5rem",
                                backgroundColor:
                                    activeTab === tab.key
                                        ? "#f9fafb"
                                        : "transparent",
                                color:
                                    activeTab === tab.key
                                        ? "#3b82f6"
                                        : "#6b7280",
                                border: "none",
                                borderBottom:
                                    activeTab === tab.key
                                        ? "2px solid #3b82f6"
                                        : "2px solid transparent",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: "1.5rem" }}>
                    {/* Aba Visão Geral */}
                    {activeTab === "overview" && (
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        color: "#111827",
                                        margin: "0 0 0.5rem 0",
                                    }}
                                >
                                    Queixa Principal
                                </h3>
                                <p
                                    style={{
                                        color: "#374151",
                                        lineHeight: "1.6",
                                        margin: 0,
                                    }}
                                >
                                    {medicalRecord.chief_complaint}
                                </p>
                            </div>

                            <div>
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        color: "#111827",
                                        margin: "0 0 0.5rem 0",
                                    }}
                                >
                                    Avaliação Médica
                                </h3>
                                <p
                                    style={{
                                        color: "#374151",
                                        lineHeight: "1.6",
                                        margin: 0,
                                    }}
                                >
                                    {medicalRecord.assessment ||
                                        "Nenhuma avaliação registrada ainda."}
                                </p>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "1rem",
                                    padding: "1rem",
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "8px",
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "1.5rem",
                                            fontWeight: "700",
                                            color: "#dc2626",
                                        }}
                                    >
                                        {diagnoses.length}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#6b7280",
                                        }}
                                    >
                                        Diagnósticos
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "1.5rem",
                                            fontWeight: "700",
                                            color: "#2563eb",
                                        }}
                                    >
                                        {prescriptions.length}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#6b7280",
                                        }}
                                    >
                                        Prescrições
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "1.5rem",
                                            fontWeight: "700",
                                            color: "#7c3aed",
                                        }}
                                    >
                                        {attachments.length}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#6b7280",
                                        }}
                                    >
                                        Anexos
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        color: "#111827",
                                        margin: "0 0 0.5rem 0",
                                    }}
                                >
                                    Informações da Consulta
                                </h3>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(250px, 1fr))",
                                        gap: "1rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "0.75rem",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            TIPO DE CONSULTA
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#111827",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {medicalRecord.consultation_type}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "0.75rem",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            CRIADO EM
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#111827",
                                            }}
                                        >
                                            {formatDateTime(
                                                medicalRecord.created_at
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "0.75rem",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            ÚLTIMA ATUALIZAÇÃO
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#111827",
                                            }}
                                        >
                                            {formatDateTime(
                                                medicalRecord.updated_at
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Aba Diagnósticos */}
                    {activeTab === "diagnoses" && (
                        <div>
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    color: "#111827",
                                    margin: "0 0 1rem 0",
                                }}
                            >
                                Diagnósticos
                            </h3>
                            {diagnoses.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    Nenhum diagnóstico registrado neste
                                    prontuário.
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: "1rem" }}>
                                    {diagnoses.map((diagnosis) => (
                                        <div
                                            key={diagnosis.id}
                                            style={{
                                                padding: "1rem",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "8px",
                                                backgroundColor: "#f9fafb",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "0.875rem",
                                                            fontWeight: "600",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        {diagnosis.code} -{" "}
                                                        {diagnosis.description}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "#6b7280",
                                                            marginTop:
                                                                "0.25rem",
                                                        }}
                                                    >
                                                        Adicionado em{" "}
                                                        {formatDateTime(
                                                            diagnosis.created_at
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "500",
                                                        borderRadius: "4px",
                                                        backgroundColor:
                                                            diagnosis.type ===
                                                            "primary"
                                                                ? "#dbeafe"
                                                                : "#f3e8ff",
                                                        color:
                                                            diagnosis.type ===
                                                            "primary"
                                                                ? "#1e40af"
                                                                : "#7c3aed",
                                                    }}
                                                >
                                                    {diagnosis.type ===
                                                    "primary"
                                                        ? "Primário"
                                                        : "Secundário"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aba Prescrições */}
                    {activeTab === "prescriptions" && (
                        <div>
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    color: "#111827",
                                    margin: "0 0 1rem 0",
                                }}
                            >
                                Prescrições Médicas
                            </h3>
                            {prescriptions.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    Nenhuma prescrição registrada neste
                                    prontuário.
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: "1rem" }}>
                                    {prescriptions.map((prescription) => (
                                        <div
                                            key={prescription.id}
                                            style={{
                                                padding: "1rem",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "8px",
                                                backgroundColor: "#f9fafb",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginBottom: "0.75rem",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: "600",
                                                        color: "#111827",
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
                                                    {
                                                        prescription.medication_name
                                                    }
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    Prescrito em{" "}
                                                    {formatDateTime(
                                                        prescription.created_at
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(150px, 1fr))",
                                                    gap: "0.5rem",
                                                    marginBottom: "0.75rem",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#6b7280",
                                                            marginBottom:
                                                                "0.125rem",
                                                        }}
                                                    >
                                                        DOSAGEM
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            fontWeight: "500",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        {prescription.dosage}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#6b7280",
                                                            marginBottom:
                                                                "0.125rem",
                                                        }}
                                                    >
                                                        FREQUÊNCIA
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            fontWeight: "500",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        {prescription.frequency}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#6b7280",
                                                            marginBottom:
                                                                "0.125rem",
                                                        }}
                                                    >
                                                        DURAÇÃO
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            fontWeight: "500",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        {prescription.duration}
                                                    </div>
                                                </div>
                                            </div>

                                            {prescription.instructions && (
                                                <div
                                                    style={{
                                                        padding: "0.5rem",
                                                        backgroundColor:
                                                            "#fffbeb",
                                                        border: "1px solid #fed7aa",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#92400e",
                                                            marginBottom:
                                                                "0.125rem",
                                                        }}
                                                    >
                                                        INSTRUÇÕES
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "#92400e",
                                                        }}
                                                    >
                                                        {
                                                            prescription.instructions
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aba Anexos */}
                    {activeTab === "attachments" && (
                        <div>
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    color: "#111827",
                                    margin: "0 0 1rem 0",
                                }}
                            >
                                Anexos
                            </h3>
                            {attachments.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    Nenhum anexo neste prontuário.
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: "1rem" }}>
                                    {attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            style={{
                                                padding: "1rem",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "8px",
                                                backgroundColor: "#f9fafb",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: "600",
                                                        color: "#111827",
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
                                                    {attachment.filename}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#6b7280",
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
                                                    {attachment.description}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    {formatFileSize(
                                                        attachment.file_size
                                                    )}{" "}
                                                    •{" "}
                                                    {formatDateTime(
                                                        attachment.created_at
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    showInfo(
                                                        `Baixando ${attachment.filename}...`
                                                    )
                                                }
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    backgroundColor: "#3b82f6",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    fontSize: "0.75rem",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Baixar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Assinatura */}
            <ConfirmationModal
                isOpen={signModal}
                title="Assinar Prontuário"
                message="Ao assinar este prontuário, você confirma que todas as informações estão corretas e completas. Esta ação não pode ser desfeita."
                type="info"
                confirmText="Assinar Digitalmente"
                cancelText="Cancelar"
                onConfirm={handleSignRecord}
                onCancel={() => setSignModal(false)}
                loading={signing}
            />
        </div>
    );
};

export default MedicalRecordDetailPage;
