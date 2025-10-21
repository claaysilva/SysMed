import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import {
    FileText,
    Printer,
    Settings,
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    Clock,
} from "lucide-react";
import { format, addDays, startOfWeek, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import Modal from "../components/Modal";
import { useToast } from "../contexts/toastContextBase";
import AppointmentForm from "../components/AppointmentForm";
import ErrorBoundary from "../components/ErrorBoundary";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DateSpanApi, DatesSetArg, CalendarApi } from "@fullcalendar/core";
import { useAppointments } from "../hooks/useAppointments";

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
    // Ações adicionais
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showOnline, setShowOnline] = useState(false);
    const [onlineEnabled, setOnlineEnabled] = useState<boolean>(
        () => localStorage.getItem("sysmed_online_enabled") === "1"
    );
    // Lista de espera simples (persistência local)
    type WaitItem = {
        id: string;
        patient: string;
        date?: string; // yyyy-MM-dd
        time?: string; // HH:mm
        notes?: string;
    };
    const [waitlist, setWaitlist] = useState<WaitItem[]>(() => {
        try {
            const raw = localStorage.getItem("sysmed_waitlist");
            return raw ? (JSON.parse(raw) as WaitItem[]) : [];
        } catch {
            return [];
        }
    });
    const [wlForm, setWlForm] = useState<WaitItem>({ id: "", patient: "" });

    // Observações por data (persistência local)
    const [noteText, setNoteText] = useState<string>("");
    const [viewRangeStart, setViewRangeStart] = useState<string>("");
    const [viewRangeEnd, setViewRangeEnd] = useState<string>("");
    // Controlar slotMaxTime dinamicamente (sábados: 11:00 no modo Dia)
    const [slotMaxTime, setSlotMaxTime] = useState<string>("18:00:00");

    // Guardar último filtro usado para recarregar após criar/editar
    const lastFetchFiltersRef = useRef<Record<string, unknown> | null>(null);

    useEffect(() => {
        // O primeiro carregamento será disparado pelo datesSet do FullCalendar
        // para garantir que usamos o range atual da visão.
        // Ainda assim mantemos este efeito vazio para evitar lints.
    }, []);

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
    const calendarWrapRef = useRef<HTMLDivElement | null>(null);
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
        const view =
            vm === "month"
                ? "dayGridMonth"
                : vm === "day"
                ? "timeGridDay"
                : "timeGridWeek";
        api?.changeView(view);
        setViewMode(vm);
    };

    // Eventos do FullCalendar mapeados dos agendamentos
    const calendarEvents = useMemo(() => {
        const toLocalDate = (s: string | undefined | null) => {
            if (!s) return undefined as unknown as Date;
            const parts = s.trim().split(/[T ]/);
            const datePart = parts[0];
            const timePart = parts[1] || "00:00:00";
            const [y, m, d] = datePart.split("-").map((n) => parseInt(n, 10));
            const [hh, mm, ss] = timePart
                .split(":")
                .map((n) => parseInt(n, 10)) as [number, number, number];
            return new Date(
                y,
                (m || 1) - 1,
                d || 1,
                hh || 0,
                mm || 0,
                ss || 0,
                0
            );
        };
        return appointments.map((apt) => ({
            id: String(apt.id),
            title: apt.patient?.nome_completo || "Consulta",
            start: toLocalDate(apt.data_hora_inicio),
            end: toLocalDate(apt.data_hora_fim),
            extendedProps: { apt },
            color: getStatusColor(apt.status),
        }));
    }, [appointments]);

    // Helpers persistência
    const saveWaitlist = (items: Waitlist) => {
        localStorage.setItem("sysmed_waitlist", JSON.stringify(items));
    };
    type Waitlist = WaitItem[];

    const keyForNote = (d: Date) => `sysmed_notes:${format(d, "yyyy-LL-dd")}`;
    const loadNoteForDate = useCallback((d: Date) => {
        try {
            const raw = localStorage.getItem(keyForNote(d));
            setNoteText(raw || "");
        } catch {
            setNoteText("");
        }
    }, []);

    useEffect(() => {
        loadNoteForDate(currentDate);
    }, [currentDate, loadNoteForDate]);

    // Ações dos botões
    const onOpenWaitlist = () => setShowWaitlist(true);
    const onOpenNotes = () => setShowNotes(true);
    const onOpenOnline = () => setShowOnline(true);
    const onToggleOnline = (val: boolean) => {
        setOnlineEnabled(val);
        localStorage.setItem("sysmed_online_enabled", val ? "1" : "0");
    };
    const onCopyOnlineLink = async () => {
        const url = `${window.location.origin}/real_login.html`;
        try {
            await navigator.clipboard.writeText(url);
            showSuccess("Link de agendamento copiado!");
        } catch {
            // fallback
            alert(`Copie o link: ${url}`);
        }
    };

    const onAddWaitItem = () => {
        const name = (wlForm.patient || "").trim();
        if (!name) return;
        const item: WaitItem = {
            id: `${Date.now()}`,
            patient: name,
            date: wlForm.date,
            time: wlForm.time,
            notes: wlForm.notes,
        };
        const next = [item, ...waitlist];
        setWaitlist(next);
        saveWaitlist(next);
        setWlForm({ id: "", patient: "" });
    };
    const onRemoveWaitItem = (id: string) => {
        const next = waitlist.filter((i) => i.id !== id);
        setWaitlist(next);
        saveWaitlist(next);
    };
    const onSaveNote = () => {
        try {
            localStorage.setItem(keyForNote(currentDate), noteText || "");
            showSuccess("Observações salvas para o dia.");
            setShowNotes(false);
        } catch {
            /* ignore */
        }
    };

    const onPrintAgenda = () => {
        // Gerar lista a partir dos appointments no range visível
        const toLocal = (s: string) => {
            const [datePart, timePart = "00:00:00"] = s.split(/[T ]/);
            const [y, m, d] = datePart.split("-").map((n) => parseInt(n, 10));
            const [hh, mm, ss] = timePart
                .split(":")
                .map((n) => parseInt(n, 10)) as [number, number, number];
            return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
        };
        const startStr = viewRangeStart || format(currentDate, "yyyy-LL-dd");
        const endStr = viewRangeEnd || format(currentDate, "yyyy-LL-dd");
        const start = new Date(startStr + "T00:00:00");
        const end = new Date(endStr + "T00:00:00");
        // FullCalendar usa end exclusivo; ajustar -1ms para inclusivo
        const endInclusive = new Date(end.getTime() - 1);
        const items = appointments
            .map((a) => ({
                ...a,
                _start: toLocal(a.data_hora_inicio),
                _end: toLocal(a.data_hora_fim),
            }))
            .filter((a) => a._start >= start && a._start <= endInclusive)
            .sort((a, b) => a._start.getTime() - b._start.getTime());

        const title = `Agenda ${
            viewMode === "week"
                ? `${format(start, "dd/MM")} a ${format(endInclusive, "dd/MM")}`
                : format(currentDate, "dd/MM/yyyy")
        }`;

        const rows = items
            .map(
                (a) => `
            <tr>
              <td style="padding:6px;border:1px solid #e5e7eb;white-space:nowrap">${format(
                  a._start,
                  "HH:mm"
              )} - ${format(a._end, "HH:mm")}</td>
              <td style="padding:6px;border:1px solid #e5e7eb">${
                  a.patient?.nome_completo || "—"
              }</td>
              <td style="padding:6px;border:1px solid #e5e7eb">${
                  a.user?.name || "—"
              }</td>
              <td style="padding:6px;border:1px solid #e5e7eb;text-transform:capitalize">${
                  a.status
              }</td>
            </tr>`
            )
            .join("");

        const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body{ font-family: Arial, sans-serif; color:#111827; }
    h1{ font-size:18px; margin:0 0 12px 0; }
    table{ width:100%; border-collapse: collapse; font-size:12px; }
    @media print { .no-print{ display:none } }
  </style>
  </head>
  <body>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h1>${title}</h1>
      <span style="color:#6b7280;font-size:12px">Gerado em ${format(
          new Date(),
          "dd/MM/yyyy HH:mm"
      )}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:6px;border:1px solid #e5e7eb">Horário</th>
          <th style="text-align:left;padding:6px;border:1px solid #e5e7eb">Paciente</th>
          <th style="text-align:left;padding:6px;border:1px solid #e5e7eb">Médico</th>
          <th style="text-align:left;padding:6px;border:1px solid #e5e7eb">Status</th>
        </tr>
      </thead>
      <tbody>${
          rows || "<tr><td colspan=4 style='padding:8px'>Sem itens</td></tr>"
      }</tbody>
    </table>
    <div class="no-print" style="margin-top:16px">
      <button onclick="window.print();">Imprimir</button>
    </div>
  </body>
  </html>`;

        const w = window.open("", "_blank");
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
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
                                gap: "0.4rem",
                                padding: "0.50rem 0.75rem",
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
                            onClick={onOpenWaitlist}
                        >
                            <Clock size={16} />
                            Lista de Espera
                            {waitlist.length > 0 && (
                                <span
                                    style={{
                                        backgroundColor: "#ef4444",
                                        color: "white",
                                        borderRadius: "9999px",
                                        padding: "0 6px",
                                        fontSize: "0.75rem",
                                        lineHeight: "1.25rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {waitlist.length}
                                </span>
                            )}
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
                            onClick={onOpenNotes}
                        >
                            <FileText size={16} />
                            Observações
                            {noteText && noteText.trim().length > 0 && (
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        backgroundColor: "#10b981",
                                        borderRadius: "9999px",
                                        display: "inline-block",
                                    }}
                                />
                            )}
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
                            onClick={onPrintAgenda}
                        >
                            <Printer size={14} />
                            Imprimir Agenda
                        </button>

                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                padding: "0.50rem 0.75rem",
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
                            onClick={onOpenOnline}
                        >
                            <Settings size={14} />
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
                        {(
                            ["month", "week", "day"] as Array<
                                "month" | "week" | "day"
                            >
                        ).map((vm) => (
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
                    ref={calendarWrapRef}
                >
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView={"timeGridWeek"}
                        headerToolbar={false}
                        footerToolbar={false}
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
                        slotMinTime="08:00:00"
                        slotMaxTime={slotMaxTime}
                        slotDuration="00:30:00"
                        slotLabelInterval="01:00:00"
                        slotLabelFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }}
                        eventTimeFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }}
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
                                // Na visão de mês: trocar para dia usando a API do calendário
                                const api = getCalendarApi();
                                api?.changeView("timeGridDay", arg.date);
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
                            // Preferir usar os dados completos em extendedProps quando disponíveis
                            const ext = info.event.extendedProps as
                                | { apt?: AppointmentType }
                                | undefined;
                            const aptFromExt = ext?.apt as
                                | AppointmentType
                                | undefined;
                            if (aptFromExt && aptFromExt.id) {
                                handleEditAppointment(aptFromExt);
                                return;
                            }
                            const id = Number(info.event.id);
                            if (!Number.isNaN(id)) {
                                const apt = appointments.find(
                                    (a) => a.id === id
                                );
                                if (apt) {
                                    handleEditAppointment(
                                        apt as unknown as AppointmentType
                                    );
                                }
                            }
                        }}
                        datesSet={async (arg: DatesSetArg) => {
                            // manter o título e botões em sincronia com a visão atual
                            const newDate = arg.start;
                            if (
                                !currentDate ||
                                currentDate.getTime() !== newDate.getTime()
                            ) {
                                setCurrentDate(newDate);
                            }
                            const t = arg.view.type;
                            const vm: "day" | "week" | "month" =
                                t === "dayGridMonth"
                                    ? "month"
                                    : t === "timeGridDay"
                                    ? "day"
                                    : "week";
                            if (vm !== viewMode) setViewMode(vm);

                            // Ajustar slotMaxTime: sábados (6) no modo Dia devem terminar às 11:00, senão 18:00
                            const desiredMax =
                                vm === "day" && newDate.getDay() === 6
                                    ? "11:00:00"
                                    : "18:00:00";
                            if (desiredMax !== slotMaxTime) {
                                setSlotMaxTime(desiredMax);
                            }

                            // Buscar consultas para o range atual do calendário
                            // Observação: arg.start/arg.end são limites do range da visão atual
                            const rangeStart = format(arg.start, "yyyy-LL-dd");
                            const rangeEnd = format(arg.end, "yyyy-LL-dd");
                            setViewRangeStart(rangeStart);
                            setViewRangeEnd(rangeEnd);
                            const newKey = `${rangeStart}:${rangeEnd}`;
                            const oldKey =
                                (lastFetchFiltersRef.current
                                    ?.__key as string) || "";
                            if (newKey !== oldKey) {
                                const filters = {
                                    start_date: rangeStart,
                                    end_date: rangeEnd,
                                    sort_by: "data_hora_inicio",
                                    sort_order: "asc",
                                    per_page: 500,
                                    // chave interna para evitar chamadas duplicadas
                                    __key: newKey,
                                } as Record<string, unknown>;
                                try {
                                    await fetchAppointments(filters);
                                    lastFetchFiltersRef.current = filters;
                                } catch {
                                    // Erros já são tratados no hook; ignorar aqui
                                }
                            }

                            // Anotar áreas desabilitadas com tooltip (hover)
                            // - Fora do expediente (.fc-non-business)
                            // - Dias passados (colunas e dias do month view)
                            setTimeout(() => {
                                const root = calendarWrapRef.current;
                                if (!root) return;
                                root.querySelectorAll<HTMLElement>(
                                    ".fc-non-business"
                                ).forEach((el) => {
                                    el.setAttribute(
                                        "title",
                                        "Fora do expediente"
                                    );
                                });
                                root.querySelectorAll<HTMLElement>(
                                    ".fc-timegrid .fc-day-past .fc-timegrid-slot, .fc-daygrid .fc-day-past"
                                ).forEach((el) => {
                                    if (!el.getAttribute("title")) {
                                        el.setAttribute("title", "Dia passado");
                                    }
                                });
                            }, 0);
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
                            ? "Editar Agendamento"
                            : "Novo Agendamento"
                    }
                    onClose={handleFormCancel}
                >
                    <ErrorBoundary>
                        <AppointmentForm
                            appointment={selectedAppointment || undefined}
                            initialStart={
                                selectedAppointment ? undefined : initialStart
                            }
                            initialEnd={
                                selectedAppointment ? undefined : initialEnd
                            }
                            onSubmit={async () => {
                                await handleFormSubmit();
                                // Recarregar com os últimos filtros usados no calendário
                                const filters =
                                    lastFetchFiltersRef.current || {};
                                try {
                                    await fetchAppointments(filters);
                                } catch {
                                    // Ignorar erros aqui; UI já mostra toast/erro do hook
                                }
                            }}
                            onCancel={handleFormCancel}
                        />
                    </ErrorBoundary>
                </Modal>
            )}

            {/* Modal: Lista de Espera */}
            {showWaitlist && (
                <Modal
                    isOpen={showWaitlist}
                    onClose={() => setShowWaitlist(false)}
                    title="Lista de Espera"
                >
                    <div style={{ display: "grid", gap: 12 }}>
                        <div style={{ display: "grid", gap: 8 }}>
                            <label className="text-sm text-gray-700">
                                Paciente
                            </label>
                            <input
                                value={wlForm.patient || ""}
                                onChange={(e) =>
                                    setWlForm((p) => ({
                                        ...p,
                                        patient: e.target.value,
                                    }))
                                }
                                placeholder="Nome do paciente"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 8,
                                }}
                            >
                                <div>
                                    <label className="text-sm text-gray-700">
                                        Data (opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={wlForm.date || ""}
                                        onChange={(e) =>
                                            setWlForm((p) => ({
                                                ...p,
                                                date: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700">
                                        Hora (opcional)
                                    </label>
                                    <input
                                        type="time"
                                        value={wlForm.time || ""}
                                        onChange={(e) =>
                                            setWlForm((p) => ({
                                                ...p,
                                                time: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <label className="text-sm text-gray-700">
                                Notas
                            </label>
                            <textarea
                                value={wlForm.notes || ""}
                                onChange={(e) =>
                                    setWlForm((p) => ({
                                        ...p,
                                        notes: e.target.value,
                                    }))
                                }
                                rows={3}
                                placeholder="Detalhes da necessidade do paciente..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    onClick={onAddWaitItem}
                                    type="button"
                                    className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Itens
                            </h4>
                            <div className="border border-gray-200 rounded-md divide-y">
                                {waitlist.length === 0 && (
                                    <div className="p-3 text-sm text-gray-500">
                                        Nenhum item
                                    </div>
                                )}
                                {waitlist.map((w) => (
                                    <div
                                        key={w.id}
                                        className="p-3 flex items-center justify-between gap-3"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {w.patient}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {(w.date || "").toString()}{" "}
                                                {w.time ? `às ${w.time}` : ""}
                                            </div>
                                            {w.notes && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {w.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() =>
                                                    onRemoveWaitItem(w.id)
                                                }
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal: Observações do Dia */}
            {showNotes && (
                <Modal
                    isOpen={showNotes}
                    onClose={() => setShowNotes(false)}
                    title={`Observações - ${format(currentDate, "dd/MM/yyyy")}`}
                >
                    <div className="space-y-3">
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={6}
                            placeholder="Escreva observações gerais para este dia (visíveis apenas internamente)."
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowNotes(false)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onSaveNote}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal: Agendamento Online */}
            {showOnline && (
                <Modal
                    isOpen={showOnline}
                    onClose={() => setShowOnline(false)}
                    title="Agendamento Online"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                                Habilitar solicitações online
                            </span>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={onlineEnabled}
                                    onChange={(e) =>
                                        onToggleOnline(e.target.checked)
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative" />
                            </label>
                        </div>
                        <div className="text-sm text-gray-600">
                            Quando habilitado, pacientes podem solicitar horário
                            via link público. Você aprova e confirma pela
                            agenda.
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value={`${window.location.origin}/real_login.html`}
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                            <button
                                onClick={onCopyOnlineLink}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
                            >
                                Copiar link
                            </button>
                        </div>
                    </div>
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
