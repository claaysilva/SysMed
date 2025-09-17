import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../hooks/useToast";
import ReportCard, { type Report } from "../components/ReportCard";
import ReportForm from "../components/ReportForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmationModal from "../components/ConfirmationModal";

interface ReportTemplate {
    id: number;
    name: string;
    type: "medical" | "financial" | "statistical";
    category: string;
    description?: string;
    fields: string[];
    default_filters?: Record<string, string | number | boolean>;
}

interface ReportStats {
    total_reports: number;
    completed_reports: number;
    generating_reports: number;
    failed_reports: number;
    reports_this_month: number;
    storage_used: number;
}

interface ReportFormData {
    template_id: number;
    title: string;
    format: string;
    filters: Record<string, string | number | boolean>;
}

const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showReportForm, setShowReportForm] = useState(false);
    const [creatingReport, setCreatingReport] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        report: Report | null;
    }>({
        isOpen: false,
        report: null,
    });
    const [deleting, setDeleting] = useState(false);

    const { showSuccess, showError, showInfo } = useToast();

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);

            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Dados mockados para demonstração
            const mockReports: Report[] = [
                {
                    id: 1,
                    title: "Relatório de Consultas - Setembro 2025",
                    type: "medical",
                    category: "appointments",
                    description: "Relatório detalhado de todas as consultas realizadas em setembro",
                    status: "completed",
                    format: "pdf",
                    file_path: "reports/1_consultas_setembro.pdf",
                    file_size: 1024000,
                    file_size_formatted: "1 MB",
                    generated_at: "2025-09-17T15:30:00Z",
                    expires_at: "2025-10-17T15:30:00Z",
                    user: { id: 1, name: "Dr. João Silva" },
                    template: { id: 1, name: "Relatório de Consultas por Período" },
                    created_at: "2025-09-17T15:25:00Z",
                    updated_at: "2025-09-17T15:30:00Z",
                    is_downloadable: true,
                    is_expired: false,
                },
                {
                    id: 2,
                    title: "Estatísticas de Diagnósticos - Q3 2025",
                    type: "statistical",
                    category: "diagnoses",
                    description: "Análise estatística dos diagnósticos mais frequentes no terceiro trimestre",
                    status: "generating",
                    format: "excel",
                    user: { id: 1, name: "Dr. João Silva" },
                    template: { id: 3, name: "Estatísticas de Diagnósticos" },
                    created_at: "2025-09-17T16:00:00Z",
                    updated_at: "2025-09-17T16:00:00Z",
                },
                {
                    id: 3,
                    title: "Relatório Financeiro - Agosto 2025",
                    type: "financial",
                    category: "revenue",
                    description: "Análise financeira completa do mês de agosto",
                    status: "failed",
                    format: "pdf",
                    user: { id: 1, name: "Dr. João Silva" },
                    template: { id: 2, name: "Relatório Financeiro Mensal" },
                    created_at: "2025-09-16T10:00:00Z",
                    updated_at: "2025-09-16T10:05:00Z",
                },
                {
                    id: 4,
                    title: "Lista de Pacientes Ativos",
                    type: "medical",
                    category: "patients",
                    status: "completed",
                    format: "csv",
                    file_path: "reports/4_pacientes_ativos.csv",
                    file_size: 512000,
                    file_size_formatted: "512 KB",
                    generated_at: "2025-09-15T14:20:00Z",
                    expires_at: "2025-10-15T14:20:00Z",
                    user: { id: 1, name: "Dr. João Silva" },
                    template: { id: 4, name: "Relatório de Pacientes" },
                    created_at: "2025-09-15T14:15:00Z",
                    updated_at: "2025-09-15T14:20:00Z",
                    is_downloadable: true,
                    is_expired: false,
                },
            ];

            // Aplicar filtros
            let filteredReports = mockReports;

            if (searchTerm) {
                filteredReports = filteredReports.filter(report =>
                    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (typeFilter) {
                filteredReports = filteredReports.filter(report => report.type === typeFilter);
            }

            if (statusFilter) {
                filteredReports = filteredReports.filter(report => report.status === statusFilter);
            }

            setReports(filteredReports);
            setTotalPages(Math.ceil(filteredReports.length / 10));
        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
            showError("Erro ao carregar relatórios");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, typeFilter, statusFilter, showError]);

    const loadTemplates = useCallback(async () => {
        try {
            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 300));

            const mockTemplates: ReportTemplate[] = [
                {
                    id: 1,
                    name: "Relatório de Consultas por Período",
                    type: "medical",
                    category: "appointments",
                    description: "Relatório detalhado de todas as consultas realizadas em um período específico",
                    fields: ["patient_name", "doctor_name", "consultation_date", "consultation_type"],
                    default_filters: { date_from: "", date_to: "" },
                },
                {
                    id: 2,
                    name: "Relatório Financeiro Mensal",
                    type: "financial",
                    category: "revenue",
                    description: "Análise financeira mensal com receitas, despesas e resultados",
                    fields: ["month", "total_revenue", "total_expenses", "net_profit"],
                    default_filters: { month: "", year: "" },
                },
                {
                    id: 3,
                    name: "Estatísticas de Diagnósticos",
                    type: "statistical",
                    category: "diagnoses",
                    description: "Análise estatística dos diagnósticos mais frequentes",
                    fields: ["diagnosis_code", "diagnosis_description", "frequency", "percentage"],
                    default_filters: { date_from: "", date_to: "" },
                },
                {
                    id: 4,
                    name: "Relatório de Pacientes",
                    type: "medical",
                    category: "patients",
                    description: "Lista detalhada de pacientes com histórico de consultas",
                    fields: ["patient_name", "cpf", "birth_date", "last_consultation"],
                    default_filters: { active_only: true },
                },
            ];

            setTemplates(mockTemplates);
        } catch (error) {
            console.error("Erro ao carregar templates:", error);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 400));

            const mockStats: ReportStats = {
                total_reports: 12,
                completed_reports: 8,
                generating_reports: 2,
                failed_reports: 2,
                reports_this_month: 6,
                storage_used: 15728640, // 15 MB
            };

            setStats(mockStats);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        }
    }, []);

    const loadInitialData = useCallback(async () => {
        try {
            await Promise.all([
                loadTemplates(),
                loadStats(),
                loadReports(),
            ]);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showError("Erro ao carregar dados dos relatórios");
        }
    }, [loadTemplates, loadStats, loadReports, showError]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        if (searchTerm || typeFilter || statusFilter) {
            loadReports();
        }
    }, [searchTerm, typeFilter, statusFilter, loadReports]);

    const handleCreateReport = async (data: ReportFormData) => {
        try {
            setCreatingReport(true);

            console.log("Criando relatório:", data);

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            showSuccess("Relatório iniciado com sucesso! Você será notificado quando estiver pronto.");
            setShowReportForm(false);
            
            // Recarregar relatórios
            await loadReports();
            await loadStats();
        } catch (error) {
            console.error("Erro ao criar relatório:", error);
            showError("Erro ao criar relatório");
        } finally {
            setCreatingReport(false);
        }
    };

    const handleDownloadReport = (report: Report) => {
        showInfo(`Baixando ${report.title}...`);
        // Implementar download real
    };

    const handleViewReport = (report: Report) => {
        showInfo(`Visualizando detalhes de ${report.title}`);
        // Navegar para página de detalhes
    };

    const handleDeleteReport = (report: Report) => {
        setDeleteModal({
            isOpen: true,
            report: report,
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.report) return;

        try {
            setDeleting(true);

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            setReports(prev => prev.filter(r => r.id !== deleteModal.report!.id));
            setDeleteModal({ isOpen: false, report: null });
            showSuccess("Relatório excluído com sucesso!");
            
            // Recarregar estatísticas
            await loadStats();
        } catch (error) {
            console.error("Erro ao excluir relatório:", error);
            showError("Erro ao excluir relatório");
        } finally {
            setDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setStatusFilter("");
        setCurrentPage(1);
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div
            style={{
                padding: "2rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1
                    style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "#111827",
                        margin: "0 0 0.5rem 0",
                    }}
                >
                    Sistema de Relatórios
                </h1>
                <p
                    style={{
                        fontSize: "1rem",
                        color: "#6b7280",
                        margin: 0,
                    }}
                >
                    Gere relatórios médicos, financeiros e estatísticos personalizados
                </p>
            </div>

            {/* Statistics */}
            {stats && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#3b82f6",
                            }}
                        >
                            {stats.total_reports}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Total de Relatórios
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#10b981",
                            }}
                        >
                            {stats.completed_reports}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Concluídos
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#f59e0b",
                            }}
                        >
                            {stats.generating_reports}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Em Processo
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#8b5cf6",
                            }}
                        >
                            {formatBytes(stats.storage_used)}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Armazenamento
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Actions */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    marginBottom: "1.5rem",
                }}
            >
                {/* Search and New Button */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <div style={{ flex: 1, marginRight: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Buscar relatórios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                outline: "none",
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setShowReportForm(true)}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <span>+</span>
                        Novo Relatório
                    </button>
                </div>

                {/* Filters */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                        }}
                    >
                        <option value="">Todos os tipos</option>
                        <option value="medical">Médico</option>
                        <option value="financial">Financeiro</option>
                        <option value="statistical">Estatístico</option>
                        <option value="custom">Personalizado</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                        }}
                    >
                        <option value="">Todos os status</option>
                        <option value="completed">Concluído</option>
                        <option value="generating">Gerando</option>
                        <option value="failed">Falhou</option>
                        <option value="scheduled">Agendado</option>
                    </select>

                    <button
                        onClick={clearFilters}
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
                        Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Report Form Modal */}
            {showReportForm && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        backdropFilter: "blur(4px)",
                        padding: "1rem",
                    }}
                    onClick={() => !creatingReport && setShowReportForm(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            maxWidth: "800px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflow: "auto",
                            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ReportForm
                            templates={templates}
                            onSubmit={handleCreateReport}
                            onCancel={() => !creatingReport && setShowReportForm(false)}
                            loading={creatingReport}
                        />
                    </div>
                </div>
            )}

            {/* Reports List */}
            {loading ? (
                <LoadingSpinner message="Carregando relatórios..." />
            ) : reports.length === 0 ? (
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
                        📊
                    </div>
                    <h3
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#374151",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        Nenhum relatório encontrado
                    </h3>
                    <p style={{ color: "#6b7280", margin: 0 }}>
                        {searchTerm || typeFilter || statusFilter
                            ? "Tente ajustar os filtros de busca"
                            : "Comece criando seu primeiro relatório"}
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            onDownload={handleDownloadReport}
                            onDelete={handleDeleteReport}
                            onView={handleViewReport}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "1rem",
                        marginTop: "2rem",
                    }}
                >
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1,
                        }}
                    >
                        Anterior
                    </button>

                    <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            opacity: currentPage === totalPages ? 0.5 : 1,
                        }}
                    >
                        Próxima
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Excluir Relatório"
                message={`Tem certeza que deseja excluir o relatório "${deleteModal.report?.title}"? Esta ação não pode ser desfeita.`}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, report: null })}
                loading={deleting}
            />
        </div>
    );
};

export default ReportsPage;