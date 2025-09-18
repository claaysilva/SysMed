import React, { useState, useCallback, useEffect } from "react";
import {
    Calendar,
    Clock,
    Users,
    Search,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import {
    format,
    addDays,
    subDays,
    startOfDay,
    isSameDay,
    parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Button from "../components/Button";
import Modal from "../components/Modal";
import AppointmentForm from "../components/AppointmentForm";

import React, { useState, useCallback, useEffect } from "react";
import {
    Calendar,
    Clock,
    Users,
    Search,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import {
    format,
    addDays,
    subDays,
    startOfDay,
    isSameDay,
    parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Button from "../components/Button";
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
    const [viewMode, setViewMode] = useState<"day" | "week">("day");
    const [showForm, setShowForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AppointmentType | null>(null);

    // Estados de filtros
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
        await loadAppointments();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedAppointment(null);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            agendado: "#fbbf24", // amber-400
            confirmado: "#3b82f6", // blue-500
            realizado: "#10b981", // emerald-500
            cancelado: "#ef4444", // red-500
            faltou: "#6b7280", // gray-500
        };
        return colors[status as keyof typeof colors] || "#6b7280";
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

    // Gerar horários do dia (8h às 18h, intervalos de 30min)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, "0")}:00`);
            slots.push(`${hour.toString().padStart(2, "0")}:30`);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Filtrar consultas do dia atual
    const todayAppointments = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.data_hora_inicio);
        return isSameDay(appointmentDate, currentDate);
    });

    const navigateDate = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setCurrentDate(subDays(currentDate, 1));
        } else {
            setCurrentDate(addDays(currentDate, 1));
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
            {/* Header estilo iClinic */}
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
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "500",
                            color: "#1f2937",
                            margin: 0,
                        }}
                    >
                        Dr. João Silva
                    </h1>
                    <Button
                        onClick={handleCreateAppointment}
                        style={{
                            backgroundColor: "#2563eb",
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                        }}
                    >
                        <Plus size={16} style={{ marginRight: "0.5rem" }} />
                        Novo Agendamento
                    </Button>
                </div>
            </div>

            {/* Toolbar de navegação */}
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
                            {format(currentDate, "d 'de' MMMM 'de' yyyy", {
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
                                        height: "60px",
                                        borderBottom: "1px solid #f3f4f6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.875rem",
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

                            {timeSlots.map((time, index) => {
                                const appointment = todayAppointments.find(
                                    (apt) => {
                                        const aptTime = format(
                                            new Date(apt.data_hora_inicio),
                                            "HH:mm"
                                        );
                                        return aptTime === time;
                                    }
                                );

                                return (
                                    <div
                                        key={time}
                                        style={{
                                            height: "60px",
                                            borderBottom: "1px solid #f3f4f6",
                                            position: "relative",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            !appointment &&
                                            handleCreateAppointment()
                                        }
                                    >
                                        {appointment && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditAppointment(
                                                        appointment
                                                    );
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: "4px",
                                                    left: "8px",
                                                    right: "8px",
                                                    bottom: "4px",
                                                    backgroundColor:
                                                        getStatusColor(
                                                            appointment.status
                                                        ),
                                                    borderRadius: "4px",
                                                    padding: "0.5rem",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "0.875rem",
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
                                                        fontSize: "0.75rem",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {appointment.tipo_consulta ||
                                                        "Consulta"}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Linha de horário de almoço */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: `${60 + 8 * 60}px`, // 12:00 (4 horas * 2 slots * 30px)
                                    left: 0,
                                    right: 0,
                                    height: "120px", // 2 horas de almoço
                                    backgroundColor: "rgba(251, 191, 36, 0.1)",
                                    border: "1px solid rgba(251, 191, 36, 0.3)",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: "none",
                                    fontSize: "0.75rem",
                                    color: "#92400e",
                                    fontWeight: "500",
                                }}
                            >
                                Horário de almoço
                            </div>
                        </div>
                    </div>
                )}

                {/* Visualização por semana (simplificada) */}
                {viewMode === "week" && (
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "2rem",
                            marginTop: "1rem",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "1.125rem",
                                color: "#6b7280",
                                margin: 0,
                            }}
                        >
                            Visualização semanal em desenvolvimento
                        </h3>
                        <p
                            style={{
                                color: "#9ca3af",
                                marginTop: "0.5rem",
                            }}
                        >
                            Use a visualização diária por enquanto
                        </p>
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
