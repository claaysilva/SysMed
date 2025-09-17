import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { RichTextEditor } from "@mantine/rte";
import { Box } from "@mantine/core";

interface Patient {
    id: number;
    nome_completo: string;
}
interface RecordEntry {
    id: number;
    conteudo: string;
    created_at: string;
    user: { name: string };
}

const PatientDetailPage: React.FC = () => {
    const userRole = localStorage.getItem("userRole");
    const [entryError, setEntryError] = useState<string>("");
    // Mantine RTE não precisa de ref para uso básico
    const { patientId } = useParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [entries, setEntries] = useState<RecordEntry[]>([]);
    const [newEntryContent, setNewEntryContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };
        axios
            .get(`http://localhost:8000/api/patients/${patientId}`, { headers })
            .then((res) => setPatient(res.data));
        axios
            .get(
                `http://localhost:8000/api/patients/${patientId}/record-entries`,
                { headers }
            )
            .then((res) => setEntries(res.data));
    }, [patientId]);

    const handleSaveEntry = async () => {
        if (!newEntryContent.trim()) {
            setEntryError("O conteúdo do prontuário é obrigatório.");
            return;
        }
        setEntryError("");
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(
                "http://localhost:8000/api/record-entries",
                {
                    patient_id: patientId,
                    conteudo: newEntryContent,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setNewEntryContent("");
            // Atualiza histórico
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(
                `http://localhost:8000/api/patients/${patientId}/record-entries`,
                { headers }
            );
            setEntries(res.data);
        } catch {
            alert("Erro ao salvar entrada do prontuário.");
        }
        setLoading(false);
    };

    if (!patient) return <div>Carregando...</div>;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
            <h2
                style={{
                    marginTop: 0,
                    marginBottom: "1.5rem",
                    textAlign: "center",
                    color: "#1976d2",
                }}
            >
                Prontuário de: {patient.nome_completo}
            </h2>
            <hr style={{ marginBottom: "2rem", border: "1px solid #e0e0e0" }} />

            {(userRole === "medico" || userRole === "admin") && (
                <div
                    style={{
                        background: "white",
                        padding: "1.5rem",
                        borderRadius: 8,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                        marginBottom: "2rem",
                    }}
                >
                    <h3 style={{ marginTop: 0, color: "#43a047" }}>
                        Nova Entrada
                    </h3>
                    <Box maw={700} mx="auto">
                        <RichTextEditor
                            value={newEntryContent}
                            onChange={setNewEntryContent}
                            style={{ marginBottom: "1rem" }}
                        />
                        {entryError && (
                            <div
                                style={{
                                    color: "#c00",
                                    marginBottom: "1rem",
                                    fontWeight: "bold",
                                    padding: "0.5rem",
                                    background: "#ffebee",
                                    borderRadius: 4,
                                    border: "1px solid #ffcdd2",
                                }}
                            >
                                {entryError}
                            </div>
                        )}
                    </Box>
                    <button
                        onClick={handleSaveEntry}
                        disabled={loading}
                        style={{
                            background: loading ? "#ccc" : "#43a047",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            padding: "0.75rem 1.5rem",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "background 0.2s",
                        }}
                    >
                        {loading ? "Salvando..." : "Salvar Nova Entrada"}
                    </button>
                </div>
            )}

            <div
                style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: 8,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
            >
                <h3 style={{ marginTop: 0, color: "#1976d2" }}>
                    Histórico do Prontuário
                </h3>
                {entries.length === 0 ? (
                    <p
                        style={{
                            color: "#666",
                            textAlign: "center",
                            padding: "2rem",
                        }}
                    >
                        Nenhuma entrada encontrada no prontuário.
                    </p>
                ) : (
                    entries.map((entry) => (
                        <div
                            key={entry.id}
                            style={{
                                border: "1px solid #e0e0e0",
                                padding: "1.5rem",
                                margin: "1rem 0",
                                borderRadius: 8,
                                background: "#fafafa",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "1rem",
                                    borderBottom: "1px solid #e0e0e0",
                                    paddingBottom: "0.5rem",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontWeight: "bold",
                                        color: "#1976d2",
                                    }}
                                >
                                    <strong>Data:</strong>{" "}
                                    {new Date(entry.created_at).toLocaleString(
                                        "pt-BR"
                                    )}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        color: "#43a047",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <strong>Médico:</strong> {entry.user.name}
                                </p>
                            </div>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: entry.conteudo,
                                }}
                                style={{
                                    lineHeight: 1.6,
                                    color: "#333",
                                }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientDetailPage;
