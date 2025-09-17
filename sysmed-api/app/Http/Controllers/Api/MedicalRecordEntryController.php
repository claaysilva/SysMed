<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecordEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicalRecordEntryController extends Controller
{
  public function indexForPatient($patientId)
  {
    $entries = MedicalRecordEntry::with('user:id,name')
      ->where('patient_id', $patientId)
      ->orderBy('created_at', 'desc')
      ->get();
    return response()->json($entries);
  }

  public function store(Request $request)
  {
    $validatedData = $request->validate([
      'patient_id' => 'required|exists:patients,id',
      'conteudo' => 'required|string',
      'appointment_id' => 'nullable|exists:appointments,id',
    ]);

    $user = Auth::user();
    if (!in_array($user->role, ['medico', 'admin'])) {
      return response()->json(['message' => 'Apenas médicos ou admin podem registrar entradas no prontuário.'], 403);
    }

    $entry = MedicalRecordEntry::create([
      'patient_id' => $validatedData['patient_id'],
      'conteudo' => $validatedData['conteudo'],
      'appointment_id' => $validatedData['appointment_id'] ?? null,
      'user_id' => Auth::id(),
    ]);

    return response()->json($entry, 201);
  }
}
