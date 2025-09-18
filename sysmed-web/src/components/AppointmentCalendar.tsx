import React, { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
    id: number;
    patient_id: number;
    user_id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    status: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
    tipo_consulta?: "consulta" | "retorno" | "emergencia" | "exame";
    observacoes?: string;
    patient: {
        id: number;
        nome_completo: string;
        telefone?: string;
    };
}

interface AppointmentCalendarProps {
    appointments: Appointment[];
    onDateSelect?: (date: Date) => void;
    onAppointmentClick?: (appointment: Appointment) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
    appointments,
    onDateSelect,
    onAppointmentClick,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter((appointment) => {
            const appointmentDate = parseISO(appointment.data_hora_inicio);
            return isSameDay(appointmentDate, date);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmado":
                return "bg-blue-500 hover:bg-blue-600";
            case "realizado":
                return "bg-green-500 hover:bg-green-600";
            case "cancelado":
                return "bg-red-500 hover:bg-red-600";
            case "agendado":
                return "bg-yellow-500 hover:bg-yellow-600";
            case "faltou":
                return "bg-gray-500 hover:bg-gray-600";
            default:
                return "bg-gray-500 hover:bg-gray-600";
        }
    };

    const getTypeColor = (tipo?: string) => {
        switch (tipo) {
            case "consulta":
                return "bg-blue-500 hover:bg-blue-600";
            case "retorno":
                return "bg-green-500 hover:bg-green-600";
            case "emergencia":
                return "bg-red-500 hover:bg-red-600";
            case "exame":
                return "bg-purple-500 hover:bg-purple-600";
            default:
                return "bg-indigo-500 hover:bg-indigo-600";
        }
    };

    const getAppointmentColor = (appointment: Appointment) => {
        // Prioriza status para agendamentos cancelados ou realizados
        if (
            appointment.status === "cancelado" ||
            appointment.status === "realizado" ||
            appointment.status === "faltou"
        ) {
            return getStatusColor(appointment.status);
        }
        // Para agendados e confirmados, usa cor do tipo
        return getTypeColor(appointment.tipo_consulta);
    };

    const renderCalendarDays = () => {
        const days = [];
        let day = startDate;

        while (day <= endDate) {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentDay = isToday(day);

            days.push(
                <div
                    key={day.toString()}
                    className={`
            min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors relative
            ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
            ${
                isCurrentDay
                    ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                    : ""
            }
          `}
                    onClick={() => onDateSelect?.(day)}
                >
                    <div
                        className={`font-semibold mb-2 ${
                            isCurrentDay ? "text-blue-600" : ""
                        }`}
                    >
                        {format(day, "d")}
                        {/* Indicador visual para dias com agendamentos */}
                        {dayAppointments.length > 0 && (
                            <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </div>
                    <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                            <div
                                key={appointment.id}
                                className={`
                  text-xs p-1 rounded text-white cursor-pointer transition-colors
                  ${getAppointmentColor(appointment)}
                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAppointmentClick?.(appointment);
                                }}
                                title={`${
                                    appointment.patient.nome_completo
                                } - ${format(
                                    parseISO(appointment.data_hora_inicio),
                                    "HH:mm"
                                )} - ${
                                    appointment.tipo_consulta || "consulta"
                                } - ${appointment.status}`}
                            >
                                <div className="truncate font-medium">
                                    {format(
                                        parseISO(appointment.data_hora_inicio),
                                        "HH:mm"
                                    )}
                                </div>
                                <div className="truncate">
                                    {appointment.patient.nome_completo}
                                </div>
                                <div className="truncate text-xs opacity-90">
                                    {appointment.tipo_consulta || "consulta"}
                                </div>
                            </div>
                        ))}
                        {dayAppointments.length > 3 && (
                            <div className="text-xs text-gray-600 font-medium">
                                +{dayAppointments.length - 3} mais
                            </div>
                        )}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-0 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                        <div
                            key={day}
                            className="p-3 text-center font-medium text-gray-700 bg-gray-50"
                        >
                            {day}
                        </div>
                    )
                )}
            </div>

            {/* Grade do Calendário */}
            <div className="grid grid-cols-7 gap-0 border border-gray-200">
                {renderCalendarDays()}
            </div>

            {/* Legenda */}
            <div className="mt-6 space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Tipos de Consulta
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Consulta</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Retorno</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Emergência</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Exame</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Status
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Agendado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Confirmado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Realizado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Cancelado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-500 rounded"></div>
                            <span>Faltou</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCalendar;
