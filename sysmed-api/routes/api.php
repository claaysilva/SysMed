<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;

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
});
