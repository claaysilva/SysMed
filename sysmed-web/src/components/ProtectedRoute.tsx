import React from "react";
import { Navigate } from "react-router-dom";

// Este componente recebe outros componentes como "filhos" (children)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Verifica se o token de autenticação existe no localStorage
    const token = localStorage.getItem("authToken");

    // Se o token NÃO existir, redireciona o usuário para a página de login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Se o token existir, permite que o componente "filho" seja renderizado
    return <>{children}</>;
};

export default ProtectedRoute;
