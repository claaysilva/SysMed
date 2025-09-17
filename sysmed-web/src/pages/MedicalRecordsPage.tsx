import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../hooks/useToast";
import MedicalRecordCard, {
    type MedicalRecord,
} from "../components/MedicalRecordCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmationModal from "../components/ConfirmationModal";

const MedicalRecordsPage: React.FC = () => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        record: MedicalRecord | null;
    }>({
        isOpen: false,
        record: null,
    });
    const [deleting, setDeleting] = useState(false);

    const { showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        loadMedicalRecords();
    }, [
        currentPage,
        searchTerm,
        statusFilter,
        typeFilter,
        dateFromFilter,
        dateToFilter,
    ]);

    const loadMedicalRecords = useCallback(async () => {
        try {
            setLoading(true);

            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Dados mockados para demonstração
            const mockRecords: MedicalRecord[] = [
                {
                    id: 1,
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
                    chief_complaint: "Dor nas costas há 3 dias",
                    assessment: "Provável distensão muscular lombar",
                    diagnoses_count: 2,
                    prescriptions_count: 3,
                    attachments_count: 1,
                    created_at: "2025-09-17T14:30:00Z",
                    updated_at: "2025-09-17T15:45:00Z",
                },
                {
                    id: 2,
                    patient: {
                        id: 2,
                        nome_completo: "Pedro Oliveira Costa",
                        cpf: "987.654.321-00",
                    },
                    doctor: {
                        id: 2,
                        name: "Dra. Ana Paula Silva",
                    },
                    consultation_date: "2025-09-16",
                    consultation_time: "10:00",
                    consultation_type: "retorno",
                    status: "signed",
                    chief_complaint: "Retorno pós-cirúrgico",
                    assessment: "Evolução favorável, sem complicações",
                    diagnoses_count: 1,
                    prescriptions_count: 2,
                    attachments_count: 3,
                    signed_at: "2025-09-16T16:30:00Z",
                    created_at: "2025-09-16T10:00:00Z",
                    updated_at: "2025-09-16T16:30:00Z",
                },
                {
                    id: 3,
                    patient: {
                        id: 3,
                        nome_completo: "Carlos Eduardo Mendes",
                        cpf: "555.666.777-88",
                    },
                    doctor: {
                        id: 1,
                        name: "Dr. João Carvalho",
                    },
                    consultation_date: "2025-09-15",
                    consultation_time: "09:15",
                    consultation_type: "urgencia",
                    status: "draft",
                    chief_complaint: "Dor abdominal intensa",
                    assessment: "",
                    diagnoses_count: 0,
                    prescriptions_count: 0,
                    attachments_count: 0,
                    created_at: "2025-09-15T09:15:00Z",
                    updated_at: "2025-09-15T09:15:00Z",
                },
                {
                    id: 4,
                    patient: {
                        id: 4,
                        nome_completo: "Ana Paula Costa Silva",
                        cpf: "111.222.333-44",
                    },
                    doctor: {
                        id: 3,
                        name: "Dr. Roberto Fernandes",
                    },
                    consultation_date: "2025-09-14",
                    consultation_time: "16:45",
                    consultation_type: "consulta",
                    status: "completed",
                    chief_complaint: "Cefaleia recorrente",
                    assessment:
                        "Cefaleia tensional, possivelmente relacionada ao estresse",
                    diagnoses_count: 1,
                    prescriptions_count: 1,
                    attachments_count: 0,
                    created_at: "2025-09-14T16:45:00Z",
                    updated_at: "2025-09-14T17:30:00Z",
                },
                {
                    id: 5,
                    patient: {
                        id: 5,
                        nome_completo: "José Santos Lima",
                        cpf: "999.888.777-66",
                    },
                    doctor: {
                        id: 2,
                        name: "Dra. Ana Paula Silva",
                    },
                    consultation_date: "2025-09-13",
                    consultation_time: "11:30",
                    consultation_type: "consulta",
                    status: "signed",
                    chief_complaint: "Consulta de rotina - checkup",
                    assessment:
                        "Paciente sem queixas, exames dentro da normalidade",
                    diagnoses_count: 0,
                    prescriptions_count: 0,
                    attachments_count: 2,
                    signed_at: "2025-09-13T12:15:00Z",
                    created_at: "2025-09-13T11:30:00Z",
                    updated_at: "2025-09-13T12:15:00Z",
                },
            ];

            // Aplicar filtros (simulação)
            let filteredRecords = mockRecords;

            if (searchTerm) {
                filteredRecords = filteredRecords.filter(
                    (record) =>
                        record.patient.nome_completo
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        record.chief_complaint
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        record.assessment
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                );
            }

            if (statusFilter) {
                filteredRecords = filteredRecords.filter(
                    (record) => record.status === statusFilter
                );
            }

            if (typeFilter) {
                filteredRecords = filteredRecords.filter(
                    (record) => record.consultation_type === typeFilter
                );
            }

            setMedicalRecords(filteredRecords);
            setTotalRecords(filteredRecords.length);
            setTotalPages(Math.ceil(filteredRecords.length / 10));
        } catch (error) {
            console.error("Erro ao carregar prontuários:", error);
            showError("Erro ao carregar prontuários");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, typeFilter, showError]);

    const handleRecordClick = (record: MedicalRecord) => {
        showInfo(`Visualizando prontuário de ${record.patient.nome_completo}`);
        // Navegar para página de detalhes
    };

    const handleEditRecord = (record: MedicalRecord) => {
        showInfo(`Editando prontuário de ${record.patient.nome_completo}`);
        // Navegar para página de edição
    };

    const handleDeleteRecord = (record: MedicalRecord) => {
        setDeleteModal({
            isOpen: true,
            record: record,
        });
    };

    const handleSignRecord = async (record: MedicalRecord) => {
        try {
            showInfo("Assinando prontuário...");

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Atualizar status do prontuário
            setMedicalRecords((prev) =>
                prev.map((r) =>
                    r.id === record.id
                        ? {
                              ...r,
                              status: "signed" as const,
                              signed_at: new Date().toISOString(),
                          }
                        : r
                )
            );

            showSuccess(
                `Prontuário de ${record.patient.nome_completo} assinado com sucesso!`
            );
        } catch (error) {
            console.error("Erro ao assinar prontuário:", error);
            showError("Erro ao assinar prontuário");
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.record) return;

        try {
            setDeleting(true);

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Remover prontuário da lista
            setMedicalRecords((prev) =>
                prev.filter((r) => r.id !== deleteModal.record!.id)
            );

            setDeleteModal({ isOpen: false, record: null });
            showSuccess("Prontuário excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir prontuário:", error);
            showError("Erro ao excluir prontuário");
        } finally {
            setDeleting(false);
        }
    };

    const handleNewRecord = () => {
        showInfo("Redirecionando para novo prontuário...");
        // Navegar para página de criação
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setTypeFilter("");
        setDateFromFilter("");
        setDateToFilter("");
        setCurrentPage(1);
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
                    Prontuários Médicos
                </h1>
                <p
                    style={{
                        fontSize: "1rem",
                        color: "#6b7280",
                        margin: 0,
                    }}
                >
                    Gerencie todos os prontuários médicos da clínica
                </p>
            </div>

            {/* Filtros e Ações */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    marginBottom: "1.5rem",
                }}
            >
                {/* Barra de busca e botão novo */}
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
                            placeholder="Buscar por paciente, queixa ou avaliação..."
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
                        onClick={handleNewRecord}
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
                        Novo Prontuário
                    </button>
                </div>

                {/* Filtros */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                    }}
                >
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
                        <option value="draft">Rascunho</option>
                        <option value="completed">Concluído</option>
                        <option value="signed">Assinado</option>
                    </select>

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
                        <option value="consulta">Consulta</option>
                        <option value="retorno">Retorno</option>
                        <option value="urgencia">Urgência</option>
                    </select>

                    <input
                        type="date"
                        value={dateFromFilter}
                        onChange={(e) => setDateFromFilter(e.target.value)}
                        placeholder="Data início"
                        style={{
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                        }}
                    />

                    <input
                        type="date"
                        value={dateToFilter}
                        onChange={(e) => setDateToFilter(e.target.value)}
                        placeholder="Data fim"
                        style={{
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                        }}
                    />

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

            {/* Estatísticas */}
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
                        {totalRecords}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Total de Prontuários
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
                        {
                            medicalRecords.filter((r) => r.status === "draft")
                                .length
                        }
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Rascunhos
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
                        {
                            medicalRecords.filter((r) => r.status === "signed")
                                .length
                        }
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Assinados
                    </div>
                </div>
            </div>

            {/* Lista de Prontuários */}
            {loading ? (
                <LoadingSpinner message="Carregando prontuários..." />
            ) : medicalRecords.length === 0 ? (
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
                        📋
                    </div>
                    <h3
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#374151",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        Nenhum prontuário encontrado
                    </h3>
                    <p style={{ color: "#6b7280", margin: 0 }}>
                        {searchTerm ||
                        statusFilter ||
                        typeFilter ||
                        dateFromFilter ||
                        dateToFilter
                            ? "Tente ajustar os filtros de busca"
                            : "Comece criando o primeiro prontuário médico"}
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(400px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {medicalRecords.map((record) => (
                        <MedicalRecordCard
                            key={record.id}
                            medicalRecord={record}
                            onClick={handleRecordClick}
                            onEdit={handleEditRecord}
                            onDelete={handleDeleteRecord}
                            onSign={handleSignRecord}
                        />
                    ))}
                </div>
            )}

            {/* Paginação */}
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
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            cursor:
                                currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1,
                        }}
                    >
                        Anterior
                    </button>

                    <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                            )
                        }
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            cursor:
                                currentPage === totalPages
                                    ? "not-allowed"
                                    : "pointer",
                            opacity: currentPage === totalPages ? 0.5 : 1,
                        }}
                    >
                        Próxima
                    </button>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Excluir Prontuário"
                message={`Tem certeza que deseja excluir o prontuário de "${deleteModal.record?.patient.nome_completo}"? Esta ação não pode ser desfeita.`}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, record: null })}
                loading={deleting}
            />
        </div>
    );
};

export default MedicalRecordsPage;
