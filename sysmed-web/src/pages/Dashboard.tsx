import React, { useState, useEffect } from "react";
import Card, { StatsCard } from "../components/Card";
import { StatusBadge } from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

interface DashboardStats {
    totalPacientes: number;
    pacientesAtivos: number;
    agendamentosHoje: number;
    agendamentosSemana: number;
    faturamentoMes: number;
    tendenciaPacientes: number;
    tendenciaAgendamentos: number;
}

interface AgendamentoRecente {
    id: number;
    paciente: string;
    horario: string;
    status: "agendado" | "concluido" | "cancelado";
    tipo: string;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [agendamentosRecentes, setAgendamentosRecentes] = useState<
        AgendamentoRecente[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular carregamento de dados
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Simular delay de API
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Dados mockados
                setStats({
                    totalPacientes: 1247,
                    pacientesAtivos: 892,
                    agendamentosHoje: 23,
                    agendamentosSemana: 156,
                    faturamentoMes: 45780.5,
                    tendenciaPacientes: 12.5,
                    tendenciaAgendamentos: 8.3,
                });

                setAgendamentosRecentes([
                    {
                        id: 1,
                        paciente: "Maria Silva Santos",
                        horario: "09:00",
                        status: "agendado",
                        tipo: "Consulta Rotina",
                    },
                    {
                        id: 2,
                        paciente: "João Carlos Oliveira",
                        horario: "10:30",
                        status: "concluido",
                        tipo: "Retorno",
                    },
                    {
                        id: 3,
                        paciente: "Ana Paula Costa",
                        horario: "14:00",
                        status: "agendado",
                        tipo: "Primeira Consulta",
                    },
                    {
                        id: 4,
                        paciente: "Pedro Santos Lima",
                        horario: "15:30",
                        status: "cancelado",
                        tipo: "Consulta Rotina",
                    },
                    {
                        id: 5,
                        paciente: "Carla Mendes Reis",
                        horario: "16:00",
                        status: "agendado",
                        tipo: "Retorno",
                    },
                ]);

                console.log("Dashboard carregado com sucesso!");
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

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
                    message="Carregando dashboard..."
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
            <div style={{ marginBottom: "2rem" }}>
                <h1
                    style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "#111827",
                        margin: "0 0 0.5rem 0",
                    }}
                >
                    Dashboard
                </h1>
                <p
                    style={{
                        fontSize: "1rem",
                        color: "#6b7280",
                        margin: 0,
                    }}
                >
                    Visão geral da sua clínica
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                }}
            >
                <StatsCard
                    title="Total de Pacientes"
                    value={stats?.totalPacientes.toLocaleString("pt-BR") || "0"}
                    subtitle={`${stats?.pacientesAtivos} ativos`}
                    icon="👥"
                    trend={{
                        value: stats?.tendenciaPacientes || 0,
                        direction: "up",
                        label: "vs mês passado",
                    }}
                    color="blue"
                />

                <StatsCard
                    title="Agendamentos Hoje"
                    value={stats?.agendamentosHoje || 0}
                    subtitle={`${stats?.agendamentosSemana} esta semana`}
                    icon="📅"
                    trend={{
                        value: stats?.tendenciaAgendamentos || 0,
                        direction: "up",
                        label: "vs semana passada",
                    }}
                    color="green"
                />

                <StatsCard
                    title="Faturamento Mensal"
                    value={`R$ ${
                        stats?.faturamentoMes.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                        }) || "0,00"
                    }`}
                    subtitle="Receita do mês atual"
                    icon="💰"
                    trend={{
                        value: 15.2,
                        direction: "up",
                        label: "vs mês passado",
                    }}
                    color="purple"
                />

                <StatsCard
                    title="Taxa de Ocupação"
                    value="87%"
                    subtitle="Média da semana"
                    icon="📊"
                    trend={{
                        value: 3.1,
                        direction: "up",
                        label: "vs semana passada",
                    }}
                    color="yellow"
                />
            </div>

            {/* Conteúdo Principal */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "2rem",
                }}
            >
                {/* Agendamentos de Hoje */}
                <Card
                    title="Agendamentos de Hoje"
                    subtitle={`${agendamentosRecentes.length} consultas programadas`}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        {agendamentosRecentes.length > 0 ? (
                            agendamentosRecentes.map((agendamento) => (
                                <div
                                    key={agendamento.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem",
                                        backgroundColor: "#f9fafb",
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#1f2937",
                                                fontSize: "1rem",
                                                minWidth: "60px",
                                            }}
                                        >
                                            {agendamento.horario}
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: "500",
                                                    color: "#111827",
                                                    marginBottom: "0.25rem",
                                                }}
                                            >
                                                {agendamento.paciente}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.875rem",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                {agendamento.tipo}
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge
                                        status={agendamento.status}
                                        size="small"
                                    />
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "2rem",
                                    color: "#6b7280",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "3rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    📅
                                </div>
                                <p>Nenhum agendamento para hoje</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Ações Rápidas */}
                <Card
                    title="Ações Rápidas"
                    subtitle="Acesso rápido às funcionalidades"
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "1rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                                e.currentTarget.style.borderColor = "#d1d5db";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>👤</span>
                            Novo Paciente
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "1rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                                e.currentTarget.style.borderColor = "#d1d5db";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>📅</span>
                            Agendar Consulta
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "1rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                                e.currentTarget.style.borderColor = "#d1d5db";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>📋</span>
                            Prontuário
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "1rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                                e.currentTarget.style.borderColor = "#d1d5db";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>💰</span>
                            Relatórios
                        </button>
                    </div>
                </Card>
            </div>

            {/* Avisos e Notificações */}
            <div style={{ marginTop: "2rem" }}>
                <Card
                    title="Avisos e Notificações"
                    subtitle="Informações importantes da clínica"
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                padding: "1rem",
                                backgroundColor: "#fef3c7",
                                borderRadius: "8px",
                                border: "1px solid #f59e0b",
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                            <div>
                                <div
                                    style={{
                                        fontWeight: "500",
                                        color: "#92400e",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Lembrete: Consulta de emergência
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#b45309",
                                    }}
                                >
                                    João Silva precisa remarcar consulta urgente
                                    para amanhã
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                padding: "1rem",
                                backgroundColor: "#dbeafe",
                                borderRadius: "8px",
                                border: "1px solid #3b82f6",
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>ℹ️</span>
                            <div>
                                <div
                                    style={{
                                        fontWeight: "500",
                                        color: "#1e40af",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    Sistema atualizado
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#1d4ed8",
                                    }}
                                >
                                    Nova versão do SysMed disponível com
                                    melhorias de performance
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
