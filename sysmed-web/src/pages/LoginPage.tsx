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

            alert("Login realizado com sucesso!");

            navigate("/");
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Falha no login. Verifique suas credenciais.");
        }
    };

    return (
        <div>
            <h2>Login - SysMed</h2>
            {/* 4. Conecte a função handleSubmit ao evento onSubmit do formulário */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    {/* 5. Conecte os inputs aos seus respectivos estados. */}
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email} // O valor do input é o que está no estado 'email'
                        onChange={(e) => setEmail(e.target.value)} // Quando o usuário digita, atualize o estado.
                    />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password} // O valor do input é o que está no estado 'password'
                        onChange={(e) => setPassword(e.target.value)} // Quando o usuário digita, atualize o estado.
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
};

export default LoginPage;
