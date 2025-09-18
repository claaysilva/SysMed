import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientFormModal from "../components/PatientFormModal";
import Card from "../components/Card";
import { StatusBadge } from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmationModal from "../components/ConfirmationModal";
import { Link } from "react-router-dom";

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

const PatientsPage: React.FC = () => {
    const userRole = localStorage.getItem("userRole");
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "todos" | "ativo" | "inativo"
    >("todos");
    const [ageFilter, setAgeFilter] = useState({ min: "", max: "" });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState<"nome" | "idade" | "data_cadastro">(
        "nome"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        patient: Patient | null;
    }>({
        isOpen: false,
        patient: null,
    });
    const [deleting, setDeleting] = useState(false);

    const itemsPerPage = 10;

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            const response = await axios.get(
                "http://localhost:8000/api/patients",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Simular dados adicionais para demonstração
            const patientsWithStatus = response.data.map(
                (patient: Patient) => ({
                    ...patient,
                    status: Math.random() > 0.2 ? "ativo" : "inativo",
                    telefone: patient.telefone || "(11) 9999-9999",
                    email: patient.email || "paciente@email.com",
                    endereco: patient.endereco || "Endereço não informado",
                    created_at: patient.created_at || new Date().toISOString(),
                })
            );

            setPatients(patientsWithStatus);
            setFilteredPatients(patientsWithStatus);
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const calculateAge = (birthDate: string) => {
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

    // Filtrar pacientes baseado na busca e filtros
    useEffect(() => {
        let filtered = patients;

        // Filtrar por termo de busca
        if (searchTerm) {
            filtered = filtered.filter(
                (patient) =>
                    patient.nome_completo
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    patient.cpf.includes(searchTerm) ||
                    patient.email
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    patient.telefone?.includes(searchTerm)
            );
        }

        // Filtrar por status
        if (statusFilter !== "todos") {
            filtered = filtered.filter(
                (patient) => patient.status === statusFilter
            );
        }

        // Filtrar por idade
        if (ageFilter.min || ageFilter.max) {
            filtered = filtered.filter((patient) => {
                const age = calculateAge(patient.data_nascimento);
                const minAge = parseInt(ageFilter.min) || 0;
                const maxAge = parseInt(ageFilter.max) || 150;
                return age >= minAge && age <= maxAge;
            });
        }

        // Ordenar pacientes
        filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortBy) {
                case "nome":
                    aValue = a.nome_completo.toLowerCase();
                    bValue = b.nome_completo.toLowerCase();
                    break;
                case "idade":
                    aValue = calculateAge(a.data_nascimento);
                    bValue = calculateAge(b.data_nascimento);
                    break;
                case "data_cadastro":
                    aValue = new Date(a.created_at || "").getTime();
                    bValue = new Date(b.created_at || "").getTime();
                    break;
                default:
                    aValue = a.nome_completo.toLowerCase();
                    bValue = b.nome_completo.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredPatients(filtered);
        setCurrentPage(1); // Reset página ao filtrar
    }, [searchTerm, statusFilter, ageFilter, sortBy, sortOrder, patients]);

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingPatient(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (patient: Patient) => {
        setDeleteModal({ isOpen: true, patient });
    };

    const handleDelete = async () => {
        if (!deleteModal.patient) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.delete(
                `http://localhost:8000/api/patients/${deleteModal.patient.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            await fetchPatients();
            setDeleteModal({ isOpen: false, patient: null });
        } catch (error) {
            console.error("Erro ao deletar paciente:", error);
            alert("Erro ao deletar paciente. Tente novamente.");
        } finally {
            setDeleting(false);
        }
    };

    // Paginação
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPatients = filteredPatients.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "400px",
                }}
            >
                <LoadingSpinner
                    size="large"
                    message="Carregando pacientes..."
                />
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "2rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#111827",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        Pacientes
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            color: "#6b7280",
                            margin: 0,
                        }}
                    >
                        {filteredPatients.length} paciente
                        {filteredPatients.length !== 1 ? "s" : ""} encontrado
                        {filteredPatients.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {userRole === "admin" && (
                    <button
                        onClick={handleAdd}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <span>+</span>
                        Novo Paciente
                    </button>
                )}
            </div>

            {/* Filtros e Busca */}
            <Card>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1rem",
                        alignItems: "end",
                    }}
                >
                    {/* Busca */}
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
                            Buscar pacientes
                        </label>
                        <input
                            type="text"
                            placeholder="Nome, CPF, telefone ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                transition: "border-color 0.2s",
                            }}
                        />
                    </div>

                    {/* Status */}
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
                            Filtrar por status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as
                                        | "todos"
                                        | "ativo"
                                        | "inativo"
                                )
                            }
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                backgroundColor: "white",
                                cursor: "pointer",
                            }}
                        >
                            <option value="todos">Todos os status</option>
                            <option value="ativo">Ativos</option>
                            <option value="inativo">Inativos</option>
                        </select>
                    </div>

                    {/* Ordenação */}
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
                            Ordenar por
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value as
                                            | "nome"
                                            | "idade"
                                            | "data_cadastro"
                                    )
                                }
                                style={{
                                    flex: 2,
                                    padding: "0.75rem",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="nome">Nome</option>
                                <option value="idade">Idade</option>
                                <option value="data_cadastro">
                                    Data Cadastro
                                </option>
                            </select>
                            <button
                                onClick={() =>
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    )
                                }
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                }}
                                title={`Ordenação ${
                                    sortOrder === "asc"
                                        ? "crescente"
                                        : "decrescente"
                                }`}
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtros Avançados */}
                <div style={{ marginTop: "1rem" }}>
                    <button
                        onClick={() =>
                            setShowAdvancedFilters(!showAdvancedFilters)
                        }
                        style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid #d1d5db",
                            backgroundColor: "transparent",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "#374151",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        {showAdvancedFilters ? "−" : "+"} Filtros Avançados
                    </button>

                    {showAdvancedFilters && (
                        <div
                            style={{
                                marginTop: "1rem",
                                padding: "1rem",
                                backgroundColor: "#f9fafb",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                            }}
                        >
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
                                    Faixa Etária
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                    }}
                                >
                                    <input
                                        type="number"
                                        placeholder="Idade min"
                                        value={ageFilter.min}
                                        onChange={(e) =>
                                            setAgeFilter((prev) => ({
                                                ...prev,
                                                min: e.target.value,
                                            }))
                                        }
                                        style={{
                                            flex: 1,
                                            padding: "0.5rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "6px",
                                            fontSize: "0.875rem",
                                        }}
                                    />
                                    <span style={{ color: "#6b7280" }}>−</span>
                                    <input
                                        type="number"
                                        placeholder="Idade max"
                                        value={ageFilter.max}
                                        onChange={(e) =>
                                            setAgeFilter((prev) => ({
                                                ...prev,
                                                max: e.target.value,
                                            }))
                                        }
                                        style={{
                                            flex: 1,
                                            padding: "0.5rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "6px",
                                            fontSize: "0.875rem",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botão Limpar */}
                <div style={{ marginTop: "1rem" }}>
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("todos");
                            setAgeFilter({ min: "", max: "" });
                            setSortBy("nome");
                            setSortOrder("asc");
                        }}
                        style={{
                            padding: "0.75rem 1rem",
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "#374151",
                        }}
                    >
                        Limpar Filtros
                    </button>
                </div>
            </Card>

            {/* Lista de Pacientes */}
            <div style={{ marginTop: "2rem" }}>
                <Card>
                    {currentPatients.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <th
                                            style={{
                                                padding: "1rem",
                                                textAlign: "left",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#374151",
                                            }}
                                        >
                                            Paciente
                                        </th>
                                        <th
                                            style={{
                                                padding: "1rem",
                                                textAlign: "left",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#374151",
                                            }}
                                        >
                                            Contato
                                        </th>
                                        <th
                                            style={{
                                                padding: "1rem",
                                                textAlign: "left",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#374151",
                                            }}
                                        >
                                            Idade
                                        </th>
                                        <th
                                            style={{
                                                padding: "1rem",
                                                textAlign: "left",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#374151",
                                            }}
                                        >
                                            Status
                                        </th>
                                        <th
                                            style={{
                                                padding: "1rem",
                                                textAlign: "right",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#374151",
                                            }}
                                        >
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPatients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #f3f4f6",
                                            }}
                                        >
                                            <td style={{ padding: "1rem" }}>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: "500",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        {patient.nome_completo}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "0.875rem",
                                                            color: "#6b7280",
                                                        }}
                                                    >
                                                        CPF: {patient.cpf}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        color: "#374151",
                                                    }}
                                                >
                                                    <div>
                                                        {patient.telefone}
                                                    </div>
                                                    <div>{patient.email}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        color: "#374151",
                                                    }}
                                                >
                                                    {calculateAge(
                                                        patient.data_nascimento
                                                    )}{" "}
                                                    anos
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <StatusBadge
                                                    status={
                                                        patient.status ||
                                                        "ativo"
                                                    }
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    padding: "1rem",
                                                    textAlign: "right",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "0.5rem",
                                                        justifyContent:
                                                            "flex-end",
                                                    }}
                                                >
                                                    <Link
                                                        to={`/patients/${patient.id}`}
                                                        style={{
                                                            padding:
                                                                "0.5rem 1rem",
                                                            backgroundColor:
                                                                "#3b82f6",
                                                            color: "white",
                                                            textDecoration:
                                                                "none",
                                                            borderRadius: "6px",
                                                            fontSize:
                                                                "0.875rem",
                                                            fontWeight: "500",
                                                            transition:
                                                                "all 0.2s",
                                                        }}
                                                    >
                                                        Ver
                                                    </Link>
                                                    {userRole === "admin" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        patient
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "0.5rem 1rem",
                                                                    backgroundColor:
                                                                        "#f59e0b",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "6px",
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight:
                                                                        "500",
                                                                    cursor: "pointer",
                                                                    transition:
                                                                        "all 0.2s",
                                                                }}
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        patient
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "0.5rem 1rem",
                                                                    backgroundColor:
                                                                        "#ef4444",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "6px",
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight:
                                                                        "500",
                                                                    cursor: "pointer",
                                                                    transition:
                                                                        "all 0.2s",
                                                                }}
                                                            >
                                                                Excluir
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "3rem",
                                color: "#6b7280",
                            }}
                        >
                            <h3 style={{ marginBottom: "1rem" }}>
                                Nenhum paciente encontrado
                            </h3>
                            <p>
                                Tente ajustar seus filtros ou adicione um novo
                                paciente.
                            </p>
                        </div>
                    )}

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginTop: "2rem",
                                padding: "1rem",
                                borderTop: "1px solid #e5e7eb",
                            }}
                        >
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                style={{
                                    padding: "0.5rem 1rem",
                                    border: "1px solid #d1d5db",
                                    backgroundColor:
                                        currentPage === 1 ? "#f9fafb" : "white",
                                    borderRadius: "6px",
                                    cursor:
                                        currentPage === 1
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize: "0.875rem",
                                    color:
                                        currentPage === 1
                                            ? "#9ca3af"
                                            : "#374151",
                                }}
                            >
                                Anterior
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    // Mostrar sempre as primeiras 2, últimas 2, e páginas próximas à atual
                                    return (
                                        page <= 2 ||
                                        page > totalPages - 2 ||
                                        Math.abs(page - currentPage) <= 1
                                    );
                                })
                                .map((page, index, visiblePages) => {
                                    const prevPage = visiblePages[index - 1];
                                    const shouldShowEllipsis =
                                        prevPage && page - prevPage > 1;

                                    return (
                                        <React.Fragment key={page}>
                                            {shouldShowEllipsis && (
                                                <span
                                                    style={{
                                                        color: "#6b7280",
                                                        padding: "0 0.5rem",
                                                    }}
                                                >
                                                    ...
                                                </span>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    border: "1px solid #d1d5db",
                                                    backgroundColor:
                                                        currentPage === page
                                                            ? "#3b82f6"
                                                            : "white",
                                                    color:
                                                        currentPage === page
                                                            ? "white"
                                                            : "#374151",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "0.875rem",
                                                    fontWeight:
                                                        currentPage === page
                                                            ? "600"
                                                            : "400",
                                                }}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: "0.5rem 1rem",
                                    border: "1px solid #d1d5db",
                                    backgroundColor:
                                        currentPage === totalPages
                                            ? "#f9fafb"
                                            : "white",
                                    borderRadius: "6px",
                                    cursor:
                                        currentPage === totalPages
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize: "0.875rem",
                                    color:
                                        currentPage === totalPages
                                            ? "#9ca3af"
                                            : "#374151",
                                }}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modais */}
            <PatientFormModal
                isOpen={isModalOpen}
                patientToEdit={editingPatient}
                onClose={() => setIsModalOpen(false)}
                onSave={() => {
                    setIsModalOpen(false);
                    fetchPatients();
                }}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o paciente "${deleteModal.patient?.nome_completo}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteModal({ isOpen: false, patient: null })
                }
                loading={deleting}
                type="danger"
            />
        </div>
    );
};

export default PatientsPage;
