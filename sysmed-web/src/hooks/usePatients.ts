import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { ApiResponse } from "../utils/errorHandler";

export interface Patient {
    id: number;
    nome_completo: string;
    email?: string;
    telefone?: string;
    data_nascimento?: string;
    cpf?: string;
    endereco?: string;
    created_at?: string;
    updated_at?: string;
    status?: "ativo" | "inativo";
}

type PatientsListEnvelope = {
    current_page: number;
    data: Patient[];
    total: number;
    per_page: number;
    last_page: number;
};

type PatientsIndexResponse =
    | ApiResponse<PatientsListEnvelope | Patient[]>
    | Patient[];
type PatientShowResponse = ApiResponse<Patient> | Patient;

interface UsePatients {
    patients: Patient[];
    loading: boolean;
    error: string | null;
    searchPatients: (search?: string) => Promise<void>;
    getPatient: (id: number) => Promise<Patient | null>;
}

export const usePatients = (): UsePatients => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchPatients = async (search?: string) => {
        try {
            setLoading(true);
            setError(null);

            const params = search ? { search } : {};
            const response = await api.get("/patients", { params });
            const payload: PatientsIndexResponse = response.data;

            if (Array.isArray(payload)) {
                setPatients(payload as Patient[]);
                return;
            }

            if (
                payload &&
                typeof payload === "object" &&
                "success" in payload
            ) {
                const data = payload.data;
                if (Array.isArray(data)) {
                    setPatients(data);
                    return;
                }
                if (
                    data &&
                    Array.isArray((data as PatientsListEnvelope).data)
                ) {
                    setPatients((data as PatientsListEnvelope).data);
                    return;
                }
            }

            // Fallback seguro
            setPatients([]);
        } catch (err) {
            console.error("Erro ao buscar pacientes:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Erro ao buscar pacientes";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getPatient = async (id: number): Promise<Patient | null> => {
        try {
            const response = await api.get(`/patients/${id}`);
            const payload: PatientShowResponse = response.data;

            if (
                payload &&
                typeof payload === "object" &&
                "success" in payload
            ) {
                return payload.data ?? null;
            }

            // Se não vier envelope padronizado
            return (payload as Patient) ?? null;
        } catch (err) {
            console.error("Erro ao buscar paciente:", err);
            return null;
        }
    };

    useEffect(() => {
        searchPatients();
    }, []);

    return {
        patients,
        loading,
        error,
        searchPatients,
        getPatient,
    };
};
