import { useState, useCallback } from "react";
import { apiRequest } from "../services/api";
import { ApiErrorHandler } from "../utils/errorHandler";

export interface VitalSigns {
    pressao_arterial?: string;
    frequencia_cardiaca?: number;
    frequencia_respiratoria?: number;
    temperatura?: number;
    peso?: number;
    altura?: number;
    saturacao_oxigenio?: number;
}

export interface Patient {
    id: number;
    nome_completo: string;
    data_nascimento: string;
    cpf: string;
    telefone?: string;
}

export interface MedicalRecord {
    id: number;
    patient_id: number;
    user_id: number;
    appointment_id?: number;
    data_consulta: string;
    horario_consulta: string;
    tipo_consulta: "consulta" | "retorno" | "emergencia" | "exame" | "cirurgia";
    queixa_principal?: string;
    historia_doenca_atual?: string;
    historia_patologica_pregressa?: string;
    historia_familiar?: string;
    historia_social?: string;
    medicamentos_uso?: string;
    alergias?: string;
    sinais_vitais?: VitalSigns;
    exame_fisico_geral?: string;
    exame_fisico_especifico?: string;
    hipotese_diagnostica?: string;
    cid?: string;
    conduta?: string;
    prescricao?: string;
    exames_solicitados?: string;
    orientacoes?: string;
    retorno?: string;
    observacoes?: string;
    anexos?: string[];
    status: "rascunho" | "finalizado" | "assinado";
    created_at: string;
    updated_at: string;
    patient: {
        id: number;
        nome_completo: string;
        data_nascimento: string;
        cpf: string;
        telefone?: string;
    };
    user: {
        id: number;
        name: string;
    };
    appointment?: {
        id: number;
        data_hora_inicio: string;
        data_hora_fim: string;
    };
    status_label: string;
    tipo_consulta_label: string;
}

export interface CreateMedicalRecordData {
    patient_id: number;
    appointment_id?: number;
    data_consulta: string;
    horario_consulta: string;
    tipo_consulta: "consulta" | "retorno" | "emergencia" | "exame" | "cirurgia";
    queixa_principal?: string;
    historia_doenca_atual?: string;
    historia_patologica_pregressa?: string;
    historia_familiar?: string;
    historia_social?: string;
    medicamentos_uso?: string;
    alergias?: string;
    sinais_vitais?: VitalSigns;
    exame_fisico_geral?: string;
    exame_fisico_especifico?: string;
    hipotese_diagnostica?: string;
    cid?: string;
    conduta?: string;
    prescricao?: string;
    exames_solicitados?: string;
    orientacoes?: string;
    retorno?: string;
    observacoes?: string;
    status?: "rascunho" | "finalizado" | "assinado";
}

export const useMedicalRecords = () => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | null>(null);

    const fetchMedicalRecords = useCallback(
        async (filters?: {
            patient_id?: number;
            user_id?: number;
            status?: string;
            tipo_consulta?: string;
            data_inicio?: string;
            data_fim?: string;
            per_page?: number;
            search?: string;
            page?: number;
            sort_by?: string;
            sort_order?: "asc" | "desc";
        }) => {
            setLoading(true);
            setError(null);

            try {
                const activeFilters = filters
                    ? Object.fromEntries(
                          Object.entries(filters).filter(
                              ([, v]) =>
                                  v !== undefined && v !== null && v !== ""
                          )
                      )
                    : {};

                const response = await apiRequest.get<
                    import("../utils/errorHandler").ApiResponse<
                        MedicalRecord[]
                    > & {
                        meta?: {
                            current_page: number;
                            last_page: number;
                            per_page: number;
                            total: number;
                        };
                    }
                >("/medical-records", activeFilters);

                if (response && response.success) {
                    setMedicalRecords(response.data || []);
                    setPagination(response.meta || null);
                } else {
                    throw new Error(
                        response?.message || "Erro ao buscar prontuários"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao buscar prontuários");
                console.error("Erro ao buscar prontuários:", err);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getMedicalRecord = useCallback(
        async (id: number): Promise<MedicalRecord | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiRequest.get<
                    import("../utils/errorHandler").ApiResponse<MedicalRecord>
                >(`/medical-records/${id}`);

                if (response && response.success) {
                    return response.data as MedicalRecord;
                } else {
                    throw new Error(
                        response?.message || "Erro ao buscar prontuário"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao buscar prontuário");
                console.error("Erro ao buscar prontuário:", err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createMedicalRecord = useCallback(
        async (
            data: CreateMedicalRecordData
        ): Promise<MedicalRecord | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiRequest.post<
                    import("../utils/errorHandler").ApiResponse<MedicalRecord>
                >(`/medical-records`, data);

                if (response && response.success) {
                    return response.data as MedicalRecord;
                } else {
                    throw new Error(
                        response?.message || "Erro ao criar prontuário"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao criar prontuário");
                console.error("Erro ao criar prontuário:", err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const updateMedicalRecord = useCallback(
        async (
            id: number,
            data: Partial<CreateMedicalRecordData>
        ): Promise<MedicalRecord | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiRequest.put<
                    import("../utils/errorHandler").ApiResponse<MedicalRecord>
                >(`/medical-records/${id}`, data);

                if (response && response.success) {
                    return response.data as MedicalRecord;
                } else {
                    throw new Error(
                        response?.message || "Erro ao atualizar prontuário"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao atualizar prontuário");
                console.error("Erro ao atualizar prontuário:", err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deleteMedicalRecord = useCallback(
        async (id: number): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiRequest.delete<
                    import("../utils/errorHandler").ApiResponse
                >(`/medical-records/${id}`);

                if (response && response.success) {
                    return true;
                } else {
                    throw new Error(
                        response?.message || "Erro ao excluir prontuário"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao excluir prontuário");
                console.error("Erro ao excluir prontuário:", err);
                return false;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getMedicalRecordsByPatient = useCallback(
        async (
            patientId: number
        ): Promise<{ patient: Patient; records: MedicalRecord[] } | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiRequest.get<
                    import("../utils/errorHandler").ApiResponse<{
                        patient: Patient;
                        records: MedicalRecord[];
                    }>
                >(`/patients/${patientId}/medical-records`);

                if (response && response.success) {
                    return response.data as {
                        patient: Patient;
                        records: MedicalRecord[];
                    };
                } else {
                    throw new Error(
                        response?.message ||
                            "Erro ao buscar prontuários do paciente"
                    );
                }
            } catch (err: unknown) {
                const friendly = ApiErrorHandler.getErrorMessage(err);
                setError(friendly || "Erro ao buscar prontuários do paciente");
                console.error("Erro ao buscar prontuários do paciente:", err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        medicalRecords,
        loading,
        error,
        pagination,
        fetchMedicalRecords,
        getMedicalRecord,
        createMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        getMedicalRecordsByPatient,
    };
};
