import { useState, useCallback } from "react";
import { apiRequest } from "../services/api";
import { ApiErrorHandler } from "../utils/errorHandler";
import type { ApiResponse } from "../utils/errorHandler";

interface Appointment {
    id: number;
    patient_id: number;
    user_id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    status: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
    observacoes?: string;
    tipo_consulta?: "consulta" | "retorno" | "emergencia" | "exame";
    valor?: number;
    patient: {
        id: number;
        nome_completo: string;
        telefone: string;
        cpf: string;
    };
    user: {
        id: number;
        name: string;
    };
    // Computed properties from backend
    status_label?: string;
    status_color?: string;
    duration_in_minutes?: number;
    can_be_cancelled?: boolean;
    can_be_confirmed?: boolean;
    is_upcoming?: boolean;
    is_today?: boolean;
}

interface AppointmentFilters {
    doctor_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    patient_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface CreateAppointmentData {
    patient_id: number;
    user_id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    observacoes?: string;
    tipo_consulta?: "consulta" | "retorno" | "emergencia" | "exame";
    valor?: number;
}

interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
    status?: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
}

export const useAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    // Tipos de resposta da API
    type ListAppointmentsResponse = ApiResponse<Appointment[]> & {
        pagination?: PaginationInfo;
    };
    type AppointmentItemResponse = ApiResponse<Appointment>;
    type AvailableSlotsResponse = ApiResponse<string[]>;
    type DoctorScheduleResponse = ApiResponse<Appointment[]>;

    // Headers e token já são gerenciados por interceptors em api.ts

    const fetchAppointments = useCallback(
        async (filters: AppointmentFilters = {}) => {
            try {
                setLoading(true);
                setError(null);
                console.log(
                    "Iniciando busca de agendamentos com filtros:",
                    filters
                );

                // Limpar filtros vazios
                const activeFilters = Object.fromEntries(
                    Object.entries(filters).filter(
                        ([, v]) => v !== undefined && v !== null && v !== ""
                    )
                );

                const data = await apiRequest.get<ListAppointmentsResponse>(
                    "/appointments",
                    activeFilters
                );
                console.log("Dados recebidos:", data);

                if (data?.success) {
                    const items = Array.isArray(data.data) ? data.data : [];
                    setAppointments(items);
                    setPagination(data.pagination ?? null);
                    console.log("Agendamentos carregados:", items.length);
                } else {
                    throw new Error(
                        data?.message || "Erro ao carregar consultas"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao carregar consultas");
                console.error("Erro ao buscar consultas:", err);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createAppointment = async (
        appointmentData: CreateAppointmentData
    ): Promise<Appointment> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Criando agendamento:", appointmentData);

            const data = await apiRequest.post<AppointmentItemResponse>(
                "/appointments",
                appointmentData
            );

            console.log("Dados da resposta:", data);

            if (data?.success) {
                // Refresh appointments list
                console.log(
                    "Agendamento criado com sucesso, atualizando lista..."
                );
                await fetchAppointments();
                return data.data as Appointment;
            } else {
                throw new Error(data?.message || "Erro ao criar consulta");
            }
        } catch (err: unknown) {
            const friendly = ApiErrorHandler.getErrorMessage(err);
            setError(friendly || "Erro ao criar consulta");
            console.error("Erro detalhado:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateAppointment = async (
        id: number,
        appointmentData: UpdateAppointmentData
    ): Promise<Appointment> => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiRequest.put<AppointmentItemResponse>(
                `/appointments/${id}`,
                appointmentData
            );

            if (data?.success) {
                // Update local state
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id
                            ? (data.data as Appointment) || appointment
                            : appointment
                    )
                );
                return data.data as Appointment;
            } else {
                throw new Error(data?.message || "Erro ao atualizar consulta");
            }
        } catch (err: unknown) {
            const friendly = ApiErrorHandler.getErrorMessage(err);
            setError(friendly || "Erro ao atualizar consulta");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentStatus = async (
        id: number,
        status: Appointment["status"]
    ): Promise<Appointment> => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiRequest.patch<AppointmentItemResponse>(
                `/appointments/${id}/status`,
                { status }
            );

            if (data?.success) {
                // Update local state
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id
                            ? { ...appointment, status }
                            : appointment
                    )
                );
                return data.data as Appointment;
            } else {
                throw new Error(data?.message || "Erro ao atualizar status");
            }
        } catch (err: unknown) {
            const friendly = ApiErrorHandler.getErrorMessage(err);
            setError(friendly || "Erro ao atualizar status");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiRequest.delete<ApiResponse>(
                `/appointments/${id}`
            );

            if (data?.success) {
                // Update local state
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id
                            ? { ...appointment, status: "cancelado" }
                            : appointment
                    )
                );
            } else {
                throw new Error(data?.message || "Erro ao cancelar consulta");
            }
        } catch (err: unknown) {
            const friendly = ApiErrorHandler.getErrorMessage(err);
            setError(friendly || "Erro ao cancelar consulta");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAvailableSlots = async (
        doctorId: number,
        date: string
    ): Promise<string[]> => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiRequest.get<AvailableSlotsResponse>(
                `/appointments/available-slots`,
                { doctor_id: doctorId, date }
            );

            if (data?.success) {
                return data.data as string[];
            } else {
                throw new Error(
                    data?.message || "Erro ao carregar horários disponíveis"
                );
            }
        } catch (err: unknown) {
            const friendly = ApiErrorHandler.getErrorMessage(err);
            setError(friendly || "Erro ao carregar horários disponíveis");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getDoctorSchedule = async (
        doctorId: number,
        startDate: string,
        endDate: string
    ): Promise<Appointment[]> => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiRequest.get<DoctorScheduleResponse>(
                `/appointments/doctor/${doctorId}/schedule`,
                { start_date: startDate, end_date: endDate }
            );

            if (data?.success) {
                return data.data as Appointment[];
            } else {
                throw new Error(
                    data?.message || "Erro ao carregar agenda do médico"
                );
            }
        } catch (err: unknown) {
            const friendly = ApiErrorHandler.getErrorMessage(err);
            setError(friendly || "Erro ao carregar agenda do médico");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        appointments,
        loading,
        error,
        pagination,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        getAvailableSlots,
        getDoctorSchedule,
        clearError: () => setError(null),
    };
};
