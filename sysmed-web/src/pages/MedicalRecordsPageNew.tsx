import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    FileText,
    Download,
    Printer,
    User,
    FileSignature,
    Edit3,
    Trash2,
    Calendar,
    Clock,
} from "lucide-react";
// Removido ícone de busca para seguir o padrão visual do Patients
import {
    useMedicalRecords,
    type MedicalRecord,
} from "../hooks/useMedicalRecords";
import { useToast } from "../hooks/useToast";
import { formatCPF } from "../hooks/useFormValidation";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Card from "../components/Card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Usaremos o tipo MedicalRecord do hook

const MedicalRecordsPage: React.FC = () => {
    // Hook de dados
    const {
        medicalRecords,
        loading,
        pagination,
        fetchMedicalRecords,
        updateMedicalRecord,
        deleteMedicalRecord,
    } = useMedicalRecords();
    const { showSuccess, showError, showInfo } = useToast();
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    type SortBy = "data_consulta" | "status" | "tipo_consulta";
    const [sortBy, setSortBy] = useState<SortBy>("data_consulta");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const handleSortClick = (field: SortBy) => {
        setSortBy((prev) => (prev === field ? prev : field));
        setSortOrder((prev) =>
            sortBy === field ? (prev === "asc" ? "desc" : "asc") : "asc"
        );
    };
    const renderSortIndicator = (field: SortBy) => {
        if (sortBy !== field) return null;
        return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
    };
    const perPage = 15;

    // Estados para modal de exclusão
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        record: MedicalRecord | null;
    }>({
        isOpen: false,
        record: null,
    });

    const loadMedicalRecords = useCallback(async () => {
        try {
            await fetchMedicalRecords({
                status: statusFilter || undefined,
                tipo_consulta: typeFilter || undefined,
                search: searchTerm || undefined,
                data_inicio: dateFromFilter || undefined,
                data_fim: dateToFilter || undefined,
                per_page: perPage,
                page,
                sort_by: sortBy,
                sort_order: sortOrder,
            });
        } catch {
            showError("Erro ao carregar prontuários");
        }
    }, [
        fetchMedicalRecords,
        statusFilter,
        typeFilter,
        searchTerm,
        dateFromFilter,
        dateToFilter,
        page,
        sortBy,
        sortOrder,
        showError,
    ]);

    useEffect(() => {
        loadMedicalRecords();
    }, [loadMedicalRecords]);

    const handleRecordClick = (record: MedicalRecord) => {
        navigate(`/medical-records/${record.id}`);
    };

    const handleEditRecord = (record: MedicalRecord) => {
        navigate(`/medical-records/${record.id}/edit`);
    };

    const handleDeleteRecord = (record: MedicalRecord) => {
        setDeleteModal({
            isOpen: true,
            record: record,
        });
    };

    const handleSignRecord = async (record: MedicalRecord) => {
        try {
            showInfo("Assinando prontuário...");
            const updated = await updateMedicalRecord(record.id, {
                status: "assinado",
            });
            if (updated) {
                showSuccess(
                    `Prontuário de ${record.patient.nome_completo} assinado com sucesso!`
                );
                await loadMedicalRecords();
            }
        } catch (error) {
            console.error("Erro ao assinar prontuário:", error);
            showError("Erro ao assinar prontuário");
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.record) return;
        try {
            setDeleting(true);
            const ok = await deleteMedicalRecord(deleteModal.record.id);
            if (ok) {
                showSuccess(
                    `Prontuário de ${deleteModal.record.patient.nome_completo} excluído com sucesso!`
                );
                await loadMedicalRecords();
            } else {
                showError("Não foi possível excluir o prontuário");
            }
        } catch (error) {
            console.error("Erro ao excluir prontuário:", error);
            showError("Erro ao excluir prontuário");
        } finally {
            setDeleting(false);
            setDeleteModal({ isOpen: false, record: null });
        }
    };

    const handleNewRecord = () => {
        navigate("/medical-records/new");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setTypeFilter("");
        setDateFromFilter("");
        setDateToFilter("");
        setSortBy("data_consulta");
        setSortOrder("desc");
        setPage(1);
        loadMedicalRecords();
    };

    // Exportação CSV (página atual)
    const handleExportCsv = () => {
        if (!medicalRecords || medicalRecords.length === 0) return;
        const sep = ",";
        const headers = [
            "Data",
            "Hora",
            "Paciente",
            "Tipo",
            "Status",
            "Médico",
            "Queixa",
        ];
        const rows = medicalRecords.map((r) => [
            format(new Date(r.data_consulta), "dd/MM/yyyy", { locale: ptBR }),
            r.horario_consulta || "",
            r.patient?.nome_completo || "",
            r.tipo_consulta || "",
            r.status || "",
            r.user?.name || "",
            (r.queixa_principal || "")
                .replaceAll("\n", " ")
                .replaceAll(sep, " "),
        ]);
        const csv = [headers.join(sep), ...rows.map((r) => r.join(sep))].join(
            "\n"
        );
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prontuarios_${format(new Date(), "yyyyLLdd_HHmm")}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Impressão (página atual)
    const handlePrint = () => {
        const items = medicalRecords || [];
        const title = "Prontuários";
        const safe = (s: unknown) =>
            String(s ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        const rows = items
            .map((r) => {
                const data = r.data_consulta
                    ? format(new Date(r.data_consulta), "dd/MM/yyyy", {
                          locale: ptBR,
                      })
                    : "—";
                const hora = r.horario_consulta || "";
                const paciente = r.patient?.nome_completo || "—";
                const cpf = r.patient?.cpf ? formatCPF(r.patient.cpf) : "";
                const tipo = r.tipo_consulta || "—";
                const status = r.status || "—";
                const medico = r.user?.name || "—";
                const queixa = safe(r.queixa_principal || "");
                return `
                <tr>
                    <td style="padding:6px;border:1px solid #e5e7eb">${data}${
                    hora ? ` ${hora}` : ""
                }</td>
                    <td style="padding:6px;border:1px solid #e5e7eb">${safe(
                        paciente
                    )}${
                    cpf
                        ? `<div style='color:#6b7280;font-size:11px'>${cpf}</div>`
                        : ""
                }</td>
                    <td style="padding:6px;border:1px solid #e5e7eb">${safe(
                        tipo
                    )}</td>
                    <td style="padding:6px;border:1px solid #e5e7eb;text-transform:capitalize">${safe(
                        status
                    )}</td>
                    <td style="padding:6px;border:1px solid #e5e7eb">${safe(
                        medico
                    )}</td>
                    <td style="padding:6px;border:1px solid #e5e7eb">${queixa}</td>
                </tr>`;
            })
            .join("");

        const html = `
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        body{ font-family: Arial, sans-serif; color:#111827; padding:16px }
        h1{ font-size:18px; margin:0 0 12px 0; }
        table{ width:100%; border-collapse: collapse; font-size:12px; }
        th, td{ border:1px solid #e5e7eb; padding:6px; text-align:left }
        thead{ background:#f9fafb }
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
                    <th>Data/Hora</th>
                    <th>Paciente</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Médico</th>
                    <th>Queixa</th>
                </tr>
            </thead>
            <tbody>${
                rows ||
                "<tr><td colspan=6 style='padding:8px'>Sem itens</td></tr>"
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

    const getStatusColor = (status: string) => {
        const colors = {
            rascunho: "#f59e0b", // yellow-500
            finalizado: "#10b981", // emerald-500
            assinado: "#059669", // emerald-600 (padrão SysMed)
        };
        return colors[status as keyof typeof colors] || "#6b7280";
    };

    const getTypeColor = (type: string) => {
        const colors = {
            consulta: "#10b981", // emerald-500
            retorno: "#3b82f6", // blue-500
            emergencia: "#ef4444", // red-500
            exame: "#8b5cf6", // violet-500
            cirurgia: "#f59e0b", // amber-500
        } as const;
        return (colors as Record<string, string>)[type] || "#6b7280";
    };

    return (
        <div
            className="flex-1 overflow-hidden"
            style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
        >
            {/* Header inline no conteúdo, como Patients */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 0,
                    padding: "2rem",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#111827",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        Prontuários Médicos
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            color: "#6b7280",
                            margin: 0,
                        }}
                    >
                        {pagination?.total ?? medicalRecords.length} prontuário
                        {(pagination?.total ?? medicalRecords.length) === 1
                            ? ""
                            : "s"}{" "}
                        encontrado
                        {(pagination?.total ?? medicalRecords.length) === 1
                            ? ""
                            : "s"}
                    </p>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <button
                        onClick={handleExportCsv}
                        style={{
                            padding: "0.50rem 0.75rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                        }}
                        title="Exportar CSV"
                    >
                        <Download style={{ width: 14, height: 14 }} />
                        <span>Exportar CSV</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{
                            padding: "0.50rem 0.75rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                        }}
                        title="Imprimir"
                    >
                        <Printer style={{ width: 14, height: 14 }} />
                        <span>Imprimir</span>
                    </button>
                    <button
                        onClick={handleNewRecord}
                        style={{
                            padding: "0.50rem 0.75rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                        }}
                        title="Novo Prontuário"
                    >
                        <Plus style={{ width: 14, height: 14 }} />
                        <span>Novo Prontuário</span>
                    </button>
                </div>
            </div>
            {/* Conteúdo principal com espaçamento entre cards */}
            <div style={{ padding: "0 2rem 2rem 2rem" }} className="space-y-12">
                {/* Filtros (modelo Pacientes) */}
                <Card padding="medium" className="mb-8">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "1rem",
                            alignItems: "end",
                        }}
                    >
                        {/* Buscar */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Buscar prontuários
                            </label>
                            <input
                                type="text"
                                placeholder="Paciente, tipo, status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    transition: "border-color 0.2s",
                                }}
                            />
                        </div>
                        {/* Status */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Filtrar por status
                            </label>
                            <select
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                }}
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="">Todos os status</option>
                                <option value="rascunho">Rascunho</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="assinado">Assinado</option>
                            </select>
                        </div>
                        {/* Ordenar por */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Ordenar por
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    style={{
                                        flex: 2,
                                        padding: "0.75rem",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        backgroundColor: "white",
                                        cursor: "pointer",
                                    }}
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as SortBy)
                                    }
                                >
                                    <option value="data_consulta">
                                        Data da consulta
                                    </option>
                                    <option value="status">Status</option>
                                    <option value="tipo_consulta">Tipo</option>
                                </select>
                                <button
                                    type="button"
                                    title={
                                        sortOrder === "asc"
                                            ? "Ordenação crescente"
                                            : "Ordenação decrescente"
                                    }
                                    onClick={() =>
                                        setSortOrder((o) =>
                                            o === "asc" ? "desc" : "asc"
                                        )
                                    }
                                    style={{
                                        width: 40,
                                        height: 40,
                                        padding: 0,
                                        border: "1px solid #d1d5db",
                                        backgroundColor: "white",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "0.875rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    title={
                                        showFilters
                                            ? "Ocultar filtros"
                                            : "Mostrar filtros"
                                    }
                                    style={{
                                        height: 40,
                                        padding: 0,
                                        border: "1px solid #d1d5db",
                                        backgroundColor: "white",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "0.875rem",
                                        color: "#374151",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingLeft: "0.75rem",
                                        paddingRight: "0.75rem",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {showFilters ? "− Filtros" : "+ Filtros"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filtros Avançados */}
                    {showFilters && (
                        <div style={{ marginTop: "1rem" }}>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Filtros Avançados
                            </h4>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(250px, 1fr))",
                                    gap: "1rem",
                                    padding: "1rem",
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    marginTop: "1rem",
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Tipo
                                    </label>
                                    <select
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "6px",
                                            fontSize: "0.875rem",
                                            backgroundColor: "white",
                                            cursor: "pointer",
                                        }}
                                        value={typeFilter}
                                        onChange={(e) =>
                                            setTypeFilter(e.target.value)
                                        }
                                    >
                                        <option value="">Todos os tipos</option>
                                        <option value="consulta">
                                            Consulta
                                        </option>
                                        <option value="retorno">Retorno</option>
                                        <option value="emergencia">
                                            Emergência
                                        </option>
                                        <option value="exame">Exame</option>
                                        <option value="cirurgia">
                                            Cirurgia
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Data inicial
                                    </label>
                                    <input
                                        type="date"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "6px",
                                            fontSize: "0.875rem",
                                        }}
                                        value={dateFromFilter}
                                        onChange={(e) =>
                                            setDateFromFilter(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Data final
                                    </label>
                                    <input
                                        type="date"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "6px",
                                            fontSize: "0.875rem",
                                        }}
                                        value={dateToFilter}
                                        onChange={(e) =>
                                            setDateToFilter(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Limpar Filtros */}
                    <div style={{ marginTop: "1rem" }}>
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: "0.50rem 0.75rem",
                                border: "1px solid #d1d5db",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                color: "#374151",
                            }}
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </Card>

                {/* Espaçador explícito entre as bolhas */}
                <div style={{ height: 36 }} />

                {/* Resultados (card) */}
                <Card padding="medium" className="mt-10 md:mt-12">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 p-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            <span className="ml-2 text-gray-600">
                                Carregando prontuários...
                            </span>
                        </div>
                    ) : medicalRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Nenhum prontuário encontrado
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Não há prontuários que correspondam aos filtros
                                aplicados.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "left",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                }}
                                            >
                                                Paciente
                                            </th>
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "center",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                }}
                                                onClick={() =>
                                                    handleSortClick(
                                                        "data_consulta"
                                                    )
                                                }
                                                title="Ordenar por data da consulta"
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.25rem",
                                                    }}
                                                >
                                                    Data/Hora{" "}
                                                    {renderSortIndicator(
                                                        "data_consulta"
                                                    )}
                                                </span>
                                            </th>
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "center",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                }}
                                                onClick={() =>
                                                    handleSortClick(
                                                        "tipo_consulta"
                                                    )
                                                }
                                                title="Ordenar por tipo"
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.25rem",
                                                    }}
                                                >
                                                    Tipo{" "}
                                                    {renderSortIndicator(
                                                        "tipo_consulta"
                                                    )}
                                                </span>
                                            </th>
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "center",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                }}
                                                onClick={() =>
                                                    handleSortClick("status")
                                                }
                                                title="Ordenar por status"
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.25rem",
                                                    }}
                                                >
                                                    Status{" "}
                                                    {renderSortIndicator(
                                                        "status"
                                                    )}
                                                </span>
                                            </th>
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "left",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                    width: "clamp(12rem, 24vw, 22rem)",
                                                }}
                                            >
                                                Queixa Principal
                                            </th>
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "left",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                }}
                                            >
                                                Médico
                                            </th>
                                            <th
                                                style={{
                                                    padding: "0 1rem 1rem 1rem",
                                                    textAlign: "right",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "#374151",
                                                }}
                                            >
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicalRecords.map((record) => (
                                            <tr
                                                key={record.id}
                                                style={{
                                                    borderBottom:
                                                        "1px solid #f3f4f6",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleRecordClick(record)
                                                }
                                            >
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "flex-start",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius:
                                                                    "9999px",
                                                                backgroundColor:
                                                                    "#d1fae5",
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <User
                                                                style={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    color: "#059669",
                                                                }}
                                                            />
                                                        </div>
                                                        <div
                                                            style={{
                                                                marginLeft:
                                                                    "1rem",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight: 600,
                                                                    color: "#111827",
                                                                }}
                                                            >
                                                                {
                                                                    record
                                                                        .patient
                                                                        .nome_completo
                                                                }
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    color: "#6b7280",
                                                                }}
                                                            >
                                                                {record.patient
                                                                    ?.cpf
                                                                    ? formatCPF(
                                                                          record
                                                                              .patient
                                                                              .cpf
                                                                      )
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            width: "100%",
                                                            fontSize:
                                                                "0.875rem",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        <Calendar
                                                            style={{
                                                                width: 16,
                                                                height: 16,
                                                                marginRight: 8,
                                                                color: "#9ca3af",
                                                            }}
                                                        />
                                                        <div>
                                                            <div>
                                                                {format(
                                                                    new Date(
                                                                        record.data_consulta
                                                                    ),
                                                                    "dd/MM/yyyy",
                                                                    {
                                                                        locale: ptBR,
                                                                    }
                                                                )}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    color: "#6b7280",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                }}
                                                            >
                                                                <Clock
                                                                    style={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        marginRight: 4,
                                                                    }}
                                                                />
                                                                {
                                                                    record.horario_consulta
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            padding:
                                                                "0.125rem 0.625rem",
                                                            borderRadius:
                                                                "9999px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 500,
                                                            textTransform:
                                                                "capitalize",
                                                            backgroundColor: `${getTypeColor(
                                                                record.tipo_consulta
                                                            )}20`,
                                                            color: getTypeColor(
                                                                record.tipo_consulta
                                                            ),
                                                        }}
                                                    >
                                                        {record.tipo_consulta}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            padding:
                                                                "0.125rem 0.625rem",
                                                            borderRadius:
                                                                "9999px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 500,
                                                            textTransform:
                                                                "capitalize",
                                                            backgroundColor: `${getStatusColor(
                                                                record.status
                                                            )}20`,
                                                            color: getStatusColor(
                                                                record.status
                                                            ),
                                                        }}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        textAlign: "left",
                                                        width: "clamp(12rem, 24vw, 22rem)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "0.875rem",
                                                            color: "#111827",
                                                            overflow: "hidden",
                                                            whiteSpace:
                                                                "normal",
                                                            wordBreak:
                                                                "break-word",
                                                            overflowWrap:
                                                                "anywhere",
                                                        }}
                                                    >
                                                        {record.queixa_principal ||
                                                            "Não informado"}
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "left",
                                                        fontSize: "0.875rem",
                                                        color: "#111827",
                                                    }}
                                                >
                                                    {record.user.name}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "1rem",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                            justifyContent:
                                                                "flex-end",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditRecord(
                                                                    record
                                                                );
                                                            }}
                                                            style={{
                                                                color: "#b45309",
                                                                background:
                                                                    "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Edit3
                                                                style={{
                                                                    width: 16,
                                                                    height: 16,
                                                                }}
                                                            />
                                                        </button>
                                                        {record.status ===
                                                            "finalizado" && (
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleSignRecord(
                                                                        record
                                                                    );
                                                                }}
                                                                style={{
                                                                    color: "#16a34a",
                                                                    background:
                                                                        "transparent",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                }}
                                                                title="Assinar"
                                                            >
                                                                <FileSignature
                                                                    style={{
                                                                        width: 16,
                                                                        height: 16,
                                                                    }}
                                                                />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteRecord(
                                                                    record
                                                                );
                                                            }}
                                                            style={{
                                                                color: "#dc2626",
                                                                background:
                                                                    "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                            }}
                                                            title="Excluir"
                                                        >
                                                            <Trash2
                                                                style={{
                                                                    width: 16,
                                                                    height: 16,
                                                                }}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Paginação */}
                            <div className="flex items-center justify-between p-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    {pagination
                                        ? `Página ${pagination.current_page} de ${pagination.last_page} — ${pagination.total} registros`
                                        : null}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={
                                            !pagination ||
                                            pagination.current_page <= 1
                                        }
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={
                                            !pagination ||
                                            pagination.current_page >=
                                                (pagination.last_page || 1)
                                        }
                                        onClick={() =>
                                            setPage((p) =>
                                                pagination
                                                    ? Math.min(
                                                          pagination.last_page,
                                                          p + 1
                                                      )
                                                    : p + 1
                                            )
                                        }
                                    >
                                        Próximo
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, record: null })}
                title="Confirmar Exclusão"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Tem certeza que deseja excluir o prontuário de{" "}
                        <strong>
                            {deleteModal.record?.patient.nome_completo}
                        </strong>
                        ?
                    </p>
                    <p className="text-sm text-red-600 mb-6">
                        Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteModal({ isOpen: false, record: null })
                            }
                            disabled={deleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? "Excluindo..." : "Excluir"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MedicalRecordsPage;
