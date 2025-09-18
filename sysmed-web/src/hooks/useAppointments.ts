import { useState, useCallback } from "react";

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

    const getAuthHeaders = () => {
        const token = localStorage.getItem("authToken");
        console.log("Token encontrado:", token ? "Sim" : "Não");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };
    };

    const fetchAppointments = useCallback(
        async (filters: AppointmentFilters = {}) => {
            try {
                setLoading(true);
                setError(null);
                console.log(
                    "Iniciando busca de agendamentos com filtros:",
                    filters
                );

                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        params.append(key, value.toString());
                    }
                });

                const url = `http://localhost:8000/api/appointments${
                    params.toString() ? `?${params.toString()}` : ""
                }`;
                console.log("URL da requisição:", url);

                const response = await fetch(url, {
                    headers: getAuthHeaders(),
                });

                console.log(
                    "Resposta da API:",
                    response.status,
                    response.statusText
                );

                if (!response.ok) {
                    throw new Error("Erro ao carregar consultas");
                }

                const data = await response.json();
                console.log("Dados recebidos:", data);

                if (data.success) {
                    setAppointments(data.data);
                    setPagination(data.pagination);
                    console.log("Agendamentos carregados:", data.data.length);
                } else {
                    throw new Error(
                        data.message || "Erro ao carregar consultas"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "Erro desconhecido";
                setError(errorMessage);
                console.error("Erro ao buscar consultas:", err);
                console.error(
                    "Stack trace:",
                    err instanceof Error ? err.stack : "N/A"
                );
                console.error("Tipo do erro:", typeof err);
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

            const response = await fetch(
                "http://localhost:8000/api/appointments",
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(appointmentData),
                }
            );

            console.log(
                "Resposta da criação:",
                response.status,
                response.statusText
            );
            const data = await response.json();
            console.log("Dados da resposta:", data);

            if (!response.ok) {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors)
                        .flat()
                        .join(", ");
                    throw new Error(errorMessages);
                }
                throw new Error(data.message || "Erro ao criar consulta");
            }

            if (data.success) {
                // Refresh appointments list
                console.log(
                    "Agendamento criado com sucesso, atualizando lista..."
                );
                await fetchAppointments();
                return data.data;
            } else {
                throw new Error(data.message || "Erro ao criar consulta");
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
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

            const response = await fetch(
                `http://localhost:8000/api/appointments/${id}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(appointmentData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors)
                        .flat()
                        .join(", ");
                    throw new Error(errorMessages);
                }
                throw new Error(data.message || "Erro ao atualizar consulta");
            }

            if (data.success) {
                // Update local state
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id ? data.data : appointment
                    )
                );
                return data.data;
            } else {
                throw new Error(data.message || "Erro ao atualizar consulta");
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
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

            const response = await fetch(
                `http://localhost:8000/api/appointments/${id}/status`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao atualizar status");
            }

            if (data.success) {
                // Update local state
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id
                            ? { ...appointment, status }
                            : appointment
                    )
                );
                return data.data;
            } else {
                throw new Error(data.message || "Erro ao atualizar status");
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `http://localhost:8000/api/appointments/${id}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao cancelar consulta");
            }

            if (data.success) {
                // Update local state
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id
                            ? { ...appointment, status: "cancelado" }
                            : appointment
                    )
                );
            } else {
                throw new Error(data.message || "Erro ao cancelar consulta");
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
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

            const response = await fetch(
                `http://localhost:8000/api/appointments/available-slots?doctor_id=${doctorId}&date=${date}`,
                {
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erro ao carregar horários disponíveis"
                );
            }

            if (data.success) {
                return data.data;
            } else {
                throw new Error(
                    data.message || "Erro ao carregar horários disponíveis"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
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

            const response = await fetch(
                `http://localhost:8000/api/appointments/doctor/${doctorId}/schedule?start_date=${startDate}&end_date=${endDate}`,
                {
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erro ao carregar agenda do médico"
                );
            }

            if (data.success) {
                return data.data;
            } else {
                throw new Error(
                    data.message || "Erro ao carregar agenda do médico"
                );
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
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
