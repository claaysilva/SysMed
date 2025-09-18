import React from "react";
import { useAppointments } from "../hooks/useAppointments";

const DebugAppointments: React.FC = () => {
    const {
        appointments,
        loading,
        error,
        fetchAppointments,
        createAppointment,
    } = useAppointments();

    const getTokenInfo = () => {
        const token = localStorage.getItem("authToken");
        return {
            exists: !!token,
            length: token?.length || 0,
            preview: token
                ? `${token.substring(0, 10)}...${token.substring(
                      token.length - 10
                  )}`
                : "N/A",
        };
    };

    const tokenInfo = getTokenInfo();

    const handleSetValidToken = () => {
        // Definir o token válido que acabamos de gerar
        const validToken =
            "21|6RRsPWOGeBio252vaImem6PAGFzENIgGQDEdtz9C2f82678f";
        localStorage.setItem("authToken", validToken);
        alert("Token válido definido! Teste a busca agora.");
    };

    const handleTestFetch = async () => {
        console.log("Testando busca de agendamentos...");
        try {
            await fetchAppointments();
            console.log("Busca realizada com sucesso!");
        } catch (err) {
            console.error("Erro na busca:", err);
        }
    };

    const handleTestCreate = async () => {
        console.log("Testando criação de agendamento...");
        try {
            const testData = {
                patient_id: 1,
                user_id: 1,
                data_hora_inicio: "2025-09-18T10:00:00",
                data_hora_fim: "2025-09-18T11:00:00",
                observacoes: "Teste de agendamento",
                tipo_consulta: "consulta" as const,
                valor: 100.0,
            };
            await createAppointment(testData);
            console.log("Agendamento criado com sucesso!");
        } catch (err) {
            console.error("Erro na criação:", err);
        }
    };

    return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Debug Agendamentos</h3>

            <div className="space-y-2 mb-4">
                <p>
                    <strong>Total de agendamentos:</strong>{" "}
                    {appointments.length}
                </p>
                <p>
                    <strong>Loading:</strong> {loading ? "Sim" : "Não"}
                </p>
                <p>
                    <strong>Error:</strong> {error || "Nenhum"}
                </p>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium mb-2">Debug Token</h4>
                <div className="space-y-1 text-sm">
                    <p>
                        <strong>Token:</strong>{" "}
                        {tokenInfo.exists ? "Existe" : "Não existe"}
                    </p>
                    <p>
                        <strong>Comprimento:</strong> {tokenInfo.length}
                    </p>
                    <p>
                        <strong>Preview:</strong> {tokenInfo.preview}
                    </p>
                </div>
                <button
                    onClick={handleSetValidToken}
                    className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                    Definir Token Válido
                </button>
            </div>

            <div className="space-x-2">
                <button
                    onClick={handleTestFetch}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Testar Busca
                </button>
                <button
                    onClick={handleTestCreate}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Testar Criação
                </button>
            </div>

            <div className="mt-4">
                <h4 className="font-medium">Agendamentos encontrados:</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(appointments, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default DebugAppointments;
