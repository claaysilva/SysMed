import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Clock,
    FileText,
    Settings,
    Printer,
} from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import { format, addDays, startOfWeek, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import Modal from "../components/Modal";
import { useToast } from "../contexts/toastContextBase";
import AppointmentForm from "../components/AppointmentForm";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DateSpanApi, DatesSetArg, CalendarApi } from "@fullcalendar/core";

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
    const { showSuccess } = useToast();

    // Estados principais
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
    const [showForm, setShowForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AppointmentType | null>(null);
    const [initialStart, setInitialStart] = useState<string | undefined>(
        undefined
    );
    const [initialEnd, setInitialEnd] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const formatForInput = (date: Date) => format(date, "yyyy-LL-dd'T'HH:mm");

    const clampToBusinessHours = (date: Date) => {
        const start = new Date(date);
        start.setHours(8, 0, 0, 0);
        const end = new Date(date);
        end.setHours(18, 0, 0, 0);
        return { start, end };
    };

    const nextHalfHour = (date: Date) => {
        const d = new Date(date);
        d.setSeconds(0, 0);
        const minutes = d.getMinutes();
        const remainder = minutes % 30;
        if (remainder !== 0) {
            d.setMinutes(minutes + (30 - remainder));
        }
        return d;
    };

    const handleCreateAppointment = (opts?: { day?: Date; time?: string }) => {
        setSelectedAppointment(null);

        let start: Date;
        if (opts?.day && opts?.time) {
            // Criado a partir do slot clicado
            const [hh, mm] = opts.time.split(":").map((n) => parseInt(n, 10));
            start = new Date(
                opts.day.getFullYear(),
                opts.day.getMonth(),
                opts.day.getDate(),
                hh,
                mm,
                0,
                0
            );
            // Não permitir slots passados (defensivo)
            const now = new Date();
            if (
                start.toDateString() < now.toDateString() ||
                (start.toDateString() === now.toDateString() && start < now)
            ) {
                return;
            }
        } else {
            // Botão Novo Agendamento: próxima meia hora dentro do expediente
            let base = new Date();
            // se hoje for domingo, usar segunda-feira como base
            if (base.getDay() === 0) {
                base = addDays(base, 1);
            }
            const { start: bhStart, end: bhEnd } = clampToBusinessHours(base);
            if (base < bhStart) {
                start = bhStart;
            } else if (base > bhEnd) {
                // próximo dia útil às 08:00
                const tomorrow = addDays(base, 1);
                start = clampToBusinessHours(tomorrow).start;
            } else {
                start = nextHalfHour(base);
            }
        }

        const end = addMinutes(start, 30); // duração padrão: 30 min
        setInitialStart(formatForInput(start));
        setInitialEnd(formatForInput(end));
        setShowForm(true);
    };

    const handleEditAppointment = (appointment: AppointmentType) => {
        setSelectedAppointment(appointment);
        setShowForm(true);
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        setSelectedAppointment(null);
        await fetchAppointments();
        showSuccess("Consulta agendada com sucesso!");
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedAppointment(null);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            agendado: "#059669", // green-600
            confirmado: "#059669", // green-600
            realizado: "#059669", // green-600
            cancelado: "#dc2626", // red-600
            faltou: "#6b7280", // gray-500
        };
        return colors[status as keyof typeof colors] || "#6b7280";
    };

    // Observação: grade antiga removida; usamos FullCalendar para Mês/Semana/Dia

    // Gerar dias da semana
    const getWeekDays = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(start, i));
        }
        return days;
    };

    const weekDays = getWeekDays();

    // Controle do FullCalendar via ref
    const calendarRef = useRef<FullCalendar | null>(null);
    const getCalendarApi = (): CalendarApi | undefined => {
        const inst = calendarRef.current as unknown as {
            getApi?: () => CalendarApi;
        } | null;
        return inst?.getApi ? inst.getApi() : undefined;
    };
    const onToday = () => getCalendarApi()?.today();
    const onPrev = () => getCalendarApi()?.prev();
    const onNext = () => getCalendarApi()?.next();
    const onChangeView = (vm: "month" | "week" | "day") => {
        const api = getCalendarApi();
        const view = vm === "month" ? "dayGridMonth" : vm === "day" ? "timeGridDay" : "timeGridWeek";
        api?.changeView(view);
        setViewMode(vm);
    };

    // Eventos do FullCalendar mapeados dos agendamentos
    const calendarEvents = useMemo(
        () =>
            appointments.map((apt) => ({
                id: String(apt.id),
                title: apt.patient?.nome_completo || "Consulta",
                start: apt.data_hora_inicio,
                end: apt.data_hora_fim,
                extendedProps: { apt },
                color: getStatusColor(apt.status),
            })),
        [appointments]
    );

    if (loading && appointments.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "400px",
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid #e5e7eb",
                        borderTop: "3px solid #3b82f6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }}
                />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div
            style={{
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                fontFamily: "Roboto, sans-serif",
            }}
        >
            {/* Header Principal - Estilo iClinic */}
            <div
                style={{
                    backgroundColor: "white",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem 2rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "500",
                            color: "#1f2937",
                            margin: 0,
                        }}
                    >
                        SysMed Clínica
                    </h1>
                </div>

                {/* Barra de pesquisa e botões de ação */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    {/* Search Bar */}
                    <div
                        style={{
                            position: "relative",
                            flex: 1,
                            maxWidth: "400px",
                        }}
                    >
                        <Search
                            size={20}
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#9ca3af",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Busque um paciente"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "#2563eb";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "#d1d5db";
                            }}
                        />
                    </div>

                    {/* Botões de ação */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link to="/calendar" style={{ textDecoration: "none" }}>
                            <button
                                type="button"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1rem",
                                    backgroundColor: "white",
                                    color: "#374151",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#f9fafb";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "white";
                                }}
                            >
                                Calendário (Mês)
                            </button>
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleCreateAppointment()}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                backgroundColor: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#059669";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#10b981";
                            }}
                        >
                            <Plus size={16} />
                            Novo Agendamento
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                backgroundColor: "white",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            <Clock size={16} />
                            Lista de Espera
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                backgroundColor: "white",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            <FileText size={16} />
                            Observações
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                backgroundColor: "white",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            <Printer size={16} />
                            Imprimir Agenda
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                backgroundColor: "white",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            <Settings size={16} />
                            Agendamento online
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar de navegação e visualização */}
            <div
                style={{
                    backgroundColor: "white",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem 2rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Navegação de data */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                        }}
                    >
                        <button
                            onClick={onToday}
                            style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                            }}
                        >
                            HOJE
                        </button>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <button
                                onClick={onPrev}
                                style={{
                                    padding: "0.5rem",
                                    backgroundColor: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={onNext}
                                style={{
                                    padding: "0.5rem",
                                    backgroundColor: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <h2
                            style={{
                                fontSize: "1.125rem",
                                fontWeight: "500",
                                color: "#1f2937",
                                margin: 0,
                            }}
                        >
                            {viewMode === "week"
                                ? `${format(weekDays[0], "d/MM", {
                                      locale: ptBR,
                                  })} a ${format(weekDays[6], "d/MM", {
                                      locale: ptBR,
                                  })}`
                                : format(currentDate, "d 'de' MMMM 'de' yyyy", {
                                      locale: ptBR,
                                  })}
                        </h2>
                    </div>

                    {/* Seletor de visualização */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {(["month", "week", "day"] as Array<"month" | "week" | "day">).map((vm) => (
                            <button
                                key={vm}
                                onClick={() => onChangeView(vm)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    backgroundColor:
                                        viewMode === vm
                                            ? "#dbeafe"
                                            : "transparent",
                                    color:
                                        viewMode === vm ? "#2563eb" : "#6b7280",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "4px",
                                    fontSize: "0.875rem",
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                }}
                            >
                                {vm === "month"
                                    ? "MÊS"
                                    : vm === "week"
                                    ? "SEMANA"
                                    : "DIA"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conteúdo principal: FullCalendar */}
            <div style={{ padding: "0 2rem" }}>
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        marginTop: "1rem",
                        padding: "1rem",
                    }}
                >
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView={viewMode === "month" ? "dayGridMonth" : viewMode === "day" ? "timeGridDay" : "timeGridWeek"}
                        headerToolbar={false}
                        footerToolbar={false}
                        initialDate={currentDate}
                        locale="pt-br"
                        buttonText={{
                            today: "Hoje",
                            month: "Mês",
                            week: "Semana",
                            day: "Dia",
                        }}
                        nowIndicator={true}
                        navLinks={true}
                        height="auto"
                        events={calendarEvents}
                        validRange={{ start: format(new Date(), "yyyy-LL-dd") }}
                        hiddenDays={[0]}
                        allDaySlot={false}
                        slotMinTime="07:00:00"
                        slotMaxTime="19:00:00"
                        slotDuration="00:30:00"
                        slotLabelInterval="00:30:00"
                        businessHours={[
                            {
                                daysOfWeek: [1, 2, 3, 4, 5],
                                startTime: "08:00",
                                endTime: "18:00",
                            },
                            {
                                daysOfWeek: [6],
                                startTime: "08:00",
                                endTime: "11:00",
                            },
                        ]}
                        selectable={true}
                        selectAllow={(span: DateSpanApi) => {
                            if (span.allDay) return false; // não selecionar no mês
                            const now = new Date();
                            const start =
                                span.start instanceof Date
                                    ? span.start
                                    : new Date(span.start);
                            const sDay = new Date(
                                start.getFullYear(),
                                start.getMonth(),
                                start.getDate()
                            );
                            const t0 = new Date(
                                now.getFullYear(),
                                now.getMonth(),
                                now.getDate()
                            );
                            if (sDay.getTime() < t0.getTime()) return false;
                            if (sDay.getTime() === t0.getTime() && start < now)
                                return false;
                            // domingo fechado
                            if (start.getDay() === 0) return false;
                            // expediente
                            const minutes =
                                start.getHours() * 60 + start.getMinutes();
                            const close =
                                start.getDay() === 6 ? 11 * 60 : 18 * 60;
                            const open = 8 * 60;
                            if (minutes < open || minutes > close - 30)
                                return false;
                            return true;
                        }}
                        select={(info) => {
                            const start = new Date(info.start);
                            const end = addMinutes(start, 30);
                            setInitialStart(
                                format(start, "yyyy-LL-dd'T'HH:mm")
                            );
                            setInitialEnd(format(end, "yyyy-LL-dd'T'HH:mm"));
                            setShowForm(true);
                        }}
                        dateClick={(arg: DateClickArg) => {
                            if (arg.view?.type === "dayGridMonth") {
                                // Na visão de mês: trocar para dia
                                setCurrentDate(arg.date);
                                setViewMode("day");
                                return;
                            }
                            const start = arg.date;
                            const now = new Date();
                            const sDay = new Date(
                                start.getFullYear(),
                                start.getMonth(),
                                start.getDate()
                            );
                            const t0 = new Date(
                                now.getFullYear(),
                                now.getMonth(),
                                now.getDate()
                            );
                            if (sDay.getTime() < t0.getTime()) return;
                            if (sDay.getTime() === t0.getTime() && start < now)
                                return;
                            if (start.getDay() === 0) return;
                            const minutes =
                                start.getHours() * 60 + start.getMinutes();
                            const close =
                                start.getDay() === 6 ? 11 * 60 : 18 * 60;
                            const open = 8 * 60;
                            if (minutes < open || minutes > close - 30) return;
                            const end = addMinutes(start, 30);
                            setInitialStart(
                                format(start, "yyyy-LL-dd'T'HH:mm")
                            );
                            setInitialEnd(format(end, "yyyy-LL-dd'T'HH:mm"));
                            setShowForm(true);
                        }}
                        eventClick={(info) => {
                            const id = Number(info.event.id);
                            const apt = appointments.find((a) => a.id === id);
                            if (apt) {
                                handleEditAppointment(
                                    apt as unknown as AppointmentType
                                );
                            }
                        }}
                        datesSet={(arg: DatesSetArg) => {
                            // manter o título e botões em sincronia com a visão atual
                            setCurrentDate(arg.start);
                            const t = arg.view.type;
                            const vm: "day" | "week" | "month" =
                                t === "dayGridMonth" ? "month" : t === "timeGridDay" ? "day" : "week";
                            if (vm !== viewMode) setViewMode(vm);
                        }}
                    />
                </div>
            </div>

            {/* Modal do formulário */}
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
                        initialStart={
                            selectedAppointment ? undefined : initialStart
                        }
                        initialEnd={
                            selectedAppointment ? undefined : initialEnd
                        }
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                    />
                </Modal>
            )}

            {/* Mostrar erro se houver */}
            {error && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "1rem",
                        right: "1rem",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        padding: "1rem",
                        color: "#dc2626",
                        fontSize: "0.875rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;
