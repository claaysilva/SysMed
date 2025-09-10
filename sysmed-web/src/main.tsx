import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.tsx";
import LoginPage from "./pages/LoginPage.tsx"; // Importando o arquivo .tsx
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                {/* Rota principal que carrega o layout do App */}
                <Route path="/" element={<App />}>
                    {/* Adicione outras rotas aqui no futuro, ex: Dashboard */}
                </Route>

                {/* Rota específica para a página de login */}
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
