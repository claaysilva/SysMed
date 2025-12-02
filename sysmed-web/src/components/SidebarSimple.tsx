import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    HomeIcon,
    UsersIcon,
    CalendarIcon,
    DocumentTextIcon,
    ChartPieIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface SidebarSimpleProps {
    userName: string;
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    isMobile: boolean;
    onToggleCollapse: () => void;
    onCloseMobile: () => void;
}

const SidebarSimple: React.FC<SidebarSimpleProps> = ({
    userName,
    isSidebarCollapsed,
    isMobileMenuOpen,
    isMobile,
    onToggleCollapse,
    onCloseMobile,
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: "/", label: "Dashboard", icon: HomeIcon },
        { path: "/patients", label: "Pacientes", icon: UsersIcon },
        { path: "/schedule", label: "Consultas", icon: CalendarIcon },
        {
            path: "/medical-records",
            label: "Prontuários",
            icon: DocumentTextIcon,
        },
        { path: "/reports", label: "Relatórios", icon: ChartPieIcon },
        {
            path: "/users-permissions",
            label: "Usuários",
            icon: ShieldCheckIcon,
        },
        { path: "/settings", label: "Configurações", icon: CogIcon },
    ];

    const isActive = (path: string) => {
        if (path === "/") {
            return (
                location.pathname === "/" || location.pathname === "/dashboard"
            );
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    const sidebarWidth = isSidebarCollapsed && !isMobile ? "w-16" : "w-48";
    const isVisible = isMobile ? isMobileMenuOpen : true;

    // Fecha ao clicar em qualquer lugar da tela (desktop) quando o menu estiver aberto
    useEffect(() => {
        const handleGlobalClick = () => {
            if (!isMobile && !isSidebarCollapsed) {
                onToggleCollapse();
            }
        };
        document.addEventListener("click", handleGlobalClick);
        return () => document.removeEventListener("click", handleGlobalClick);
    }, [isMobile, isSidebarCollapsed, onToggleCollapse]);

    return (
        <>
            {/* Overlay Mobile */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    sidebar-dark
                    ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}
                    ${isVisible ? "translate-x-0" : "-translate-x-full"}
                    ${sidebarWidth}
                    flex flex-col h-full
                    transition-all duration-300 ease-in-out
                    shadow-lg
                `}
                style={{
                    backgroundColor: "#1e40af", // blue-800 (mais claro que blue-900)
                    borderRight: "1px solid #2563eb", // blue-600
                    color: "white",
                }}
                onMouseEnter={() => {
                    // No desktop, abre ao passar o mouse
                    if (!isMobile && isSidebarCollapsed) {
                        onToggleCollapse();
                    }
                }}
            >
                {/* Fechamento por clique global configurado via useEffect */}
                {/* Header */}
                <div
                    className={`border-b ${
                        isSidebarCollapsed && !isMobile ? "p-2" : "p-4"
                    }`}
                    style={{ borderColor: "#2563eb" }} // blue-600
                >
                    <div className="flex items-center justify-center">
                        {(!isSidebarCollapsed || isMobile) && (
                            <div className="text-center">
                                <h1
                                    className="text-lg font-bold"
                                    style={{ color: "white" }}
                                >
                                    SysMed
                                </h1>
                                <p
                                    className="text-xs"
                                    style={{ color: "#cbd5e1" }}
                                >
                                    Gestão Médica
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 sidebar-nav px-4 pb-4 pt-0 flex flex-col justify-center">
                    <ul className="list-none" style={{ margin: 0, padding: 0 }}>
                        {/* Removido botão de abrir/fechar; comportamento agora é por hover */}
                        {/* Itens do menu principal */}
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const active = isActive(item.path);

                            return (
                                <li
                                    key={item.path}
                                    className="list-none m-0 p-0"
                                    style={{
                                        margin: 0,
                                        padding: 0,
                                    }}
                                >
                                    <Link
                                        to={item.path}
                                        onClick={
                                            isMobile ? onCloseMobile : undefined
                                        }
                                        className={`
                                            flex items-center rounded-lg transition-colors no-underline
                                            ${
                                                isSidebarCollapsed && !isMobile
                                                    ? "p-3"
                                                    : "p-5"
                                            }
                                            ${
                                                active
                                                    ? "bg-blue-600 text-blue-50"
                                                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
                                            }
                                            ${
                                                isSidebarCollapsed && !isMobile
                                                    ? "justify-center"
                                                    : ""
                                            }
                                        `}
                                    >
                                        <IconComponent
                                            className="sidebar-icon flex-shrink-0"
                                            style={{
                                                width:
                                                    isSidebarCollapsed &&
                                                    !isMobile
                                                        ? "32px"
                                                        : "28px",
                                                height:
                                                    isSidebarCollapsed &&
                                                    !isMobile
                                                        ? "32px"
                                                        : "28px",
                                            }}
                                        />
                                        {(!isSidebarCollapsed || isMobile) && (
                                            <span
                                                className="font-bold"
                                                style={{ marginLeft: "14px" }}
                                            >
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info & Logout */}
                <div
                    className={`border-t ${
                        isSidebarCollapsed && !isMobile ? "p-1.5" : "p-4"
                    }`}
                    style={{
                        borderColor: "#2563eb", // blue-600
                        backgroundColor: "#1d4ed8", // blue-700
                    }}
                >
                    {(!isSidebarCollapsed || isMobile) && (
                        <div
                            className="mb-4 p-3 rounded-lg shadow-sm"
                            style={{
                                backgroundColor: "#2563eb", // blue-600
                                borderColor: "#3b82f6", // blue-500
                                border: "1px solid",
                            }}
                        >
                            <div className="flex items-center justify-center text-center">
                                <p className="text-sm font-bold text-white truncate text-center">
                                    {userName || "Usuário"}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`
                            w-full rounded-lg
                            ${
                                isSidebarCollapsed && !isMobile
                                    ? "py-1.5 px-1.5"
                                    : "py-2 px-3"
                            }
                            flex items-center transition-colors font-medium
                            ${
                                isSidebarCollapsed && !isMobile
                                    ? "justify-center"
                                    : "justify-center space-x-2"
                            }
                        `}
                        style={{
                            backgroundColor: "#dc2626", // red-600 (mantendo vermelho para logout)
                            color: "#fecaca", // red-200
                            border: "1px solid #b91c1c", // red-700
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#b91c1c"; // red-700
                            e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc2626"; // red-600
                            e.currentTarget.style.color = "#fecaca"; // red-200
                        }}
                    >
                        <ArrowRightOnRectangleIcon
                            className="sidebar-icon"
                            style={{
                                width:
                                    isSidebarCollapsed && !isMobile
                                        ? "28px"
                                        : "24px",
                                height:
                                    isSidebarCollapsed && !isMobile
                                        ? "28px"
                                        : "24px",
                            }}
                        />
                        {(!isSidebarCollapsed || isMobile) && <span>Sair</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SidebarSimple;
