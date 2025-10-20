import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppointmentFormModal from "../components/AppointmentFormModal";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import type { DateSpanApi } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, addMinutes } from "date-fns";
import type { DateClickArg } from "@fullcalendar/interaction";

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
        doctor: string;
        notes: string;
    };
}

interface Appointment {
    id: string;
    data_hora_inicio: string;
    data_hora_fim: string;
    observacoes: string;
    patient?: { nome_completo: string };
    user?: { name: string };
}

interface SelectInfo {
    startStr: string;
    endStr: string;
}

const SchedulePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState<{
        start: string;
        end: string;
    }>();

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(
                "http://localhost:8000/api/appointments",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const formattedEvents: CalendarEvent[] = response.data.map(
                (appt: Appointment) => ({
                    id: appt.id,
                    title: `Consulta - ${
                        appt.patient?.nome_completo || "Paciente"
                    }`,
                    start: appt.data_hora_inicio,
                    end: appt.data_hora_fim,
                    extendedProps: {
                        doctor: appt.user?.name || "Médico",
                        notes: appt.observacoes,
                    },
                })
            );
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Não permitir selecionar datas passadas e nem no modo mês (allDay)
    const selectAllow = (span: DateSpanApi) => {
        if (span.allDay) return false; // bloqueia seleção no mês
        const now = new Date();
        const start =
            span.start instanceof Date ? span.start : new Date(span.start);
        const startDay = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
        );
        const todayDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        if (startDay.getTime() < todayDay.getTime()) return false;
        if (startDay.getTime() === todayDay.getTime() && start < now)
            return false;
        return true;
    };

    // Clique simples em um slot (garantir mesmas regras de bloqueio)
    const handleDateClick = (arg: DateClickArg) => {
        // Ignorar cliques na visão mensal (dayGridMonth)
        // para evitar abrir o modal em células de dia inteiro
        // e manter o fluxo apenas nas visões semana/dia
        // onde trabalhamos com intervalos de 30min
        // (seleção no mês permanece bloqueada por selectAllow)
        //
        // Também evita o comportamento citado de clique não esperado.
        if (arg.view?.type === "dayGridMonth") {
            return;
        }
        const start: Date =
            arg?.date instanceof Date ? arg.date : new Date(arg?.date);
        if (Number.isNaN(start?.getTime())) return;
        const now = new Date();
        const startDay = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
        );
        const todayDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        // bloquear passado
        if (startDay.getTime() < todayDay.getTime()) return;
        if (startDay.getTime() === todayDay.getTime() && start < now) return;
        // domingo fechado
        const dow = start.getDay();
        if (dow === 0) return;
        // horários de funcionamento
        const h = start.getHours();
        const m = start.getMinutes();
        const minutes = h * 60 + m;
        const isSat = dow === 6;
        const open = 8 * 60; // 08:00
        const close = isSat ? 11 * 60 : 18 * 60; // 11:00 aos sábados, 18:00 demais
        // último início é 30 min antes do fechamento
        const lastStart = close - 30;
        if (minutes < open || minutes > lastStart) return;

        const end = addMinutes(start, 30);
        setSelectedDates({
            start: start.toISOString(),
            end: end.toISOString(),
        });
        setIsModalOpen(true);
    };

    // Ao selecionar horário
    const handleSelect = (selectInfo: SelectInfo) => {
        setSelectedDates({
            start: selectInfo.startStr,
            end: selectInfo.endStr,
        });
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h2 style={{ color: "#1976d2", marginBottom: "0.5rem" }}>
                    Agenda de Consultas
                </h2>
                <p style={{ color: "#666", fontSize: "1rem" }}>
                    Clique em um horário para criar um novo agendamento
                </p>
            </div>

            <div
                style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                }}
            >
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={events}
                    locale="pt-br"
                    buttonText={{
                        today: "Hoje",
                        month: "Mês",
                        week: "Semana",
                        day: "Dia",
                    }}
                    nowIndicator={true}
                    navLinks={true}
                    selectable={true}
                    select={handleSelect}
                    dateClick={handleDateClick}
                    selectAllow={selectAllow}
                    selectConstraint="businessHours"
                    height="600px"
                    eventColor="#1976d2"
                    eventBorderColor="#1565c0"
                    validRange={{
                        // usar string yyyy-MM-dd para evitar ambiguidade de timezone
                        start: format(new Date(), "yyyy-LL-dd"),
                    }}
                    hiddenDays={[0]}
                    slotMinTime="07:00:00"
                    slotMaxTime="19:00:00"
                    allDaySlot={false}
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
                />
            </div>

            <AppointmentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => {
                    setIsModalOpen(false);
                    fetchAppointments();
                }}
                defaultDates={selectedDates}
                selectedPatientId={searchParams.get("patient") || undefined}
            />
        </div>
    );
};

export default SchedulePage;
