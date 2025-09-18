import React, { useState, useCallback, useEffect } from "react";
import { Calendar, Clock, Users, Search, Plus, Filter } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Button from "../components/Button";
import Modal from "../components/Modal";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentCalendar from "../components/AppointmentCalendar";

type AppointmentType = {
    id: number;
    patient_id: number;
    user_id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    status: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
    observacoes?: string;
    tipo_consulta?: "consulta" | "retorno" | "emergencia" | "exame";
    valor?: number;
    patient: {
        id: number;
        nome_completo: string;
        telefone?: string;
    };
    user?: {
        id: number;
        name: string;
    };
};

const AppointmentsPage: React.FC = () => {
    const { appointments, loading, error, fetchAppointments } =
        useAppointments();

    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [showForm, setShowForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AppointmentType | null>(null);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        date: "",
        doctor_id: "",
    });

    const loadAppointments = useCallback(() => {
        const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== "")
        );
        fetchAppointments(activeFilters);
    }, [filters, fetchAppointments]);

    useEffect(() => {
        // Carrega agendamentos na primeira montagem do componente
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Array vazio para executar apenas uma vez

    const handleCreateAppointment = () => {
        setSelectedAppointment(null);
        setShowForm(true);
    };

    const handleEditAppointment = (appointment: AppointmentType) => {
        setSelectedAppointment(appointment);
        setShowForm(true);
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        setSelectedAppointment(null);
        await loadAppointments();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedAppointment(null);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            agendado: "bg-yellow-100 text-yellow-800",
            confirmado: "bg-blue-100 text-blue-800",
            realizado: "bg-green-100 text-green-800",
            cancelado: "bg-red-100 text-red-800",
            faltou: "bg-gray-100 text-gray-800",
        };
        return (
            colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        );
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            agendado: "Agendado",
            confirmado: "Confirmado",
            realizado: "Realizado",
            cancelado: "Cancelado",
            faltou: "Faltou",
        };
        return labels[status as keyof typeof labels] || status;
    };

    if (loading && appointments.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Agendamentos
                    </h1>
                    <p className="text-gray-600">
                        Gerencie as consultas e agendamentos
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={handleCreateAppointment}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Consulta
                    </Button>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total de Consultas
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {appointments.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Agendadas
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    appointments.filter(
                                        (a) => a.status === "agendado"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Realizadas
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    appointments.filter(
                                        (a) => a.status === "realizado"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Filter className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Canceladas
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    appointments.filter(
                                        (a) => a.status === "cancelado"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros e Controles */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    status: e.target.value,
                                }))
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="agendado">Agendado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="realizado">Realizado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    date: e.target.value,
                                }))
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={loadAppointments} variant="outline">
                            Filtrar
                        </Button>
                    </div>
                </div>

                {/* Controles de Visualização */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                viewMode === "list"
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                viewMode === "calendar"
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Calendário
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {viewMode === "list" ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paciente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment) => (
                                    <tr
                                        key={appointment.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {
                                                        appointment.patient
                                                            .nome_completo
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {
                                                        appointment.patient
                                                            .telefone
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {format(
                                                    new Date(
                                                        appointment.data_hora_inicio
                                                    ),
                                                    "dd/MM/yyyy",
                                                    { locale: ptBR }
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {format(
                                                    new Date(
                                                        appointment.data_hora_inicio
                                                    ),
                                                    "HH:mm"
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                    new Date(
                                                        appointment.data_hora_fim
                                                    ),
                                                    "HH:mm"
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 capitalize">
                                                {appointment.tipo_consulta ||
                                                    "Consulta"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                    appointment.status
                                                )}`}
                                            >
                                                {getStatusLabel(
                                                    appointment.status
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {appointment.valor
                                                ? `R$ ${Number(
                                                      appointment.valor
                                                  ).toFixed(2)}`
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEditAppointment(
                                                            appointment
                                                        )
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <AppointmentCalendar
                    appointments={appointments}
                    onAppointmentClick={handleEditAppointment}
                    onDateSelect={(date) => {
                        const formattedDate = format(date, "yyyy-MM-dd");
                        setFilters((prev) => ({
                            ...prev,
                            date: formattedDate,
                        }));
                        loadAppointments();
                    }}
                />
            )}

            {/* Modal do Formulário */}
            {showForm && (
                <Modal
                    isOpen={showForm}
                    title={
                        selectedAppointment
                            ? "Editar Consulta"
                            : "Nova Consulta"
                    }
                    onClose={handleFormCancel}
                >
                    <AppointmentForm
                        appointment={selectedAppointment || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AppointmentsPage;
