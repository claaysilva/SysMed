import { useState, useCallback } from "react";
import axios from "axios";

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

    const API_BASE_URL = "http://localhost:8000/api";

    const getAuthHeaders = () => {
        const token = localStorage.getItem("auth_token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };
    };

    const fetchMedicalRecords = useCallback(
        async (filters?: {
            patient_id?: number;
            user_id?: number;
            status?: string;
            tipo_consulta?: string;
            data_inicio?: string;
            data_fim?: string;
            per_page?: number;
        }) => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (filters) {
                    Object.entries(filters).forEach(([key, value]) => {
                        if (value) params.append(key, value.toString());
                    });
                }

                const response = await axios.get(
                    `${API_BASE_URL}/medical-records?${params.toString()}`,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    setMedicalRecords(response.data.data);
                } else {
                    throw new Error(
                        response.data.message || "Erro ao buscar prontuários"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    (err as Error).message || "Erro ao buscar prontuários";
                setError(errorMessage);
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
                const response = await axios.get(
                    `${API_BASE_URL}/medical-records/${id}`,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Erro ao buscar prontuário"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    (err as Error).message || "Erro ao buscar prontuário";
                setError(errorMessage);
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
                const response = await axios.post(
                    `${API_BASE_URL}/medical-records`,
                    data,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Erro ao criar prontuário"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    (err as Error).message || "Erro ao criar prontuário";
                setError(errorMessage);
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
                const response = await axios.put(
                    `${API_BASE_URL}/medical-records/${id}`,
                    data,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Erro ao atualizar prontuário"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    (err as Error).message || "Erro ao atualizar prontuário";
                setError(errorMessage);
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
                const response = await axios.delete(
                    `${API_BASE_URL}/medical-records/${id}`,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    return true;
                } else {
                    throw new Error(
                        response.data.message || "Erro ao excluir prontuário"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    (err as Error).message || "Erro ao excluir prontuário";
                setError(errorMessage);
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
                const response = await axios.get(
                    `${API_BASE_URL}/patients/${patientId}/medical-records`,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message ||
                            "Erro ao buscar prontuários do paciente"
                    );
                }
            } catch (err: unknown) {
                const errorMessage =
                    (err as Error).message ||
                    "Erro ao buscar prontuários do paciente";
                setError(errorMessage);
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
        fetchMedicalRecords,
        getMedicalRecord,
        createMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        getMedicalRecordsByPatient,
    };
};
