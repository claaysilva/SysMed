import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import PatientsPage from "./pages/PatientsPage.tsx";
import AgendaPage from "./pages/AgendaPage.tsx";
import PatientDetailPage from "./pages/PatientDetailPage.tsx";
import MedicalRecordsPage from "./pages/MedicalRecordsPage.tsx";
import MedicalRecordDetailPage from "./pages/MedicalRecordDetailPage.tsx";
import MedicalRecordFormPage from "./pages/MedicalRecordFormPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";

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
                <Route path="/schedule" element={<AgendaPage />} />
                <Route
                    path="/medical-records"
                    element={<MedicalRecordsPage />}
                />
                <Route
                    path="/medical-records/new"
                    element={<MedicalRecordFormPage />}
                />
                <Route
                    path="/medical-records/:recordId"
                    element={<MedicalRecordDetailPage />}
                />
                <Route
                    path="/medical-records/:recordId/edit"
                    element={<MedicalRecordFormPage />}
                />
                <Route path="/reports" element={<ReportsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
