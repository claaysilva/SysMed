<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
  /**
   * Lista consultas com filtros avançados
   */
  public function index(Request $request)
  {
    try {
      $query = Appointment::with(['patient', 'user']);

      // Filtro por médico
      if ($request->has('doctor_id')) {
        $query->where('user_id', $request->doctor_id);
      }

      // Filtro por data
      if ($request->has('date')) {
        $query->whereDate('data_hora_inicio', $request->date);
      }

      // Filtro por período
      if ($request->has('start_date') && $request->has('end_date')) {
        $query->whereBetween('data_hora_inicio', [
          Carbon::parse($request->start_date)->startOfDay(),
          Carbon::parse($request->end_date)->endOfDay()
        ]);
      }

      // Filtro por status
      if ($request->has('status')) {
        $query->where('status', $request->status);
      }

      // Filtro por paciente
      if ($request->has('patient_id')) {
        $query->where('patient_id', $request->patient_id);
      }

      // Busca por nome do paciente
      if ($request->has('search')) {
        $search = $request->search;
        $query->whereHas('patient', function ($q) use ($search) {
          $q->where('nome_completo', 'like', "%{$search}%")
            ->orWhere('cpf', 'like', "%{$search}%");
        });
      }

      // Ordenação
      $sortBy = $request->get('sort_by', 'data_hora_inicio');
      $sortOrder = $request->get('sort_order', 'asc');
      $query->orderBy($sortBy, $sortOrder);

      // Paginação
      $perPage = $request->get('per_page', 15);
      $appointments = $query->paginate($perPage);

      return response()->json([
        'success' => true,
        'data' => $appointments->items(),
        'pagination' => [
          'current_page' => $appointments->currentPage(),
          'last_page' => $appointments->lastPage(),
          'per_page' => $appointments->perPage(),
          'total' => $appointments->total(),
        ]
      ]);
    } catch (\Exception $e) {
      Log::error('Erro ao listar consultas: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro ao carregar consultas'
      ], 500);
    }
  }

  /**
   * Exibe uma consulta específica
   */
  public function show($id)
  {
    try {
      $appointment = Appointment::with(['patient', 'user'])->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => $appointment
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Consulta não encontrada'
      ], 404);
    }
  }

  /**
   * Cria nova consulta com validações de conflito
   */
  public function store(StoreAppointmentRequest $request)
  {
    try {
      $validatedData = $request->validated();

      // Verificar conflitos de horário para o médico
      $conflicts = $this->checkTimeConflicts(
        $validatedData['user_id'],
        $validatedData['data_hora_inicio'],
        $validatedData['data_hora_fim']
      );

      if ($conflicts->count() > 0) {
        return response()->json([
          'success' => false,
          'message' => 'Conflito de horário detectado',
          'conflicts' => $conflicts
        ], 422);
      }

      // Verificar se é horário de funcionamento
      if (!$this->isValidWorkingHours($validatedData['data_hora_inicio'], $validatedData['data_hora_fim'])) {
        return response()->json([
          'success' => false,
          'message' => 'Horário fora do funcionamento da clínica'
        ], 422);
      }

      $validatedData['status'] = 'agendado';
      $appointment = Appointment::create($validatedData);
      $appointment->load(['patient', 'user']);

      return response()->json([
        'success' => true,
        'message' => 'Consulta agendada com sucesso',
        'data' => $appointment
      ], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Dados inválidos',
        'errors' => $e->errors()
      ], 422);
    } catch (\Exception $e) {
      Log::error('Erro ao criar consulta: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro interno do servidor'
      ], 500);
    }
  }

  /**
   * Atualiza uma consulta
   */
  public function update(UpdateAppointmentRequest $request, $id)
  {
    try {
      $appointment = Appointment::findOrFail($id);

      $validatedData = $request->validated();

      // Se alterando horário, verificar conflitos
      if (isset($validatedData['data_hora_inicio']) || isset($validatedData['data_hora_fim'])) {
        $startTime = $validatedData['data_hora_inicio'] ?? $appointment->data_hora_inicio;
        $endTime = $validatedData['data_hora_fim'] ?? $appointment->data_hora_fim;
        $doctorId = $validatedData['user_id'] ?? $appointment->user_id;

        $conflicts = $this->checkTimeConflicts($doctorId, $startTime, $endTime, $id);

        if ($conflicts->count() > 0) {
          return response()->json([
            'success' => false,
            'message' => 'Conflito de horário detectado',
            'conflicts' => $conflicts
          ], 422);
        }
      }

      $appointment->update($validatedData);
      $appointment->load(['patient', 'user']);

      return response()->json([
        'success' => true,
        'message' => 'Consulta atualizada com sucesso',
        'data' => $appointment
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Dados inválidos',
        'errors' => $e->errors()
      ], 422);
    } catch (\Exception $e) {
      Log::error('Erro ao atualizar consulta: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro interno do servidor'
      ], 500);
    }
  }

  /**
   * Remove uma consulta
   */
  public function destroy($id)
  {
    try {
      $appointment = Appointment::findOrFail($id);

      // Verificar se pode ser cancelada
      if (in_array($appointment->status, ['realizado', 'cancelado'])) {
        return response()->json([
          'success' => false,
          'message' => 'Esta consulta não pode ser cancelada'
        ], 422);
      }

      $appointment->update(['status' => 'cancelado']);

      return response()->json([
        'success' => true,
        'message' => 'Consulta cancelada com sucesso'
      ]);
    } catch (\Exception $e) {
      Log::error('Erro ao cancelar consulta: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro interno do servidor'
      ], 500);
    }
  }

  /**
   * Retorna horários disponíveis para um médico em uma data
   */
  public function availableSlots(Request $request)
  {
    try {
      $request->validate([
        'doctor_id' => 'required|exists:users,id',
        'date' => 'required|date|after_or_equal:today'
      ]);

      $doctorId = $request->doctor_id;
      $date = Carbon::parse($request->date);

      // Horários padrão de funcionamento (pode vir de configuração)
      $workingHours = [
        'start' => '08:00',
        'end' => '18:00',
        'lunch_start' => '12:00',
        'lunch_end' => '13:00',
        'slot_duration' => 30 // minutos
      ];

      $slots = $this->generateTimeSlots($date, $workingHours);
      $busySlots = $this->getBusySlots($doctorId, $date);

      $availableSlots = array_filter($slots, function ($slot) use ($busySlots) {
        return !in_array($slot, $busySlots);
      });

      return response()->json([
        'success' => true,
        'data' => array_values($availableSlots)
      ]);
    } catch (\Exception $e) {
      Log::error('Erro ao buscar horários disponíveis: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro ao carregar horários disponíveis'
      ], 500);
    }
  }

  /**
   * Agenda do médico - visualização em formato calendário
   */
  public function doctorSchedule(Request $request, $doctorId)
  {
    try {
      $startDate = Carbon::parse($request->get('start_date', now()->startOfWeek()));
      $endDate = Carbon::parse($request->get('end_date', now()->endOfWeek()));

      $appointments = Appointment::with(['patient'])
        ->where('user_id', $doctorId)
        ->whereBetween('data_hora_inicio', [$startDate, $endDate])
        ->whereNotIn('status', ['cancelado'])
        ->orderBy('data_hora_inicio')
        ->get()
        ->map(function ($appointment) {
          return [
            'id' => $appointment->id,
            'title' => $appointment->patient->nome_completo,
            'start' => $appointment->data_hora_inicio,
            'end' => $appointment->data_hora_fim,
            'status' => $appointment->status,
            'tipo_consulta' => $appointment->tipo_consulta,
            'patient' => [
              'id' => $appointment->patient->id,
              'nome_completo' => $appointment->patient->nome_completo,
              'telefone' => $appointment->patient->telefone
            ]
          ];
        });

      return response()->json([
        'success' => true,
        'data' => $appointments
      ]);
    } catch (\Exception $e) {
      Log::error('Erro ao carregar agenda do médico: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro ao carregar agenda'
      ], 500);
    }
  }

  /**
   * Atualiza status de uma consulta
   */
  public function updateStatus(Request $request, $id)
  {
    try {
      $appointment = Appointment::findOrFail($id);

      $request->validate([
        'status' => ['required', Rule::in(['agendado', 'confirmado', 'realizado', 'cancelado', 'faltou'])]
      ]);

      $appointment->update(['status' => $request->status]);

      return response()->json([
        'success' => true,
        'message' => 'Status atualizado com sucesso',
        'data' => $appointment
      ]);
    } catch (\Exception $e) {
      Log::error('Erro ao atualizar status: ' . $e->getMessage());
      return response()->json([
        'success' => false,
        'message' => 'Erro ao atualizar status'
      ], 500);
    }
  }

  /**
   * Verifica conflitos de horário
   */
  private function checkTimeConflicts($doctorId, $startTime, $endTime, $excludeId = null)
  {
    $query = Appointment::where('user_id', $doctorId)
      ->whereNotIn('status', ['cancelado'])
      ->where(function ($q) use ($startTime, $endTime) {
        $q->whereBetween('data_hora_inicio', [$startTime, $endTime])
          ->orWhereBetween('data_hora_fim', [$startTime, $endTime])
          ->orWhere(function ($subQ) use ($startTime, $endTime) {
            $subQ->where('data_hora_inicio', '<=', $startTime)
              ->where('data_hora_fim', '>=', $endTime);
          });
      });

    if ($excludeId) {
      $query->where('id', '!=', $excludeId);
    }

    return $query->with(['patient'])->get();
  }

  /**
   * Verifica se está dentro do horário de funcionamento
   */
  private function isValidWorkingHours($startTime, $endTime)
  {
    $start = Carbon::parse($startTime);
    $end = Carbon::parse($endTime);

    // Verificar se é dia útil (pode ser configurável)
    if ($start->isWeekend()) {
      return false;
    }

    // Verificar horário (8h às 18h, pode ser configurável)
    $workStart = $start->copy()->setTime(8, 0);
    $workEnd = $start->copy()->setTime(18, 0);

    return $start->gte($workStart) && $end->lte($workEnd);
  }

  /**
   * Gera slots de tempo disponíveis
   */
  private function generateTimeSlots($date, $workingHours)
  {
    $slots = [];
    $start = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['start']);
    $end = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['end']);
    $lunchStart = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['lunch_start']);
    $lunchEnd = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['lunch_end']);

    while ($start->lt($end)) {
      // Pular horário de almoço
      if ($start->gte($lunchStart) && $start->lt($lunchEnd)) {
        $start = $lunchEnd->copy();
        continue;
      }

      $slots[] = $start->format('H:i');
      $start->addMinutes($workingHours['slot_duration']);
    }

    return $slots;
  }

  /**
   * Obtém slots ocupados
   */
  private function getBusySlots($doctorId, $date)
  {
    $appointments = Appointment::where('user_id', $doctorId)
      ->whereDate('data_hora_inicio', $date)
      ->whereNotIn('status', ['cancelado'])
      ->get();

    $busySlots = [];
    foreach ($appointments as $appointment) {
      $start = Carbon::parse($appointment->data_hora_inicio);
      $end = Carbon::parse($appointment->data_hora_fim);

      while ($start->lt($end)) {
        $busySlots[] = $start->format('H:i');
        $start->addMinutes(30);
      }
    }

    return $busySlots;
  }
}
