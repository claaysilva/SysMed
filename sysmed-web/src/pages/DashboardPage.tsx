import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import RecentActivityCard from "../components/RecentActivityCard";
import UpcomingAppointmentsCard from "../components/UpcomingAppointmentsCard";

const DashboardPage: React.FC = () => {
    const { stats, recentActivity, loading, error, refreshData } = useDashboard();

    const userName = localStorage.getItem("userName") || "Usuário";
    const userRole = localStorage.getItem("userRole") || "user";

    if (error) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ color: "#f44336", marginBottom: "1rem" }}>
                    Erro ao carregar dashboard: {error}
                </div>
                <button
                    onClick={refreshData}
                    style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
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
                    
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        style={{
                            background: "#1976d2",
                            color: "white",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        🔄 {loading ? "Atualizando..." : "Atualizar"}
                    </button>
                </div>
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
                {loading ? (
                    // Loading state
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            style={{
                                background: "#f5f5f5",
                                borderRadius: "12px",
                                padding: "1.5rem",
                                height: "120px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                                animation: "pulse 1.5s ease-in-out infinite alternate",
                            }}
                        >
                            Carregando...
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Total de Pacientes"
                            value={stats?.overview.totalPatients || 0}
                            icon="👥"
                            color="#4caf50"
                            growth={stats?.growth.newPatientsThisMonth}
                        />
                        
                        <StatCard
                            title="Consultas Hoje"
                            value={stats?.overview.appointmentsToday || 0}
                            icon="📅"
                            color="#2196f3"
                            subtitle={`${stats?.overview.appointmentsThisWeek || 0} esta semana`}
                        />
                        
                        <StatCard
                            title="Prontuários"
                            value={stats?.overview.totalMedicalRecords || 0}
                            icon="📋"
                            color="#ff9800"
                            growth={stats?.growth.medicalRecordsThisMonth}
                        />
                        
                        <StatCard
                            title="Relatórios"
                            value={stats?.overview.totalReports || 0}
                            icon="📊"
                            color="#9c27b0"
                            growth={stats?.growth.reportsThisMonth}
                        />
                    </>
                )}
            </div>

            {/* Secondary Stats */}
            {!loading && stats && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        marginBottom: "2rem",
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: "8px",
                            padding: "1rem",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <div style={{ color: "#666", fontSize: "0.9rem" }}>
                            Consultas Este Mês
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                            {stats.overview.appointmentsThisMonth}
                        </div>
                    </div>
                    
                    <div
                        style={{
                            background: "white",
                            borderRadius: "8px",
                            padding: "1rem",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <div style={{ color: "#666", fontSize: "0.9rem" }}>
                            Prontuários Pendentes
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f44336" }}>
                            {stats.overview.pendingMedicalRecords}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "2rem",
                    marginTop: "2rem",
                }}
            >
                {/* Upcoming Appointments */}
                <UpcomingAppointmentsCard
                    appointments={stats?.appointments.upcoming || []}
                    loading={loading}
                />

                {/* Recent Activity */}
                <RecentActivityCard
                    activities={recentActivity}
                    loading={loading}
                />
            </div>
            
            {/* Additional Info */}
            {!loading && stats && stats.monthlyActivity.length > 0 && (
                <div
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        marginTop: "2rem",
                    }}
                >
                    <h3
                        style={{
                            margin: "0 0 1rem 0",
                            color: "#333",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                        }}
                    >
                        Atividade dos Últimos Meses
                    </h3>
                    
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                            gap: "1rem",
                        }}
                    >
                        {stats.monthlyActivity.map((month, index) => (
                            <div
                                key={index}
                                style={{
                                    textAlign: "center",
                                    padding: "1rem",
                                    border: "1px solid #f0f0f0",
                                    borderRadius: "8px",
                                    background: "#fafafa",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#666",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {month.month}
                                </div>
                                <div
                                    style={{
                                        fontSize: "1.2rem",
                                        fontWeight: "bold",
                                        color: "#333",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {month.patients + month.appointments + month.records}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#999" }}>
                                    atividades
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;