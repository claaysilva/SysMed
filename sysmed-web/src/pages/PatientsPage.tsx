import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientFormModal from "../components/PatientFormModal";
import { Link } from "react-router-dom";

interface Patient {
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
}

const PatientsPage: React.FC = () => {
    const userRole = localStorage.getItem("userRole");
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(
                "http://localhost:8000/api/patients",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setPatients(response.data);
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingPatient(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (patientId: number) => {
        if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
            try {
                const token = localStorage.getItem("authToken");
                await axios.delete(
                    `http://localhost:8000/api/patients/${patientId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                fetchPatients();
            } catch (error) {
                console.error("Não foi possível excluir o paciente:", error);
                alert("Não foi possível excluir o paciente.");
            }
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
            <h2
                style={{
                    marginTop: 0,
                    marginBottom: "1.5rem",
                    textAlign: "center",
                }}
            >
                Gestão de Pacientes
            </h2>
            {userRole === "admin" && (
                <button
                    onClick={handleAdd}
                    style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "0.75rem 1.5rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: "1rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "background 0.2s",
                    }}
                >
                    + Adicionar Paciente
                </button>
            )}
            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "white",
                        borderRadius: 8,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                        minWidth: 600,
                    }}
                >
                    <thead
                        style={{
                            background: "#f5f5f5",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <tr>
                            <th
                                style={{
                                    padding: "0.75rem",
                                    textAlign: "left",
                                }}
                            >
                                Nome
                            </th>
                            <th
                                style={{
                                    padding: "0.75rem",
                                    textAlign: "left",
                                }}
                            >
                                CPF
                            </th>
                            <th
                                style={{
                                    padding: "0.75rem",
                                    textAlign: "left",
                                }}
                            >
                                Data de Nascimento
                            </th>
                            <th
                                style={{
                                    padding: "0.75rem",
                                    textAlign: "left",
                                }}
                            >
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                style={{ borderBottom: "1px solid #eee" }}
                            >
                                <td style={{ padding: "0.75rem" }}>
                                    {patient.nome_completo}
                                </td>
                                <td style={{ padding: "0.75rem" }}>
                                    {patient.cpf}
                                </td>
                                <td style={{ padding: "0.75rem" }}>
                                    {patient.data_nascimento}
                                </td>
                                <td style={{ padding: "0.75rem" }}>
                                    {userRole === "admin" && (
                                        <span>
                                            <button
                                                onClick={() =>
                                                    handleEdit(patient)
                                                }
                                                style={{
                                                    background: "#ffa726",
                                                    color: "#222",
                                                    border: "none",
                                                    borderRadius: 6,
                                                    padding: "0.5rem 1rem",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    marginRight: "0.5rem",
                                                    transition:
                                                        "background 0.2s",
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(patient.id)
                                                }
                                                style={{
                                                    background: "#e53935",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: 6,
                                                    padding: "0.5rem 1rem",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    transition:
                                                        "background 0.2s",
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </span>
                                    )}
                                    <Link
                                        to={`/patients/${patient.id}`}
                                        style={{ marginLeft: "0.5rem" }}
                                    >
                                        <button
                                            style={{
                                                background: "#43a047",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "0.5rem 1rem",
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                transition: "background 0.2s",
                                            }}
                                        >
                                            Ver Prontuário
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PatientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchPatients}
                patientToEdit={editingPatient}
            />
        </div>
    );
};

export default PatientsPage;
