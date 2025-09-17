import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import type { CalendarEvent } from "../components/Calendar";
import { useToast } from "../hooks/useToast";
import ConfirmationModal from "../components/ConfirmationModal";

const AgendaPage: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );
    const [showEventModal, setShowEventModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        event: CalendarEvent | null;
    }>({
        isOpen: false,
        event: null,
    });
    const [deleting, setDeleting] = useState(false);

    const { showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);

                // Simular delay de API
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Dados mockados para demonstração
                const mockEvents: CalendarEvent[] = [
                    {
                        id: 1,
                        title: "Consulta de Rotina",
                        patient: "Maria Silva Santos",
                        doctor: "Dr. João Carvalho",
                        start: new Date(2025, 8, 18, 9, 0), // 18 de setembro, 9h
                        end: new Date(2025, 8, 18, 10, 0),
                        type: "consulta",
                        status: "agendado",
                    },
                    {
                        id: 2,
                        title: "Retorno Pós-Cirúrgico",
                        patient: "Pedro Oliveira",
                        doctor: "Dr. Ana Costa",
                        start: new Date(2025, 8, 18, 14, 30),
                        end: new Date(2025, 8, 18, 15, 30),
                        type: "retorno",
                        status: "agendado",
                    },
                    {
                        id: 3,
                        title: "Exame de Sangue",
                        patient: "Carlos Mendes",
                        doctor: "Laboratório",
                        start: new Date(2025, 8, 19, 8, 0),
                        end: new Date(2025, 8, 19, 8, 30),
                        type: "exame",
                        status: "agendado",
                    },
                    {
                        id: 4,
                        title: "Cirurgia Cardíaca",
                        patient: "Ana Paula Costa",
                        doctor: "Dr. Roberto Silva",
                        start: new Date(2025, 8, 20, 7, 0),
                        end: new Date(2025, 8, 20, 12, 0),
                        type: "cirurgia",
                        status: "agendado",
                    },
                    {
                        id: 5,
                        title: "Consulta Oncológica",
                        patient: "José Santos",
                        doctor: "Dr. Maria Fernanda",
                        start: new Date(2025, 8, 21, 10, 0),
                        end: new Date(2025, 8, 21, 11, 0),
                        type: "consulta",
                        status: "concluido",
                    },
                    {
                        id: 6,
                        title: "Consulta Cancelada",
                        patient: "Ricardo Lima",
                        doctor: "Dr. Paulo Henrique",
                        start: new Date(2025, 8, 22, 15, 0),
                        end: new Date(2025, 8, 22, 16, 0),
                        type: "consulta",
                        status: "cancelado",
                    },
                ];

                setEvents(mockEvents);
                showSuccess("Agenda carregada com sucesso!");
            } catch (error) {
                console.error("Erro ao carregar agenda:", error);
                showError("Erro ao carregar a agenda");
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [showSuccess, showError]); // Dependências estáveis com useCallback

    const loadEventsManual = async () => {
        try {
            setLoading(true);

            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Dados mockados para demonstração
            const mockEvents: CalendarEvent[] = [
                {
                    id: 1,
                    title: "Consulta de Rotina",
                    patient: "Maria Silva Santos",
                    doctor: "Dr. João Carvalho",
                    start: new Date(2025, 8, 18, 9, 0), // 18 de setembro, 9h
                    end: new Date(2025, 8, 18, 10, 0),
                    type: "consulta",
                    status: "agendado",
                },
                {
                    id: 2,
                    title: "Retorno Pós-Cirúrgico",
                    patient: "Pedro Oliveira",
                    doctor: "Dr. Ana Costa",
                    start: new Date(2025, 8, 18, 14, 30),
                    end: new Date(2025, 8, 18, 15, 30),
                    type: "retorno",
                    status: "agendado",
                },
                {
                    id: 3,
                    title: "Exame de Sangue",
                    patient: "Carlos Mendes",
                    doctor: "Laboratório",
                    start: new Date(2025, 8, 19, 8, 0),
                    end: new Date(2025, 8, 19, 8, 30),
                    type: "exame",
                    status: "agendado",
                },
                {
                    id: 4,
                    title: "Cirurgia Cardíaca",
                    patient: "Ana Paula Costa",
                    doctor: "Dr. Roberto Silva",
                    start: new Date(2025, 8, 20, 7, 0),
                    end: new Date(2025, 8, 20, 12, 0),
                    type: "cirurgia",
                    status: "agendado",
                },
                {
                    id: 5,
                    title: "Consulta Oncológica",
                    patient: "José Santos",
                    doctor: "Dr. Maria Fernanda",
                    start: new Date(2025, 8, 21, 10, 0),
                    end: new Date(2025, 8, 21, 11, 0),
                    type: "consulta",
                    status: "concluido",
                },
                {
                    id: 6,
                    title: "Consulta Cancelada",
                    patient: "Ricardo Lima",
                    doctor: "Dr. Paulo Henrique",
                    start: new Date(2025, 8, 22, 15, 0),
                    end: new Date(2025, 8, 22, 16, 0),
                    type: "consulta",
                    status: "cancelado",
                },
            ];

            setEvents(mockEvents);
            showSuccess("Agenda atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao carregar agenda:", error);
            showError("Erro ao carregar a agenda");
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const handleEventDrop = async (
        event: CalendarEvent,
        newStart: Date,
        newEnd: Date
    ) => {
        try {
            showInfo("Reagendando consulta...");

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Atualizar evento
            setEvents((prevEvents) =>
                prevEvents.map((e) =>
                    e.id === event.id
                        ? { ...e, start: newStart, end: newEnd }
                        : e
                )
            );

            showSuccess(`Consulta de ${event.patient} reagendada com sucesso!`);
        } catch (error) {
            console.error("Erro ao reagendar:", error);
            showError("Erro ao reagendar consulta");
        }
    };

    const handleDateClick = (date: Date) => {
        showInfo(`Data selecionada: ${date.toLocaleDateString("pt-BR")}`);
        // Aqui você pode abrir um modal para criar novo agendamento
    };

    const handleDeleteEvent = async () => {
        if (!deleteModal.event) return;

        try {
            setDeleting(true);

            // Simular API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Remover evento
            setEvents((prevEvents) =>
                prevEvents.filter((e) => e.id !== deleteModal.event!.id)
            );

            setDeleteModal({ isOpen: false, event: null });
            setShowEventModal(false);
            showSuccess("Agendamento excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir:", error);
            showError("Erro ao excluir agendamento");
        } finally {
            setDeleting(false);
        }
    };

    const getEventTypeLabel = (type: CalendarEvent["type"]) => {
        const labels = {
            consulta: "Consulta",
            retorno: "Retorno",
            exame: "Exame",
            cirurgia: "Cirurgia",
        };
        return labels[type];
    };

    const getStatusLabel = (status: CalendarEvent["status"]) => {
        const labels = {
            agendado: "Agendado",
            cancelado: "Cancelado",
            concluido: "Concluído",
        };
        return labels[status];
    };

    return (
        <div
            style={{
                padding: "2rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1
                    style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "#111827",
                        margin: "0 0 0.5rem 0",
                    }}
                >
                    Agenda
                </h1>
                <p
                    style={{
                        fontSize: "1rem",
                        color: "#6b7280",
                        margin: 0,
                    }}
                >
                    Gerencie os agendamentos da clínica
                </p>
            </div>

            {/* Botões de Ação */}
            <div
                style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}
            >
                <button
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#3b82f6";
                    }}
                >
                    <span>+</span>
                    Nova Consulta
                </button>

                <button
                    onClick={loadEventsManual}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "white",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                    }}
                >
                    🔄 Atualizar
                </button>
            </div>

            {/* Calendário */}
            <Calendar
                events={events}
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                onDateClick={handleDateClick}
                loading={loading}
            />

            {/* Modal de Detalhes do Evento */}
            {showEventModal && selectedEvent && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={() => setShowEventModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "2rem",
                            maxWidth: "500px",
                            width: "90%",
                            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                            transform: "scale(1)",
                            animation: "modalAppear 0.2s ease-out",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <style>
                            {`
                                @keyframes modalAppear {
                                    from {
                                        opacity: 0;
                                        transform: scale(0.9);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: scale(1);
                                    }
                                }
                            `}
                        </style>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <h3
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "700",
                                    color: "#111827",
                                    margin: "0 0 0.5rem 0",
                                }}
                            >
                                {selectedEvent.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: "1rem",
                                    color: "#6b7280",
                                    margin: 0,
                                }}
                            >
                                {getEventTypeLabel(selectedEvent.type)} -{" "}
                                {getStatusLabel(selectedEvent.status)}
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                                marginBottom: "2rem",
                            }}
                        >
                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#374151",
                                    }}
                                >
                                    Paciente:
                                </label>
                                <p
                                    style={{
                                        margin: "0.25rem 0 0 0",
                                        fontSize: "1rem",
                                        color: "#111827",
                                    }}
                                >
                                    {selectedEvent.patient}
                                </p>
                            </div>

                            <div>
                                <label
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#374151",
                                    }}
                                >
                                    Médico:
                                </label>
                                <p
                                    style={{
                                        margin: "0.25rem 0 0 0",
                                        fontSize: "1rem",
                                        color: "#111827",
                                    }}
                                >
                                    {selectedEvent.doctor}
                                </p>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                        }}
                                    >
                                        Data:
                                    </label>
                                    <p
                                        style={{
                                            margin: "0.25rem 0 0 0",
                                            fontSize: "1rem",
                                            color: "#111827",
                                        }}
                                    >
                                        {selectedEvent.start.toLocaleDateString(
                                            "pt-BR"
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label
                                        style={{
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#374151",
                                        }}
                                    >
                                        Horário:
                                    </label>
                                    <p
                                        style={{
                                            margin: "0.25rem 0 0 0",
                                            fontSize: "1rem",
                                            color: "#111827",
                                        }}
                                    >
                                        {selectedEvent.start.toLocaleTimeString(
                                            "pt-BR",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}{" "}
                                        -
                                        {selectedEvent.end.toLocaleTimeString(
                                            "pt-BR",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={() => setShowEventModal(false)}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "white",
                                    color: "#374151",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                Fechar
                            </button>

                            <button
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    border: "none",
                                    backgroundColor: "#f59e0b",
                                    color: "white",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                Editar
                            </button>

                            <button
                                onClick={() => {
                                    setDeleteModal({
                                        isOpen: true,
                                        event: selectedEvent,
                                    });
                                }}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    border: "none",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Excluir Agendamento"
                message={`Tem certeza que deseja excluir o agendamento de "${deleteModal.event?.patient}"? Esta ação não pode ser desfeita.`}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteEvent}
                onCancel={() => setDeleteModal({ isOpen: false, event: null })}
                loading={deleting}
            />
        </div>
    );
};

export default AgendaPage;
