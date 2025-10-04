<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\MedicalRecordEntryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;

// Rota para obter usuário autenticado
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rota de status da API
Route::get('/ping', function () {
    return response()->json(['message' => 'pong', 'status' => 'ok']);
});

// Autenticação
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {
    // Médicos (com cache)
    Route::middleware('cache.response:15')->get('/doctors', [DoctorController::class, 'index']);

    // Pacientes
    Route::apiResource('/patients', PatientController::class);

    // Consultas
    Route::apiResource('/appointments', AppointmentController::class);
    Route::middleware('cache.response:5')->get('/appointments/available-slots', [AppointmentController::class, 'availableSlots']);
    Route::middleware('cache.response:10')->get('/appointments/doctor/{doctorId}/schedule', [AppointmentController::class, 'doctorSchedule']);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);

    // Dashboard (com cache de curto prazo para estatísticas)
    Route::middleware('cache.response:5')->get('/dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::middleware('cache.response:2')->get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // Prontuários médicos
    Route::apiResource('/medical-records', MedicalRecordController::class);
    Route::middleware('cache.response:10')->get('/patients/{patientId}/medical-records', [MedicalRecordController::class, 'byPatient']);
    Route::get('/patients/{patientId}/record-entries', [MedicalRecordEntryController::class, 'indexForPatient']);
    Route::post('/record-entries', [MedicalRecordEntryController::class, 'store']);

    // Relatórios e estatísticas (com cache mais longo para dados analíticos)
    Route::prefix('reports')->group(function () {
        Route::middleware('cache.response:30')->get('/dashboard-stats', [ReportsController::class, 'dashboardStats']);
        Route::middleware('cache.response:30')->get('/appointments', [ReportsController::class, 'appointmentsReport']);
        Route::middleware('cache.response:30')->get('/financial', [ReportsController::class, 'financialReport']);
        Route::middleware('cache.response:30')->get('/patients', [ReportsController::class, 'patientsReport']);
    });

    // Sistema de notificações
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::get('/stats', [NotificationController::class, 'stats']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::put('/{id}', [NotificationController::class, 'update']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('/mark-multiple-read', [NotificationController::class, 'markMultipleAsRead']);
        Route::patch('/{id}/retry', [NotificationController::class, 'retry']);
        Route::patch('/{id}/cancel', [NotificationController::class, 'cancel']);
    });

    // Sistema de relatórios (legacy - considerar refatoração futura)
    Route::apiResource('/reports', ReportController::class);
    Route::get('/reports/{report}/download', [ReportController::class, 'download']);
    Route::middleware('cache.response:60')->get('/report-templates', [ReportController::class, 'templates']);
    Route::middleware('cache.response:30')->get('/reports-statistics', [ReportController::class, 'statistics']);
    Route::post('/reports/export', [ReportController::class, 'export']);
});
