<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Apenas admin pode cadastrar pacientes.'], 403);
        }
        $validatedData = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'cpf' => 'required|string|unique:patients|max:14',
            'telefone' => 'nullable|string|max:20',
            'endereco' => 'nullable|string',
        ]);

        $patient = Patient::create($validatedData);
        return response()->json($patient, 201); // 201 = Created
    }

    // Mostrar um paciente específico
    public function show(Patient $patient)
    {
        return $patient;
    }

    // Atualizar um paciente
    public function update(Request $request, Patient $patient)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Apenas admin pode editar pacientes.'], 403);
        }
        $validatedData = $request->validate([
            'nome_completo' => 'sometimes|required|string|max:255',
            'data_nascimento' => 'sometimes|required|date',
            'cpf' => 'sometimes|required|string|max:14|unique:patients,cpf,' . $patient->id,
            'telefone' => 'nullable|string|max:20',
            'endereco' => 'nullable|string',
        ]);

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
