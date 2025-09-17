import { useState, useEffect } from "react";
import { api } from "../services/api";

interface Patient {
    id: number;
    nome_completo: string;
    email?: string;
    telefone?: string;
    data_nascimento?: string;
    cpf?: string;
    endereco?: string;
    created_at?: string;
    updated_at?: string;
}

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

            setPatients(response.data.data || response.data);
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
            return response.data.data || response.data;
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
