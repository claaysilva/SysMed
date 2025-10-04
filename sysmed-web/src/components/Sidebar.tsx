import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Bars3Icon,
    XMarkIcon,
    UsersIcon,
    CalendarIcon,
    DocumentTextIcon,
    ChartPieIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    CogIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string;
}

interface SidebarProps {
    userName: string;
    userRole: string;
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    isMobile: boolean;
    onToggleCollapse: () => void;
    onCloseMobile: () => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    userName,
    userRole,
    isSidebarCollapsed,
    isMobileMenuOpen,
    isMobile,
    onToggleCollapse,
    onCloseMobile,
    onLogout,
}) => {
    const location = useLocation();

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
            description: "Gerenciar pacientes",
        },
        {
            path: "/schedule",
            label: "Consultas",
            icon: CalendarIcon,
            description: "Agenda e horários",
        },
        {
            path: "/medical-records",
            label: "Prontuários",
            icon: DocumentTextIcon,
            description: "Histórico médico",
        },
        {
            path: "/reports",
            label: "Relatórios",
            icon: ChartPieIcon,
            description: "Análises e estatísticas",
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
        <>
            {/* Mobile overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}
                    ${
                        isMobile && !isMobileMenuOpen
                            ? "-translate-x-full"
                            : "translate-x-0"
                    }
                    ${isSidebarCollapsed && !isMobile ? "w-20" : "w-80"}
                    bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-white
                    flex flex-col transition-all duration-300 ease-in-out
                    h-full shadow-2xl border-r border-blue-600/30
                `}
            >
                {/* Header da Sidebar */}
                <div
                    className={`${
                        isMobile
                            ? "pt-16 px-6 pb-6"
                            : isSidebarCollapsed
                            ? "p-4"
                            : "p-6"
                    } border-b border-blue-600/40`}
                >
                    <div
                        className={`flex items-center ${
                            isSidebarCollapsed && !isMobile
                                ? "justify-center"
                                : "justify-between"
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                                <span className="text-2xl">🏥</span>
                            </div>
                            {(!isSidebarCollapsed || isMobile) && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white">
                                        SysMed
                                    </h1>
                                    <p className="text-sm text-blue-200 font-medium">
                                        Gestão Médica
                                    </p>
                                </div>
                            )}
                        </div>
                        {!isMobile && !isSidebarCollapsed && (
                            <button
                                onClick={onToggleCollapse}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                aria-label="Colapsar menu"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Menu de Navegação */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={
                                        isMobile ? onCloseMobile : undefined
                                    }
                                    className={`
                                        group flex items-center rounded-lg transition-all duration-200 relative
                                        ${
                                            isSidebarCollapsed && !isMobile
                                                ? "px-3 py-3 justify-center"
                                                : "px-4 py-3"
                                        }
                                        ${
                                            active
                                                ? "bg-white/15 text-white shadow-lg border border-white/20"
                                                : "text-blue-100 hover:bg-white/10 hover:text-white"
                                        }
                                    `}
                                >
                                    {/* Indicador de item ativo */}
                                    {active && (
                                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full" />
                                    )}

                                    <div
                                        className={`flex items-center ${
                                            isSidebarCollapsed && !isMobile
                                                ? "justify-center"
                                                : "space-x-3"
                                        }`}
                                    >
                                        <IconComponent className="h-5 w-5 flex-shrink-0" />

                                        {(!isSidebarCollapsed || isMobile) && (
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {item.label}
                                                </div>
                                                <div className="text-xs text-blue-200 truncate opacity-90">
                                                    {item.description}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tooltip para modo colapsado */}
                                    {isSidebarCollapsed && !isMobile && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                                            <div className="font-medium">
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-gray-300">
                                                {item.description}
                                            </div>
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divisor e menu secundário */}
                    <div className="mt-8 pt-6 border-t border-blue-600/30">
                        <div className="space-y-2">
                            <Link
                                to="/settings"
                                className={`
                                    group flex items-center rounded-lg transition-all duration-200 relative
                                    ${
                                        isSidebarCollapsed && !isMobile
                                            ? "px-3 py-3 justify-center"
                                            : "px-4 py-3"
                                    }
                                    text-blue-200 hover:bg-white/10 hover:text-white
                                `}
                            >
                                <div
                                    className={`flex items-center ${
                                        isSidebarCollapsed && !isMobile
                                            ? "justify-center"
                                            : "space-x-3"
                                    }`}
                                >
                                    <CogIcon className="h-5 w-5 flex-shrink-0" />
                                    {(!isSidebarCollapsed || isMobile) && (
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">
                                                Configurações
                                            </div>
                                            <div className="text-xs text-blue-200 opacity-90">
                                                Ajustes do sistema
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tooltip para modo colapsado */}
                                {isSidebarCollapsed && !isMobile && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                                        <div className="font-medium">
                                            Configurações
                                        </div>
                                        <div className="text-xs text-gray-300">
                                            Ajustes do sistema
                                        </div>
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Informações do Usuário e Logout */}
                <div
                    className={`${
                        isMobile ? "p-6" : isSidebarCollapsed ? "p-4" : "p-6"
                    } border-t border-blue-600/30 bg-black/20 backdrop-blur-sm`}
                >
                    {(!isSidebarCollapsed || isMobile) && (
                        <div className="mb-4 p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                                    <span className="text-lg font-bold">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">
                                        {userName}
                                    </div>
                                    <div className="text-xs text-blue-200 truncate">
                                        {roleDisplayName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onLogout}
                        className={`
                            w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30
                            text-white rounded-lg transition-all duration-200
                            flex items-center font-medium text-sm hover:shadow-lg
                            backdrop-blur-sm hover:border-red-400/40
                            ${
                                isSidebarCollapsed && !isMobile
                                    ? "justify-center py-3 px-3"
                                    : "justify-center space-x-2 py-3 px-4"
                            }
                        `}
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        {(!isSidebarCollapsed || isMobile) && <span>Sair</span>}
                    </button>
                </div>

                {/* Botão de expandir sidebar (desktop) */}
                {!isMobile && isSidebarCollapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="absolute -right-3 top-8 bg-blue-700 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border-2 border-blue-500 hover:border-blue-400 z-10"
                        aria-label="Expandir menu"
                    >
                        <Bars3Icon className="h-4 w-4" />
                    </button>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
