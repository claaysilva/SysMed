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
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TestController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rota de teste simples
Route::get('/ping', function () {
    return response()->json(['message' => 'pong', 'status' => 'ok']);
});

Route::post('/login', [AuthController::class, 'login'])->name('login');

// Rotas de teste sem auth
Route::get('/test', [TestController::class, 'simpleTest']);
Route::get('/dashboard/test', [TestController::class, 'dashboardTest']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/doctors', [DoctorController::class, 'index']);
    Route::apiResource('/patients', PatientController::class);
    Route::apiResource('/appointments', AppointmentController::class);

    // Rotas do dashboard
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // Rotas avançadas de agendamento
    Route::get('/appointments/available-slots', [AppointmentController::class, 'availableSlots']);
    Route::get('/appointments/doctor/{doctorId}/schedule', [AppointmentController::class, 'doctorSchedule']);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);

    Route::get('/patients/{patientId}/record-entries', [MedicalRecordEntryController::class, 'indexForPatient']);
    Route::post('/record-entries', [MedicalRecordEntryController::class, 'store']);

    // Rotas do sistema de prontuários
    Route::apiResource('/medical-records', MedicalRecordController::class);
    Route::get('/patients/{patientId}/medical-records', [MedicalRecordController::class, 'byPatient']);

    // Rotas do sistema de relatórios
    Route::apiResource('/reports', ReportController::class);
    Route::get('/reports/{report}/download', [ReportController::class, 'download']);
    Route::get('/report-templates', [ReportController::class, 'templates']);
    Route::get('/reports-statistics', [ReportController::class, 'statistics']);
    Route::post('/reports/export', [ReportController::class, 'export']);
});
