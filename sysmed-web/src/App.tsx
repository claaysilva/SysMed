import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
    return (
        <div>
            {/* O componente <Routes> olha a URL atual e decide qual <Route> mostrar. */}
            <Routes>
                {/* Se a URL for exatamente "/", mostre o elemento abaixo */}
                <Route path="/" element={<h1>Página Principal do SysMed</h1>} />

                {/* Se a URL for "/login", mostre o componente da página de Login */}
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </div>
    );
}

export default App;
