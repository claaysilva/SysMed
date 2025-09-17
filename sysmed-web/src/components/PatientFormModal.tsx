import React, { useState, useEffect } from "react"; // NOVO: Importamos o useEffect
import axios from "axios";

// NOVO: Definimos o tipo de um Paciente para usar no componente
interface Patient {
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    telefone?: string;
    endereco?: string;
}

interface PatientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    patientToEdit?: Patient | null; // Esta prop receberá os dados do paciente para edição
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    patientToEdit,
}) => {
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [endereco, setEndereco] = useState("");
    const [error, setError] = useState("");

    // NOVO: Este bloco de código é a chave para a edição.
    // Ele "escuta" por mudanças no `patientToEdit`.
    useEffect(() => {
        if (isOpen && patientToEdit) {
            // Se o modal abriu e recebeu um paciente para editar, preenchemos os campos.
            setNomeCompleto(patientToEdit.nome_completo);
            setDataNascimento(patientToEdit.data_nascimento);
            setCpf(patientToEdit.cpf);
            setTelefone(patientToEdit.telefone || "");
            setEndereco(patientToEdit.endereco || "");
        } else {
            // Se não, limpamos os campos (para o modo de criação).
            setNomeCompleto("");
            setDataNascimento("");
            setCpf("");
            setTelefone("");
            setEndereco("");
        }
    }, [patientToEdit, isOpen]); // Este código roda sempre que o modal abre/fecha ou um novo paciente é passado para edição.

    if (!isOpen) {
        return null;
    }

    // ALTERADO: A lógica de envio agora é mais inteligente.
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(""); // Limpa erros antigos
        // Validação manual dos campos obrigatórios
        if (!nomeCompleto.trim()) {
            setError("O nome completo é obrigatório.");
            return;
        }
        if (!dataNascimento.trim()) {
            setError("A data de nascimento é obrigatória.");
            return;
        }
        if (!cpf.trim()) {
            setError("O CPF é obrigatório.");
            return;
        }
        const token = localStorage.getItem("authToken");
        const patientData = {
            nome_completo: nomeCompleto,
            data_nascimento: dataNascimento,
            cpf,
            telefone,
            endereco,
        };

        try {
            if (patientToEdit) {
                await axios.put(
                    `http://localhost:8000/api/patients/${patientToEdit.id}`,
                    patientData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                await axios.post(
                    "http://localhost:8000/api/patients",
                    patientData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }
            onSave();
            onClose();
        } catch (err) {
            console.error("Erro ao salvar paciente:", err);
            if (err instanceof Error && err.message) {
                setError(err.message);
            } else if (
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof err.response === "object" &&
                err.response !== null &&
                "data" in err.response &&
                typeof err.response.data === "object" &&
                err.response.data !== null &&
                "message" in err.response.data
            ) {
                setError(String(err.response.data.message));
            } else {
                setError(
                    "Falha ao salvar paciente. Verifique os dados e tente novamente."
                );
            }
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
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    maxHeight: "90vh",
                    overflowY: "auto",
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
                    {patientToEdit ? "Editar Paciente" : "Novo Paciente"}
                </h2>

                {error && (
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
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="nome"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Nome Completo *
                        </label>
                        <input
                            id="nome"
                            type="text"
                            value={nomeCompleto}
                            onChange={(e) => setNomeCompleto(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#ddd")
                            }
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="cpf"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            CPF *
                        </label>
                        <input
                            id="cpf"
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#ddd")
                            }
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="dataNascimento"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Data de Nascimento *
                        </label>
                        <input
                            id="dataNascimento"
                            type="date"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#ddd")
                            }
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="telefone"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Telefone
                        </label>
                        <input
                            id="telefone"
                            type="text"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#ddd")
                            }
                        />
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="endereco"
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: "bold",
                            }}
                        >
                            Endereço
                        </label>
                        <textarea
                            id="endereco"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
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
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLTextAreaElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLTextAreaElement
                                ).style.borderColor = "#ddd")
                            }
                        />
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                background: "#1976d2",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                padding: "0.75rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "1rem",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                ((
                                    e.target as HTMLButtonElement
                                ).style.background = "#1565c0")
                            }
                            onMouseLeave={(e) =>
                                ((
                                    e.target as HTMLButtonElement
                                ).style.background = "#1976d2")
                            }
                        >
                            {patientToEdit ? "Atualizar" : "Criar"} Paciente
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
                            onMouseEnter={(e) =>
                                ((
                                    e.target as HTMLButtonElement
                                ).style.background = "#eeeeee")
                            }
                            onMouseLeave={(e) =>
                                ((
                                    e.target as HTMLButtonElement
                                ).style.background = "#f5f5f5")
                            }
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientFormModal;
