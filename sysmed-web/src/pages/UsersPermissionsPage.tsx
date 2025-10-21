import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import ConfirmationModal from "../components/ConfirmationModal";
import UserFormModal from "../components/UserFormModal";
import {
    usersService,
    type User,
    type CreateUserInput,
    type UpdateUserInput,
} from "../services/users";
import { rolesService } from "../services/roles";

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: "0.875rem",
    background: "white",
};

const smallBtn: React.CSSProperties = {
    padding: "0.50rem 0.75rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
    padding: "0.50rem 0.75rem",
    border: "1px solid #d1d5db",
    background: "white",
    borderRadius: 8,
    fontSize: "0.875rem",
    color: "#374151",
    cursor: "pointer",
};

const headerBar: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
};

const UsersPermissionsPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [serverDriven, setServerDriven] = useState(false);

    const getCurrentRoles = (): string[] => {
        const result: string[] = [];
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) result.push(String(storedRole).toLowerCase());
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const u = JSON.parse(storedUser);
                if (Array.isArray(u?.roles)) {
                    for (const r of u.roles) {
                        if (typeof r === "string") result.push(r.toLowerCase());
                        else if (r?.name)
                            result.push(String(r.name).toLowerCase());
                    }
                }
                if (u?.role) {
                    if (typeof u.role === "string")
                        result.push(u.role.toLowerCase());
                    else if (u.role?.name)
                        result.push(String(u.role.name).toLowerCase());
                }
            } catch {
                // ignore
            }
        }
        return Array.from(new Set(result));
    };
    const canManage = getCurrentRoles().includes("admin");

    const fetchUsers = async (resetPage = false) => {
        setLoading(true);
        try {
            const targetPage = resetPage ? 1 : page;
            const result = await usersService.paginate({
                page: targetPage,
                perPage,
                search: query,
            });
            setUsers(result.items);
            setPage(result.page);
            setPerPage(result.perPage);
            setTotal(result.total);
            setLastPage(result.lastPage);
            setServerDriven(result.serverDriven);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Carrega roles apenas uma vez
        void (async () => setRoles(await rolesService.list()))();
    }, []);

    useEffect(() => {
        void fetchUsers(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, query]);

    const filtered = useMemo(() => {
        // Quando a paginação vem do servidor, a lista já está filtrada
        if (serverDriven) return users;
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) =>
            [u.name, u.email, u.roles?.map((r) => r.name).join(" ")]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [users, query, serverDriven]);

    const handleCreate = () => {
        setSelectedUser(null);
        setFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            await usersService.remove(selectedUser.id);
            await fetchUsers(false);
        } finally {
            setLoading(false);
            setConfirmOpen(false);
            setSelectedUser(null);
        }
    };

    const submitForm = async (
        payload: CreateUserInput | UpdateUserInput,
        id?: number
    ) => {
        setLoading(true);
        try {
            if (id) {
                const updated = await usersService.update(
                    id,
                    payload as UpdateUserInput
                );
                if (
                    Array.isArray((payload as UpdateUserInput).role_ids) &&
                    (payload as UpdateUserInput).role_ids!.length
                ) {
                    await usersService.setRoles(
                        updated.id,
                        (payload as UpdateUserInput).role_ids!
                    );
                } else if ((payload as UpdateUserInput).role_id) {
                    await usersService.assignRole(
                        updated.id,
                        (payload as UpdateUserInput).role_id!
                    );
                }
            } else {
                const created = await usersService.create(
                    payload as CreateUserInput
                );
                if (
                    Array.isArray((payload as CreateUserInput).role_ids) &&
                    (payload as CreateUserInput).role_ids!.length
                ) {
                    await usersService.setRoles(
                        created.id,
                        (payload as CreateUserInput).role_ids!
                    );
                } else if ((payload as CreateUserInput).role_id) {
                    await usersService.assignRole(
                        created.id,
                        (payload as CreateUserInput).role_id!
                    );
                }
            }
            await fetchUsers(false);
            setFormOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                padding: "2rem",
                background: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#111827",
                        }}
                    >
                        Usuários e Permissões
                    </h1>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#6b7280" }}>
                        Gerencie acessos e papéis da equipe
                    </p>
                </div>

                <Card padding="medium" title="Usuários">
                    <div style={headerBar}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                alignItems: "center",
                            }}
                        >
                            <input
                                placeholder="Buscar por nome, email ou papel"
                                style={inputStyle}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                style={ghostBtn}
                                onClick={() => {
                                    setQuery("");
                                    setPage(1);
                                }}
                            >
                                Limpar
                            </button>
                            <button
                                style={{
                                    ...smallBtn,
                                    opacity: canManage ? 1 : 0.6,
                                    cursor: canManage
                                        ? "pointer"
                                        : "not-allowed",
                                }}
                                onClick={handleCreate}
                                disabled={!canManage}
                            >
                                + Novo usuário
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: 0,
                            }}
                        >
                            <thead>
                                <tr>
                                    {[
                                        "Nome",
                                        "Email",
                                        "Papel",
                                        "Status",
                                        "Ações",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                textAlign: "left",
                                                fontSize: "0.8rem",
                                                color: "#6b7280",
                                                fontWeight: 600,
                                                padding: "0.5rem",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => (
                                    <tr
                                        key={u.id}
                                        style={{
                                            borderTop: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "0.5rem",
                                                fontWeight: 500,
                                                color: "#111827",
                                            }}
                                        >
                                            {u.name}
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.5rem",
                                                color: "#374151",
                                            }}
                                        >
                                            {u.email}
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.5rem",
                                                color: "#374151",
                                            }}
                                        >
                                            {u.roles?.length
                                                ? u.roles
                                                      .map((r) => r.name)
                                                      .join(", ")
                                                : "—"}
                                        </td>
                                        <td style={{ padding: "0.5rem" }}>
                                            <span
                                                style={{
                                                    padding: "0.125rem 0.5rem",
                                                    borderRadius: 999,
                                                    fontSize: "0.75rem",
                                                    background:
                                                        u.status === "inativo"
                                                            ? "#fee2e2"
                                                            : "#dcfce7",
                                                    color:
                                                        u.status === "inativo"
                                                            ? "#b91c1c"
                                                            : "#166534",
                                                }}
                                            >
                                                {u.status === "inativo"
                                                    ? "Inativo"
                                                    : "Ativo"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.5rem" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                <button
                                                    style={{
                                                        ...ghostBtn,
                                                        opacity: canManage
                                                            ? 1
                                                            : 0.6,
                                                        cursor: canManage
                                                            ? "pointer"
                                                            : "not-allowed",
                                                    }}
                                                    onClick={() =>
                                                        handleEdit(u)
                                                    }
                                                    disabled={!canManage}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    style={{
                                                        ...ghostBtn,
                                                        borderColor: "#ef4444",
                                                        color: "#b91c1c",
                                                        opacity: canManage
                                                            ? 1
                                                            : 0.6,
                                                        cursor: canManage
                                                            ? "pointer"
                                                            : "not-allowed",
                                                    }}
                                                    onClick={() =>
                                                        handleDelete(u)
                                                    }
                                                    disabled={!canManage}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                padding: "1rem",
                                                textAlign: "center",
                                                color: "#6b7280",
                                            }}
                                        >
                                            Nenhum usuário encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.5rem",
                                borderTop: "1px solid #e5e7eb",
                                marginTop: "0.5rem",
                            }}
                        >
                            <div
                                style={{
                                    color: "#6b7280",
                                    fontSize: "0.875rem",
                                }}
                            >
                                {total > 0
                                    ? `Mostrando ${
                                          (page - 1) * perPage + 1
                                      }–${Math.min(
                                          page * perPage,
                                          total
                                      )} de ${total}`
                                    : "Sem registros"}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    alignItems: "center",
                                }}
                            >
                                <button
                                    style={ghostBtn}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page <= 1}
                                >
                                    ◀ Anterior
                                </button>
                                <span
                                    style={{
                                        color: "#374151",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Página {page} de {Math.max(1, lastPage)}
                                </span>
                                <button
                                    style={ghostBtn}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(lastPage, p + 1)
                                        )
                                    }
                                    disabled={page >= lastPage}
                                >
                                    Próxima ▶
                                </button>
                                <select
                                    style={{
                                        ...inputStyle,
                                        width: 100,
                                        height: 36,
                                    }}
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    {[10, 20, 50].map((n) => (
                                        <option key={n} value={n}>
                                            {n}/página
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                <ConfirmationModal
                    isOpen={confirmOpen}
                    title="Confirmar exclusão"
                    message={`Tem certeza que deseja excluir o usuário ${
                        selectedUser?.name ?? ""
                    }? Essa ação não pode ser desfeita.`}
                    type="danger"
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    loading={loading}
                />

                <UserFormModal
                    isOpen={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSubmit={submitForm}
                    roles={roles}
                    user={selectedUser}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default UsersPermissionsPage;
