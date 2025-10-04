import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarSimple from "../components/SidebarSimple";
import MobileHeader from "../components/MobileHeader";

const MainLayoutNew: React.FC = () => {
    const location = useLocation();
    const [userName, setUserName] = useState<string>("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem("userName") || "Admin Sistema";
        setUserName(name.trim()); // Aplicar trim ao salvar no state
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

    // Fechar menu mobile ao navegar
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const getCurrentPage = () => {
        const path = location.pathname;
        switch (path) {
            case "/dashboard":
                return {
                    label: "Dashboard",
                    description: "Visão geral do sistema",
                };
            case "/patients":
                return {
                    label: "Pacientes",
                    description: "Gerenciar pacientes",
                };
            case "/appointments":
                return {
                    label: "Consultas",
                    description: "Agendar e gerenciar consultas",
                };
            case "/medical-records":
                return {
                    label: "Prontuários",
                    description: "Histórico médico",
                };
            case "/reports":
                return {
                    label: "Relatórios",
                    description: "Análises e estatísticas",
                };
            default:
                return { label: "Dashboard", description: "Sistema médico" };
        }
    };

    const handleToggleCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleCloseMobile = () => {
        setIsMobileMenuOpen(false);
    };

    const handleToggleMobile = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Header Mobile */}
            {isMobile && (
                <MobileHeader
                    isMobileMenuOpen={isMobileMenuOpen}
                    onToggleMenu={handleToggleMobile}
                    currentPage={getCurrentPage()}
                />
            )}

            {/* Sidebar */}
            <SidebarSimple
                userName={userName}
                isSidebarCollapsed={isSidebarCollapsed}
                isMobileMenuOpen={isMobileMenuOpen}
                isMobile={isMobile}
                onToggleCollapse={handleToggleCollapse}
                onCloseMobile={handleCloseMobile}
            />

            {/* Overlay para mobile */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleCloseMobile}
                />
            )}

            {/* Conteúdo principal */}
            <main
                className={`
                flex-1 overflow-auto
                ${isMobile ? "pt-16" : ""}
            `}
            >
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayoutNew;
