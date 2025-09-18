import React, { useState, useEffect } from "react";
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
import {
    format,
    addDays,
    subDays,
    isSameDay,
    startOfWeek,
    addWeeks,
    subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Modal from "../components/Modal";
import AppointmentForm from "../components/AppointmentForm";

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

    // Estados principais
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"day" | "week">("week");
    const [showForm, setShowForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AppointmentType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

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
        await fetchAppointments();
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

    // Gerar horários do dia (8h às 18h, intervalos de 15min)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, "0")}:00`);
            slots.push(`${hour.toString().padStart(2, "0")}:15`);
            slots.push(`${hour.toString().padStart(2, "0")}:30`);
            slots.push(`${hour.toString().padStart(2, "0")}:45`);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Gerar dias da semana
    const getWeekDays = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(start, i));
        }
        return days;
    };

    const weekDays = getWeekDays();

    const navigateWeek = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const navigateDate = (direction: "prev" | "next") => {
        if (viewMode === "week") {
            navigateWeek(direction);
        } else {
            if (direction === "prev") {
                setCurrentDate(subDays(currentDate, 1));
            } else {
                setCurrentDate(addDays(currentDate, 1));
            }
        }
    };

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
                        <button
                            onClick={handleCreateAppointment}
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
                            onClick={() => setCurrentDate(new Date())}
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
                                onClick={() => navigateDate("prev")}
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
                                onClick={() => navigateDate("next")}
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
                        <button
                            onClick={() => setViewMode("day")}
                            style={{
                                padding: "0.5rem 1rem",
                                backgroundColor:
                                    viewMode === "day"
                                        ? "#dbeafe"
                                        : "transparent",
                                color:
                                    viewMode === "day" ? "#2563eb" : "#6b7280",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            DIA
                        </button>
                        <button
                            onClick={() => setViewMode("week")}
                            style={{
                                padding: "0.5rem 1rem",
                                backgroundColor:
                                    viewMode === "week"
                                        ? "#dbeafe"
                                        : "transparent",
                                color:
                                    viewMode === "week" ? "#2563eb" : "#6b7280",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            SEMANA
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div style={{ padding: "0 2rem" }}>
                {/* Visualização semanal - Estilo iClinic */}
                {viewMode === "week" && (
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            marginTop: "1rem",
                        }}
                    >
                        {/* Header dos dias da semana */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "80px repeat(7, 1fr)",
                                borderBottom: "1px solid #e5e7eb",
                                backgroundColor: "#f9fafb",
                            }}
                        >
                            <div
                                style={{
                                    padding: "1rem 0.5rem",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    color: "#6b7280",
                                    textAlign: "center",
                                    borderRight: "1px solid #e5e7eb",
                                }}
                            >
                                Horário
                            </div>
                            {weekDays.map((day, index) => {
                                const dayNames = [
                                    "Domingo",
                                    "Segunda",
                                    "Terça",
                                    "Quarta",
                                    "Quinta",
                                    "Sexta",
                                    "Sábado",
                                ];
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            padding: "1rem 0.5rem",
                                            textAlign: "center",
                                            borderRight:
                                                index < 6
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#374151",
                                            }}
                                        >
                                            {dayNames[index]}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                marginTop: "2px",
                                            }}
                                        >
                                            {format(day, "d/MMM", {
                                                locale: ptBR,
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid de horários */}
                        <div style={{ position: "relative" }}>
                            {timeSlots.map((time, timeIndex) => (
                                <div
                                    key={time}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "80px repeat(7, 1fr)",
                                        minHeight: "45px",
                                        borderBottom:
                                            timeIndex < timeSlots.length - 1
                                                ? "1px solid #f3f4f6"
                                                : "none",
                                    }}
                                >
                                    {/* Coluna de horário */}
                                    <div
                                        style={{
                                            padding: "0.5rem",
                                            fontSize: "0.75rem",
                                            color: "#6b7280",
                                            textAlign: "center",
                                            borderRight: "1px solid #e5e7eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#f9fafb",
                                        }}
                                    >
                                        {time}
                                    </div>

                                    {/* Colunas dos dias */}
                                    {weekDays.map((day, dayIndex) => {
                                        const dayAppointments =
                                            appointments.filter((apt) => {
                                                const aptDate = new Date(
                                                    apt.data_hora_inicio
                                                );
                                                const aptTime = format(
                                                    aptDate,
                                                    "HH:mm"
                                                );
                                                return (
                                                    isSameDay(aptDate, day) &&
                                                    aptTime === time
                                                );
                                            });

                                        return (
                                            <div
                                                key={`${time}-${dayIndex}`}
                                                style={{
                                                    padding: "0.25rem",
                                                    borderRight:
                                                        dayIndex < 6
                                                            ? "1px solid #e5e7eb"
                                                            : "none",
                                                    cursor: "pointer",
                                                    position: "relative",
                                                }}
                                                onClick={() =>
                                                    !dayAppointments.length &&
                                                    handleCreateAppointment()
                                                }
                                            >
                                                {dayAppointments.map(
                                                    (appointment) => (
                                                        <div
                                                            key={appointment.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditAppointment(
                                                                    appointment
                                                                );
                                                            }}
                                                            style={{
                                                                backgroundColor:
                                                                    getStatusColor(
                                                                        appointment.status
                                                                    ),
                                                                color: "white",
                                                                padding:
                                                                    "0.25rem 0.5rem",
                                                                borderRadius:
                                                                    "3px",
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight:
                                                                    "500",
                                                                cursor: "pointer",
                                                                marginBottom:
                                                                    "2px",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {
                                                                appointment
                                                                    .patient
                                                                    .nome_completo
                                                            }
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visualização por dia */}
                {viewMode === "day" && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "80px 1fr",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            marginTop: "1rem",
                        }}
                    >
                        {/* Coluna de horários */}
                        <div
                            style={{
                                backgroundColor: "#f9fafb",
                                borderRight: "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    height: "60px",
                                    borderBottom: "1px solid #e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    color: "#6b7280",
                                }}
                            >
                                Horário
                            </div>
                            {timeSlots.map((time) => (
                                <div
                                    key={time}
                                    style={{
                                        height: "45px",
                                        borderBottom: "1px solid #f3f4f6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Coluna de consultas */}
                        <div style={{ position: "relative" }}>
                            <div
                                style={{
                                    height: "60px",
                                    borderBottom: "1px solid #e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    color: "#6b7280",
                                    backgroundColor: "#f9fafb",
                                }}
                            >
                                {format(currentDate, "EEEE", { locale: ptBR })}
                            </div>

                            {timeSlots.map((time) => {
                                const dayAppointments = appointments.filter(
                                    (apt) => {
                                        const aptDate = new Date(
                                            apt.data_hora_inicio
                                        );
                                        const aptTime = format(
                                            aptDate,
                                            "HH:mm"
                                        );
                                        return (
                                            isSameDay(aptDate, currentDate) &&
                                            aptTime === time
                                        );
                                    }
                                );

                                return (
                                    <div
                                        key={time}
                                        style={{
                                            height: "45px",
                                            borderBottom: "1px solid #f3f4f6",
                                            position: "relative",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            !dayAppointments.length &&
                                            handleCreateAppointment()
                                        }
                                    >
                                        {dayAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditAppointment(
                                                        appointment
                                                    );
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: "2px",
                                                    left: "8px",
                                                    right: "8px",
                                                    bottom: "2px",
                                                    backgroundColor:
                                                        getStatusColor(
                                                            appointment.status
                                                        ),
                                                    borderRadius: "4px",
                                                    padding: "0.25rem 0.5rem",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "0.75rem",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "center",
                                                    boxShadow:
                                                        "0 1px 3px rgba(0, 0, 0, 0.2)",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: "500",
                                                        marginBottom: "2px",
                                                    }}
                                                >
                                                    {
                                                        appointment.patient
                                                            .nome_completo
                                                    }
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.625rem",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {appointment.tipo_consulta ||
                                                        "Consulta"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
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
