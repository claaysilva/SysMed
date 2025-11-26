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

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Usa o apiRequest (axios) já configurado com o token
            const { api } = await import("../services/api");
            const response = await api.get("/dashboard/statistics");
            if (response.data && response.data.success) {
                setStats(response.data.data);
            } else {
                throw new Error(
                    response.data?.message || "Erro ao buscar estatísticas"
                );
            }
        } catch (err: any) {
            setError(err.message || "Erro desconhecido");
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
        loading,
        error,
        refreshData,
    };
};
