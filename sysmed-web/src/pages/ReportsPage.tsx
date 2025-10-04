import React, { useState, useEffect } from "react";
import {
    UsersIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    FunnelIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useReports } from "../hooks/useReports";

interface ReportFilters {
    start_date?: string;
    end_date?: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: "positive" | "negative" | "neutral";
    icon: React.ElementType;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    color,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change !== undefined && (
                        <div
                            className={`flex items-center mt-2 text-sm ${
                                changeType === "positive"
                                    ? "text-green-600"
                                    : changeType === "negative"
                                    ? "text-red-600"
                                    : "text-gray-600"
                            }`}
                        >
                            {changeType === "positive" && (
                                <ArrowUpIcon className="w-4 h-4 mr-1" />
                            )}
                            {changeType === "negative" && (
                                <ArrowDownIcon className="w-4 h-4 mr-1" />
                            )}
                            <span>{Math.abs(change)}% vs mês anterior</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
};

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    children,
    className = "",
}) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {title}
            </h3>
            {children}
        </div>
    );
};

interface FilterBarProps {
    onFilterChange: (filters: ReportFilters) => void;
    loading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, loading }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Set default dates (current month)
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
    }, []);

    const handleApplyFilters = () => {
        onFilterChange({
            start_date: startDate,
            end_date: endDate,
        });
    };

    const handleQuickFilter = (period: string) => {
        const now = new Date();
        let start: Date;
        let end = new Date();

        switch (period) {
            case "today":
                start = new Date();
                break;
            case "week":
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case "quarter": {
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            }
            case "year":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        setStartDate(startStr);
        setEndDate(endStr);

        onFilterChange({
            start_date: startStr,
            end_date: endStr,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                        Filtros:
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleQuickFilter("today")}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => handleQuickFilter("week")}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        7 dias
                    </button>
                    <button
                        onClick={() => handleQuickFilter("month")}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Este mês
                    </button>
                    <button
                        onClick={() => handleQuickFilter("quarter")}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Trimestre
                    </button>
                    <button
                        onClick={() => handleQuickFilter("year")}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Este ano
                    </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-gray-400">até</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleApplyFilters}
                        disabled={loading}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                        {loading && (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        )}
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const { dashboardStats, loading, error, fetchDashboardStats, clearError } =
        useReports();

    const [refreshing, setRefreshing] = useState(false);

    const handleFilterChange = async (filters: ReportFilters) => {
        setRefreshing(true);
        try {
            await fetchDashboardStats(filters);
        } finally {
            setRefreshing(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value || 0);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("pt-BR").format(value || 0);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Erro ao carregar relatórios
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => {
                                            clearError();
                                            fetchDashboardStats();
                                        }}
                                        className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading && !dashboardStats) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                >
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Relatórios e Estatísticas
                    </h1>
                    <p className="text-gray-600">
                        Acompanhe o desempenho da sua clínica em tempo real
                    </p>
                </div>

                {/* Filters */}
                <FilterBar
                    onFilterChange={handleFilterChange}
                    loading={refreshing}
                />

                {dashboardStats && (
                    <>
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total de Pacientes"
                                value={formatNumber(
                                    dashboardStats.overview.totalPatients
                                )}
                                change={12}
                                changeType="positive"
                                icon={UsersIcon}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Consultas Hoje"
                                value={formatNumber(
                                    dashboardStats.overview.appointmentsToday
                                )}
                                change={8}
                                changeType="positive"
                                icon={CalendarIcon}
                                color="bg-green-500"
                            />
                            <StatCard
                                title="Receita do Mês"
                                value={formatCurrency(
                                    dashboardStats.revenue.totalThisMonth
                                )}
                                change={15}
                                changeType="positive"
                                icon={CurrencyDollarIcon}
                                color="bg-purple-500"
                            />
                            <StatCard
                                title="Taxa de Comparecimento"
                                value={`${dashboardStats.performance.attendanceRate}%`}
                                change={5}
                                changeType="positive"
                                icon={ChartBarIcon}
                                color="bg-indigo-500"
                            />
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                title="Novos Pacientes (Mês)"
                                value={formatNumber(
                                    dashboardStats.overview.newPatientsThisMonth
                                )}
                                icon={UsersIcon}
                                color="bg-cyan-500"
                            />
                            <StatCard
                                title="Consultas da Semana"
                                value={formatNumber(
                                    dashboardStats.overview.appointmentsThisWeek
                                )}
                                icon={CalendarIcon}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Prontuários Criados"
                                value={formatNumber(
                                    dashboardStats.overview.recordsThisMonth
                                )}
                                icon={DocumentTextIcon}
                                color="bg-amber-500"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <ChartCard title="Consultas por Status">
                                <div className="space-y-3">
                                    {dashboardStats.appointments.byStatus.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                    {item.status ||
                                                        "Não informado"}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {formatNumber(item.total)}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </ChartCard>

                            <ChartCard title="Consultas por Tipo">
                                <div className="space-y-3">
                                    {dashboardStats.appointments.byType
                                        .slice(0, 5)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-sm font-medium text-gray-700">
                                                    {item.tipo_consulta ||
                                                        "Não informado"}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {formatNumber(item.total)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </ChartCard>
                        </div>

                        {/* Performance Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Produtividade por Médico">
                                <div className="space-y-3">
                                    {dashboardStats.performance.doctorProductivity
                                        .slice(0, 5)
                                        .map((doctor, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-sm font-medium text-gray-700">
                                                    {doctor.name}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {formatNumber(
                                                        doctor.appointments
                                                    )}{" "}
                                                    consultas
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </ChartCard>

                            <ChartCard title="Performance Geral">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            Taxa de Comparecimento
                                        </span>
                                        <span className="text-sm font-bold text-green-600">
                                            {
                                                dashboardStats.performance
                                                    .attendanceRate
                                            }
                                            %
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            Tempo Médio de Consulta
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {
                                                dashboardStats.performance
                                                    .avgConsultationTime
                                            }{" "}
                                            min
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            Valor Médio por Consulta
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {formatCurrency(
                                                dashboardStats.revenue
                                                    .averagePerAppointment
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            Satisfação do Paciente
                                        </span>
                                        <span className="text-sm font-bold text-yellow-600">
                                            {
                                                dashboardStats.performance
                                                    .patientSatisfaction
                                            }
                                            /5.0 ⭐
                                        </span>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
