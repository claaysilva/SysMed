import React, { useState } from "react";
import {
    format,
    startOfWeek,
    addDays,
    addWeeks,
    subWeeks,
    isSameDay,
    parseISO,
    differenceInMinutes,
    set,
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

interface WeeklyCalendarProps {
    appointments: Appointment[];
    onDateSelect?: (date: Date) => void;
    onAppointmentClick?: (appointment: Appointment) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    appointments,
    onDateSelect,
    onAppointmentClick,
}) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const timeSlots = Array.from({ length: 20 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8;
        const minute = (i % 2) * 30;
        return `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
    });
    const slotHeight = 64;
    const pxPerMinute = slotHeight / 30;

    const getAppointmentColor = (appointment: Appointment) => {
        switch (appointment.tipo_consulta) {
            case "consulta":
                return "bg-blue-400 border-blue-500 text-white";
            case "retorno":
                return "bg-green-400 border-green-500 text-white";
            case "emergencia":
                return "bg-red-400 border-red-500 text-white";
            case "exame":
                return "bg-purple-400 border-purple-500 text-white";
            default:
                switch (appointment.status) {
                    case "confirmado":
                        return "bg-cyan-400 border-cyan-500 text-white";
                    case "realizado":
                        return "bg-emerald-400 border-emerald-500 text-white";
                    case "cancelado":
                        return "bg-red-400 border-red-500 text-white";
                    case "agendado":
                        return "bg-yellow-400 border-yellow-500 text-black";
                    default:
                        return "bg-gray-400 border-gray-500 text-white";
                }
        }
    };

    return (
        <div>
            <div
                className="flex items-center justify-between p-4 border-b"
                style={{ background: "white" }}
            >
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setCurrentWeek(new Date())}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        HOJE
                    </button>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                setCurrentWeek(subWeeks(currentWeek, 1))
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() =>
                                setCurrentWeek(addWeeks(currentWeek, 1))
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <h2 className="text-lg font-medium">
                        {format(weekStart, "d MMM", { locale: ptBR })} -{" "}
                        {format(addDays(weekStart, 6), "d MMM yyyy", {
                            locale: ptBR,
                        })}
                    </h2>
                </div>
                <div className="text-sm text-gray-500">SEMANA</div>
            </div>

            <div className="flex" style={{ background: "white" }}>
                <div className="w-20 border-r bg-gray-50">
                    <div className="h-12 border-b flex items-center justify-center text-xs font-medium text-gray-500"></div>
                    {timeSlots.map((time) => (
                        <div
                            key={time}
                            className="h-16 border-b flex items-start justify-center pt-1 text-xs text-gray-600"
                        >
                            {time}
                        </div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day) => {
                        const isWeekend = [0, 6].includes(day.getDay());
                        const dayAppointments = appointments
                            .filter((a) =>
                                isSameDay(parseISO(a.data_hora_inicio), day)
                            )
                            .sort(
                                (a, b) =>
                                    parseISO(a.data_hora_inicio).getTime() -
                                    parseISO(b.data_hora_inicio).getTime()
                            );
                        const dayStartBase = set(day, {
                            hours: 8,
                            minutes: 0,
                            seconds: 0,
                            milliseconds: 0,
                        });

                        return (
                            <div
                                key={day.toString()}
                                className="border-r last:border-r-0"
                            >
                                <div className="h-12 border-b bg-gray-50 flex flex-col items-center justify-center">
                                    <div className="text-xs font-medium text-gray-600 uppercase">
                                        {format(day, "EEE", { locale: ptBR })}
                                    </div>
                                    <div className="text-sm font-bold">
                                        {format(day, "d")}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {format(day, "MMM", { locale: ptBR })}
                                    </div>
                                </div>

                                <div
                                    className="relative"
                                    style={{
                                        height: `${
                                            timeSlots.length * slotHeight
                                        }px`,
                                    }}
                                    onClick={() => onDateSelect?.(day)}
                                >
                                    <div className="absolute inset-0">
                                        {timeSlots.map((t) => (
                                            <div
                                                key={t}
                                                className="h-16 border-b border-gray-100"
                                            />
                                        ))}
                                    </div>

                                    {isWeekend && (
                                        <div className="absolute inset-0 bg-gray-50/70 flex items-center justify-center pointer-events-none">
                                            <span className="text-xs text-gray-400">
                                                Dia bloqueado
                                            </span>
                                        </div>
                                    )}

                                    {(() => {
                                        const lunchStart = set(day, {
                                            hours: 12,
                                            minutes: 0,
                                            seconds: 0,
                                            milliseconds: 0,
                                        });
                                        const lunchEnd = set(day, {
                                            hours: 14,
                                            minutes: 0,
                                            seconds: 0,
                                            milliseconds: 0,
                                        });
                                        const top = Math.max(
                                            0,
                                            differenceInMinutes(
                                                lunchStart,
                                                dayStartBase
                                            ) * pxPerMinute
                                        );
                                        const height =
                                            differenceInMinutes(
                                                lunchEnd,
                                                lunchStart
                                            ) * pxPerMinute;
                                        return (
                                            <div
                                                className="absolute left-0 right-0 bg-amber-50/60 border-y border-amber-100 flex items-center justify-center pointer-events-none"
                                                style={{ top, height }}
                                            >
                                                <span className="text-[10px] text-amber-700">
                                                    Horário de almoço
                                                </span>
                                            </div>
                                        );
                                    })()}

                                    {dayAppointments.map(
                                        (appointment, index) => {
                                            const start = parseISO(
                                                appointment.data_hora_inicio
                                            );
                                            const end = parseISO(
                                                appointment.data_hora_fim
                                            );
                                            const top = Math.max(
                                                0,
                                                differenceInMinutes(
                                                    start,
                                                    dayStartBase
                                                ) * pxPerMinute
                                            );
                                            const height = Math.max(
                                                26,
                                                differenceInMinutes(
                                                    end,
                                                    start
                                                ) * pxPerMinute
                                            );
                                            const left = 4 + (index % 3) * 6;
                                            const right = 4;
                                            return (
                                                <div
                                                    key={appointment.id}
                                                    className={`absolute rounded border-l-4 p-1 text-xs cursor-pointer shadow-sm ${getAppointmentColor(
                                                        appointment
                                                    )}`}
                                                    style={{
                                                        top,
                                                        height,
                                                        left,
                                                        right,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAppointmentClick?.(
                                                            appointment
                                                        );
                                                    }}
                                                    title={`${
                                                        appointment.patient
                                                            .nome_completo
                                                    } - ${format(
                                                        start,
                                                        "HH:mm"
                                                    )} - ${
                                                        appointment.tipo_consulta ||
                                                        "consulta"
                                                    }`}
                                                >
                                                    <div className="font-medium truncate">
                                                        {format(start, "HH:mm")}{" "}
                                                        - {format(end, "HH:mm")}
                                                    </div>
                                                    <div className="truncate text-xs opacity-90">
                                                        {
                                                            appointment.patient
                                                                .nome_completo
                                                        }
                                                    </div>
                                                    <div className="truncate text-[10px] opacity-75">
                                                        {appointment.tipo_consulta ||
                                                            "consulta"}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-4 py-3 border-t bg-white">
                <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-blue-400 inline-block" />{" "}
                        Consulta
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-green-400 inline-block" />{" "}
                        Retorno
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-purple-400 inline-block" />{" "}
                        Exame
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-red-400 inline-block" />{" "}
                        Emergência/Cancelado
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-cyan-400 inline-block" />{" "}
                        Confirmado
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-400 inline-block" />{" "}
                        Realizado
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-yellow-400 inline-block" />{" "}
                        Agendado
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
