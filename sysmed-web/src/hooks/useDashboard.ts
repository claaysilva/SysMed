import { useState, useEffect } from "react";

interface DashboardStats {
    overview: {
        totalPatients: number;
        appointmentsToday: number;
        appointmentsThisWeek: number;
        appointmentsThisMonth: number;
        totalMedicalRecords: number;
        pendingMedicalRecords: number;
        totalReports: number;
    };
    growth: {
        newPatientsThisMonth: number;
        newPatientsThisWeek: number;
        medicalRecordsThisMonth: number;
        reportsThisMonth: number;
    };
    appointments: {
        byStatus: {
            agendada: number;
            confirmada: number;
            realizada: number;
            cancelada: number;
        };
        upcoming: Array<{
            id: number;
            data_consulta: string;
            horario: string;
            patient: {
                nome_completo: string;
            };
            user: {
                name: string;
            };
        }>;
    };
    recentReports: Array<{
        id: number;
        titulo: string;
        created_at: string;
        patient: {
            nome_completo: string;
        };
    }>;
    monthlyActivity: Array<{
        month: string;
        patients: number;
        appointments: number;
        records: number;
    }>;
}

interface RecentActivity {
    type: string;
    title: string;
    description: string;
    created_at: string;
    user: string;
    icon: string;
    color: string;
}

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Token não encontrado");
            }

            // Buscar estatísticas
            const statsResponse = await fetch(
                "http://localhost:8000/api/dashboard/statistics",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!statsResponse.ok) {
                console.error(
                    "Stats response not ok:",
                    statsResponse.status,
                    statsResponse.statusText
                );
                throw new Error("Erro ao buscar estatísticas");
            }

            const statsData = await statsResponse.json();
            console.log("Stats data received:", statsData);

            if (!statsData.success) {
                console.error("Stats data success is false:", statsData);
                throw new Error(statsData.message || "Resposta indica erro");
            }

            setStats(statsData.data);

            // Buscar atividades recentes
            const activityResponse = await fetch(
                "http://localhost:8000/api/dashboard/recent-activity?limit=8",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                setRecentActivity(activityData.data);
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
            console.error("Erro ao buscar dados do dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        fetchDashboardData();
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        stats,
        recentActivity,
        loading,
        error,
        refreshData,
    };
};
