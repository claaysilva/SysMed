<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Database\QueryException;

class PatientController extends Controller
{
    /**
     * Listar todos os pacientes com paginação e filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Patient::query();

            // Filtro por nome
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('nome_completo', 'like', '%' . $search . '%')
                    ->orWhere('cpf', 'like', '%' . $search . '%')
                    ->orWhere('telefone', 'like', '%' . $search . '%');
            }

            // Filtro por data de cadastro
            if ($request->has('created_from')) {
                $query->where('created_at', '>=', $request->created_from);
            }

            if ($request->has('created_to')) {
                $query->where('created_at', '<=', $request->created_to . ' 23:59:59');
            }

            // Filtro por status (ativo/inativo)
            if ($request->filled('status')) {
                $status = $request->get('status');
                $query->where('status', $status);
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginação
            $perPage = min($request->get('per_page', 15), 100); // Máximo 100 por página
            $patients = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $patients,
                'message' => 'Pacientes listados com sucesso.'
            ]);
        } catch (Exception $e) {
            Log::error('Erro ao listar pacientes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ], 500);
        }
    }

    /**
     * Criar um novo paciente
     */
    public function store(StorePatientRequest $request)
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validated();

            // Remover formatação do CPF para salvar apenas números
            if (isset($validatedData['cpf'])) {
                $validatedData['cpf'] = preg_replace('/[^0-9]/', '', $validatedData['cpf']);

                // Verificação explícita para CPF duplicado (evita erro genérico 500 do banco)
                $cpfApenasDigitos = $validatedData['cpf'];
                if (Patient::where('cpf', $cpfApenasDigitos)->exists()) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'cpf' => ['Este CPF já está cadastrado no sistema.']
                        ],
                        'message' => 'CPF duplicado.'
                    ], 422);
                }
            }

            // Remover formatação do telefone
            if (isset($validatedData['telefone'])) {
                $validatedData['telefone'] = preg_replace('/[^0-9]/', '', $validatedData['telefone']);
            }

            $patient = Patient::create($validatedData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $patient,
                'message' => 'Paciente cadastrado com sucesso.'
            ], 201);
        } catch (QueryException $e) {
            DB::rollBack();
            // Tratamento específico para violação de chave única (duplicidade)
            // MySQL/MariaDB: errorInfo[1] == 1062
            if (isset($e->errorInfo[1]) && (int)$e->errorInfo[1] === 1062) {
                Log::warning('CPF duplicado ao cadastrar paciente: ' . ($e->getMessage() ?? ''));
                return response()->json([
                    'success' => false,
                    'errors' => [
                        'cpf' => ['Este CPF já está cadastrado no sistema.']
                    ],
                    'message' => 'CPF duplicado.'
                ], 422);
            }

            Log::error('Erro de banco ao cadastrar paciente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cadastrar paciente. Tente novamente.'
            ], 500);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Erro ao cadastrar paciente: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro ao cadastrar paciente. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Mostrar um paciente específico
     */
    public function show($id)
    {
        try {
            $patient = Patient::with(['appointments' => function ($query) {
                $query->orderBy('data_hora_inicio', 'desc')->take(10);
            }])->find($id);

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente não encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $patient,
                'message' => 'Paciente encontrado com sucesso.'
            ]);
        } catch (Exception $e) {
            Log::error('Erro ao buscar paciente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ], 500);
        }
    }

    /**
     * Atualizar um paciente
     */
    public function update(UpdatePatientRequest $request, $id)
    {
        try {
            $patient = Patient::find($id);

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente não encontrado.'
                ], 404);
            }

            DB::beginTransaction();

            $validatedData = $request->validated();

            // Remover formatação do CPF para salvar apenas números
            if (isset($validatedData['cpf'])) {
                $validatedData['cpf'] = preg_replace('/[^0-9]/', '', $validatedData['cpf']);

                // Verificação explícita para CPF duplicado em atualização (exceto o próprio paciente)
                $cpfApenasDigitos = $validatedData['cpf'];
                $jaExisteOutro = Patient::where('cpf', $cpfApenasDigitos)
                    ->where('id', '<>', $patient->id)
                    ->exists();
                if ($jaExisteOutro) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'cpf' => ['Este CPF já está cadastrado no sistema.']
                        ],
                        'message' => 'CPF duplicado.'
                    ], 422);
                }
            }

            // Remover formatação do telefone
            if (isset($validatedData['telefone'])) {
                $validatedData['telefone'] = preg_replace('/[^0-9]/', '', $validatedData['telefone']);
            }

            $patient->update($validatedData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $patient,
                'message' => 'Paciente atualizado com sucesso.'
            ]);
        } catch (QueryException $e) {
            DB::rollBack();
            if (isset($e->errorInfo[1]) && (int)$e->errorInfo[1] === 1062) {
                Log::warning('CPF duplicado ao atualizar paciente: ' . ($e->getMessage() ?? ''));
                return response()->json([
                    'success' => false,
                    'errors' => [
                        'cpf' => ['Este CPF já está cadastrado no sistema.']
                    ],
                    'message' => 'CPF duplicado.'
                ], 422);
            }

            Log::error('Erro de banco ao atualizar paciente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar paciente. Tente novamente.'
            ], 500);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar paciente: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar paciente. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Deletar um paciente
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Apenas administradores podem excluir pacientes.'
                ], 403);
            }

            $patient = Patient::find($id);

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente não encontrado.'
                ], 404);
            }

            // Verificar se o paciente tem consultas agendadas
            $upcomingAppointments = $patient->appointments()
                ->where('data_hora_inicio', '>', now())
                ->where('status', '!=', 'cancelada')
                ->count();

            if ($upcomingAppointments > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível excluir paciente com consultas agendadas.'
                ], 422);
            }

            DB::beginTransaction();

            $patient->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paciente excluído com sucesso.'
            ], 204);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Erro ao excluir paciente: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir paciente. Tente novamente.'
            ], 500);
        }
    }
}
