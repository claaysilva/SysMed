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

        setFilteredPatients(filtered);
        setCurrentPage(1); // Reset página ao filtrar
    }, [searchTerm, statusFilter, patients]);

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

        try {
            setDeleting(true);
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
            console.error("Não foi possível excluir o paciente:", error);
            alert("Não foi possível excluir o paciente.");
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2563eb";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#3b82f6";
                        }}
                    >
                        <span>+</span>
                        Novo Paciente
                    </button>
                )}
            </div>

            {/* Filtros e Busca */}
            <Card padding="medium" className="mb-6">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1rem",
                        alignItems: "end",
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
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = "#3b82f6")
                            }
                            onBlur={(e) =>
                                (e.currentTarget.style.borderColor = "#d1d5db")
                            }
                        />
                    </div>

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

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("todos");
                            }}
                            style={{
                                padding: "0.75rem 1rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                color: "#374151",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </Card>

            {/* Lista de Pacientes */}
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
                                        Data de Nascimento
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
                                            borderBottom: "1px solid #f3f4f6",
                                            transition: "background-color 0.2s",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                "#f9fafb")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                "transparent")
                                        }
                                    >
                                        <td style={{ padding: "1rem" }}>
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: "500",
                                                        color: "#111827",
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
                                                    {patient.nome_completo}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    CPF: {patient.cpf}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        color: "#374151",
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
                                                    📞 {patient.telefone}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    ✉️ {patient.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <span
                                                style={{
                                                    fontSize: "0.875rem",
                                                    color: "#374151",
                                                }}
                                            >
                                                {patient.data_nascimento}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <StatusBadge
                                                status={
                                                    patient.status || "ativo"
                                                }
                                                size="small"
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
                                                    justifyContent: "flex-end",
                                                }}
                                            >
                                                <Link
                                                    to={`/patients/${patient.id}`}
                                                >
                                                    <button
                                                        style={{
                                                            padding:
                                                                "0.5rem 0.75rem",
                                                            backgroundColor:
                                                                "#10b981",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "500",
                                                            cursor: "pointer",
                                                            transition:
                                                                "all 0.2s",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "#059669";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "#10b981";
                                                        }}
                                                    >
                                                        Prontuário
                                                    </button>
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
                                                                    "0.5rem 0.75rem",
                                                                backgroundColor:
                                                                    "#f59e0b",
                                                                color: "white",
                                                                border: "none",
                                                                borderRadius:
                                                                    "6px",
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight:
                                                                    "500",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.2s",
                                                            }}
                                                            onMouseEnter={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.backgroundColor =
                                                                    "#d97706";
                                                            }}
                                                            onMouseLeave={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.backgroundColor =
                                                                    "#f59e0b";
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
                                                                    "0.5rem 0.75rem",
                                                                backgroundColor:
                                                                    "#ef4444",
                                                                color: "white",
                                                                border: "none",
                                                                borderRadius:
                                                                    "6px",
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight:
                                                                    "500",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.2s",
                                                            }}
                                                            onMouseEnter={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.backgroundColor =
                                                                    "#dc2626";
                                                            }}
                                                            onMouseLeave={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.backgroundColor =
                                                                    "#ef4444";
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
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                            👥
                        </div>
                        <p
                            style={{
                                fontSize: "1.1rem",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Nenhum paciente encontrado
                        </p>
                        <p style={{ fontSize: "0.875rem" }}>
                            {searchTerm || statusFilter !== "todos"
                                ? "Tente ajustar os filtros de busca"
                                : "Comece adicionando um novo paciente"}
                        </p>
                    </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div
                        style={{
                            marginTop: "1.5rem",
                            paddingTop: "1.5rem",
                            borderTop: "1px solid #e5e7eb",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor:
                                    currentPage === 1 ? "#f9fafb" : "white",
                                color:
                                    currentPage === 1 ? "#9ca3af" : "#374151",
                                borderRadius: "6px",
                                cursor:
                                    currentPage === 1
                                        ? "not-allowed"
                                        : "pointer",
                                fontSize: "0.875rem",
                            }}
                        >
                            Anterior
                        </button>

                        <span
                            style={{
                                padding: "0 1rem",
                                fontSize: "0.875rem",
                                color: "#6b7280",
                            }}
                        >
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor:
                                    currentPage === totalPages
                                        ? "#f9fafb"
                                        : "white",
                                color:
                                    currentPage === totalPages
                                        ? "#9ca3af"
                                        : "#374151",
                                borderRadius: "6px",
                                cursor:
                                    currentPage === totalPages
                                        ? "not-allowed"
                                        : "pointer",
                                fontSize: "0.875rem",
                            }}
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </Card>

            {/* Modais */}
            <PatientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchPatients}
                patientToEdit={editingPatient}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Excluir Paciente"
                message={`Tem certeza que deseja excluir o paciente "${deleteModal.patient?.nome_completo}"? Esta ação não pode ser desfeita.`}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteModal({ isOpen: false, patient: null })
                }
                loading={deleting}
            />
        </div>
    );
};

export default PatientsPage;
