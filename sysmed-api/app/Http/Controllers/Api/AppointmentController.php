<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
  public function index()
  {
    $appointments = Appointment::with(['patient', 'user'])->get();
    return response()->json($appointments);
  }

  public function store(Request $request)
  {
    $validatedData = $request->validate([
      'patient_id' => 'required|exists:patients,id',
      'user_id' => 'required|exists:users,id',
      'data_hora_inicio' => 'required|date',
      'data_hora_fim' => 'required|date|after:data_hora_inicio',
      'status' => 'sometimes|string',
      'observacoes' => 'nullable|string',
    ]);

    $appointment = Appointment::create($validatedData);
    return response()->json($appointment, 201);
  }
}
