import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

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

const sectionGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1rem",
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

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    // Estados simples para demonstração/placeholder
    const [clinicName, setClinicName] = useState("");
    const [timezone, setTimezone] = useState("America/Sao_Paulo");
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifySms, setNotifySms] = useState(false);
    const [integrationToken, setIntegrationToken] = useState("");
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <div
            style={{
                padding: "2rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#111827",
                            margin: 0,
                        }}
                    >
                        Configurações
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            color: "#6b7280",
                            margin: "0.5rem 0 0 0",
                        }}
                    >
                        Personalize preferências da clínica, integrações e
                        notificações
                    </p>
                </div>

                {/* Geral */}
                <Card title="Geral" padding="medium">
                    <div style={sectionGridStyle}>
                        <div>
                            <label style={labelStyle}>Nome da Clínica</label>
                            <input
                                type="text"
                                value={clinicName}
                                onChange={(e) => setClinicName(e.target.value)}
                                placeholder="Ex.: Clínica Saúde+"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Fuso horário</label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="America/Sao_Paulo">
                                    America/Sao_Paulo (GMT-03)
                                </option>
                                <option value="America/Manaus">
                                    America/Manaus (GMT-04)
                                </option>
                                <option value="America/Fortaleza">
                                    America/Fortaleza (GMT-03)
                                </option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginTop: "1rem", ...actionBarStyle }}>
                        <button
                            style={secondaryBtn}
                            onClick={() => {
                                setClinicName("");
                                setTimezone("America/Sao_Paulo");
                            }}
                        >
                            Restaurar padrão
                        </button>
                        <button style={primaryBtn}>Salvar</button>
                    </div>
                </Card>

                {/* Notificações */}
                <div style={{ height: 36 }} />
                <Card title="Notificações" padding="medium">
                    <div style={sectionGridStyle}>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <input
                                    id="notifyEmail"
                                    type="checkbox"
                                    checked={notifyEmail}
                                    onChange={(e) =>
                                        setNotifyEmail(e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="notifyEmail"
                                    style={{
                                        color: "#374151",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Enviar confirmações e lembretes por email
                                </label>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>SMS</label>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <input
                                    id="notifySms"
                                    type="checkbox"
                                    checked={notifySms}
                                    onChange={(e) =>
                                        setNotifySms(e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="notifySms"
                                    style={{
                                        color: "#374151",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Enviar lembretes por SMS
                                </label>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: "1rem", ...actionBarStyle }}>
                        <button
                            style={secondaryBtn}
                            onClick={() => {
                                setNotifyEmail(true);
                                setNotifySms(false);
                            }}
                        >
                            Restaurar padrão
                        </button>
                        <button style={primaryBtn}>Salvar</button>
                    </div>
                </Card>

                {/* Integrações */}
                <div style={{ height: 36 }} />
                <Card title="Integrações" padding="medium">
                    <div style={sectionGridStyle}>
                        <div>
                            <label style={labelStyle}>
                                Token de Integração
                            </label>
                            <input
                                type="text"
                                value={integrationToken}
                                onChange={(e) =>
                                    setIntegrationToken(e.target.value)
                                }
                                placeholder="Cole aqui o token de integração"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>
                                Autenticação em Duas Etapas
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <input
                                    id="twoFactor"
                                    type="checkbox"
                                    checked={twoFactor}
                                    onChange={(e) =>
                                        setTwoFactor(e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="twoFactor"
                                    style={{
                                        color: "#374151",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Exigir 2FA para logins de administrador
                                </label>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: "1rem", ...actionBarStyle }}>
                        <button
                            style={secondaryBtn}
                            onClick={() => {
                                setIntegrationToken("");
                                setTwoFactor(false);
                            }}
                        >
                            Restaurar padrão
                        </button>
                        <button style={primaryBtn}>Salvar</button>
                    </div>
                </Card>

                {/* Usuários e Permissões (placeholder simples) */}
                <div style={{ height: 36 }} />
                <Card title="Usuários e Permissões" padding="medium">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                margin: 0,
                            }}
                        >
                            Gerencie acessos da equipe, papéis e status dos
                            usuários.
                        </p>
                        <button
                            onClick={() => navigate("/users-permissions")}
                            style={{
                                padding: "0.50rem 0.75rem",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Gerenciar usuários
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
