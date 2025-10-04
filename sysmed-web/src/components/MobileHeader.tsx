import React from "react";
import {
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

interface MobileHeaderProps {
    isMobileMenuOpen: boolean;
    onToggleMenu: () => void;
    currentPage: {
        label: string;
        description: string;
    };
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
    isMobileMenuOpen,
    onToggleMenu,
    currentPage,
}) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo e Título */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">🏥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">
                            SysMed
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {currentPage.label}
                        </div>
                    </div>
                </div>

                {/* Ações do Header */}
                <div className="flex items-center space-x-2">
                    {/* Notificações */}
                    <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
                        <BellIcon className="h-5 w-5" />
                        {/* Badge de notificação */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    </button>

                    {/* Avatar do usuário */}
                    <button className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        <UserCircleIcon className="h-6 w-6" />
                    </button>

                    {/* Botão do menu */}
                    <button
                        onClick={onToggleMenu}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-2"
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
        </div>
    );
};

export default MobileHeader;
