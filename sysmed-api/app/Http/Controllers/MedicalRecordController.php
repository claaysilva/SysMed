<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicalRecordRequest;
use App\Http\Requests\UpdateMedicalRecordRequest;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MedicalRecord::with(['patient', 'doctor', 'diagnoses', 'prescriptions', 'attachments']);

        // Filtro por paciente
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filtro por médico
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por tipo de consulta
        if ($request->has('consultation_type')) {
            $query->where('consultation_type', $request->consultation_type);
        }

        // Filtro por data
        if ($request->has('date_from')) {
            $query->where('consultation_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('consultation_date', '<=', $request->date_to);
        }

        // Busca por texto
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('chief_complaint', 'like', "%{$search}%")
                    ->orWhere('assessment', 'like', "%{$search}%")
                    ->orWhere('plan', 'like', "%{$search}%")
                    ->orWhere('observations', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($pq) use ($search) {
                        $pq->where('nome_completo', 'like', "%{$search}%");
                    })
                    ->orWhereHas('diagnoses', function ($dq) use ($search) {
                        $dq->where('description', 'like', "%{$search}%")
                            ->orWhere('code_icd10', 'like', "%{$search}%");
                    });
            });
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'consultation_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $records = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $records,
            'message' => 'Prontuários listados com sucesso'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicalRecordRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $medicalRecord = MedicalRecord::create($request->validated());

            // Criar diagnósticos se fornecidos
            if ($request->has('diagnoses')) {
                foreach ($request->diagnoses as $diagnosisData) {
                    $medicalRecord->diagnoses()->create($diagnosisData);
                }
            }

            // Criar prescrições se fornecidas
            if ($request->has('prescriptions')) {
                foreach ($request->prescriptions as $prescriptionData) {
                    $medicalRecord->prescriptions()->create($prescriptionData);
                }
            }

            // Carregar relacionamentos
            $medicalRecord->load(['patient', 'doctor', 'diagnoses', 'prescriptions']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $medicalRecord,
                'message' => 'Prontuário criado com sucesso'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar prontuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(MedicalRecord $medicalRecord): JsonResponse
    {
        $medicalRecord->load([
            'patient',
            'doctor',
            'appointment',
            'diagnoses' => function ($query) {
                $query->orderBy('type', 'asc')->orderBy('created_at', 'desc');
            },
            'prescriptions' => function ($query) {
                $query->orderBy('start_date', 'desc');
            },
            'attachments' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => $medicalRecord,
            'message' => 'Prontuário recuperado com sucesso'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicalRecordRequest $request, MedicalRecord $medicalRecord): JsonResponse
    {
        try {
            // Verificar se pode ser editado
            if (!$medicalRecord->canBeEdited() && !$request->has('status')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este prontuário não pode ser editado pois já foi assinado'
                ], 403);
            }

            $data = $request->validated();

            // Se está assinando o prontuário
            if (isset($data['status']) && $data['status'] === 'signed') {
                $data['signed_at'] = now();
                $data['digital_signature'] = $data['digital_signature'] ??
                    hash('sha256', $medicalRecord->id . now()->timestamp . Auth::id());
            }

            $medicalRecord->update($data);

            // Recarregar com relacionamentos
            $medicalRecord->load(['patient', 'doctor', 'diagnoses', 'prescriptions']);

            return response()->json([
                'success' => true,
                'data' => $medicalRecord,
                'message' => 'Prontuário atualizado com sucesso'
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
    public function destroy(MedicalRecord $medicalRecord): JsonResponse
    {
        try {
            // Verificar se pode ser deletado
            if ($medicalRecord->isSigned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível excluir um prontuário assinado'
                ], 403);
            }

            $medicalRecord->delete();

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
     * Assinar digitalmente um prontuário
     */
    public function sign(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $request->validate([
            'signature' => 'nullable|string|max:255'
        ]);

        try {
            if ($medicalRecord->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Só é possível assinar prontuários que estejam completos'
                ], 400);
            }

            if ($medicalRecord->isSigned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este prontuário já foi assinado'
                ], 400);
            }

            $signature = $request->signature ?? hash('sha256', $medicalRecord->id . now()->timestamp . Auth::id());
            $medicalRecord->sign($signature);

            return response()->json([
                'success' => true,
                'data' => $medicalRecord->fresh(),
                'message' => 'Prontuário assinado com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao assinar prontuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas dos prontuários
     */
    public function statistics(Request $request): JsonResponse
    {
        $stats = [
            'total' => MedicalRecord::count(),
            'draft' => MedicalRecord::where('status', 'draft')->count(),
            'completed' => MedicalRecord::where('status', 'completed')->count(),
            'signed' => MedicalRecord::where('status', 'signed')->count(),
            'today' => MedicalRecord::whereDate('consultation_date', today())->count(),
            'this_week' => MedicalRecord::whereBetween('consultation_date', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month' => MedicalRecord::whereMonth('consultation_date', now()->month)
                ->whereYear('consultation_date', now()->year)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estatísticas recuperadas com sucesso'
        ]);
    }

    /**
     * Buscar prontuários por paciente com histórico
     */
    public function byPatient(Patient $patient): JsonResponse
    {
        $records = $patient->medicalRecords()
            ->with(['doctor', 'diagnoses', 'prescriptions'])
            ->orderBy('consultation_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'patient' => $patient,
                'records' => $records
            ],
            'message' => 'Histórico do paciente recuperado com sucesso'
        ]);
    }
}
