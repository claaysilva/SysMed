import { useState, useEffect } from "react";
import api from "../services/api";

export interface Appointment {
    id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    status: string;
    tipo_consulta: string;
    valor?: number;
    observacoes?: string;
    patient: {
        id: number;
        nome_completo: string;
        email?: string;
        telefone?: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export interface Patient {
    id: number;
    nome_completo: string;
    email?: string;
    telefone?: string;
    data_nascimento?: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    overview: {
        totalPatients: number;
        newPatientsThisMonth: number;
        totalAppointments: number;
        appointmentsToday: number;
        appointmentsThisWeek: number;
        appointmentsThisMonth: number;
        totalMedicalRecords: number;
        recordsThisMonth: number;
    };
    appointments: {
        byStatus: Array<{ status: string; total: number }>;
        byType: Array<{ tipo_consulta: string; total: number }>;
        byDoctor: Array<{ doctor_name: string; total: number }>;
    };
    revenue: {
        totalThisMonth: number;
        averagePerAppointment: number;
        byMonth: Array<{
            year: number;
            month: number;
            appointments: number;
            revenue: number;
        }>;
    };
    performance: {
        attendanceRate: number;
        avgConsultationTime: number;
        patientSatisfaction: number;
        doctorProductivity: Array<{ name: string; appointments: number }>;
    };
}

export interface ReportFilters {
    start_date?: string;
    end_date?: string;
    doctor_id?: number;
    status?: string;
    type?: string;
}

export interface AppointmentReport {
    appointments: Appointment[];
    summary: {
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        totalRevenue: number;
        averageValue: number;
    };
    period: {
        start: string;
        end: string;
    };
}

export interface FinancialReport {
    dailyRevenue: Array<{
        date: string;
        appointments: number;
        total_revenue: number;
        avg_revenue: number;
    }>;
    summary: {
        totalRevenue: number;
        totalAppointments: number;
        averagePerDay: number;
        averagePerAppointment: number;
        bestDay: {
            date: string;
            appointments: number;
            total_revenue: number;
            avg_revenue: number;
        } | null;
        revenueByDoctor: Array<{ name: string; revenue: number }>;
        revenueByType: Array<{ tipo_consulta: string; revenue: number }>;
    };
    period: {
        start: string;
        end: string;
    };
}

export interface PatientReport {
    patients: Patient[];
    summary: {
        totalPatients: number;
        newPatients: number;
        activePatients: number;
        averageAge: number;
        genderDistribution: Record<string, number>;
        appointmentFrequency: Array<{ patient: string; appointments: number }>;
    };
    period: {
        start: string;
        end: string;
    };
}

export const useReports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dashboard Stats
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
        null
    );

    const fetchDashboardStats = async (filters?: ReportFilters) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters?.start_date)
                params.append("start_date", filters.start_date);
            if (filters?.end_date) params.append("end_date", filters.end_date);

            const response = await api.get(
                `/reports/dashboard-stats?${params.toString()}`
            );

            if (response.data.success) {
                setDashboardStats(response.data.data);
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Erro ao carregar estatísticas"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao carregar estatísticas";
            setError(errorMessage);
            console.error("Erro ao carregar estatísticas:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Appointments Report
    const fetchAppointmentsReport = async (
        filters?: ReportFilters
    ): Promise<AppointmentReport> => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters?.start_date)
                params.append("start_date", filters.start_date);
            if (filters?.end_date) params.append("end_date", filters.end_date);
            if (filters?.doctor_id)
                params.append("doctor_id", filters.doctor_id.toString());
            if (filters?.status) params.append("status", filters.status);
            if (filters?.type) params.append("type", filters.type);

            const response = await api.get(
                `/api/reports/appointments?${params.toString()}`
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message ||
                        "Erro ao gerar relatório de consultas"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao gerar relatório de consultas";
            setError(errorMessage);
            console.error("Erro no relatório de consultas:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Financial Report
    const fetchFinancialReport = async (
        filters?: ReportFilters
    ): Promise<FinancialReport> => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters?.start_date)
                params.append("start_date", filters.start_date);
            if (filters?.end_date) params.append("end_date", filters.end_date);

            const response = await api.get(
                `/api/reports/financial?${params.toString()}`
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message ||
                        "Erro ao gerar relatório financeiro"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao gerar relatório financeiro";
            setError(errorMessage);
            console.error("Erro no relatório financeiro:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Patients Report
    const fetchPatientsReport = async (
        filters?: ReportFilters
    ): Promise<PatientReport> => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters?.start_date)
                params.append("start_date", filters.start_date);
            if (filters?.end_date) params.append("end_date", filters.end_date);

            const response = await api.get(
                `/api/reports/patients?${params.toString()}`
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message ||
                        "Erro ao gerar relatório de pacientes"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      "Erro ao gerar relatório de pacientes";
            setError(errorMessage);
            console.error("Erro no relatório de pacientes:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-load dashboard stats on mount
    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return {
        // States
        loading,
        error,
        dashboardStats,

        // Actions
        fetchDashboardStats,
        fetchAppointmentsReport,
        fetchFinancialReport,
        fetchPatientsReport,

        // Utils
        clearError: () => setError(null),
    };
};
