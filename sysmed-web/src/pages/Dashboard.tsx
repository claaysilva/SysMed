import React, { useState, useEffect } from "react";
import Card, { StatsCard } from "../components/Card";
import { StatusBadge } from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

interface DashboardStats {
    totalPacientes: number;
    pacientesAtivos: number;
    agendamentosHoje: number;
    agendamentosSemana: number;
    faturamentoMes: number;
    tendenciaPacientes: number;
    tendenciaAgendamentos: number;
}

interface AgendamentoRecente {
    id: number;
    paciente: string;
    horario: string;
    status: "agendado" | "concluido" | "cancelado";
    tipo: string;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [agendamentosRecentes, setAgendamentosRecentes] = useState<
        AgendamentoRecente[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Simular delay de API
                await new Promise((resolve) => setTimeout(resolve, 800));

                // Dados mockados baseados na imagem
                setStats({
                    totalPacientes: 3,
                    pacientesAtivos: 2,
                    agendamentosHoje: 0,
                    agendamentosSemana: 2,
                    faturamentoMes: 2450.0,
                    tendenciaPacientes: 12.5,
                    tendenciaAgendamentos: 8.3,
                });

                setAgendamentosRecentes([
                    {
                        id: 1,
                        paciente: "Maria Silva Santos",
                        horario: "09:00",
                        status: "agendado",
                        tipo: "Consulta Rotina",
                    },
                    {
                        id: 2,
                        paciente: "João Carlos Oliveira",
                        horario: "14:00",
                        status: "agendado",
                        tipo: "Retorno",
                    },
                ]);

                console.log("Dashboard carregado com sucesso!");
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner
                    size="large"
                    message="Carregando dashboard..."
                />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Bem-vindo */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Bem-vindo, Admin Sistema!{" "}
                    <span className="text-gray-600">(Administrador)</span>
                </h1>
                <p className="text-gray-600">
                    Aqui está um resumo da sua clínica hoje.
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Pacientes"
                    value={stats?.totalPacientes.toString() || "0"}
                    subtitle={`${stats?.pacientesAtivos} ativos`}
                    icon="👥"
                    trend={{
                        value: stats?.tendenciaPacientes || 0,
                        direction: "up",
                        label: "vs mês passado",
                    }}
                    color="blue"
                />

                <StatsCard
                    title="Consultas Hoje"
                    value={stats?.agendamentosHoje.toString() || "0"}
                    subtitle={`${stats?.agendamentosSemana} esta semana`}
                    icon="📅"
                    trend={{
                        value: stats?.tendenciaAgendamentos || 0,
                        direction: "up",
                        label: "vs semana passada",
                    }}
                    color="green"
                />

                <StatsCard
                    title="Prontuários"
                    value="2"
                    subtitle="Documentos ativos"
                    icon="📋"
                    trend={{
                        value: 5.2,
                        direction: "up",
                        label: "novos esta semana",
                    }}
                    color="yellow"
                />

                <StatsCard
                    title="Faturamento Mensal"
                    value={`R$ ${
                        stats?.faturamentoMes.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                        }) || "0,00"
                    }`}
                    subtitle="Receita do mês"
                    icon="💰"
                    trend={{
                        value: 15.2,
                        direction: "up",
                        label: "vs mês passado",
                    }}
                    color="purple"
                />
            </div>

            {/* Conteúdo Principal - Grid Responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agendamentos de Hoje */}
                <Card
                    title="Próximos Agendamentos"
                    subtitle={`${agendamentosRecentes.length} consultas programadas`}
                >
                    <div className="space-y-4">
                        {agendamentosRecentes.length > 0 ? (
                            agendamentosRecentes.map((agendamento) => (
                                <div
                                    key={agendamento.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm font-bold text-blue-600 min-w-[60px]">
                                            {agendamento.horario}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {agendamento.paciente}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {agendamento.tipo}
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge
                                        status={agendamento.status}
                                        size="small"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-4">📅</div>
                                <p>Nenhum agendamento para hoje</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link
                            to="/schedule"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Ver toda agenda →
                        </Link>
                    </div>
                </Card>

                {/* Ações Rápidas */}
                <Card
                    title="Ações Rápidas"
                    subtitle="Acesso rápido às funcionalidades"
                >
                    <div className="grid grid-cols-1 gap-3">
                        <Link
                            to="/patients"
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <span className="text-xl">👤</span>
                            <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                    Gerenciar Pacientes
                                </div>
                                <div className="text-sm text-gray-500">
                                    Cadastrar e editar pacientes
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/schedule"
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <span className="text-xl">📅</span>
                            <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                    Agendar Consulta
                                </div>
                                <div className="text-sm text-gray-500">
                                    Nova consulta ou retorno
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/medical-records"
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <span className="text-xl">📋</span>
                            <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                    Prontuários
                                </div>
                                <div className="text-sm text-gray-500">
                                    Consultar histórico médico
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/reports"
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <span className="text-xl">📊</span>
                            <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                    Relatórios
                                </div>
                                <div className="text-sm text-gray-500">
                                    Estatísticas e análises
                                </div>
                            </div>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Avisos e Status do Sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Avisos */}
                <Card
                    title="Avisos e Notificações"
                    subtitle="Informações importantes"
                >
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <div className="font-medium text-yellow-800">
                                    Sistema funcionando normalmente
                                </div>
                                <div className="text-sm text-yellow-700">
                                    Todas as funcionalidades estão operacionais
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-xl">ℹ️</span>
                            <div>
                                <div className="font-medium text-blue-800">
                                    Performance otimizada
                                </div>
                                <div className="text-sm text-blue-700">
                                    Sistema com cache e otimizações ativas
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Status do Sistema */}
                <Card
                    title="Status do Sistema"
                    subtitle="Monitoramento em tempo real"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium">
                                    Backend API
                                </span>
                            </div>
                            <span className="text-sm text-green-600">
                                Online
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium">
                                    Banco de Dados
                                </span>
                            </div>
                            <span className="text-sm text-green-600">
                                Conectado
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium">
                                    Cache Sistema
                                </span>
                            </div>
                            <span className="text-sm text-green-600">
                                Ativo
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                                Último backup
                            </span>
                            <span className="text-sm text-gray-500">
                                Hoje, 03:00
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
