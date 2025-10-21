import React, { useState, useEffect } from "react";
import Card, { StatsCard } from "../components/Card";
import { useReports } from "../hooks/useReports";

interface ReportFilters {
    start_date?: string;
    end_date?: string;
}

// Removido ChartCard/StatCard baseados em Tailwind; usamos Card/StatsCard compartilhados com estilos inline

interface FilterBarProps {
    onFilterChange: (filters: ReportFilters) => void;
    loading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, loading }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Datas padrão (mês atual)
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
    }, []);

    const handleApply = () => {
        onFilterChange({ start_date: startDate, end_date: endDate });
    };

    const handleReset = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const s = firstDay.toISOString().split("T")[0];
        const e = lastDay.toISOString().split("T")[0];
        setStartDate(s);
        setEndDate(e);
        onFilterChange({ start_date: s, end_date: e });
    };

    const quickPeriod = (
        period: "today" | "week" | "month" | "quarter" | "year"
    ) => {
        const now = new Date();
        let start = new Date();
        let end = new Date();
        switch (period) {
            case "today":
                start = new Date();
                break;
            case "week":
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case "quarter": {
                const q = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), q * 3, 1);
                end = new Date(now.getFullYear(), q * 3 + 3, 0);
                break;
            }
            case "year":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
        }
        const s = start.toISOString().split("T")[0];
        const e = end.toISOString().split("T")[0];
        setStartDate(s);
        setEndDate(e);
        onFilterChange({ start_date: s, end_date: e });
    };

    return (
        <Card padding="small">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                    alignItems: "end",
                }}
            >
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#374151",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Data inicial
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            backgroundColor: "white",
                        }}
                    />
                </div>
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#374151",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Data final
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            backgroundColor: "white",
                        }}
                    />
                </div>
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#374151",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Ações
                    </label>
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                        }}
                    >
                        <button
                            onClick={handleApply}
                            disabled={loading}
                            style={{
                                height: 40,
                                paddingLeft: "0.75rem",
                                paddingRight: "0.75rem",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.4rem",
                            }}
                            title="Aplicar filtros"
                        >
                            Aplicar
                        </button>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            style={{
                                height: 40,
                                paddingLeft: "0.75rem",
                                paddingRight: "0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                color: "#374151",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {showAdvanced ? "− Filtros" : "+ Filtros"}
                        </button>
                    </div>
                </div>
            </div>

            {showAdvanced && (
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() => quickPeriod("today")}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                color: "#374151",
                            }}
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => quickPeriod("week")}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                color: "#374151",
                            }}
                        >
                            7 dias
                        </button>
                        <button
                            onClick={() => quickPeriod("month")}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                color: "#374151",
                            }}
                        >
                            Este mês
                        </button>
                        <button
                            onClick={() => quickPeriod("quarter")}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                color: "#374151",
                            }}
                        >
                            Trimestre
                        </button>
                        <button
                            onClick={() => quickPeriod("year")}
                            style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                color: "#374151",
                            }}
                        >
                            Este ano
                        </button>
                        <div style={{ marginLeft: "auto" }}>
                            <button
                                onClick={handleReset}
                                style={{
                                    padding: "0.50rem 0.75rem",
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
                    </div>
                </div>
            )}
        </Card>
    );
};

