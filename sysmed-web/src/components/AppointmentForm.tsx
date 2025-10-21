import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppointments } from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";
import Button from "./Button";
import { addMinutes, format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
// registra locale pt-BR para o react-datepicker
registerLocale("pt-BR", ptBR);
import { apiRequest } from "../services/api";
import { useToast } from "../hooks/useToast";
import { ApiErrorHandler } from "../utils/errorHandler";

interface Appointment {
    id?: number;
    patient_id: number;
    user_id: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    observacoes?: string;
    tipo_consulta?: "consulta" | "retorno" | "emergencia" | "exame";
    valor?: number;
}

interface AppointmentFormProps {
    appointment?: Appointment;
    onSubmit: () => void;
    onCancel: () => void;
    // Novas props para defaults ao criar
    initialStart?: string;
    initialEnd?: string;
}

type DoctorItem = { id: number; name: string };
type DoctorsResponse = DoctorItem[] | { success: boolean; data: DoctorItem[] };

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    appointment,
    onSubmit,
    onCancel,
    initialStart,
    initialEnd,
}) => {
    const { showError } = useToast();
    const {
        createAppointment,
        updateAppointment,
        loading,
        getAvailableSlots,
        clearError,
    } = useAppointments();
    const { patients, loading: patientsLoading } = usePatients();

    const [formData, setFormData] = useState({
        patient_id: "",
        user_id: "", // será preenchido conforme médico logado ou primeiro médico carregado
        data_hora_inicio: "",
        data_hora_fim: "",
        observacoes: "",
        tipo_consulta: "consulta" as
            | "consulta"
            | "retorno"
            | "emergencia"
            | "exame",
        valor: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [doctors, setDoctors] = useState<Array<DoctorItem>>([]);

    // Novos estados controlados: data e hora de início
    const [dateOnly, setDateOnly] = useState<string>(""); // yyyy-MM-dd
    const [timeOnly, setTimeOnly] = useState<string>(""); // HH:mm
    const [loadingTimes, setLoadingTimes] = useState<boolean>(false);
    const [serverTimes, setServerTimes] = useState<string[] | null>(null);
    const todayStr = format(new Date(), "yyyy-LL-dd");

    const formatForInput = (d: Date) => format(d, "yyyy-LL-dd'T'HH:mm");

    const isSunday = (d: Date) => d.getDay() === 0;
    const isSaturday = (d: Date) => d.getDay() === 6;

    const generateTimes = (d: Date): string[] => {
        if (isSunday(d)) return [];
        // Expedientes: Seg–Sex 08:00–18:00 (último início 17:30) | Sáb 08:00–11:00 (último início 10:30)
        const startHour = 8;
        const endHour = isSaturday(d) ? 11 : 18;
        const lastStartMinutes = 30; // apenas :00 e :30
        const times: string[] = [];
        for (let h = startHour; h < endHour; h++) {
            [0, 30].forEach((m) => {
                if (h === endHour - 1 && m > lastStartMinutes) return;
                times.push(
                    `${h.toString().padStart(2, "0")}:${m
                        .toString()
                        .padStart(2, "0")}`
                );
            });
        }
        return times;
    };

    // Limpar erros residuais do hook ao abrir/montar o formulário
    useEffect(() => {
        try {
            clearError?.();
        } catch {
            // noop: apenas garantindo que erro antigo não apareça ao abrir
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const syncDateTimeToFormData = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return;
        const [hh, mm] = timeStr.split(":").map((n) => parseInt(n, 10));
        const parts = dateStr.split("-").map((n) => parseInt(n, 10));
        if (parts.length !== 3) return;
        const start = new Date(parts[0], parts[1] - 1, parts[2], hh, mm, 0, 0);
        const end = addMinutes(start, 30);
        setFormData((prev) => ({
            ...prev,
            data_hora_inicio: formatForInput(start),
            data_hora_fim: formatForInput(end),
        }));
    };

    useEffect(() => {
        // Carregar médicos para seleção
        (async () => {
            try {
                // Suportar tanto envelope { success, data } quanto array direto
                const resp = await apiRequest.get<DoctorsResponse>("/doctors");

                const list: DoctorItem[] = Array.isArray(resp)
                    ? resp
                    : resp && "data" in resp && Array.isArray(resp.data)
                    ? resp.data
                    : [];

                setDoctors(list);

                // Se não estiver editando e não houver médico setado, pré-selecionar baseado no usuário logado (se for médico) e existir na lista; senão o primeiro
                const storedRole = localStorage.getItem("userRole");
                const storedUserId = localStorage.getItem("userId");
                const doctorIds = new Set(list.map((d) => String(d.id)));
                const preselectFromRole =
                    storedRole === "medico" &&
                    storedUserId &&
                    doctorIds.has(String(storedUserId))
                        ? String(storedUserId)
                        : list[0]?.id != null
                        ? String(list[0].id)
                        : "";

                setFormData((prev) => {
                    if (prev.user_id) return prev; // não sobrescrever em edição
                    return {
                        ...prev,
                        user_id: preselectFromRole,
                    };
                });
            } catch (e) {
                console.error("Erro ao carregar médicos", e);
                setDoctors([]);
            }
        })();

        // Prefill quando editando
        if (appointment) {
            const start = parseISO(appointment.data_hora_inicio);
            const end = parseISO(appointment.data_hora_fim);
            const safeStart = isValid(start) ? start : new Date();
            const safeEnd = isValid(end) ? end : addMinutes(safeStart, 30);
            setFormData({
                patient_id: appointment.patient_id?.toString() || "",
                user_id: appointment.user_id?.toString() || "1",
                data_hora_inicio: formatForInput(safeStart),
                data_hora_fim: formatForInput(safeEnd),
                observacoes: appointment.observacoes || "",
                tipo_consulta: appointment.tipo_consulta || "consulta",
                valor: appointment.valor?.toString() || "",
            });
            setDateOnly(format(safeStart, "yyyy-LL-dd"));
            setTimeOnly(format(safeStart, "HH:mm"));
            return;
        }
        // Prefill quando criando
        if (initialStart) {
            const start = parseISO(initialStart);
            const safeStart = isValid(start) ? start : new Date();
            setDateOnly(format(safeStart, "yyyy-LL-dd"));
            setTimeOnly(format(safeStart, "HH:mm"));
            const end = initialEnd
                ? parseISO(initialEnd)
                : addMinutes(safeStart, 30);
            const safeEnd = isValid(end) ? end : addMinutes(safeStart, 30);
            setFormData((prev) => ({
                ...prev,
                data_hora_inicio: formatForInput(safeStart),
                data_hora_fim: formatForInput(safeEnd),
            }));
            return;
        }
    }, [appointment, initialStart, initialEnd]);

    useEffect(() => {
        syncDateTimeToFormData(dateOnly, timeOnly);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateOnly, timeOnly]);

    const handleDateChange = (newDate: string) => {
        if (!newDate) {
            setDateOnly("");
            return;
        }
        const chosen = new Date(newDate + "T00:00:00");
        const day = new Date(chosen);
        day.setHours(0, 0, 0, 0);
        const today = new Date();
        const todayDay = new Date(today);
        todayDay.setHours(0, 0, 0, 0);
        if (day < todayDay) {
            setFormErrors((prev) => ({
                ...prev,
                data_hora_inicio: "Não é possível agendar em datas passadas",
            }));
            // forçar volta para hoje
            setDateOnly(todayStr);
            setTimeOnly("");
            setServerTimes(null);
            return;
        }
        if (chosen.getDay() === 0) {
            setFormErrors((prev) => ({
                ...prev,
                data_hora_inicio: "Domingo não possui atendimento",
            }));
            // manter data anterior válida (ou hoje se vazio)
            setDateOnly((prev) => (prev ? prev : todayStr));
            setTimeOnly("");
            setServerTimes(null);
            return;
        }
        // limpar erro ao escolher data válida
        setFormErrors((prev) => ({ ...prev, data_hora_inicio: "" }));
        setDateOnly(newDate);
        setTimeOnly("");
    };

    // Carregar horários do backend conforme médico+data
    useEffect(() => {
        const loadSlots = async () => {
            setServerTimes(null);
            if (!formData.user_id || !dateOnly) return;
            try {
                setLoadingTimes(true);
                const slots = await getAvailableSlots(
                    Number(formData.user_id),
                    dateOnly
                );
                // Filtro adicional para evitar horários passados no dia atual (defensivo)
                const now = new Date();
                const isToday = dateOnly === todayStr;
                const filtered = Array.isArray(slots)
                    ? slots
                          // aceitar apenas passos de 30 min
                          .filter((t) => {
                              const [, mm] = t
                                  .split(":")
                                  .map((n) => parseInt(n, 10));
                              return mm % 30 === 0;
                          })
                          // bloquear passados no dia atual
                          .filter((t) => {
                              if (!isToday) return true;
                              const [hh, mm] = t
                                  .split(":")
                                  .map((n) => parseInt(n, 10));
                              const d = new Date(dateOnly + "T00:00:00");
                              d.setHours(hh, mm, 0, 0);
                              return d >= now;
                          })
                    : [];
                setServerTimes(filtered);
            } catch (e) {
                console.warn(
                    "Falha ao carregar available-slots, usando fallback local.",
                    e
                );
                setServerTimes(null);
            } finally {
                setLoadingTimes(false);
            }
        };
        loadSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.user_id, dateOnly]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.patient_id) {
            errors.patient_id = "Selecione um paciente";
        }

        if (!dateOnly) {
            errors.data_hora_inicio = "Selecione a data";
        }

        if (!timeOnly) {
            errors.data_hora_inicio = "Selecione o horário";
        }

        if (!formData.user_id) {
            errors.user_id = "Selecione o médico";
        }

        // Bloquear datas passadas e regras de funcionamento
        if (dateOnly && timeOnly) {
            const [y, m, d] = dateOnly.split("-").map((n) => parseInt(n, 10));
            const [hh, mm] = timeOnly.split(":").map((n) => parseInt(n, 10));
            const chosen = new Date(y, m - 1, d, hh, mm, 0, 0);
            const today = new Date();
            const chosenDay = new Date(chosen);
            chosenDay.setHours(0, 0, 0, 0);
            const todayDay = new Date(today);
            todayDay.setHours(0, 0, 0, 0);
            if (chosenDay < todayDay) {
                errors.data_hora_inicio =
                    "Não é possível agendar em datas passadas";
            }
            if (isSunday(chosen)) {
                errors.data_hora_inicio = "Domingo não possui atendimento";
            } else {
                const allowed = generateTimes(chosen);
                if (!allowed.includes(timeOnly)) {
                    errors.data_hora_inicio =
                        "Horário fora do funcionamento da clínica";
                }
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const submitData = {
                patient_id: Number(formData.patient_id),
                user_id: Number(formData.user_id),
                data_hora_inicio: formData.data_hora_inicio,
                data_hora_fim: formData.data_hora_fim,
                observacoes: formData.observacoes,
                tipo_consulta: formData.tipo_consulta,
                valor: formData.valor ? Number(formData.valor) : undefined,
            };

            if (appointment && appointment.id) {
                await updateAppointment(appointment.id, submitData);
            } else {
                await createAppointment(submitData);
            }

            onSubmit();
        } catch (err) {
            // Erro já tratado no hook como mensagem amigável, mas vamos
            // destacar conflito de horário no campo de horário e atualizar slots
            console.error(err);
            const unknownErr = err as {
                apiError?: { message?: string; status?: number; code?: string };
                message?: string;
            };
            const apiErr = unknownErr?.apiError;
            const rawMsg: string = apiErr?.message || unknownErr?.message || "";
            const isTimeConflict =
                apiErr?.code === "TIME_CONFLICT" ||
                (apiErr?.status === 422 &&
                    typeof rawMsg === "string" &&
                    rawMsg.toLowerCase().includes("conflito"));

            if (isTimeConflict) {
                setFormErrors((prev) => ({
                    ...prev,
                    data_hora_inicio:
                        "Horário já ocupado. Escolha outro horário.",
                }));
                showError("Horário já ocupado. Escolha outro horário.");
                // Recarregar horários disponíveis (pode ter sido ocupado por outra sessão)
                if (formData.user_id && dateOnly) {
                    try {
                        setLoadingTimes(true);
                        const slots = await getAvailableSlots(
                            Number(formData.user_id),
                            dateOnly
                        );
                        const now = new Date();
                        const isToday = dateOnly === todayStr;
                        const filtered = Array.isArray(slots)
                            ? slots
                                  .filter((t) => {
                                      const [, mm] = t
                                          .split(":")
                                          .map((n) => parseInt(n, 10));
                                      return mm % 30 === 0;
                                  })
                                  .filter((t) => {
                                      if (!isToday) return true;
                                      const [hh, mm] = t
                                          .split(":")
                                          .map((n) => parseInt(n, 10));
                                      const d = new Date(
                                          dateOnly + "T00:00:00"
                                      );
                                      d.setHours(hh, mm, 0, 0);
                                      return d >= now;
                                  })
                            : [];
                        setServerTimes(filtered);
                    } catch {
                        // silencioso
                    } finally {
                        setLoadingTimes(false);
                    }
                }
            } else {
                // Exibir erro genérico amigável
                const friendly = ApiErrorHandler.getErrorMessage(err);
                showError(friendly || "Não foi possível salvar o agendamento.");
            }
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Times a exibir: preferir os do servidor (quando existentes), senão fallback local
    const localTimes = dateOnly
        ? generateTimes(new Date(dateOnly + "T00:00:00")).filter((t) => {
              // impedir datas passadas no dia atual
              if (dateOnly !== todayStr) return true;
              const [hh, mm] = t.split(":").map((n) => parseInt(n, 10));
              const d = new Date(dateOnly + "T00:00:00");
              d.setHours(hh, mm, 0, 0);
              return d >= new Date();
          })
        : [];
    const availableTimes = serverTimes ?? localTimes;

    return (
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
            {/* Título removido para não duplicar com o título do Modal */}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Médico
                        </label>
                        <select
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleChange}
                            required
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                formErrors.user_id
                                    ? "border-red-400"
                                    : "border-gray-200"
                            }`}
                        >
                            <option value="">Selecione um médico</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        {formErrors.user_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.user_id}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Paciente
                        </label>
                        <select
                            name="patient_id"
                            value={formData.patient_id}
                            onChange={handleChange}
                            required
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                formErrors.patient_id
                                    ? "border-red-400"
                                    : "border-gray-200"
                            }`}
                            disabled={patientsLoading}
                        >
                            <option value="">
                                {patientsLoading
                                    ? "Carregando pacientes..."
                                    : "Selecione um paciente"}
                            </option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.nome_completo}
                                </option>
                            ))}
                        </select>
                        {formErrors.patient_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.patient_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tipo de Consulta
                        </label>
                        <select
                            name="tipo_consulta"
                            value={formData.tipo_consulta}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="consulta">Consulta</option>
                            <option value="retorno">Retorno</option>
                            <option value="emergencia">Emergência</option>
                            <option value="exame">Exame</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Data do Atendimento
                        </label>
                        <DatePicker
                            selected={
                                dateOnly
                                    ? new Date(dateOnly + "T00:00:00")
                                    : null
                            }
                            onChange={(d) => {
                                const v = d
                                    ? format(d as Date, "yyyy-LL-dd")
                                    : "";
                                handleDateChange(v);
                            }}
                            minDate={new Date()}
                            filterDate={(d) => d.getDay() !== 0} // domingo fechado
                            locale="pt-BR"
                            dateFormat="dd/MM/yyyy"
                            calendarStartDay={1}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                formErrors.data_hora_inicio
                                    ? "border-red-400"
                                    : "border-gray-200"
                            }`}
                            placeholderText="Selecione a data"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Horário de Início
                        </label>
                        <select
                            value={timeOnly}
                            onChange={(e) => setTimeOnly(e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                formErrors.data_hora_inicio
                                    ? "border-red-400"
                                    : "border-gray-200"
                            }`}
                            disabled={!dateOnly}
                        >
                            <option value="" disabled hidden>
                                {!dateOnly
                                    ? "Selecione a data primeiro"
                                    : loadingTimes
                                    ? "Carregando horários..."
                                    : availableTimes.length
                                    ? "Selecione um horário"
                                    : "Sem horários disponíveis"}
                            </option>
                            {availableTimes.map((t) => (
                                <option value={t} key={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Valor (R$)
                        </label>
                        <input
                            type="number"
                            name="valor"
                            value={formData.valor}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Observações
                    </label>
                    <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Observações sobre a consulta..."
                    />
                </div>

                {formErrors.data_hora_inicio && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 text-sm">
                        {formErrors.data_hora_inicio}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        type="button"
                        className="!border-gray-200"
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" loading={loading}>
                        {appointment ? "Atualizar" : "Criar"} Consulta
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
