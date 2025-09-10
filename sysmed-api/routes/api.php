<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Adicione a sua rota de login aqui
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('/patients', PatientController::class)->middleware('auth:sanctum');
