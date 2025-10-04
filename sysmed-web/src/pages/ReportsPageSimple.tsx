import React from "react";
import {
    UsersIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

const ReportsPageSimple: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Relatórios e Estatísticas
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Total de Pacientes
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                150
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <UsersIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Consultas Hoje
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                12
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Receita Mensal
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                R$ 15.400
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Taxa de Comparecimento
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                85%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Página de Relatórios Simplificada
                </h2>
                <p className="text-gray-600">
                    Esta é uma versão simplificada da página de relatórios para
                    testar se o problema está nos ícones, no hook useReports ou
                    em outra parte do código.
                </p>
            </div>
        </div>
    );
};

export default ReportsPageSimple;
