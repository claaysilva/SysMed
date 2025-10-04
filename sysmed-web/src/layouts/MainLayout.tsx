import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
    HomeIcon,
    UsersIcon,
    CalendarIcon,
    DocumentTextIcon,
    ChartPieIcon,
    XMarkIcon,
    Bars3Icon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
// Removed unused imports Sidebar and MobileHeader

interface MenuItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem("userName") || "Admin Sistema";
        const role = localStorage.getItem("userRole") || "admin";
        setUserName(name);
        setUserRole(role);
    }, []);

    // Detectar se é mobile
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarCollapsed(true);
                setIsMobileMenuOpen(false);
            }
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);

        return () => window.removeEventListener("resize", checkIfMobile);
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
            icon: HomeIcon,
            description: "Visão geral do sistema",
        },
        {
            path: "/patients",
            label: "Pacientes",
            icon: UsersIcon,
            description: "Cadastro e gestão de pacientes",
        },
        {
            path: "/schedule",
            label: "Agenda",
            icon: CalendarIcon,
            description: "Agendamentos e consultas",
        },
        {
            path: "/medical-records",
            label: "Prontuários",
            icon: DocumentTextIcon,
            description: "Prontuários médicos eletrônicos",
        },
        {
            path: "/reports",
            label: "Relatórios",
            icon: ChartPieIcon,
            description: "Relatórios e estatísticas",
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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const currentMenuItem = menuItems.find((item) => isActive(item.path));

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile menu button */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    🏥
                                </span>
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">
                                    SysMed
                                </span>
                                <div className="text-xs text-gray-500">
                                    Gestão Médica
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    ${isMobile ? "fixed" : "relative"}
                    ${
                        isMobile && !isMobileMenuOpen
                            ? "-translate-x-full"
                            : "translate-x-0"
                    }
                    ${isMobile ? "w-72" : isSidebarCollapsed ? "w-20" : "w-72"}
                    bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-white
                    flex flex-col transition-all duration-300 ease-in-out
                    ${isMobile ? "h-screen z-50" : "h-screen sticky top-0"}
                    shadow-xl border-r border-blue-600
                `}
            >
                {/* Logo e Header da Sidebar */}
                <div
                    className={`${
                        isMobile
                            ? "pt-16 px-4 pb-4"
                            : isSidebarCollapsed
                            ? "p-4"
                            : "p-6"
                    } border-b border-blue-600/30`}
                >
                    <div
                        className={`flex items-center ${
                            isSidebarCollapsed && !isMobile
                                ? "justify-center"
                                : "justify-between"
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <span className="text-xl">🏥</span>
                            </div>
                            {(!isSidebarCollapsed || isMobile) && (
                                <div>
                                    <h1 className="text-xl font-bold text-white">
                                        SysMed
                                    </h1>
                                    <p className="text-xs text-blue-200">
                                        Gestão Médica
                                    </p>
                                </div>
                            )}
                        </div>
                        {!isMobile && !isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(true)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Colapsar menu"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Menu de Navegação */}
                <nav className="flex-1 py-4 px-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={
                                        isMobile ? closeMobileMenu : undefined
                                    }
                                    className={`
                                        group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                                        transition-all duration-200 relative
                                        ${
                                            active
                                                ? "bg-white/15 text-white shadow-sm border border-white/20"
                                                : "text-blue-100 hover:bg-white/10 hover:text-white"
                                        }
                                        ${
                                            isSidebarCollapsed && !isMobile
                                                ? "justify-center"
                                                : ""
                                        }
                                    `}
                                >
                                    {active && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                                    )}
                                    <IconComponent
                                        className={`${
                                            isSidebarCollapsed && !isMobile
                                                ? "h-6 w-6"
                                                : "h-5 w-5 mr-3"
                                        } flex-shrink-0 transition-colors`}
                                    />
                                    {(!isSidebarCollapsed || isMobile) && (
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className={`font-medium truncate ${
                                                    active ? "text-white" : ""
                                                }`}
                                            >
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-blue-200 mt-0.5 truncate">
                                                {item.description}
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Informações do Usuário e Logout */}
                <div
                    className={`${
                        isMobile ? "p-4" : isSidebarCollapsed ? "p-4" : "p-6"
                    } border-t border-blue-600/30 bg-black/20 backdrop-blur-sm`}
                >
                    {(!isSidebarCollapsed || isMobile) && (
                        <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/10">
                            <div className="text-sm font-semibold text-white truncate">
                                {userName}
                            </div>
                            <div className="text-xs text-blue-200 truncate">
                                {roleDisplayName}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full bg-white/10 hover:bg-white/20 border border-white/20
                            text-white rounded-lg py-2.5 px-3 transition-all duration-200
                            flex items-center font-medium text-sm hover:shadow-sm
                            ${
                                isSidebarCollapsed && !isMobile
                                    ? "justify-center"
                                    : "justify-center space-x-2"
                            }
                        `}
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        {(!isSidebarCollapsed || isMobile) && <span>Sair</span>}
                    </button>
                </div>

                {/* Botão de expandir sidebar (desktop) */}
                {!isMobile && isSidebarCollapsed && (
                    <button
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="absolute -right-3 top-8 bg-blue-700 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                        aria-label="Expandir menu"
                    >
                        <Bars3Icon className="h-4 w-4" />
                    </button>
                )}
            </aside>

            {/* Conteúdo Principal */}
            <main
                className={`flex-1 flex flex-col min-h-screen ${
                    isMobile ? "pt-16" : ""
                }`}
            >
                {/* Header do Conteúdo */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                {currentMenuItem?.label || "Dashboard"}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                                {currentMenuItem?.description ||
                                    "Visão geral do sistema"}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center space-x-4">
                            <div className="bg-gray-50 px-3 py-2 rounded-lg text-xs sm:text-sm text-gray-600 border">
                                {new Date().toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Área de Conteúdo */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
