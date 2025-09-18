import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Plus,
    FileText,
    Eye,
    Edit3,
    Trash2,
    Calendar,
    User,
    Clock,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Button from "../components/Button";
import Modal from "../components/Modal";

interface Patient {
    id: number;
    nome_completo: string;
    data_nascimento: string;
    cpf: string;
    telefone?: string;
}

interface Doctor {
    id: number;
    name: string;
}

interface MedicalRecord {
    id: number;
    patient: Patient;
    doctor: Doctor;
    consultation_date: string;
    consultation_time: string;
    consultation_type: "consulta" | "retorno" | "urgencia" | "exame";
    status: "rascunho" | "finalizado" | "assinado";
    chief_complaint: string;
    assessment: string;
    diagnoses_count: number;
    prescriptions_count: number;
    attachments_count: number;
    signed_at?: string;
    created_at: string;
    updated_at: string;
}

const MedicalRecordsPage: React.FC = () => {
    // Estados para dados
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState("");

    // Estados para modal de exclusão
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        record: MedicalRecord | null;
    }>({
        isOpen: false,
        record: null,
    });

    // Funções de notificação
    const showSuccess = useCallback((message: string) => {
        console.log("Success:", message);
    }, []);

    const showError = useCallback((message: string) => {
        console.error("Error:", message);
    }, []);

    const showInfo = useCallback((message: string) => {
        console.info("Info:", message);
    }, []);

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
                        data_nascimento: "1985-03-15",
                        cpf: "123.456.789-00",
                    },
                    doctor: {
                        id: 1,
                        name: "Dr. João Carvalho",
                    },
                    consultation_date: "2025-09-17",
                    consultation_time: "14:30",
                    consultation_type: "consulta",
                    status: "finalizado",
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
                        data_nascimento: "1972-11-22",
                        cpf: "987.654.321-00",
                    },
                    doctor: {
                        id: 2,
                        name: "Dra. Ana Paula Silva",
                    },
                    consultation_date: "2025-09-16",
                    consultation_time: "10:00",
                    consultation_type: "retorno",
                    status: "assinado",
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
                        data_nascimento: "1990-07-08",
                        cpf: "555.666.777-88",
                    },
                    doctor: {
                        id: 1,
                        name: "Dr. João Carvalho",
                    },
                    consultation_date: "2025-09-15",
                    consultation_time: "09:15",
                    consultation_type: "urgencia",
                    status: "rascunho",
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
                        data_nascimento: "1988-02-28",
                        cpf: "111.222.333-44",
                    },
                    doctor: {
                        id: 3,
                        name: "Dr. Roberto Fernandes",
                    },
                    consultation_date: "2025-09-14",
                    consultation_time: "16:45",
                    consultation_type: "consulta",
                    status: "finalizado",
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
                        data_nascimento: "1965-12-03",
                        cpf: "999.888.777-66",
                    },
                    doctor: {
                        id: 2,
                        name: "Dra. Ana Paula Silva",
                    },
                    consultation_date: "2025-09-13",
                    consultation_time: "11:30",
                    consultation_type: "consulta",
                    status: "assinado",
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
        } catch (error) {
            console.error("Erro ao carregar prontuários:", error);
            showError("Erro ao carregar prontuários");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, typeFilter, showError]);

    useEffect(() => {
        loadMedicalRecords();
    }, [loadMedicalRecords]);

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
                              status: "assinado" as const,
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
    };

    const getStatusColor = (status: string) => {
        const colors = {
            rascunho: "#f59e0b", // yellow-500
            finalizado: "#10b981", // emerald-500
            assinado: "#3b82f6", // blue-500
        };
        return colors[status as keyof typeof colors] || "#6b7280";
    };

    const getTypeColor = (type: string) => {
        const colors = {
            consulta: "#10b981", // emerald-500
            retorno: "#3b82f6", // blue-500
            urgencia: "#ef4444", // red-500
            exame: "#8b5cf6", // violet-500
        };
        return colors[type as keyof typeof colors] || "#6b7280";
    };

    return (
        <div className="flex-1 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Prontuários Médicos
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Gerencie os prontuários e histórico de atendimentos
                        </p>
                    </div>
                    <Button
                        onClick={handleNewRecord}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Prontuário
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Busca */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por paciente, queixa..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro Status */}
                    <div>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos os Status</option>
                            <option value="rascunho">Rascunho</option>
                            <option value="finalizado">Finalizado</option>
                            <option value="assinado">Assinado</option>
                        </select>
                    </div>

                    {/* Filtro Tipo */}
                    <div>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="consulta">Consulta</option>
                            <option value="retorno">Retorno</option>
                            <option value="urgencia">Urgência</option>
                            <option value="exame">Exame</option>
                        </select>
                    </div>

                    {/* Data De */}
                    <div>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={dateFromFilter}
                            onChange={(e) => setDateFromFilter(e.target.value)}
                        />
                    </div>

                    {/* Limpar Filtros */}
                    <div>
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="w-full"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Limpar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                            Carregando prontuários...
                        </span>
                    </div>
                ) : medicalRecords.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Nenhum prontuário encontrado
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Não há prontuários que correspondam aos filtros
                            aplicados.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paciente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Data/Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Queixa Principal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Médico
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {medicalRecords.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() =>
                                                handleRecordClick(record)
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {
                                                                record.patient
                                                                    .nome_completo
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {record.patient.cpf}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <div>
                                                            {format(
                                                                new Date(
                                                                    record.consultation_date
                                                                ),
                                                                "dd/MM/yyyy",
                                                                { locale: ptBR }
                                                            )}
                                                        </div>
                                                        <div className="text-gray-500 flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {
                                                                record.consultation_time
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                                    style={{
                                                        backgroundColor: `${getTypeColor(
                                                            record.consultation_type
                                                        )}20`,
                                                        color: getTypeColor(
                                                            record.consultation_type
                                                        ),
                                                    }}
                                                >
                                                    {record.consultation_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                                    style={{
                                                        backgroundColor: `${getStatusColor(
                                                            record.status
                                                        )}20`,
                                                        color: getStatusColor(
                                                            record.status
                                                        ),
                                                    }}
                                                >
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {record.chief_complaint ||
                                                        "Não informado"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {record.doctor.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRecordClick(
                                                                record
                                                            );
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditRecord(
                                                                record
                                                            );
                                                        }}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="Editar"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {record.status ===
                                                        "finalizado" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSignRecord(
                                                                    record
                                                                );
                                                            }}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Assinar"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteRecord(
                                                                record
                                                            );
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Exclusão */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, record: null })}
                title="Confirmar Exclusão"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Tem certeza que deseja excluir o prontuário de{" "}
                        <strong>
                            {deleteModal.record?.patient.nome_completo}
                        </strong>
                        ?
                    </p>
                    <p className="text-sm text-red-600 mb-6">
                        Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteModal({ isOpen: false, record: null })
                            }
                            disabled={deleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? "Excluindo..." : "Excluir"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MedicalRecordsPage;
