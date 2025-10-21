import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import {
    useMedicalRecords,
    type MedicalRecord,
} from "../hooks/useMedicalRecords";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCPF } from "../hooks/useFormValidation";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import Button from "../components/Button";

// Sem props; usa recordId da rota
type MedicalRecordDetailPageProps = Record<string, never>;

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

const MedicalRecordDetailPage: React.FC<MedicalRecordDetailPageProps> = () => {
    const { recordId } = useParams<{ recordId: string }>();
    const navigate = useNavigate();
    const { getMedicalRecord, updateMedicalRecord } = useMedicalRecords();
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

    const loadMedicalRecord = useCallback(async () => {
        try {
            setLoading(true);
            if (!recordId) {
                showError("ID do prontuário não informado");
                return;
            }
            const rec = await getMedicalRecord(Number(recordId));
            if (!rec) {
                showError("Prontuário não encontrado");
                return;
            }
            setMedicalRecord(rec);
            // Mantemos listas vazias enquanto não há endpoints específicos
            setDiagnoses([]);
            setPrescriptions([]);
            setAttachments([]);
        } catch (error) {
            console.error("Erro ao carregar prontuário:", error);
            showError("Erro ao carregar prontuário");
        } finally {
            setLoading(false);
        }
    }, [recordId, getMedicalRecord, showError]);

    useEffect(() => {
        loadMedicalRecord();
    }, [recordId, loadMedicalRecord]);

    const handleSignRecord = async () => {
        try {
            setSigning(true);
            if (!medicalRecord) return;
            const updated = await updateMedicalRecord(medicalRecord.id, {
                status: "assinado",
            });
            if (updated) {
                setMedicalRecord(updated);
                setSignModal(false);
                showSuccess("Prontuário assinado digitalmente com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao assinar prontuário:", error);
            showError("Erro ao assinar prontuário");
        } finally {
            setSigning(false);
        }
    };

    const handleEditRecord = () => {
        if (!medicalRecord) return;
        navigate(`/medical-records/${medicalRecord.id}/edit`);
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
            <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-5xl mb-4">❌</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        Prontuário não encontrado
                    </h3>
                    <p className="text-gray-500">
                        O prontuário solicitado não foi encontrado ou você não
                        tem permissão para acessá-lo.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white px-6 py-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            Prontuário - {medicalRecord.patient.nome_completo}
                        </h1>
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-sm text-gray-500">
                                CPF:{" "}
                                {medicalRecord.patient?.cpf
                                    ? formatCPF(medicalRecord.patient.cpf)
                                    : "—"}
                            </span>
                            <span className="text-sm text-gray-500">
                                Médico: {medicalRecord.user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                                Data:{" "}
                                {new Date(
                                    medicalRecord.data_consulta
                                ).toLocaleDateString("pt-BR")}{" "}
                                às {medicalRecord.horario_consulta}
                            </span>
                            <StatusBadge
                                status={
                                    medicalRecord.status === "assinado"
                                        ? "signed"
                                        : medicalRecord.status === "finalizado"
                                        ? "completed"
                                        : "draft"
                                }
                            >
                                {medicalRecord.status_label}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {medicalRecord.status !== "assinado" && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditRecord}
                                >
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setSignModal(true)}
                                >
                                    Assinar
                                </Button>
                            </>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handlePrintRecord}
                        >
                            Imprimir
                        </Button>
                    </div>
                </div>

                {medicalRecord.status === "assinado" && (
                    <div className="p-3 rounded-md text-sm text-emerald-800 bg-emerald-50 border border-emerald-200">
                        ✅ Prontuário assinado digitalmente
                    </div>
                )}
            </div>

            {/* Navegação por Abas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
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
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? "border-blue-500 text-blue-600 bg-gray-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Aba Visão Geral */}
                    {activeTab === "overview" && (
                        <div className="grid gap-6">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                    Queixa Principal
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {medicalRecord.queixa_principal ||
                                        "Não informado"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                    Avaliação Médica
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {medicalRecord.hipotese_diagnostica ||
                                        "Nenhuma avaliação registrada ainda."}
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {diagnoses.length}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Diagnósticos
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {prescriptions.length}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Prescrições
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {attachments.length}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Anexos
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                    Informações da Consulta
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <div className="text-[11px] tracking-wide text-gray-500 mb-1">
                                            TIPO DE CONSULTA
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 capitalize">
                                            {medicalRecord.tipo_consulta}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <div className="text-[11px] tracking-wide text-gray-500 mb-1">
                                            CRIADO EM
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDateTime(
                                                medicalRecord.created_at
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <div className="text-[11px] tracking-wide text-gray-500 mb-1">
                                            ÚLTIMA ATUALIZAÇÃO
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
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
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900 m-0">
                                    Diagnósticos
                                </h3>
                            </div>
                            {diagnoses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum diagnóstico registrado neste
                                    prontuário.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {diagnoses.map((diagnosis) => (
                                        <div
                                            key={diagnosis.id}
                                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {diagnosis.code} -{" "}
                                                        {diagnosis.description}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Adicionado em{" "}
                                                        {formatDateTime(
                                                            diagnosis.created_at
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                                                        diagnosis.type ===
                                                        "primary"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-purple-100 text-purple-800"
                                                    }`}
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
                            <h3 className="text-base font-semibold text-gray-900 mb-4">
                                Prescrições Médicas
                            </h3>
                            {prescriptions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhuma prescrição registrada neste
                                    prontuário.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {prescriptions.map((prescription) => (
                                        <div
                                            key={prescription.id}
                                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                        >
                                            <div className="mb-3">
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {
                                                        prescription.medication_name
                                                    }
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Prescrito em{" "}
                                                    {formatDateTime(
                                                        prescription.created_at
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-3 max-[520px]:grid-cols-1">
                                                <div>
                                                    <div className="text-[11px] text-gray-500 mb-0.5">
                                                        DOSAGEM
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {prescription.dosage}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-gray-500 mb-0.5">
                                                        FREQUÊNCIA
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {prescription.frequency}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-gray-500 mb-0.5">
                                                        DURAÇÃO
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {prescription.duration}
                                                    </div>
                                                </div>
                                            </div>

                                            {prescription.instructions && (
                                                <div className="p-2 rounded border border-amber-200 bg-amber-50">
                                                    <div className="text-[11px] text-amber-700 mb-0.5">
                                                        INSTRUÇÕES
                                                    </div>
                                                    <div className="text-sm text-amber-700">
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
                            <h3 className="text-base font-semibold text-gray-900 mb-4">
                                Anexos
                            </h3>
                            {attachments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum anexo neste prontuário.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {attachment.filename}
                                                </div>
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {attachment.description}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatFileSize(
                                                        attachment.file_size
                                                    )}{" "}
                                                    •{" "}
                                                    {formatDateTime(
                                                        attachment.created_at
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    showInfo(
                                                        `Baixando ${attachment.filename}...`
                                                    )
                                                }
                                            >
                                                Baixar
                                            </Button>
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
