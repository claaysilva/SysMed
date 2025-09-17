import React from "react";

interface UpcomingAppointment {
    id: number;
    data_consulta: string;
    horario: string;
    patient: {
        nome_completo: string;
    };
    user: {
        name: string;
    };
}

interface UpcomingAppointmentsCardProps {
    appointments: UpcomingAppointment[];
    loading?: boolean;
}

const UpcomingAppointmentsCard: React.FC<UpcomingAppointmentsCardProps> = ({
    appointments,
    loading = false,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "Hoje";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Amanhã";
        } else {
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            });
        }
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // HH:MM
    };

    if (loading) {
        return (
            <div
                style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
            >
                <h3
                    style={{
                        margin: "0 0 1rem 0",
                        color: "#333",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                    }}
                >
                    Próximas Consultas
                </h3>
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#666",
                    }}
                >
                    Carregando consultas...
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
                <h3
                    style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                    }}
                >
                    Próximas Consultas
                </h3>
                <span
                    style={{
                        background: "#e3f2fd",
                        color: "#1976d2",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                    }}
                >
                    {appointments.length} agendadas
                </span>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {appointments.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "3rem 1rem",
                            color: "#666",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                            📅
                        </div>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>
                            Nenhuma consulta agendada para os próximos dias
                        </p>
                    </div>
                ) : (
                    appointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "0.75rem",
                                marginBottom: "0.5rem",
                                borderRadius: "8px",
                                border: "1px solid #f0f0f0",
                                background: "#fafafa",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f5f5f5";
                                e.currentTarget.style.borderColor = "#ddd";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fafafa";
                                e.currentTarget.style.borderColor = "#f0f0f0";
                            }}
                        >
                            <div
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "8px",
                                    background: "#1976d2",
                                    color: "white",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: "500",
                                    }}
                                >
                                    {formatDate(appointment.data_consulta)}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {formatTime(appointment.horario)}
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: "600",
                                        color: "#333",
                                        fontSize: "0.9rem",
                                        marginBottom: "0.25rem",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {appointment.patient.nome_completo}
                                </div>

                                <div
                                    style={{
                                        color: "#666",
                                        fontSize: "0.8rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <span>👨‍⚕️ {appointment.user.name}</span>
                                </div>
                            </div>

                            <div
                                style={{
                                    color: "#1976d2",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                }}
                            >
                                →
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingAppointmentsCard;
