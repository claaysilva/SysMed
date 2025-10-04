import React, { useState } from "react";
import api from "../services/api";

const LoginQuickPage: React.FC = () => {
    const [status, setStatus] = useState<string>("");

    const handleGenerateToken = async () => {
        try {
            setStatus("Gerando token...");
            const response = await api.post("/generate-test-token");

            const { token, user } = response.data;

            // Salvar no localStorage
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));

            setStatus(`✅ Token criado e salvo! Usuário: ${user.email}`);

            // Redirecionar para relatórios após 2 segundos
            setTimeout(() => {
                window.location.href = "/reports";
            }, 2000);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Erro desconhecido";
            setStatus(`❌ Erro: ${errorMessage}`);
        }
    };

    const handleManualLogin = async () => {
        try {
            setStatus("Fazendo login...");
            const response = await api.post("/auth/login", {
                email: "admin@sysmed.com",
                password: "password",
            });

            if (response.data.access_token) {
                localStorage.setItem("authToken", response.data.access_token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
                setStatus("✅ Login realizado com sucesso!");

                // Redirecionar para relatórios
                setTimeout(() => {
                    window.location.href = "/reports";
                }, 1000);
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Erro no login";
            setStatus(`❌ Erro no login: ${errorMessage}`);
        }
    };

    const checkCurrentAuth = () => {
        const token = localStorage.getItem("authToken");
        const user = localStorage.getItem("user");

        if (token && user) {
            setStatus(`✅ Já autenticado. Token: ${token.substring(0, 20)}...`);
        } else {
            setStatus("❌ Não autenticado");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6">
                    Login Rápido - SysMed
                </h1>

                <div className="space-y-4">
                    <button
                        onClick={handleGenerateToken}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Gerar Token de Teste
                    </button>

                    <button
                        onClick={handleManualLogin}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Login Manual (admin@sysmed.com)
                    </button>

                    <button
                        onClick={checkCurrentAuth}
                        className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Verificar Autenticação Atual
                    </button>
                </div>

                {status && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                        <p className="text-sm">{status}</p>
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-500">
                    <p>
                        <strong>Para usar o sistema:</strong>
                    </p>
                    <p>1. Clique em "Gerar Token de Teste" ou</p>
                    <p>2. Clique em "Login Manual"</p>
                    <p>3. Será redirecionado para os relatórios</p>
                </div>
            </div>
        </div>
    );
};

export default LoginQuickPage;
