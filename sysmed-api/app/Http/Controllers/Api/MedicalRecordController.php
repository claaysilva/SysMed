<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = MedicalRecord::with(['patient', 'user', 'appointment']);

            // Filtros
            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('tipo_consulta')) {
                $query->where('tipo_consulta', $request->tipo_consulta);
            }

            if ($request->has('data_inicio') && $request->has('data_fim')) {
                $query->whereBetween('data_consulta', [$request->data_inicio, $request->data_fim]);
            }

            // Ordenação
            $query->orderBy('data_consulta', 'desc')
                ->orderBy('horario_consulta', 'desc');

            // Paginação
            $perPage = $request->get('per_page', 15);
            $records = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $records->items(),
                'meta' => [
                    'current_page' => $records->currentPage(),
                    'last_page' => $records->lastPage(),
                    'per_page' => $records->perPage(),
                    'total' => $records->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar prontuários: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:patients,id',
                'appointment_id' => 'nullable|exists:appointments,id',
                'data_consulta' => 'required|date',
                'horario_consulta' => 'required|date_format:H:i',
                'tipo_consulta' => 'required|in:consulta,retorno,emergencia,exame,cirurgia',
                'queixa_principal' => 'nullable|string',
                'historia_doenca_atual' => 'nullable|string',
                'historia_patologica_pregressa' => 'nullable|string',
                'historia_familiar' => 'nullable|string',
                'historia_social' => 'nullable|string',
                'medicamentos_uso' => 'nullable|string',
                'alergias' => 'nullable|string',
                'sinais_vitais' => 'nullable|array',
                'exame_fisico_geral' => 'nullable|string',
                'exame_fisico_especifico' => 'nullable|string',
                'hipotese_diagnostica' => 'nullable|string',
                'cid' => 'nullable|string',
                'conduta' => 'nullable|string',
                'prescricao' => 'nullable|string',
                'exames_solicitados' => 'nullable|string',
                'orientacoes' => 'nullable|string',
                'retorno' => 'nullable|date',
                'observacoes' => 'nullable|string',
                'status' => 'in:rascunho,finalizado,assinado'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['user_id'] = Auth::id();

            $record = MedicalRecord::create($data);
            $record->load(['patient', 'user', 'appointment']);

            return response()->json([
                'success' => true,
                'message' => 'Prontuário criado com sucesso',
                'data' => $record
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar prontuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $record = MedicalRecord::with(['patient', 'user', 'appointment'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $record
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Prontuário não encontrado'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $record = MedicalRecord::findOrFail($id);

            // Verificar se pode ser editado
            if (!$record->canBeEdited()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este prontuário não pode ser editado'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'patient_id' => 'sometimes|exists:patients,id',
                'appointment_id' => 'nullable|exists:appointments,id',
                'data_consulta' => 'sometimes|date',
                'horario_consulta' => 'sometimes|date_format:H:i',
                'tipo_consulta' => 'sometimes|in:consulta,retorno,emergencia,exame,cirurgia',
                'queixa_principal' => 'nullable|string',
                'historia_doenca_atual' => 'nullable|string',
                'historia_patologica_pregressa' => 'nullable|string',
                'historia_familiar' => 'nullable|string',
                'historia_social' => 'nullable|string',
                'medicamentos_uso' => 'nullable|string',
                'alergias' => 'nullable|string',
                'sinais_vitais' => 'nullable|array',
                'exame_fisico_geral' => 'nullable|string',
                'exame_fisico_especifico' => 'nullable|string',
                'hipotese_diagnostica' => 'nullable|string',
                'cid' => 'nullable|string',
                'conduta' => 'nullable|string',
                'prescricao' => 'nullable|string',
                'exames_solicitados' => 'nullable|string',
                'orientacoes' => 'nullable|string',
                'retorno' => 'nullable|date',
                'observacoes' => 'nullable|string',
                'status' => 'in:rascunho,finalizado,assinado'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $record->update($validator->validated());
            $record->load(['patient', 'user', 'appointment']);

            return response()->json([
                'success' => true,
                'message' => 'Prontuário atualizado com sucesso',
                'data' => $record
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar prontuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $record = MedicalRecord::findOrFail($id);

            // Verificar se pode ser excluído
            if ($record->isAssinado()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prontuários assinados não podem ser excluídos'
                ], 403);
            }

            $record->delete();

            return response()->json([
                'success' => true,
                'message' => 'Prontuário excluído com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir prontuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medical records by patient
     */
    public function byPatient(string $patientId): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($patientId);

            $records = MedicalRecord::with(['user', 'appointment'])
                ->where('patient_id', $patientId)
                ->orderBy('data_consulta', 'desc')
                ->orderBy('horario_consulta', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => $patient,
                    'records' => $records
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar prontuários do paciente: ' . $e->getMessage()
            ], 500);
        }
    }
}
