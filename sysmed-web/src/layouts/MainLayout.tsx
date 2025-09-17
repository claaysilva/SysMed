import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        const name = localStorage.getItem("userName") || "Usuário";
        const role = localStorage.getItem("userRole") || "";
        setUserName(name);
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        // Remove dados do localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        // Redireciona para a página de login
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
            <header
                style={{
                    background: "linear-gradient(135deg, #1976d2, #1565c0)",
                    color: "white",
                    padding: "1rem 2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "1.8rem",
                            fontWeight: "bold",
                        }}
                    >
                        SysMed
                    </h1>
                    <p
                        style={{
                            margin: "0.25rem 0 0 0",
                            fontSize: "0.875rem",
                            opacity: 0.9,
                        }}
                    >
                        Sistema de Gestão Médica
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontWeight: "bold" }}>
                            {userName}
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "0.875rem",
                                opacity: 0.8,
                            }}
                        >
                            {userRole === "doctor"
                                ? "Médico"
                                : userRole === "admin"
                                ? "Administrador"
                                : "Recepcionista"}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "white",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "6px",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                            ((e.target as HTMLButtonElement).style.background =
                                "rgba(255,255,255,0.3)")
                        }
                        onMouseLeave={(e) =>
                            ((e.target as HTMLButtonElement).style.background =
                                "rgba(255,255,255,0.2)")
                        }
                    >
                        Sair
                    </button>
                </div>
            </header>

            <nav
                style={{
                    background: "white",
                    padding: "0 2rem",
                    borderBottom: "1px solid #e0e0e0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
            >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link
                        to="/"
                        style={{
                            textDecoration: "none",
                            padding: "1rem 1.5rem",
                            color: isActive("/") ? "#1976d2" : "#666",
                            fontWeight: isActive("/") ? "bold" : "normal",
                            borderBottom: isActive("/")
                                ? "3px solid #1976d2"
                                : "3px solid transparent",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive("/")) {
                                (e.target as HTMLAnchorElement).style.color =
                                    "#1976d2";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive("/")) {
                                (e.target as HTMLAnchorElement).style.color =
                                    "#666";
                            }
                        }}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        to="/patients"
                        style={{
                            textDecoration: "none",
                            padding: "1rem 1.5rem",
                            color: isActive("/patients") ? "#1976d2" : "#666",
                            fontWeight: isActive("/patients")
                                ? "bold"
                                : "normal",
                            borderBottom: isActive("/patients")
                                ? "3px solid #1976d2"
                                : "3px solid transparent",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive("/patients")) {
                                (e.target as HTMLAnchorElement).style.color =
                                    "#1976d2";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive("/patients")) {
                                (e.target as HTMLAnchorElement).style.color =
                                    "#666";
                            }
                        }}
                    >
                        👥 Pacientes
                    </Link>
                    <Link
                        to="/schedule"
                        style={{
                            textDecoration: "none",
                            padding: "1rem 1.5rem",
                            color: isActive("/schedule") ? "#1976d2" : "#666",
                            fontWeight: isActive("/schedule")
                                ? "bold"
                                : "normal",
                            borderBottom: isActive("/schedule")
                                ? "3px solid #1976d2"
                                : "3px solid transparent",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive("/schedule")) {
                                (e.target as HTMLAnchorElement).style.color =
                                    "#1976d2";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive("/schedule")) {
                                (e.target as HTMLAnchorElement).style.color =
                                    "#666";
                            }
                        }}
                    >
                        📅 Agenda
                    </Link>
                </div>
            </nav>

            <main
                style={{
                    padding: 0,
                    background: "#f8f9fa",
                    minHeight: "calc(100vh - 140px)",
                }}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
