import React, { useState, useEffect } from "react";
import axios from "axios";

interface Appointment {
    id: string;
    data_hora_inicio: string;
    data_hora_fim: string;
    observacoes: string;
    patient?: {
        nome_completo: string;
    };
    user?: {
        name: string;
    };
}

interface DashboardStats {
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
    recentAppointments: Appointment[];
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        recentAppointments: [],
    });
    const [userRole, setUserRole] = useState<string>("");
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "";
        const name = localStorage.getItem("userName") || "Usuário";
        setUserRole(role);
        setUserName(name);

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("authToken");

            // Buscar pacientes
            const patientsResponse = await axios.get(
                "http://localhost:8000/api/patients",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Buscar agendamentos
            const appointmentsResponse = await axios.get(
                "http://localhost:8000/api/appointments",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const appointments = appointmentsResponse.data;
            const today = new Date().toISOString().split("T")[0];
            const todayAppointments = appointments.filter(
                (apt: Appointment) =>
                    apt.data_hora_inicio.split(" ")[0] === today
            );

            setStats({
                totalPatients: patientsResponse.data.length,
                totalAppointments: appointments.length,
                todayAppointments: todayAppointments.length,
                recentAppointments: appointments.slice(0, 5),
            });
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h1 style={{ color: "#1976d2", marginBottom: "0.5rem" }}>
                    Dashboard do SysMed
                </h1>
                <p style={{ color: "#666", fontSize: "1.1rem" }}>
                    Bem-vindo, <strong>{userName}</strong>!
                    {userRole === "doctor"
                        ? " (Médico)"
                        : userRole === "admin"
                        ? " (Administrador)"
                        : " (Recepcionista)"}
                </p>
            </div>

            {/* Statistics Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                }}
            >
                <div
                    style={{
                        background: "linear-gradient(135deg, #1976d2, #1565c0)",
                        color: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2.5rem" }}>
                        {stats.totalPatients}
                    </h3>
                    <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.9 }}>
                        Total de Pacientes
                    </p>
                </div>

                <div
                    style={{
                        background: "linear-gradient(135deg, #388e3c, #2e7d32)",
                        color: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2.5rem" }}>
                        {stats.totalAppointments}
                    </h3>
                    <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.9 }}>
                        Total de Consultas
                    </p>
                </div>

                <div
                    style={{
                        background: "linear-gradient(135deg, #f57c00, #ef6c00)",
                        color: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2.5rem" }}>
                        {stats.todayAppointments}
                    </h3>
                    <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.9 }}>
                        Consultas Hoje
                    </p>
                </div>
            </div>

            {/* Recent Appointments */}
            <div
                style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                }}
            >
                <h3 style={{ margin: "0 0 1rem 0", color: "#1976d2" }}>
                    Consultas Recentes
                </h3>

                {stats.recentAppointments.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#f8f9fa" }}>
                                    <th
                                        style={{
                                            padding: "0.75rem",
                                            textAlign: "left",
                                            borderBottom: "2px solid #dee2e6",
                                        }}
                                    >
                                        Paciente
                                    </th>
                                    <th
                                        style={{
                                            padding: "0.75rem",
                                            textAlign: "left",
                                            borderBottom: "2px solid #dee2e6",
                                        }}
                                    >
                                        Médico
                                    </th>
                                    <th
                                        style={{
                                            padding: "0.75rem",
                                            textAlign: "left",
                                            borderBottom: "2px solid #dee2e6",
                                        }}
                                    >
                                        Data/Hora
                                    </th>
                                    <th
                                        style={{
                                            padding: "0.75rem",
                                            textAlign: "left",
                                            borderBottom: "2px solid #dee2e6",
                                        }}
                                    >
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentAppointments.map(
                                    (
                                        appointment: Appointment,
                                        index: number
                                    ) => (
                                        <tr
                                            key={appointment.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #dee2e6",
                                                background:
                                                    index % 2 === 0
                                                        ? "white"
                                                        : "#f8f9fa",
                                            }}
                                        >
                                            <td style={{ padding: "0.75rem" }}>
                                                {appointment.patient
                                                    ?.nome_completo || "N/A"}
                                            </td>
                                            <td style={{ padding: "0.75rem" }}>
                                                {appointment.user?.name ||
                                                    "N/A"}
                                            </td>
                                            <td style={{ padding: "0.75rem" }}>
                                                {new Date(
                                                    appointment.data_hora_inicio
                                                ).toLocaleString("pt-BR")}
                                            </td>
                                            <td style={{ padding: "0.75rem" }}>
                                                <span
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        borderRadius: "4px",
                                                        fontSize: "0.875rem",
                                                        background:
                                                            new Date(
                                                                appointment.data_hora_inicio
                                                            ) > new Date()
                                                                ? "#e3f2fd"
                                                                : "#f3e5f5",
                                                        color:
                                                            new Date(
                                                                appointment.data_hora_inicio
                                                            ) > new Date()
                                                                ? "#1976d2"
                                                                : "#7b1fa2",
                                                    }}
                                                >
                                                    {new Date(
                                                        appointment.data_hora_inicio
                                                    ) > new Date()
                                                        ? "Agendado"
                                                        : "Realizado"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p
                        style={{
                            color: "#666",
                            textAlign: "center",
                            margin: "2rem 0",
                        }}
                    >
                        Nenhuma consulta encontrada.
                    </p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
