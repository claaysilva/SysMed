import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import MainLayoutNew from "./layouts/MainLayoutNew.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import PatientsPage from "./pages/PatientsPage.tsx";
import AppointmentsPage from "./pages/AppointmentsPageNew.tsx";
import PatientDetailPage from "./pages/PatientDetailPage.tsx";
import MedicalRecordsPage from "./pages/MedicalRecordsPageNew.tsx";
import MedicalRecordDetailPage from "./pages/MedicalRecordDetailPage.tsx";
import MedicalRecordFormPage from "./pages/MedicalRecordFormPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import LoginQuickPage from "./pages/LoginQuickPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import UsersPermissionsPage from "./pages/UsersPermissionsPage.tsx";

function App() {
    return (
        <Routes>
            {/* A página de login é pública e não usa o layout principal */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/quick-login" element={<LoginQuickPage />} />

            {/* Todas as rotas aqui dentro são PROTEGIDAS e usarão o MainLayoutNew */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayoutNew />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />

                <Route path="/patients" element={<PatientsPage />} />
                <Route
                    path="/patients/:patientId"
                    element={<PatientDetailPage />}
                />
                <Route path="/schedule" element={<AppointmentsPage />} />
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
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                    path="/users-permissions"
                    element={<UsersPermissionsPage />}
                />
                {/** Rota de atividades removida */}
            </Route>
        </Routes>
    );
}

export default App;
