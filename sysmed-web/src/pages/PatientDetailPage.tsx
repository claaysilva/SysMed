import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import { StatusBadge } from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

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
    updated_at?: string;
}

interface RecordEntry {
    id: number;
    conteudo: string;
    created_at: string;
    user: { name: string };
}

interface Appointment {
    id: number;
    data_consulta: string;
    hora_consulta: string;
    medico: string;
    status: "agendada" | "realizada" | "cancelada";
    observacoes?: string;
}

const PatientDetailPage: React.FC = () => {
    const { id: patientId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [entries, setEntries] = useState<RecordEntry[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [newEntryContent, setNewEntryContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [entryError, setEntryError] = useState<string>("");
    const [activeTab, setActiveTab] = useState<
        "info" | "prontuario" | "history" | "stats"
    >("info");

    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("authToken");
                const headers = { Authorization: `Bearer ${token}` };

                // Buscar dados do paciente
                const patientResponse = await axios.get(
                    `http://localhost:8000/api/patients/${patientId}`,
                    { headers }
                );

                setPatient({
                    ...patientResponse.data,
                    status: Math.random() > 0.3 ? "ativo" : "inativo",
                    telefone:
                        patientResponse.data.telefone || "(11) 99999-9999",
                    email: patientResponse.data.email || "paciente@email.com",
                    endereco:
                        patientResponse.data.endereco ||
                        "Endereço não informado",
                });

                // Buscar entradas do prontuário
                const entriesResponse = await axios.get(
                    `http://localhost:8000/api/patients/${patientId}/record-entries`,
                    { headers }
                );
                setEntries(entriesResponse.data);

                // Simular dados de consultas
                const mockAppointments: Appointment[] = [
                    {
                        id: 1,
                        data_consulta: "2025-09-15",
                        hora_consulta: "14:30",
                        medico: "Dr. João Silva",
                        status: "realizada",
                        observacoes:
                            "Consulta de rotina - paciente apresentando melhora",
                    },
                    {
                        id: 2,
                        data_consulta: "2025-08-20",
                        hora_consulta: "10:00",
                        medico: "Dra. Maria Santos",
                        status: "realizada",
                        observacoes: "Exame preventivo",
                    },
                    {
                        id: 3,
                        data_consulta: "2025-09-25",
                        hora_consulta: "16:00",
                        medico: "Dr. João Silva",
                        status: "agendada",
                        observacoes: "Retorno - verificar resultados de exames",
                    },
                ];

                setAppointments(mockAppointments);
            } catch (error) {
                console.error("Erro ao buscar dados do paciente:", error);
                navigate("/patients");
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchPatientData();
        }
    }, [patientId, navigate]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

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

    const handleSaveEntry = async () => {
        if (!newEntryContent.trim()) {
            setEntryError("O conteúdo do prontuário é obrigatório.");
            return;
        }
        setEntryError("");
        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(
                "http://localhost:8000/api/record-entries",
                {
                    patient_id: patientId,
                    conteudo: newEntryContent,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setNewEntryContent("");
            // Atualizar histórico
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(
                `http://localhost:8000/api/patients/${patientId}/record-entries`,
                { headers }
            );
            setEntries(res.data);
        } catch {
            alert("Erro ao salvar entrada do prontuário.");
        }
        setSaving(false);
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
                    message="Carregando dados do paciente..."
                />
            </div>
        );
    }

    if (!patient) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Paciente não encontrado</h2>
                <Link to="/patients">
                    <button
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Voltar para lista de pacientes
                    </button>
                </Link>
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
                    <div style={{ marginBottom: "1rem" }}>
                        <Link
                            to="/patients"
                            style={{
                                color: "#3b82f6",
                                textDecoration: "none",
                                fontSize: "0.875rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            ← Voltar para pacientes
                        </Link>
                    </div>
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#111827",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        {patient.nome_completo}
                    </h1>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <span style={{ color: "#6b7280" }}>
                            {calculateAge(patient.data_nascimento)} anos
                        </span>
                        <StatusBadge status={patient.status || "ativo"} />
                        <span
                            style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                            }}
                        >
                            Cadastrado em{" "}
                            {formatDate(
                                patient.created_at || new Date().toISOString()
                            )}
                        </span>
                    </div>
                </div>

                {userRole === "admin" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() =>
                                navigate(`/patients/${patientId}/edit`)
                            }
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#f59e0b",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            Editar Paciente
                        </button>
                        <button
                            onClick={() =>
                                navigate(
                                    `/appointments/new?patient=${patientId}`
                                )
                            }
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            Agendar Consulta
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div
                style={{
                    borderBottom: "1px solid #e5e7eb",
                    marginBottom: "2rem",
                }}
            >
                <div style={{ display: "flex", gap: "2rem" }}>
                    {[
                        { key: "info", label: "Informações Gerais" },
                        { key: "prontuario", label: "Prontuário" },
                        { key: "history", label: "Histórico de Consultas" },
                        { key: "stats", label: "Estatísticas" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() =>
                                setActiveTab(
                                    tab.key as
                                        | "info"
                                        | "prontuario"
                                        | "history"
                                        | "stats"
                                )
                            }
                            style={{
                                padding: "0.75rem 0",
                                border: "none",
                                backgroundColor: "transparent",
                                color:
                                    activeTab === tab.key
                                        ? "#3b82f6"
                                        : "#6b7280",
                                fontWeight:
                                    activeTab === tab.key ? "600" : "400",
                                borderBottom:
                                    activeTab === tab.key
                                        ? "2px solid #3b82f6"
                                        : "2px solid transparent",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {activeTab === "info" && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "2rem",
                    }}
                >
                    {/* Informações Pessoais */}
                    <Card>
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Informações Pessoais
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Nome Completo
                                </label>
                                <span style={{ color: "#111827" }}>
                                    {patient.nome_completo}
                                </span>
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    CPF
                                </label>
                                <span style={{ color: "#111827" }}>
                                    {patient.cpf}
                                </span>
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Data de Nascimento
                                </label>
                                <span style={{ color: "#111827" }}>
                                    {formatDate(patient.data_nascimento)} (
                                    {calculateAge(patient.data_nascimento)}{" "}
                                    anos)
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Informações de Contato */}
                    <Card>
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Contato
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Telefone
                                </label>
                                <span style={{ color: "#111827" }}>
                                    {patient.telefone}
                                </span>
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Email
                                </label>
                                <span style={{ color: "#111827" }}>
                                    {patient.email}
                                </span>
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Endereço
                                </label>
                                <span style={{ color: "#111827" }}>
                                    {patient.endereco}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === "prontuario" && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2rem",
                    }}
                >
                    {/* Nova Entrada */}
                    {(userRole === "medico" || userRole === "admin") && (
                        <Card>
                            <h3
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#111827",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                Nova Entrada no Prontuário
                            </h3>
                            <div style={{ marginBottom: "1rem" }}>
                                <textarea
                                    value={newEntryContent}
                                    onChange={(e) =>
                                        setNewEntryContent(e.target.value)
                                    }
                                    placeholder="Digite aqui a nova entrada do prontuário..."
                                    style={{
                                        width: "100%",
                                        minHeight: "120px",
                                        padding: "0.75rem",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        resize: "vertical",
                                        fontFamily: "inherit",
                                    }}
                                />
                                {entryError && (
                                    <div
                                        style={{
                                            color: "#dc2626",
                                            fontSize: "0.875rem",
                                            marginTop: "0.5rem",
                                            padding: "0.5rem",
                                            backgroundColor: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        {entryError}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSaveEntry}
                                disabled={saving}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: saving
                                        ? "#9ca3af"
                                        : "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                {saving ? "Salvando..." : "Salvar Nova Entrada"}
                            </button>
                        </Card>
                    )}

                    {/* Histórico do Prontuário */}
                    <Card>
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Histórico do Prontuário
                        </h3>
                        {entries.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "2rem",
                                    color: "#6b7280",
                                }}
                            >
                                Nenhuma entrada encontrada no prontuário.
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                }}
                            >
                                {entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        style={{
                                            padding: "1.5rem",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            backgroundColor: "#f9fafb",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "1rem",
                                                paddingBottom: "0.5rem",
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "0.875rem",
                                                    fontWeight: "600",
                                                    color: "#111827",
                                                }}
                                            >
                                                {new Date(
                                                    entry.created_at
                                                ).toLocaleString("pt-BR")}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.875rem",
                                                    color: "#10b981",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                {entry.user.name}
                                            </div>
                                        </div>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: entry.conteudo,
                                            }}
                                            style={{
                                                lineHeight: 1.6,
                                                color: "#374151",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === "history" && (
                <Card>
                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#111827",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Histórico de Consultas
                    </h3>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                style={{
                                    padding: "1rem",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    backgroundColor: "#f9fafb",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#111827",
                                            }}
                                        >
                                            {formatDate(
                                                appointment.data_consulta
                                            )}{" "}
                                            às {appointment.hora_consulta}
                                        </div>
                                        <div
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            {appointment.medico}
                                        </div>
                                    </div>
                                    <StatusBadge
                                        status={appointment.status}
                                        size="small"
                                    />
                                </div>
                                {appointment.observacoes && (
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#374151",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        {appointment.observacoes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === "stats" && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "2rem",
                    }}
                >
                    <Card>
                        <h4
                            style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "1rem",
                            }}
                        >
                            Resumo de Consultas
                        </h4>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span style={{ color: "#6b7280" }}>
                                    Total de consultas:
                                </span>
                                <span style={{ fontWeight: "600" }}>
                                    {appointments.length}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span style={{ color: "#6b7280" }}>
                                    Realizadas:
                                </span>
                                <span
                                    style={{
                                        fontWeight: "600",
                                        color: "#10b981",
                                    }}
                                >
                                    {
                                        appointments.filter(
                                            (a) => a.status === "realizada"
                                        ).length
                                    }
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span style={{ color: "#6b7280" }}>
                                    Agendadas:
                                </span>
                                <span
                                    style={{
                                        fontWeight: "600",
                                        color: "#3b82f6",
                                    }}
                                >
                                    {
                                        appointments.filter(
                                            (a) => a.status === "agendada"
                                        ).length
                                    }
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span style={{ color: "#6b7280" }}>
                                    Canceladas:
                                </span>
                                <span
                                    style={{
                                        fontWeight: "600",
                                        color: "#ef4444",
                                    }}
                                >
                                    {
                                        appointments.filter(
                                            (a) => a.status === "cancelada"
                                        ).length
                                    }
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h4
                            style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "1rem",
                            }}
                        >
                            Última Atividade
                        </h4>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        color: "#6b7280",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Última consulta:
                                </span>
                                <div style={{ fontWeight: "600" }}>
                                    {appointments.length > 0
                                        ? formatDate(
                                              appointments[0].data_consulta
                                          )
                                        : "Nenhuma consulta"}
                                </div>
                            </div>
                            <div>
                                <span
                                    style={{
                                        color: "#6b7280",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Próxima consulta:
                                </span>
                                <div style={{ fontWeight: "600" }}>
                                    {appointments.filter(
                                        (a) => a.status === "agendada"
                                    ).length > 0
                                        ? formatDate(
                                              appointments.filter(
                                                  (a) => a.status === "agendada"
                                              )[0].data_consulta
                                          )
                                        : "Nenhuma consulta agendada"}
                                </div>
                            </div>
                            <div>
                                <span
                                    style={{
                                        color: "#6b7280",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Entradas no prontuário:
                                </span>
                                <div style={{ fontWeight: "600" }}>
                                    {entries.length}{" "}
                                    {entries.length === 1
                                        ? "entrada"
                                        : "entradas"}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PatientDetailPage;
