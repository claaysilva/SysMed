import React, { useState } from "react";
import { StatusBadge } from "./Badge";
import Card from "./Card";
import LoadingSpinner from "./LoadingSpinner";

interface CalendarEvent {
    id: number;
    title: string;
    patient: string;
    doctor: string;
    start: Date;
    end: Date;
    type: "consulta" | "retorno" | "exame" | "cirurgia";
    status: "agendado" | "cancelado" | "concluido";
    color?: string;
}

interface CalendarProps {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
    onDateClick?: (date: Date) => void;
    loading?: boolean;
}

type ViewType = "month" | "week" | "day";

const Calendar: React.FC<CalendarProps> = ({
    events = [],
    onEventClick,
    onEventDrop,
    onDateClick,
    loading = false,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>("month");
    const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(
        null
    );

    // Função para obter cores por tipo de consulta
    const getEventColor = (type: CalendarEvent["type"]) => {
        const colors = {
            consulta: "#3b82f6", // Azul
            retorno: "#10b981", // Verde
            exame: "#f59e0b", // Amarelo
            cirurgia: "#ef4444", // Vermelho
        };
        return colors[type];
    };

    // Função para navegar entre datas
    const navigateDate = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);

        switch (view) {
            case "month":
                newDate.setMonth(
                    currentDate.getMonth() + (direction === "next" ? 1 : -1)
                );
                break;
            case "week": {
                const weekStart = new Date(currentDate);
                weekStart.setDate(
                    currentDate.getDate() + (direction === "next" ? 7 : -7)
                );
                newDate.setTime(weekStart.getTime());
                break;
            }
            case "day":
                newDate.setDate(
                    currentDate.getDate() + (direction === "next" ? 1 : -1)
                );
                break;
        }

        setCurrentDate(newDate);
    };

    // Função para formatar título da data
    const getDateTitle = () => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
        };

        switch (view) {
            case "month":
                return currentDate.toLocaleDateString("pt-BR", options);
            case "week": {
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return `${weekStart.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                })} - ${weekEnd.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}`;
            }
            case "day":
                return currentDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                });
        }
    };

    // Renderizar vista do mês
    const renderMonthView = () => {
        const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        );
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days = [];
        const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

        // Header dos dias da semana
        days.push(
            <div
                key="header"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "1px",
                    backgroundColor: "#e5e7eb",
                    marginBottom: "1px",
                }}
            >
                {weekDays.map((day) => (
                    <div
                        key={day}
                        style={{
                            padding: "1rem",
                            backgroundColor: "#f9fafb",
                            textAlign: "center",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>
        );

        // Células do calendário
        const calendarCells = [];
        let currentDay = 1;

        for (let week = 0; week < 6; week++) {
            const weekCells = [];

            for (let day = 0; day < 7; day++) {
                const cellDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDay - firstDayOfWeek + day + 1
                );
                const isCurrentMonth =
                    cellDate.getMonth() === currentDate.getMonth();
                const isToday =
                    cellDate.toDateString() === new Date().toDateString();

                // Filtrar eventos para este dia
                const dayEvents = events.filter((event) => {
                    const eventDate = new Date(event.start);
                    return eventDate.toDateString() === cellDate.toDateString();
                });

                weekCells.push(
                    <div
                        key={`${week}-${day}`}
                        style={{
                            minHeight: "120px",
                            padding: "0.5rem",
                            backgroundColor: isCurrentMonth
                                ? "white"
                                : "#f9fafb",
                            border: "1px solid #e5e7eb",
                            cursor: "pointer",
                            position: "relative",
                            opacity: isCurrentMonth ? 1 : 0.5,
                        }}
                        onClick={() => onDateClick?.(cellDate)}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (draggedEvent && onEventDrop) {
                                const newStart = new Date(cellDate);
                                newStart.setHours(
                                    draggedEvent.start.getHours(),
                                    draggedEvent.start.getMinutes()
                                );
                                const newEnd = new Date(newStart);
                                newEnd.setTime(
                                    newEnd.getTime() +
                                        (draggedEvent.end.getTime() -
                                            draggedEvent.start.getTime())
                                );
                                onEventDrop(draggedEvent, newStart, newEnd);
                            }
                            setDraggedEvent(null);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div
                            style={{
                                fontSize: "0.875rem",
                                fontWeight: isToday ? "700" : "500",
                                color: isToday ? "#3b82f6" : "#374151",
                                marginBottom: "0.25rem",
                            }}
                        >
                            {cellDate.getDate()}
                        </div>

                        {/* Eventos do dia */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                            }}
                        >
                            {dayEvents.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    draggable
                                    onDragStart={() => setDraggedEvent(event)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick?.(event);
                                    }}
                                    style={{
                                        padding: "2px 6px",
                                        backgroundColor: getEventColor(
                                            event.type
                                        ),
                                        color: "white",
                                        borderRadius: "4px",
                                        fontSize: "0.75rem",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        opacity:
                                            event.status === "cancelado"
                                                ? 0.5
                                                : 1,
                                        textDecoration:
                                            event.status === "cancelado"
                                                ? "line-through"
                                                : "none",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {event.start.toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    {event.patient}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "#6b7280",
                                        textAlign: "center",
                                    }}
                                >
                                    +{dayEvents.length - 3} mais
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            calendarCells.push(
                <div
                    key={week}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                    }}
                >
                    {weekCells}
                </div>
            );

            currentDay += 7;
            if (currentDay > daysInMonth && week >= 4) break;
        }

        return (
            <div>
                {days}
                {calendarCells}
            </div>
        );
    };

    // Renderizar vista da semana
    const renderWeekView = () => {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());

        const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8h às 21h
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            return day;
        });

        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Header dos dias */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "80px repeat(7, 1fr)",
                        gap: "1px",
                        backgroundColor: "#e5e7eb",
                        marginBottom: "1px",
                    }}
                >
                    <div
                        style={{ backgroundColor: "#f9fafb", padding: "1rem" }}
                    ></div>
                    {weekDays.map((day) => (
                        <div
                            key={day.toISOString()}
                            style={{
                                padding: "1rem",
                                backgroundColor: "#f9fafb",
                                textAlign: "center",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                            }}
                        >
                            <div>
                                {day.toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                })}
                            </div>
                            <div
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "700",
                                }}
                            >
                                {day.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid de horários */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "80px repeat(7, 1fr)",
                        gap: "1px",
                        backgroundColor: "#e5e7eb",
                    }}
                >
                    {hours.map((hour) => (
                        <React.Fragment key={hour}>
                            <div
                                style={{
                                    padding: "0.5rem",
                                    backgroundColor: "#f9fafb",
                                    textAlign: "center",
                                    fontSize: "0.75rem",
                                    color: "#6b7280",
                                    borderRight: "1px solid #e5e7eb",
                                }}
                            >
                                {hour}:00
                            </div>
                            {weekDays.map((day) => {
                                const cellDateTime = new Date(day);
                                cellDateTime.setHours(hour, 0, 0, 0);

                                const hourEvents = events.filter((event) => {
                                    const eventStart = new Date(event.start);
                                    return (
                                        eventStart.toDateString() ===
                                            day.toDateString() &&
                                        eventStart.getHours() === hour
                                    );
                                });

                                return (
                                    <div
                                        key={`${day.toISOString()}-${hour}`}
                                        style={{
                                            minHeight: "60px",
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            padding: "0.25rem",
                                            cursor: "pointer",
                                            position: "relative",
                                        }}
                                        onClick={() =>
                                            onDateClick?.(cellDateTime)
                                        }
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedEvent && onEventDrop) {
                                                const newStart = new Date(
                                                    cellDateTime
                                                );
                                                const duration =
                                                    draggedEvent.end.getTime() -
                                                    draggedEvent.start.getTime();
                                                const newEnd = new Date(
                                                    newStart.getTime() +
                                                        duration
                                                );
                                                onEventDrop(
                                                    draggedEvent,
                                                    newStart,
                                                    newEnd
                                                );
                                            }
                                            setDraggedEvent(null);
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        {hourEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                draggable
                                                onDragStart={() =>
                                                    setDraggedEvent(event)
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick?.(event);
                                                }}
                                                style={{
                                                    padding: "4px 8px",
                                                    backgroundColor:
                                                        getEventColor(
                                                            event.type
                                                        ),
                                                    color: "white",
                                                    borderRadius: "4px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "500",
                                                    cursor: "pointer",
                                                    marginBottom: "2px",
                                                    opacity:
                                                        event.status ===
                                                        "cancelado"
                                                            ? 0.5
                                                            : 1,
                                                    textDecoration:
                                                        event.status ===
                                                        "cancelado"
                                                            ? "line-through"
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {event.patient}
                                                </div>
                                                <div style={{ opacity: 0.9 }}>
                                                    {event.title}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    // Renderizar vista do dia
    const renderDayView = () => {
        const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8h às 21h

        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                {hours.map((hour) => {
                    const cellDateTime = new Date(currentDate);
                    cellDateTime.setHours(hour, 0, 0, 0);

                    const hourEvents = events.filter((event) => {
                        const eventStart = new Date(event.start);
                        return (
                            eventStart.toDateString() ===
                                currentDate.toDateString() &&
                            eventStart.getHours() === hour
                        );
                    });

                    return (
                        <div
                            key={hour}
                            style={{
                                display: "flex",
                                minHeight: "80px",
                                borderBottom: "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    width: "80px",
                                    padding: "1rem 0.5rem",
                                    backgroundColor: "#f9fafb",
                                    textAlign: "center",
                                    fontSize: "0.875rem",
                                    color: "#6b7280",
                                    borderRight: "1px solid #e5e7eb",
                                }}
                            >
                                {hour}:00
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                                onClick={() => onDateClick?.(cellDateTime)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedEvent && onEventDrop) {
                                        const newStart = new Date(cellDateTime);
                                        const duration =
                                            draggedEvent.end.getTime() -
                                            draggedEvent.start.getTime();
                                        const newEnd = new Date(
                                            newStart.getTime() + duration
                                        );
                                        onEventDrop(
                                            draggedEvent,
                                            newStart,
                                            newEnd
                                        );
                                    }
                                    setDraggedEvent(null);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {hourEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        draggable
                                        onDragStart={() =>
                                            setDraggedEvent(event)
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick?.(event);
                                        }}
                                        style={{
                                            padding: "0.75rem 1rem",
                                            backgroundColor: getEventColor(
                                                event.type
                                            ),
                                            color: "white",
                                            borderRadius: "8px",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            cursor: "pointer",
                                            marginBottom: "0.5rem",
                                            opacity:
                                                event.status === "cancelado"
                                                    ? 0.5
                                                    : 1,
                                            textDecoration:
                                                event.status === "cancelado"
                                                    ? "line-through"
                                                    : "none",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: "600",
                                                    marginBottom: "0.25rem",
                                                }}
                                            >
                                                {event.patient}
                                            </div>
                                            <div style={{ opacity: 0.9 }}>
                                                {event.title} - Dr.{" "}
                                                {event.doctor}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {event.start.toLocaleTimeString(
                                                    "pt-BR",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}{" "}
                                                -
                                                {event.end.toLocaleTimeString(
                                                    "pt-BR",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </div>
                                            <StatusBadge
                                                status={event.status}
                                                size="small"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <Card>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "400px",
                    }}
                >
                    <LoadingSpinner
                        size="large"
                        message="Carregando agenda..."
                    />
                </div>
            </Card>
        );
    }

    return (
        <Card>
            {/* Header do Calendário */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#111827",
                            margin: 0,
                        }}
                    >
                        {getDateTitle()}
                    </h2>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => navigateDate("prev")}
                            style={{
                                padding: "0.5rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "1rem",
                            }}
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            style={{
                                padding: "0.5rem 1rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                            }}
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => navigateDate("next")}
                            style={{
                                padding: "0.5rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "1rem",
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Botões de visualização */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {(["month", "week", "day"] as ViewType[]).map(
                        (viewType) => (
                            <button
                                key={viewType}
                                onClick={() => setView(viewType)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    border: "1px solid #d1d5db",
                                    backgroundColor:
                                        view === viewType ? "#3b82f6" : "white",
                                    color:
                                        view === viewType ? "white" : "#374151",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    textTransform: "capitalize",
                                }}
                            >
                                {viewType === "month"
                                    ? "Mês"
                                    : viewType === "week"
                                    ? "Semana"
                                    : "Dia"}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Legenda */}
            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                }}
            >
                {[
                    { type: "consulta", label: "Consulta" },
                    { type: "retorno", label: "Retorno" },
                    { type: "exame", label: "Exame" },
                    { type: "cirurgia", label: "Cirurgia" },
                ].map(({ type, label }) => (
                    <div
                        key={type}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "16px",
                                height: "16px",
                                backgroundColor: getEventColor(
                                    type as CalendarEvent["type"]
                                ),
                                borderRadius: "4px",
                            }}
                        />
                        <span
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                        >
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Renderizar vista atual */}
            <div style={{ overflow: "auto" }}>
                {view === "month" && renderMonthView()}
                {view === "week" && renderWeekView()}
                {view === "day" && renderDayView()}
            </div>
        </Card>
    );
};

export default Calendar;
export type { CalendarEvent };
