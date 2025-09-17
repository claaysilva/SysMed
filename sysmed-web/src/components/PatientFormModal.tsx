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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showHelp, setShowHelp] = useState<Record<string, boolean>>({});

    // Função para alternar a exibição de ajuda
    const toggleHelp = (field: string) => {
        setShowHelp((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Dicas de formato para cada campo
    const helpTexts = {
        nome_completo:
            "Apenas letras, espaços, hífens, pontos e apóstrofes são permitidos. Ex: João Silva Santos",
        cpf: "Formato: 123.456.789-10 (será formatado automaticamente)",
        data_nascimento: "Data deve ser anterior a hoje e posterior a 1900",
        telefone:
            "Formato: (11) 99876-5432 ou (11) 3456-7890 (formatação automática)",
        endereco:
            "Ex: Rua das Flores, 123, Centro - São Paulo, SP. Mínimo 5 caracteres, máximo 500",
    };

    // Funções de validação e formatação
    const formatCpf = (value: string) => {
        const digits = value.replace(/\D/g, "");
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 10) {
            return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    };

    const validateCpf = (cpf: string): boolean => {
        const digits = cpf.replace(/\D/g, "");

        if (digits.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(digits)) return false;

        for (let t = 9; t < 11; t++) {
            let d = 0;
            for (let c = 0; c < t; c++) {
                d += parseInt(digits[c]) * (t + 1 - c);
            }
            d = ((10 * d) % 11) % 10;
            if (parseInt(digits[t]) !== d) return false;
        }

        return true;
    };

    const validateName = (name: string): boolean => {
        return (
            /^[a-zA-ZÀ-ÿĀ-žА-я\s\-.']+$/.test(name) && name.trim().length >= 2
        );
    };

    const validatePhone = (phone: string): boolean => {
        if (!phone.trim()) return true; // Campo opcional
        return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone);
    };

    const validateDate = (date: string): boolean => {
        if (!date) return false;
        const birthDate = new Date(date);
        const today = new Date();
        const minDate = new Date("1900-01-01");
        return birthDate < today && birthDate > minDate;
    };

    const validateField = (field: string, value: string) => {
        const errors: Record<string, string> = {};

        switch (field) {
            case "nome_completo":
                if (!value.trim()) {
                    errors.nome_completo = "O nome completo é obrigatório.";
                } else if (!validateName(value)) {
                    errors.nome_completo =
                        "O nome deve conter apenas letras, espaços, hífens, pontos e apóstrofes.";
                } else if (value.trim().length < 2) {
                    errors.nome_completo =
                        "O nome deve ter pelo menos 2 caracteres.";
                }
                break;
            case "cpf":
                if (!value.trim()) {
                    errors.cpf = "O CPF é obrigatório.";
                } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
                    errors.cpf = "O CPF deve estar no formato XXX.XXX.XXX-XX.";
                } else if (!validateCpf(value)) {
                    errors.cpf = "O CPF informado é inválido.";
                }
                break;
            case "data_nascimento":
                if (!value.trim()) {
                    errors.data_nascimento =
                        "A data de nascimento é obrigatória.";
                } else if (!validateDate(value)) {
                    errors.data_nascimento =
                        "A data de nascimento deve ser anterior a hoje e posterior a 1900.";
                }
                break;
            case "telefone":
                if (value.trim() && !validatePhone(value)) {
                    errors.telefone =
                        "O telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.";
                }
                break;
            case "endereco":
                if (value.trim() && value.trim().length < 5) {
                    errors.endereco =
                        "O endereço deve ter pelo menos 5 caracteres.";
                } else if (value.trim().length > 500) {
                    errors.endereco =
                        "O endereço não pode ter mais de 500 caracteres.";
                }
                break;
        }

        setFieldErrors((prev) => ({ ...prev, ...errors }));
        return Object.keys(errors).length === 0;
    };

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
        setError("");
        setFieldErrors({});
        setShowHelp({}); // Limpa todas as dicas quando o modal abre/fecha
    }, [patientToEdit, isOpen]); // Este código roda sempre que o modal abre/fecha ou um novo paciente é passado para edição.

    if (!isOpen) {
        return null;
    }

    // ALTERADO: A lógica de envio agora é mais inteligente.
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(""); // Limpa erros antigos
        setFieldErrors({});

        // Validação de todos os campos
        const isNameValid = validateField("nome_completo", nomeCompleto);
        const isCpfValid = validateField("cpf", cpf);
        const isDateValid = validateField("data_nascimento", dataNascimento);
        const isPhoneValid = validateField("telefone", telefone);
        const isAddressValid = validateField("endereco", endereco);

        if (
            !isNameValid ||
            !isCpfValid ||
            !isDateValid ||
            !isPhoneValid ||
            !isAddressValid
        ) {
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
        } catch (err: unknown) {
            console.error("Erro ao salvar paciente:", err);

            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err as {
                    response?: {
                        data?: {
                            errors?: Record<string, string[]>;
                            message?: string;
                        };
                    };
                };

                if (axiosError.response?.data?.errors) {
                    // Laravel validation errors
                    const validationErrors = axiosError.response.data.errors;
                    const newFieldErrors: Record<string, string> = {};

                    Object.keys(validationErrors).forEach((field) => {
                        newFieldErrors[field] = validationErrors[field][0];
                    });

                    setFieldErrors(newFieldErrors);
                } else if (axiosError.response?.data?.message) {
                    setError(axiosError.response.data.message);
                } else {
                    setError(
                        "Falha ao salvar paciente. Verifique os dados e tente novamente."
                    );
                }
            } else {
                setError(
                    "Falha ao salvar paciente. Verifique os dados e tente novamente."
                );
            }
        }
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpf(e.target.value);
        setCpf(formatted);
        if (formatted) {
            validateField("cpf", formatted);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setTelefone(formatted);
        if (formatted) {
            validateField("telefone", formatted);
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
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 6,
                            }}
                        >
                            <label
                                htmlFor="nome"
                                style={{
                                    fontWeight: "bold",
                                    marginRight: "0.5rem",
                                }}
                            >
                                Nome Completo *
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleHelp("nome_completo")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#1976d2",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                                title="Clique para ver dicas de formato"
                            >
                                ?
                            </button>
                        </div>
                        {showHelp.nome_completo && (
                            <div
                                style={{
                                    background: "#e3f2fd",
                                    border: "1px solid #1976d2",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                    fontSize: "0.875rem",
                                    color: "#1976d2",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {helpTexts.nome_completo}
                            </div>
                        )}
                        <input
                            id="nome"
                            type="text"
                            value={nomeCompleto}
                            onChange={(e) => {
                                setNomeCompleto(e.target.value);
                                if (e.target.value) {
                                    validateField(
                                        "nome_completo",
                                        e.target.value
                                    );
                                }
                            }}
                            required
                            placeholder="João Silva Santos"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: fieldErrors.nome_completo
                                    ? "1px solid #f44336"
                                    : "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = fieldErrors.nome_completo
                                    ? "#f44336"
                                    : "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = fieldErrors.nome_completo
                                    ? "#f44336"
                                    : "#ddd")
                            }
                        />
                        {fieldErrors.nome_completo && (
                            <div
                                style={{
                                    color: "#f44336",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {fieldErrors.nome_completo}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 6,
                            }}
                        >
                            <label
                                htmlFor="cpf"
                                style={{
                                    fontWeight: "bold",
                                    marginRight: "0.5rem",
                                }}
                            >
                                CPF *
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleHelp("cpf")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#1976d2",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                                title="Clique para ver dicas de formato"
                            >
                                ?
                            </button>
                        </div>
                        {showHelp.cpf && (
                            <div
                                style={{
                                    background: "#e3f2fd",
                                    border: "1px solid #1976d2",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                    fontSize: "0.875rem",
                                    color: "#1976d2",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {helpTexts.cpf}
                            </div>
                        )}
                        <input
                            id="cpf"
                            type="text"
                            value={cpf}
                            onChange={handleCpfChange}
                            required
                            maxLength={14}
                            placeholder="123.456.789-10"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: fieldErrors.cpf
                                    ? "1px solid #f44336"
                                    : "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = fieldErrors.cpf
                                    ? "#f44336"
                                    : "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = fieldErrors.cpf
                                    ? "#f44336"
                                    : "#ddd")
                            }
                        />
                        {fieldErrors.cpf && (
                            <div
                                style={{
                                    color: "#f44336",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {fieldErrors.cpf}
                            </div>
                        )}
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
                            onChange={(e) => {
                                setDataNascimento(e.target.value);
                                if (e.target.value) {
                                    validateField(
                                        "data_nascimento",
                                        e.target.value
                                    );
                                }
                            }}
                            required
                            max={new Date().toISOString().split("T")[0]}
                            min="1900-01-01"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: fieldErrors.data_nascimento
                                    ? "1px solid #f44336"
                                    : "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor =
                                    fieldErrors.data_nascimento
                                        ? "#f44336"
                                        : "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor =
                                    fieldErrors.data_nascimento
                                        ? "#f44336"
                                        : "#ddd")
                            }
                        />
                        {fieldErrors.data_nascimento && (
                            <div
                                style={{
                                    color: "#f44336",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {fieldErrors.data_nascimento}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 6,
                            }}
                        >
                            <label
                                htmlFor="telefone"
                                style={{
                                    fontWeight: "bold",
                                    marginRight: "0.5rem",
                                }}
                            >
                                Telefone
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleHelp("telefone")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#1976d2",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                                title="Clique para ver dicas de formato"
                            >
                                ?
                            </button>
                        </div>
                        {showHelp.telefone && (
                            <div
                                style={{
                                    background: "#e3f2fd",
                                    border: "1px solid #1976d2",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                    fontSize: "0.875rem",
                                    color: "#1976d2",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {helpTexts.telefone}
                            </div>
                        )}
                        <input
                            id="telefone"
                            type="text"
                            value={telefone}
                            onChange={handlePhoneChange}
                            maxLength={15}
                            placeholder="(11) 99876-5432"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: fieldErrors.telefone
                                    ? "1px solid #f44336"
                                    : "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = fieldErrors.telefone
                                    ? "#f44336"
                                    : "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = fieldErrors.telefone
                                    ? "#f44336"
                                    : "#ddd")
                            }
                        />
                        {fieldErrors.telefone && (
                            <div
                                style={{
                                    color: "#f44336",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {fieldErrors.telefone}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 6,
                            }}
                        >
                            <label
                                htmlFor="endereco"
                                style={{
                                    fontWeight: "bold",
                                    marginRight: "0.5rem",
                                }}
                            >
                                Endereço
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleHelp("endereco")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#1976d2",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                                title="Clique para ver dicas de formato"
                            >
                                ?
                            </button>
                        </div>
                        {showHelp.endereco && (
                            <div
                                style={{
                                    background: "#e3f2fd",
                                    border: "1px solid #1976d2",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                    fontSize: "0.875rem",
                                    color: "#1976d2",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {helpTexts.endereco}
                            </div>
                        )}
                        <textarea
                            id="endereco"
                            value={endereco}
                            onChange={(e) => {
                                setEndereco(e.target.value);
                                if (e.target.value) {
                                    validateField("endereco", e.target.value);
                                }
                            }}
                            rows={3}
                            maxLength={500}
                            placeholder="Rua das Flores, 123, Centro - São Paulo, SP"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 6,
                                border: fieldErrors.endereco
                                    ? "1px solid #f44336"
                                    : "1px solid #ddd",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                                resize: "vertical",
                                fontFamily: "inherit",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLTextAreaElement
                                ).style.borderColor = fieldErrors.endereco
                                    ? "#f44336"
                                    : "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLTextAreaElement
                                ).style.borderColor = fieldErrors.endereco
                                    ? "#f44336"
                                    : "#ddd")
                            }
                        />
                        {fieldErrors.endereco && (
                            <div
                                style={{
                                    color: "#f44336",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {fieldErrors.endereco}
                            </div>
                        )}
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
