import { useState, useEffect, useCallback } from "react";
import { useLocalCache } from "./usePerformance";
import { apiRequest } from "../services/api";

// Tipos para os dados do sistema
// Removed unused Patient interface

// Removed unused Appointment interface (kept types lean)

interface DashboardStats {
    total_patients: number;
    total_appointments: number;
    appointments_today: number;
    pending_appointments: number;
    revenue_month: number;
    growth_percentage: number;
}

interface RecentActivity {
    type: "appointment" | "patient" | "medical_record";
    description: string;
    timestamp: string;
    user?: string;
}

// Hook para dados de pacientes com cache e busca otimizada
export const usePatients = (
    searchTerm?: string,
    page: number = 1,
    perPage: number = 20
) => {
    const cacheKey = `patients_${searchTerm || "all"}_${page}_${perPage}`;

    const fetchPatients = useCallback(async () => {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        if (searchTerm) {
            params.append("search", searchTerm);
        }

        const response = await apiRequest.get(`/patients?${params}`);
        return response;
    }, [searchTerm, page, perPage]);

    return useLocalCache(cacheKey, fetchPatients, {
        ttl: 10, // Cache por 10 minutos
        dependencies: [searchTerm, page, perPage],
    });
};

// Hook para consultas com filtros e cache
export const useAppointments = (
    filters: {
        status?: string;
        date?: string;
        doctor_id?: number;
    } = {},
    page: number = 1
) => {
    const cacheKey = `appointments_${JSON.stringify(filters)}_${page}`;

    const fetchAppointments = useCallback(async () => {
        const params = new URLSearchParams({
            page: page.toString(),
        });

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await apiRequest.get(`/appointments?${params}`);
        return response;
    }, [filters, page]);

    return useLocalCache(cacheKey, fetchAppointments, {
        ttl: 5, // Cache por 5 minutos (dados mais dinâmicos)
        dependencies: [filters, page],
    });
};

// Hook para estatísticas do dashboard com cache
export const useDashboardStats = () => {
    const fetchStats = useCallback(async () => {
        const response = await apiRequest.get("/dashboard/statistics");
        return response as DashboardStats;
    }, []);

    return useLocalCache("dashboard_stats", fetchStats, {
        ttl: 5, // Cache por 5 minutos
    });
};

// Hook para atividades recentes
export const useRecentActivity = () => {
    const fetchActivity = useCallback(async () => {
        const response = await apiRequest.get("/dashboard/recent-activity");
        return response as RecentActivity[];
    }, []);

    return useLocalCache("recent_activity", fetchActivity, {
        ttl: 2, // Cache por 2 minutos
    });
};

// Hook para médicos com cache longo (dados mais estáticos)
export const useDoctors = () => {
    const fetchDoctors = useCallback(async () => {
        const response = await apiRequest.get("/doctors");
        return response;
    }, []);

    return useLocalCache("doctors", fetchDoctors, {
        ttl: 15, // Cache por 15 minutos
    });
};

// Hook para prontuários médicos de um paciente
export const useMedicalRecords = (patientId: number) => {
    const cacheKey = `medical_records_${patientId}`;

    const fetchRecords = useCallback(async () => {
        const response = await apiRequest.get(
            `/patients/${patientId}/medical-records`
        );
        return response;
    }, [patientId]);

    return useLocalCache(cacheKey, fetchRecords, {
        ttl: 10, // Cache por 10 minutos
        dependencies: [patientId],
    });
};

// Hook para relatórios com cache longo
export const useReports = (type: "appointments" | "financial" | "patients") => {
    const cacheKey = `reports_${type}`;

    const fetchReport = useCallback(async () => {
        const response = await apiRequest.get(`/reports/${type}`);
        return response;
    }, [type]);

    return useLocalCache(cacheKey, fetchReport, {
        ttl: 30, // Cache por 30 minutos (dados analíticos)
        dependencies: [type],
    });
};

// Hook para horários disponíveis com cache curto
export const useAvailableSlots = (doctorId: number, date: string) => {
    const cacheKey = `available_slots_${doctorId}_${date}`;

    const fetchSlots = useCallback(async () => {
        const params = new URLSearchParams({
            doctor_id: doctorId.toString(),
            date: date,
        });

        const response = await apiRequest.get(
            `/appointments/available-slots?${params}`
        );
        return response;
    }, [doctorId, date]);

    return useLocalCache(cacheKey, fetchSlots, {
        ttl: 5, // Cache por 5 minutos
        dependencies: [doctorId, date],
    });
};

// Hook para notificações em tempo real (sem cache)
export const useNotifications = () => {
    const [data, setData] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiRequest.get("/notifications");
            setData(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao carregar notificações"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Atualizar notificações a cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return { data, loading, error, refresh: fetchNotifications };
};

// Hook para invalidação de cache específico
export const useCacheInvalidation = () => {
    const invalidateCache = useCallback((pattern?: string) => {
        if (pattern) {
            // Remover chaves que contêm o padrão
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.includes(`cache_${pattern}`)) {
                    localStorage.removeItem(key);
                    localStorage.removeItem(`${key}_timestamp`);
                }
            });
        } else {
            // Limpar todo o cache
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith("cache_")) {
                    localStorage.removeItem(key);
                }
            });
        }
    }, []);

    const invalidatePatients = useCallback(() => {
        invalidateCache("patients");
    }, [invalidateCache]);

    const invalidateAppointments = useCallback(() => {
        invalidateCache("appointments");
        invalidateCache("dashboard"); // Estatísticas também dependem de consultas
    }, [invalidateCache]);

    const invalidateDashboard = useCallback(() => {
        invalidateCache("dashboard");
        invalidateCache("recent_activity");
    }, [invalidateCache]);

    return {
        invalidateCache,
        invalidatePatients,
        invalidateAppointments,
        invalidateDashboard,
    };
};

// Hook para sincronização de dados quando há mudanças
export const useDataSync = () => {
    const { invalidatePatients, invalidateAppointments, invalidateDashboard } =
        useCacheInvalidation();

    const syncAfterPatientChange = useCallback(() => {
        invalidatePatients();
        invalidateDashboard();
    }, [invalidatePatients, invalidateDashboard]);

    const syncAfterAppointmentChange = useCallback(() => {
        invalidateAppointments();
        invalidateDashboard();
    }, [invalidateAppointments, invalidateDashboard]);

    const syncAfterMedicalRecordChange = useCallback((patientId: number) => {
        // Invalida apenas o cache específico do paciente
        localStorage.removeItem(`cache_medical_records_${patientId}`);
        localStorage.removeItem(`cache_medical_records_${patientId}_timestamp`);
    }, []);

    return {
        syncAfterPatientChange,
        syncAfterAppointmentChange,
        syncAfterMedicalRecordChange,
    };
};

export default {
    usePatients,
    useAppointments,
    useDashboardStats,
    useRecentActivity,
    useDoctors,
    useMedicalRecords,
    useReports,
    useAvailableSlots,
    useNotifications,
    useCacheInvalidation,
    useDataSync,
};
