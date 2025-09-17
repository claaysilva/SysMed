import React from "react";
import Card from "./Card";
import Badge from "./Badge";
import StatusBadge from "./StatusBadge";

export interface MedicalRecord {
    id: number;
    patient: {
        id: number;
        nome_completo: string;
        cpf: string;
    };
    doctor: {
        id: number;
        name: string;
    };
    consultation_date: string;
    consultation_time: string;
    consultation_type: "consulta" | "retorno" | "urgencia";
    status: "draft" | "completed" | "signed";
    chief_complaint?: string;
    assessment?: string;
    diagnoses_count?: number;
    prescriptions_count?: number;
    attachments_count?: number;
    signed_at?: string;
    created_at: string;
    updated_at: string;
}

interface MedicalRecordCardProps {
    medicalRecord: MedicalRecord;
    onClick?: (medicalRecord: MedicalRecord) => void;
    onEdit?: (medicalRecord: MedicalRecord) => void;
    onDelete?: (medicalRecord: MedicalRecord) => void;
    onSign?: (medicalRecord: MedicalRecord) => void;
    className?: string;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
    medicalRecord,
    onClick,
    onEdit,
    onDelete,
    onSign,
    className = "",
}) => {
    const getConsultationTypeVariant = (
        type: string
    ): "info" | "success" | "error" | "gray" => {
        switch (type) {
            case "consulta":
                return "info";
            case "retorno":
                return "success";
            case "urgencia":
                return "error";
            default:
                return "gray";
        }
    };

    const getConsultationTypeLabel = (type: string) => {
        switch (type) {
            case "consulta":
                return "Consulta";
            case "retorno":
                return "Retorno";
            case "urgencia":
                return "Urgência";
            default:
                return "Outro";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "yellow";
            case "completed":
                return "blue";
            case "signed":
                return "green";
            default:
                return "gray";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "draft":
                return "Rascunho";
            case "completed":
                return "Concluído";
            case "signed":
                return "Assinado";
            default:
                return "Desconhecido";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // HH:MM
    };

    const canEdit = medicalRecord.status === "draft";
    const canSign = medicalRecord.status === "completed";
    const canDelete = medicalRecord.status === "draft";

    return (
        <div
            className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${className}`}
            onClick={() => onClick?.(medicalRecord)}
        >
            <Card>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {medicalRecord.patient.nome_completo}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            Dr(a). {medicalRecord.doctor.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>
                                📅 {formatDate(medicalRecord.consultation_date)}
                            </span>
                            <span>
                                🕐 {formatTime(medicalRecord.consultation_time)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge
                            status={medicalRecord.status}
                            variant={getStatusColor(medicalRecord.status)}
                        >
                            {getStatusLabel(medicalRecord.status)}
                        </StatusBadge>
                        <Badge
                            variant={getConsultationTypeVariant(
                                medicalRecord.consultation_type
                            )}
                        >
                            {getConsultationTypeLabel(
                                medicalRecord.consultation_type
                            )}
                        </Badge>
                    </div>
                </div>

                {/* Queixa Principal */}
                {medicalRecord.chief_complaint && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Queixa Principal:
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {medicalRecord.chief_complaint}
                        </p>
                    </div>
                )}

                {/* Avaliação */}
                {medicalRecord.assessment && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Avaliação:
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {medicalRecord.assessment}
                        </p>
                    </div>
                )}

                {/* Estatísticas */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    {(medicalRecord.diagnoses_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                            🏥 {medicalRecord.diagnoses_count} diagnóstico(s)
                        </span>
                    )}
                    {(medicalRecord.prescriptions_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                            💊 {medicalRecord.prescriptions_count}{" "}
                            prescrição(ões)
                        </span>
                    )}
                    {(medicalRecord.attachments_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                            📎 {medicalRecord.attachments_count} anexo(s)
                        </span>
                    )}
                </div>

                {/* Data de Assinatura */}
                {medicalRecord.signed_at && (
                    <div className="mb-4 text-xs text-gray-500">
                        ✅ Assinado em {formatDate(medicalRecord.signed_at)} às{" "}
                        {formatTime(medicalRecord.signed_at)}
                    </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-400">
                        Criado em {formatDate(medicalRecord.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick?.(medicalRecord);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            Ver Detalhes
                        </button>

                        {canEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(medicalRecord);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                            >
                                Editar
                            </button>
                        )}

                        {canSign && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSign?.(medicalRecord);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                            >
                                Assinar
                            </button>
                        )}

                        {canDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(medicalRecord);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                                Excluir
                            </button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MedicalRecordCard;
