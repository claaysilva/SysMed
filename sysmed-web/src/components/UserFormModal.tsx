import React, { useEffect, useMemo, useState } from "react";
import type {
    Role,
    User,
    CreateUserInput,
    UpdateUserInput,
} from "../services/users";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
        payload: CreateUserInput | UpdateUserInput,
        id?: number
    ) => Promise<void> | void;
    roles: Role[];
    user?: User | null;
    loading?: boolean;
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.875rem",
    backgroundColor: "white",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
};

const actionBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
};

const primaryBtn: React.CSSProperties = {
    padding: "0.50rem 0.75rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
    padding: "0.50rem 0.75rem",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    borderRadius: "8px",
    fontSize: "0.875rem",
    color: "#374151",
    cursor: "pointer",
};

const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    roles,
    user,
    loading,
}) => {
    const isEdit = Boolean(user?.id);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleIds, setRoleIds] = useState<number[]>([]);
    const [status, setStatus] = useState<"ativo" | "inativo">("ativo");

    const title = useMemo(
        () => (isEdit ? "Editar usuário" : "Novo usuário"),
        [isEdit]
    );

    useEffect(() => {
        if (user) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            setStatus(user.status ?? "ativo");
            const ids = (user.roles ?? []).map((r) => r.id);
            setRoleIds(ids);
        } else {
            setName("");
            setEmail("");
            setPassword("");
            setRoleIds([]);
            setStatus("ativo");
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const payload: CreateUserInput | UpdateUserInput = {
            name,
            email,
            ...(password ? { password } : {}),
            ...(roleIds.length ? { role_ids: roleIds } : {}),
            status,
        };
        await onSubmit(payload, user?.id);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: 12,
                    padding: "1.25rem",
                    width: "96%",
                    maxWidth: 560,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#111827",
                    }}
                >
                    {title}
                </h3>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        marginTop: "1rem",
                    }}
                >
                    <div>
                        <label style={labelStyle}>Nome</label>
                        <input
                            style={inputStyle}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome completo"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>
                            Senha {isEdit ? "(opcional)" : ""}
                        </label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={
                                isEdit
                                    ? "Deixe em branco para manter"
                                    : "Defina uma senha"
                            }
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Papéis</label>
                        <select
                            multiple
                            style={{ ...inputStyle, height: 120 }}
                            value={roleIds.map(String)}
                            onChange={(e) => {
                                const selected = Array.from(
                                    e.target.selectedOptions
                                ).map((o) => Number(o.value));
                                setRoleIds(selected);
                            }}
                        >
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select
                            style={inputStyle}
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as "ativo" | "inativo")
                            }
                        >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: "1rem", ...actionBarStyle }}>
                    <button
                        style={secondaryBtn}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        style={{ ...primaryBtn, opacity: loading ? 0.7 : 1 }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {isEdit ? "Salvar" : "Criar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserFormModal;
