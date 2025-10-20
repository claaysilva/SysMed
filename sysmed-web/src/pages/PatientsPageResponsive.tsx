import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PhoneIcon,
    EnvelopeIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { apiRequest } from "../services/api";
import { useNotification } from "../components/notificationContext";
import { ConfirmDialog } from "../components/FormFeedback";

interface Patient {
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    status?: "ativo" | "inativo";
    created_at?: string;
}

const PatientsPageResponsive: React.FC = () => {
    const { showSuccess, showError } = useNotification();
    const userRole = localStorage.getItem("userRole");

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        patient: Patient | null;
    }>({ isOpen: false, patient: null });

    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    const fetchPatients = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiRequest.get<{
                success: boolean;
                data: {
                    data: Patient[];
                    total: number;
                    per_page: number;
                    current_page: number;
                    last_page: number;
                };
            }>("/patients", {
                page: currentPage,
                per_page: itemsPerPage,
                search: searchTerm,
            });

            if (response.success) {
                setPatients(response.data.data);
                setTotalPages(response.data.last_page);
            }
        } catch {
            showError("Erro", "Erro ao carregar pacientes");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, showError]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleDeletePatient = async () => {
        if (!deleteModal.patient) return;

        try {
            await apiRequest.delete(`/patients/${deleteModal.patient.id}`);

            showSuccess("Sucesso", "Paciente excluído com sucesso!");
            setDeleteModal({ isOpen: false, patient: null });
            fetchPatients(); // Recarregar lista
        } catch {
            showError("Erro", "Erro ao excluir paciente");
        }
    };

    const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }

        return age;
    };

    const formatCPF = (cpf: string): string => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatPhone = (phone: string): string => {
        const clean = phone.replace(/\D/g, "");
        if (clean.length === 11) {
            return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (clean.length === 10) {
            return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return phone;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Pacientes
                    </h1>
                    <p className="text-gray-600">
                        Gerencie os pacientes do sistema
                    </p>
                </div>
                <Link
                    to="/patients/new"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Novo Paciente
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, CPF ou telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                        Filtros
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Status</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                            <input
                                type="date"
                                placeholder="Data inicial"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                                type="date"
                                placeholder="Data final"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Pacientes - Desktop */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Paciente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contato
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Idade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cadastro
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {patients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {patient.nome_completo}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                CPF: {formatCPF(patient.cpf)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            {patient.telefone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <PhoneIcon className="h-4 w-4 mr-1" />
                                                    {formatPhone(
                                                        patient.telefone
                                                    )}
                                                </div>
                                            )}
                                            {patient.email && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                                                    {patient.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {calculateAge(patient.data_nascimento)}{" "}
                                        anos
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {patient.created_at
                                            ? new Date(
                                                  patient.created_at
                                              ).toLocaleDateString("pt-BR")
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/patients/${patient.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Visualizar"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                to={`/patients/${patient.id}/edit`}
                                                className="text-green-600 hover:text-green-900 p-1"
                                                title="Editar"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Link>
                                            {userRole === "admin" && (
                                                <button
                                                    onClick={() =>
                                                        setDeleteModal({
                                                            isOpen: true,
                                                            patient,
                                                        })
                                                    }
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Excluir"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lista de Pacientes - Mobile */}
            <div className="lg:hidden space-y-4">
                {patients.map((patient) => (
                    <div
                        key={patient.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {patient.nome_completo}
                                </h3>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">
                                            CPF:
                                        </span>{" "}
                                        {formatCPF(patient.cpf)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">
                                            Idade:
                                        </span>{" "}
                                        {calculateAge(patient.data_nascimento)}{" "}
                                        anos
                                    </div>
                                    {patient.telefone && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <PhoneIcon className="h-4 w-4 mr-2" />
                                            {formatPhone(patient.telefone)}
                                        </div>
                                    )}
                                    {patient.email && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                                            {patient.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                <Link
                                    to={`/patients/${patient.id}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Visualizar"
                                >
                                    <EyeIcon className="h-5 w-5" />
                                </Link>
                                <Link
                                    to={`/patients/${patient.id}/edit`}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Editar"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </Link>
                                {userRole === "admin" && (
                                    <button
                                        onClick={() =>
                                            setDeleteModal({
                                                isOpen: true,
                                                patient,
                                            })
                                        }
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Excluir"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado vazio */}
            {!loading && patients.length === 0 && (
                <div className="text-center py-12">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Nenhum paciente encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Comece criando um novo paciente.
                    </p>
                    <div className="mt-6">
                        <Link
                            to="/patients/new"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Novo Paciente
                        </Link>
                    </div>
                </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() =>
                                setCurrentPage(
                                    Math.min(totalPages, currentPage + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Próximo
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando{" "}
                                <span className="font-medium">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>{" "}
                                a{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        currentPage * itemsPerPage,
                                        patients.length
                                    )}
                                </span>{" "}
                                de{" "}
                                <span className="font-medium">
                                    {patients.length}
                                </span>{" "}
                                resultados
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                <button
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.max(1, currentPage - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                )}
                                <button
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(
                                                totalPages,
                                                currentPage + 1
                                            )
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    Próximo
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Excluir Paciente"
                message={`Tem certeza que deseja excluir o paciente "${deleteModal.patient?.nome_completo}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
                onConfirm={handleDeletePatient}
                onCancel={() =>
                    setDeleteModal({ isOpen: false, patient: null })
                }
            />
        </div>
    );
};

export default PatientsPageResponsive;
