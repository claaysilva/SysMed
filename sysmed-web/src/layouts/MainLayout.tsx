import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";

interface MenuItem {
    path: string;
    label: string;
    icon: string;
    description: string;
}

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem("userName") || "Usuário";
        const role = localStorage.getItem("userRole") || "";
        setUserName(name);
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    const menuItems: MenuItem[] = [
        {
            path: "/",
            label: "Dashboard",
            icon: "📊",
            description: "Visão geral do sistema",
        },
        {
            path: "/patients",
            label: "Pacientes",
            icon: "👥",
            description: "Cadastro e gestão de pacientes",
        },
        {
            path: "/schedule",
            label: "Agenda",
            icon: "📅",
            description: "Agendamentos e consultas",
        },
        {
            path: "/medical-records",
            label: "Prontuários",
            icon: "📋",
            description: "Prontuários médicos eletrônicos",
        },
        {
            path: "/reports",
            label: "Relatórios",
            icon: "📈",
            description: "Relatórios médicos, financeiros e estatísticos",
        },
    ];

    const isActive = (path: string) => {
        if (path === "/") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const roleDisplayName =
        {
            doctor: "Médico",
            admin: "Administrador",
            nurse: "Recepcionista",
        }[userRole] || "Usuário";

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8fafc",
            }}
        >
            {/* Sidebar */}
            <aside
                style={{
                    width: isSidebarCollapsed ? "80px" : "280px",
                    background:
                        "linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%)",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.3s ease",
                    position: "fixed",
                    height: "100vh",
                    left: 0,
                    top: 0,
                    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                }}
            >
                {/* Logo e Header da Sidebar */}
                <div
                    style={{
                        padding: isSidebarCollapsed
                            ? "1.5rem 1rem"
                            : "2rem 1.5rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isSidebarCollapsed
                            ? "center"
                            : "space-between",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                        }}
                    >
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                background: "rgba(255, 255, 255, 0.2)",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                fontWeight: "bold",
                            }}
                        >
                            🏥
                        </div>
                        {!isSidebarCollapsed && (
                            <div>
                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: "1.5rem",
                                        fontWeight: "700",
                                    }}
                                >
                                    SysMed
                                </h1>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.75rem",
                                        opacity: 0.8,
                                    }}
                                >
                                    Gestão Médica
                                </p>
                            </div>
                        )}
                    </div>
                    {!isSidebarCollapsed && (
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "white",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "6px",
                                opacity: 0.7,
                                transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "1")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
                            }
                        >
                            ⬅️
                        </button>
                    )}
                    {isSidebarCollapsed && (
                        <button
                            onClick={() => setIsSidebarCollapsed(false)}
                            style={{
                                border: "none",
                                color: "white",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "6px",
                                opacity: 0.7,
                                transition: "opacity 0.2s",
                                position: "absolute",
                                top: "20px",
                                right: "-15px",
                                background: "#1e40af",
                                boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "1")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
                            }
                        >
                            ➡️
                        </button>
                    )}
                </div>

                {/* Menu de Navegação */}
                <nav style={{ flex: 1, padding: "1rem 0" }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: isSidebarCollapsed
                                    ? "1rem"
                                    : "1rem 1.5rem",
                                margin: isSidebarCollapsed
                                    ? "0.5rem"
                                    : "0.25rem 1rem",
                                borderRadius: "12px",
                                textDecoration: "none",
                                color: "white",
                                background: isActive(item.path)
                                    ? "rgba(255, 255, 255, 0.15)"
                                    : "transparent",
                                border: isActive(item.path)
                                    ? "1px solid rgba(255, 255, 255, 0.2)"
                                    : "1px solid transparent",
                                transition: "all 0.2s ease",
                                justifyContent: isSidebarCollapsed
                                    ? "center"
                                    : "flex-start",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background =
                                        "rgba(255, 255, 255, 0.08)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background =
                                        "transparent";
                                }
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "1.25rem",
                                    width: "24px",
                                    textAlign: "center",
                                }}
                            >
                                {item.icon}
                            </span>
                            {!isSidebarCollapsed && (
                                <div>
                                    <div
                                        style={{
                                            fontWeight: isActive(item.path)
                                                ? "600"
                                                : "500",
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.75rem",
                                            opacity: 0.8,
                                            marginTop: "0.125rem",
                                        }}
                                    >
                                        {item.description}
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Informações do Usuário e Logout */}
                <div
                    style={{
                        padding: isSidebarCollapsed ? "1rem" : "1.5rem",
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {!isSidebarCollapsed && (
                        <div style={{ marginBottom: "1rem" }}>
                            <div
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: "600",
                                }}
                            >
                                {userName}
                            </div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                                {roleDisplayName}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "8px",
                            padding: isSidebarCollapsed
                                ? "0.75rem"
                                : "0.75rem 1rem",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                "rgba(255, 255, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                                "rgba(255, 255, 255, 0.1)";
                        }}
                    >
                        <span>🚪</span>
                        {!isSidebarCollapsed && "Sair"}
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main
                style={{
                    flex: 1,
                    marginLeft: isSidebarCollapsed ? "80px" : "280px",
                    transition: "margin-left 0.3s ease",
                    background: "#f8fafc",
                }}
            >
                {/* Header do Conteúdo */}
                <header
                    style={{
                        background: "white",
                        padding: "1.5rem 2rem",
                        borderBottom: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                }}
                            >
                                {menuItems.find((item) => isActive(item.path))
                                    ?.label || "SysMed"}
                            </h2>
                            <p
                                style={{
                                    margin: "0.25rem 0 0 0",
                                    fontSize: "0.875rem",
                                    color: "#64748b",
                                }}
                            >
                                {menuItems.find((item) => isActive(item.path))
                                    ?.description || "Sistema de Gestão Médica"}
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    padding: "0.5rem 1rem",
                                    background: "#f1f5f9",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    color: "#475569",
                                }}
                            >
                                {new Date().toLocaleDateString("pt-BR", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Área de Conteúdo */}
                <div
                    style={{
                        padding: "2rem",
                        minHeight: "calc(100vh - 120px)",
                    }}
                >
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
