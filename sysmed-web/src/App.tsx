import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import PatientsPage from "./pages/PatientsPage.tsx";
import SchedulePage from "./pages/SchedulePage.tsx";
import PatientDetailPage from "./pages/PatientDetailPage.tsx";

function App() {
    return (
        <Routes>
            {/* A página de login é pública e não usa o layout principal */}
            <Route path="/login" element={<LoginPage />} />

            {/* Todas as rotas aqui dentro são PROTEGIDAS e usarão o MainLayout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />

                <Route path="/patients" element={<PatientsPage />} />
                <Route
                    path="/patients/:patientId"
                    element={<PatientDetailPage />}
                />
                <Route path="/schedule" element={<SchedulePage />} />
            </Route>
        </Routes>
    );
}

export default App;
