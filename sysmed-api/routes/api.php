<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\MedicalRecordController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [AuthController::class, 'login']);
Route::get('/doctors', [DoctorController::class, 'index'])->middleware('auth:sanctum');
Route::apiResource('/patients', PatientController::class)->middleware('auth:sanctum');
Route::apiResource('/appointments', AppointmentController::class)->middleware('auth:sanctum');

use App\Http\Controllers\Api\MedicalRecordEntryController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/patients/{patientId}/record-entries', [MedicalRecordEntryController::class, 'indexForPatient']);
    Route::post('/record-entries', [MedicalRecordEntryController::class, 'store']);

    // Rotas do sistema de prontuários
    Route::apiResource('/medical-records', MedicalRecordController::class);
    Route::post('/medical-records/{medicalRecord}/sign', [MedicalRecordController::class, 'sign']);
    Route::get('/medical-records-statistics', [MedicalRecordController::class, 'statistics']);
    Route::get('/patients/{patient}/medical-records', [MedicalRecordController::class, 'byPatient']);
});
