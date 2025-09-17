import React, { useState, useEffect } from "react";
import AppointmentFormModal from "../components/AppointmentFormModal";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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
    patient?: {
        nome_completo: string;
    };
    user?: {
        name: string;
    };
}

interface SelectInfo {
    startStr: string;
    endStr: string;
}

const SchedulePage: React.FC = () => {
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
            const formattedEvents = response.data.map((appt: Appointment) => ({
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
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);
    // Função chamada ao selecionar horário no calendário
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
                    selectable={true}
                    select={handleSelect}
                    height="600px"
                    eventColor="#1976d2"
                    eventBorderColor="#1565c0"
                    dayHeaderClassNames="fc-custom-header"
                    slotMinTime="07:00:00"
                    slotMaxTime="19:00:00"
                    allDaySlot={false}
                    slotDuration="00:30:00"
                    businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5],
                        startTime: "08:00",
                        endTime: "18:00",
                    }}
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
            />
        </div>
    );
};

export default SchedulePage;
