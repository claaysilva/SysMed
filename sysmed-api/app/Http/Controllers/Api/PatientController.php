<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient; // Importe o Model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    // Listar todos os pacientes
    public function index()
    {
        return Patient::all();
    }

    // Criar um novo paciente
    public function store(StorePatientRequest $request)
    {
        $validatedData = $request->validated();

        $patient = Patient::create($validatedData);
        return response()->json($patient, 201); // 201 = Created
    }

    // Mostrar um paciente específico
    public function show(Patient $patient)
    {
        return $patient;
    }

    // Atualizar um paciente
    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $validatedData = $request->validated();

        $patient->update($validatedData);
        return response()->json($patient, 200); // 200 = OK
    }

    // Deletar um paciente
    public function destroy(Patient $patient)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Apenas admin pode deletar pacientes.'], 403);
        }
        $patient->delete();
        return response()->json(null, 204); // 204 = No Content
    }
}
