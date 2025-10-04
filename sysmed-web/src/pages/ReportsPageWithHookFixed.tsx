import React, { useEffect, useCallback } from "react";
import { useReports } from "../hooks/useReports";

const ReportsPageWithHook: React.FC = () => {
    const { dashboardStats, loading, error, fetchDashboardStats } =
        useReports();

    const loadData = useCallback(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
                <p>Carregando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
                <p className="text-red-600">Erro: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

            {dashboardStats ? (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">
                            Visão Geral
                        </h2>
                        <p>
                            Total de Pacientes:{" "}
                            {dashboardStats.overview.totalPatients}
                        </p>
                        <p>
                            Consultas Hoje:{" "}
                            {dashboardStats.overview.appointmentsToday}
                        </p>
                        <p>
                            Consultas Esta Semana:{" "}
                            {dashboardStats.overview.appointmentsThisWeek}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">Receita</h2>
                        <p>
                            Receita Este Mês: R${" "}
                            {dashboardStats.revenue.totalThisMonth}
                        </p>
                        <p>
                            Média por Consulta: R${" "}
                            {dashboardStats.revenue.averagePerAppointment}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">
                            Performance
                        </h2>
                        <p>
                            Taxa de Comparecimento:{" "}
                            {dashboardStats.performance.attendanceRate}%
                        </p>
                        <p>
                            Tempo Médio de Consulta:{" "}
                            {dashboardStats.performance.avgConsultationTime} min
                        </p>
                    </div>
                </div>
            ) : (
                <p>Nenhum dado disponível</p>
            )}
        </div>
    );
};

export default ReportsPageWithHook;
