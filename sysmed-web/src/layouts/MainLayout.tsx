import React from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";

const MainLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove o token do localStorage
        localStorage.removeItem("authToken");
        // Redireciona para a página de login
        navigate("/login");
    };

    return (
        <div>
            <header
                style={{
                    background: "#333",
                    color: "white",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <h1>SysMed</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>
            <nav style={{ padding: "1rem", background: "#f4f4f4" }}>
                <Link to="/">Dashboard</Link> |{" "}
                <Link to="/patients">Pacientes</Link>
            </nav>
            <main style={{ padding: "1rem" }}>
                {/* O <Outlet /> é um placeholder. É aqui que o conteúdo da página atual (Dashboard, Pacientes, etc.) será renderizado. */}
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
