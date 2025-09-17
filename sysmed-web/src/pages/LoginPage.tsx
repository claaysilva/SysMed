import React, { useState } from "react"; // 1. Importe o useState
import axios from "axios"; // Importaremos para o próximo passo
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    // 2. Crie "estados" para armazenar o email e a senha que o usuário digita.
    // A variável 'email' guarda o valor, e 'setEmail' é a função para atualizá-lo.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // 3. Crie uma função para ser chamada quando o formulário for enviado.
    const handleSubmit = async (event: React.FormEvent) => {
        // Previne o comportamento padrão do formulário, que é recarregar a página.
        event.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                }
            );

            console.log("Resposta do servidor:", response.data);

            localStorage.setItem("authToken", response.data.token);
            if (response.data.user && response.data.user.role) {
                localStorage.setItem("userRole", response.data.user.role);
            }
            if (response.data.user && response.data.user.name) {
                localStorage.setItem("userName", response.data.user.name);
            }
            alert("Login realizado com sucesso!");
            navigate("/");
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Falha no login. Verifique suas credenciais.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1976d2, #1565c0)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1rem",
            }}
        >
            <div
                style={{
                    background: "white",
                    padding: "3rem",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    maxWidth: "400px",
                    width: "100%",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h2
                        style={{
                            color: "#1976d2",
                            marginBottom: "0.5rem",
                            fontSize: "2rem",
                            fontWeight: "bold",
                        }}
                    >
                        SysMed
                    </h2>
                    <p style={{ color: "#666", fontSize: "1rem" }}>
                        Sistema de Gestão Médica
                    </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="email"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "bold",
                                color: "#333",
                            }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                borderRadius: "8px",
                                border: "2px solid #e0e0e0",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                                outline: "none",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#e0e0e0")
                            }
                            placeholder="Digite seu email"
                        />
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label
                            htmlFor="password"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "bold",
                                color: "#333",
                            }}
                        >
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                borderRadius: "8px",
                                border: "2px solid #e0e0e0",
                                fontSize: "1rem",
                                transition: "border-color 0.2s",
                                outline: "none",
                            }}
                            onFocus={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#1976d2")
                            }
                            onBlur={(e) =>
                                ((
                                    e.target as HTMLInputElement
                                ).style.borderColor = "#e0e0e0")
                            }
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            background:
                                "linear-gradient(135deg, #1976d2, #1565c0)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.875rem",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.transform =
                                "translateY(-2px)";
                            (e.target as HTMLButtonElement).style.boxShadow =
                                "0 6px 16px rgba(25,118,210,0.4)";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.transform =
                                "translateY(0)";
                            (e.target as HTMLButtonElement).style.boxShadow =
                                "0 4px 12px rgba(25,118,210,0.3)";
                        }}
                    >
                        Entrar no Sistema
                    </button>
                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "1.5rem",
                        fontSize: "0.875rem",
                        color: "#666",
                    }}
                >
                    <p>Acesso restrito a profissionais autorizados</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