const ReportsPage: React.FC = () => {
    const { dashboardStats, loading, error, fetchDashboardStats, clearError } =
        useReports();

    const [refreshing, setRefreshing] = useState(false);

    const handleFilterChange = async (filters: ReportFilters) => {
        setRefreshing(true);
        try {
            await fetchDashboardStats(filters);
        } finally {
            setRefreshing(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value || 0);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("pt-BR").format(value || 0);
    };

    if (error) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f8fafc",
                    padding: "2rem",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Card padding="small">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "1rem",
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: "#b91c1c",
                                        margin: 0,
                                    }}
                                >
                                    Erro ao carregar relatórios
                                </h3>
                                <p
                                    style={{
                                        marginTop: "0.5rem",
                                        fontSize: "0.875rem",
                                        color: "#991b1b",
                                    }}
                                >
                                    {error}
                                </p>
                                <div style={{ marginTop: "0.75rem" }}>
                                    <button
                                        onClick={() => {
                                            clearError();
                                            fetchDashboardStats();
                                        }}
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            backgroundColor: "#fee2e2",
                                            color: "#991b1b",
                                            border: "1px solid #fecaca",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (loading && !dashboardStats) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f8fafc",
                    padding: "2rem",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div>
                        <div
                            style={{
                                height: 32,
                                backgroundColor: "#e5e7eb",
                                borderRadius: 8,
                                width: "25%",
                                marginBottom: "1.5rem",
                            }}
                        />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1rem",
                                marginBottom: "1.5rem",
                            }}
                        >
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 12,
                                        padding: "1.5rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: 16,
                                            backgroundColor: "#e5e7eb",
                                            borderRadius: 6,
                                            width: "75%",
                                            marginBottom: 8,
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: 28,
                                            backgroundColor: "#e5e7eb",
                                            borderRadius: 6,
                                            width: "50%",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#111827",
                            margin: 0,
                        }}
                    >
                        Relatórios e Estatísticas
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            color: "#6b7280",
                            margin: "0.5rem 0 0 0",
                        }}
                    >
                        Acompanhe o desempenho da sua clínica em tempo real
                    </p>
                </div>

                {/* Filtros */}
                <FilterBar
                    onFilterChange={handleFilterChange}
                    loading={refreshing}
                />

                {dashboardStats && (
                    <>
                        {/* Overview Stats */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1rem",
                                marginTop: "1rem",
                                marginBottom: "2rem",
                            }}
                        >
                            <StatsCard
                                title="Total de Pacientes"
                                value={formatNumber(
                                    dashboardStats.overview.totalPatients
                                )}
                                subtitle="vs mês anterior"
                                trend={{ value: 12, direction: "up" }}
                                color="blue"
                            />
                            <StatsCard
                                title="Consultas Hoje"
                                value={formatNumber(
                                    dashboardStats.overview.appointmentsToday
                                )}
                                subtitle="vs mês anterior"
                                trend={{ value: 8, direction: "up" }}
                                color="green"
                            />
                            <StatsCard
                                title="Receita do Mês"
                                value={formatCurrency(
                                    dashboardStats.revenue.totalThisMonth
                                )}
                                subtitle="vs mês anterior"
                                trend={{ value: 15, direction: "up" }}
                                color="purple"
                            />
                            <StatsCard
                                title="Taxa de Comparecimento"
                                value={`${dashboardStats.performance.attendanceRate}%`}
                                subtitle="vs mês anterior"
                                trend={{ value: 5, direction: "up" }}
                                color="blue"
                            />
                        </div>

                        {/* Secondary Stats */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: "1rem",
                                marginBottom: "2rem",
                            }}
                        >
                            <StatsCard
                                title="Novos Pacientes (Mês)"
                                value={formatNumber(
                                    dashboardStats.overview.newPatientsThisMonth
                                )}
                                color="blue"
                            />
                            <StatsCard
                                title="Consultas da Semana"
                                value={formatNumber(
                                    dashboardStats.overview.appointmentsThisWeek
                                )}
                                color="green"
                            />
                            <StatsCard
                                title="Prontuários Criados"
                                value={formatNumber(
                                    dashboardStats.overview.recordsThisMonth
                                )}
                                color="yellow"
                            />
                        </div>

                        {/* Charts Section */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: "1rem",
                                marginBottom: "2rem",
                            }}
                        >
                            <Card title="Consultas por Status" padding="medium">
                                <div>
                                    {dashboardStats.appointments.byStatus.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    padding: "0.5rem 0",
                                                    borderBottom:
                                                        index <
                                                        dashboardStats
                                                            .appointments
                                                            .byStatus.length -
                                                            1
                                                            ? "1px solid #f3f4f6"
                                                            : "none",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 500,
                                                        color: "#374151",
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {item.status ||
                                                        "Não informado"}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 700,
                                                        color: "#111827",
                                                    }}
                                                >
                                                    {formatNumber(item.total)}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </Card>

                            <Card title="Consultas por Tipo" padding="medium">
                                <div>
                                    {dashboardStats.appointments.byType
                                        .slice(0, 5)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    padding: "0.5rem 0",
                                                    borderBottom:
                                                        index <
                                                        Math.min(
                                                            5,
                                                            dashboardStats
                                                                .appointments
                                                                .byType.length
                                                        ) -
                                                            1
                                                            ? "1px solid #f3f4f6"
                                                            : "none",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 500,
                                                        color: "#374151",
                                                    }}
                                                >
                                                    {item.tipo_consulta ||
                                                        "Não informado"}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 700,
                                                        color: "#111827",
                                                    }}
                                                >
                                                    {formatNumber(item.total)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        </div>

                        {/* Performance Section */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: "1rem",
                            }}
                        >
                            <Card
                                title="Produtividade por Médico"
                                padding="medium"
                            >
                                <div>
                                    {dashboardStats.performance.doctorProductivity
                                        .slice(0, 5)
                                        .map((doctor, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    padding: "0.5rem 0",
                                                    borderBottom:
                                                        index <
                                                        Math.min(
                                                            5,
                                                            dashboardStats
                                                                .performance
                                                                .doctorProductivity
                                                                .length
                                                        ) -
                                                            1
                                                            ? "1px solid #f3f4f6"
                                                            : "none",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 500,
                                                        color: "#374151",
                                                    }}
                                                >
                                                    {doctor.name}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 700,
                                                        color: "#111827",
                                                    }}
                                                >
                                                    {formatNumber(
                                                        doctor.appointments
                                                    )}{" "}
                                                    consultas
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </Card>

                            <Card title="Performance Geral" padding="medium">
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
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            Taxa de Comparecimento
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 700,
                                                color: "#059669",
                                            }}
                                        >
                                            {
                                                dashboardStats.performance
                                                    .attendanceRate
                                            }
                                            %
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            Tempo Médio de Consulta
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 700,
                                                color: "#111827",
                                            }}
                                        >
                                            {
                                                dashboardStats.performance
                                                    .avgConsultationTime
                                            }{" "}
                                            min
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            Valor Médio por Consulta
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 700,
                                                color: "#111827",
                                            }}
                                        >
                                            {formatCurrency(
                                                dashboardStats.revenue
                                                    .averagePerAppointment
                                            )}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            Satisfação do Paciente
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 700,
                                                color: "#ca8a04",
                                            }}
                                        >
                                            {
                                                dashboardStats.performance
                                                    .patientSatisfaction
                                            }
                                            /5.0 ⭐
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
