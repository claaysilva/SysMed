import React from "react";
import Card from "./Card";
import StatusBadge from "./StatusBadge";

export interface Report {
    id: number;
    title: string;
    type: "medical" | "financial" | "statistical" | "custom";
    category: string;
    description?: string;
    status: "generating" | "completed" | "failed" | "scheduled";
    format: "pdf" | "excel" | "csv" | "html";
    file_path?: string;
    file_size?: number;
    file_size_formatted?: string;
    generated_at?: string;
    expires_at?: string;
    user: {
        id: number;
        name: string;
    };
    template?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    is_downloadable?: boolean;
    is_expired?: boolean;
}

interface ReportCardProps {
    report: Report;
    onDownload?: (report: Report) => void;
    onDelete?: (report: Report) => void;
    onView?: (report: Report) => void;
    className?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    onDownload,
    onDelete,
    onView,
    className = "",
}) => {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case "medical":
                return "Médico";
            case "financial":
                return "Financeiro";
            case "statistical":
                return "Estatístico";
            case "custom":
                return "Personalizado";
            default:
                return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "medical":
                return "text-blue-600 bg-blue-100";
            case "financial":
                return "text-green-600 bg-green-100";
            case "statistical":
                return "text-purple-600 bg-purple-100";
            case "custom":
                return "text-orange-600 bg-orange-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case "pdf":
                return "📄";
            case "excel":
                return "📊";
            case "csv":
                return "📋";
            case "html":
                return "🌐";
            default:
                return "📄";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR");
    };

    const canDownload = report.status === "completed" && report.is_downloadable;
    const canDelete = report.status !== "generating";

    return (
        <div
            className={`transition-all duration-200 hover:shadow-lg ${className}`}
        >
            <Card>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {report.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                                    report.type
                                )}`}
                            >
                                {getTypeLabel(report.type)}
                            </span>
                            <span className="text-sm text-gray-500">
                                {report.category}
                            </span>
                        </div>
                        {report.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {report.description}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge
                            status={
                                report.status === "generating"
                                    ? "pending"
                                    : report.status === "completed"
                                    ? "completed"
                                    : report.status === "failed"
                                    ? "rejected"
                                    : "pending"
                            }
                        >
                            {report.status === "generating"
                                ? "Gerando"
                                : report.status === "completed"
                                ? "Concluído"
                                : report.status === "failed"
                                ? "Falhou"
                                : "Agendado"}
                        </StatusBadge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>{getFormatIcon(report.format)}</span>
                            <span className="uppercase">{report.format}</span>
                        </div>
                    </div>
                </div>

                {/* Template Info */}
                {report.template && (
                    <div className="mb-4 text-sm text-gray-600">
                        <span className="font-medium">Template:</span>{" "}
                        {report.template.name}
                    </div>
                )}

                {/* File Info */}
                {report.status === "completed" && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <div>
                                <span className="text-green-800 font-medium">
                                    Relatório gerado com sucesso
                                </span>
                                {report.file_size_formatted && (
                                    <span className="text-green-600 ml-2">
                                        ({report.file_size_formatted})
                                    </span>
                                )}
                            </div>
                            {report.generated_at && (
                                <span className="text-green-600">
                                    {formatDate(report.generated_at)}
                                </span>
                            )}
                        </div>
                        {report.expires_at && (
                            <div className="text-xs text-green-600 mt-1">
                                Expira em: {formatDate(report.expires_at)}
                            </div>
                        )}
                    </div>
                )}

                {/* Error Info */}
                {report.status === "failed" && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-red-800 text-sm font-medium">
                            Falha na geração do relatório
                        </span>
                        <p className="text-red-600 text-xs mt-1">
                            Tente gerar novamente ou entre em contato com o
                            suporte.
                        </p>
                    </div>
                )}

                {/* Generating Info */}
                {report.status === "generating" && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            <span className="text-blue-800 text-sm font-medium">
                                Gerando relatório...
                            </span>
                        </div>
                        <p className="text-blue-600 text-xs mt-1">
                            Você será notificado quando estiver pronto.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-400">
                        Criado em {formatDate(report.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onView?.(report)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            Ver Detalhes
                        </button>

                        {canDownload && (
                            <button
                                onClick={() => onDownload?.(report)}
                                className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                            >
                                Baixar
                            </button>
                        )}

                        {canDelete && (
                            <button
                                onClick={() => onDelete?.(report)}
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

export default ReportCard;
