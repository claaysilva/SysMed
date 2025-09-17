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
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Patient {
    id: number;
    nome_completo: string;
}

interface Appointment {
    id: number;
    patient: Patient;
    data_hora_inicio: string;
    data_hora_fim: string;
    status: string;
    tipo?: string;
    observacoes?: string;
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
            case "confirmada":
                return "bg-blue-500";
            case "realizada":
                return "bg-green-500";
            case "cancelada":
                return "bg-red-500";
            case "agendada":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
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
            min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50
            ${!isCurrentMonth ? "bg-gray-100 text-gray-400" : ""}
            ${isCurrentDay ? "bg-blue-50 border-blue-300" : ""}
          `}
                    onClick={() => onDateSelect?.(day)}
                >
                    <div className="font-semibold mb-1">{format(day, "d")}</div>
                    <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                            <div
                                key={appointment.id}
                                className={`
                  text-xs p-1 rounded text-white cursor-pointer
                  ${getStatusColor(appointment.status)}
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
                                )}`}
                            >
                                <div className="truncate">
                                    {format(
                                        parseISO(appointment.data_hora_inicio),
                                        "HH:mm"
                                    )}
                                </div>
                                <div className="truncate font-medium">
                                    {appointment.patient.nome_completo}
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
                        onClick={handlePrevMonth}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
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
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Agendada</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Confirmada</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Realizada</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Cancelada</span>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCalendar;
