import React, { useState, useEffect } from "react";
import axios from "axios";

interface Patient {
    id: number;
    nome_completo: string;
}
interface Doctor {
    id: number;
    name: string;
}
interface AppointmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    defaultDates?: { start: string; end: string };
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    defaultDates,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const pacienteRef = React.useRef<HTMLSelectElement>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patientId, setPatientId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && pacienteRef.current) {
            setTimeout(() => pacienteRef.current?.focus(), 200);
        }
        if (isOpen) {
            setErrorMsg(null);
            const token = localStorage.getItem("authToken");
            const headers = { Authorization: `Bearer ${token}` };
            axios
                .get("http://localhost:8000/api/patients", { headers })
                .then((response) => {
                    if (Array.isArray(response.data)) {
                        setPatients(response.data);
                    } else if (Array.isArray(response.data.data)) {
                        setPatients(response.data.data);
                    } else {
                        setPatients([]);
                    }
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        setErrorMsg("Não autorizado. Faça login novamente.");
                    } else {
                        setErrorMsg("Erro ao buscar pacientes.");
                    }
                });
            axios
                .get("http://localhost:8000/api/doctors", { headers })
                .then((response) => {
                    if (Array.isArray(response.data)) {
                        setDoctors(response.data);
                    } else if (Array.isArray(response.data.data)) {
                        setDoctors(response.data.data);
                    } else {
                        setDoctors([]);
                    }
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        setErrorMsg("Não autorizado. Faça login novamente.");
                    } else {
                        setErrorMsg("Erro ao buscar médicos.");
                    }
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Todas as variáveis e funções declaradas são utilizadas no componente, não há remoção necessária.
    const handleSubmit = async (event: React.FormEvent) => {
        setIsLoading(true);
        event.preventDefault();
        setErrorMsg(null);
        // Validação manual dos campos obrigatórios
        if (!patientId) {
            setErrorMsg("Selecione um paciente.");
            setIsLoading(false);
            return;
        }
        if (!doctorId) {
            setErrorMsg("Selecione um médico.");
            setIsLoading(false);
            return;
        }
        if (!defaultDates?.start || !defaultDates?.end) {
            setErrorMsg("Selecione o horário do agendamento.");
            setIsLoading(false);
            return;
        }
        try {
            const token = localStorage.getItem("authToken");
            const appointmentData = {
                patient_id: patientId,
                user_id: doctorId,
                data_hora_inicio: defaultDates?.start,
                data_hora_fim: defaultDates?.end,
                observacoes: observacoes,
            };
            await axios.post(
                "http://localhost:8000/api/appointments",
                appointmentData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            onSave();
            onClose();
            setIsLoading(false);
        } catch (error: unknown) {
            console.error("Erro ao criar agendamento:", error);
            if (isAxiosErrorWithMessage(error)) {
                setErrorMsg(
                    error.response?.data?.message ??
                        "Falha ao criar agendamento. Verifique os campos e tente novamente."
                );
            } else {
                setErrorMsg(
                    "Falha ao criar agendamento. Verifique os campos e tente novamente."
                );
            }
            setIsLoading(false);
        }
        // Type guard para erro do Axios
        interface AxiosErrorMessage {
            response?: {
                data?: {
                    message?: string;
                };
            };
        }

        function isAxiosErrorWithMessage(
            error: unknown
        ): error is AxiosErrorMessage {
            const err = error as AxiosErrorMessage;
            return (
                typeof error === "object" &&
                error !== null &&
                err.response !== undefined &&
                err.response.data !== undefined &&
                typeof err.response.data.message === "string"
            );
        }
    };

    return (
        <div
            className="modal-overlay"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1rem",
            }}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="modal-content"
                style={{
                    background: "white",
                    padding: "2rem",
                    borderRadius: "12px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                }}
            >
                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: "1.5rem",
                        textAlign: "center",
                        color: "#1976d2",
                    }}
                >
                    Novo Agendamento
                </h2>
                <p
                    style={{
                        fontSize: "0.95rem",
                        color: "#555",
                        marginBottom: "1.5rem",
                        background: "#f8f9fa",
                        padding: "0.75rem",
                        borderRadius: 6,
                        border: "1px solid #e9ecef",
                    }}
                >
                    <strong>Período:</strong> {defaultDates?.start} <br />{" "}
                    <strong>Até:</strong> {defaultDates?.end}
                </p>
                {errorMsg && (
                    <div
                        style={{
                            color: "#c00",
                            marginBottom: "1rem",
                            fontWeight: "bold",
                            padding: "0.75rem",
                            background: "#ffebee",
                            borderRadius: 6,
                            border: "1px solid #ffcdd2",
                        }}
                    >
                        {errorMsg}
                    </div>
                )}
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="paciente"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Paciente *
                        </label>
                        <select
                            id="paciente"
                            ref={pacienteRef}
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                        >
                            <option value="">Selecione um paciente</option>
                            {patients.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nome_completo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="medico"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Médico *
                        </label>
                        <select
                            id="medico"
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                        >
                            <option value="">Selecione um médico</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="observacoes"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Observações
                        </label>
                        <textarea
                            id="observacoes"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                                resize: "vertical",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: isLoading ? "#ccc" : "#1976d2",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                padding: "0.75rem",
                                fontWeight: "bold",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                fontSize: "1rem",
                                transition: "background 0.2s",
                            }}
                        >
                            {isLoading ? "Salvando..." : "Criar Agendamento"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                background: "#f5f5f5",
                                color: "#333",
                                border: "1px solid #ddd",
                                borderRadius: 6,
                                padding: "0.75rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "1rem",
                                transition: "background 0.2s",
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AppointmentFormModal;
