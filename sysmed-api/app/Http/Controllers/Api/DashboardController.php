<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
  /**
   * Retorna estatísticas gerais para o dashboard
   */
  public function statistics(Request $request)
  {
    try {
      Log::info('Dashboard statistics called', ['user' => optional($request->user())->id]);
      $today = Carbon::today();
      $thisMonth = Carbon::now()->startOfMonth();
      $thisWeek = Carbon::now()->startOfWeek();

      // Estatísticas básicas
      $totalPatients = Patient::count();
      Log::info('Dashboard stats step', ['step' => 'patients_count', 'totalPatients' => $totalPatients]);
      $newPatientsThisMonth = Patient::where('created_at', '>=', $thisMonth)->count();
      $newPatientsThisWeek = Patient::where('created_at', '>=', $thisWeek)->count();
      Log::info('Dashboard stats step', ['step' => 'new_patients', 'month' => $newPatientsThisMonth, 'week' => $newPatientsThisWeek]);

      // Estatísticas de consultas
      $appointmentsToday = Appointment::whereDate('data_hora_inicio', $today)->count();
      $appointmentsThisWeek = Appointment::whereBetween('data_hora_inicio', [
        $thisWeek,
        Carbon::now()->endOfWeek()
      ])->count();
      $appointmentsThisMonth = Appointment::whereBetween('data_hora_inicio', [
        $thisMonth,
        Carbon::now()->endOfMonth()
      ])->count();
      Log::info('Dashboard stats step', ['step' => 'appointments_counts', 'today' => $appointmentsToday, 'week' => $appointmentsThisWeek, 'month' => $appointmentsThisMonth]);

      // Consultas por status
      $appointmentsByStatus = [
        'agendado' => Appointment::where('status', 'agendado')->count(),
        'confirmado' => Appointment::where('status', 'confirmado')->count(),
        'realizado' => Appointment::where('status', 'realizado')->count(),
        'cancelado' => Appointment::where('status', 'cancelado')->count(),
      ];
      Log::info('Dashboard stats step', ['step' => 'appointments_by_status', 'data' => $appointmentsByStatus]);

      // Próximas consultas simplificadas
      $upcomingAppointments = Appointment::with(['patient', 'user'])
        ->whereBetween('data_hora_inicio', [
          $today,
          Carbon::today()->addDays(7)
        ])
        ->orderBy('data_hora_inicio')
        ->limit(5)
        ->get()
        ->map(function ($appointment) {
          return [
            'id' => $appointment->id,
            'data_consulta' => Carbon::parse($appointment->data_hora_inicio)->format('Y-m-d'),
            'horario' => Carbon::parse($appointment->data_hora_inicio)->format('H:i'),
            'patient' => [
              'nome_completo' => $appointment->patient->nome_completo ?? 'N/A'
            ],
            'user' => [
              'name' => $appointment->user->name ?? 'N/A'
            ]
          ];
        });
      Log::info('Dashboard stats step', ['step' => 'upcoming_loaded', 'count' => $upcomingAppointments->count()]);

      $payload = [
        'success' => true,
        'data' => [
          'overview' => [
            'totalPatients' => $totalPatients,
            'appointmentsToday' => $appointmentsToday,
            'appointmentsThisWeek' => $appointmentsThisWeek,
            'appointmentsThisMonth' => $appointmentsThisMonth,
            'totalMedicalRecords' => MedicalRecord::count(),
            'pendingMedicalRecords' => MedicalRecord::where('status', 'draft')->count(),
            'totalReports' => Report::count(),
          ],
          'growth' => [
            'newPatientsThisMonth' => $newPatientsThisMonth,
            'newPatientsThisWeek' => $newPatientsThisWeek,
            'medicalRecordsThisMonth' => MedicalRecord::where('created_at', '>=', $thisMonth)->count(),
            'reportsThisMonth' => Report::where('created_at', '>=', $thisMonth)->count(),
          ],
          'appointments' => [
            'byStatus' => $appointmentsByStatus,
            'upcoming' => $upcomingAppointments,
          ],
          // Relatórios recentes (sem relação patient, pois não existe no modelo)
          'recentReports' => Report::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($report) {
              return [
                'id' => $report->id,
                // alinhar com interface do frontend (usa 'titulo')
                'titulo' => $report->title,
                'created_at' => $report->created_at,
                // manter compatibilidade: frontend esperava patient.nome_completo, mas não há relação
                // enviamos null para evitar quebra caso seja usado futuramente
                'patient' => null,
              ];
            }),
          'monthlyActivity' => [], // Simplificado por ora
        ]
      ];
      Log::info('Dashboard statistics success', $payload);

      return response()->json($payload)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    } catch (\Exception $e) {
      Log::error('Dashboard error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

      return response()->json([
        'success' => false,
        'message' => 'Erro ao obter estatísticas: ' . $e->getMessage()
      ], 500)->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
  }

  /**
   * Retorna atividades recentes do sistema
   */
  public function recentActivity(Request $request)
  {
    try {
      Log::info('Recent activity called');

      // Retornar dados simples por enquanto
      $activities = [
        [
          'type' => 'test',
          'title' => 'Sistema funcionando',
          'description' => 'Teste de atividade recente',
          'created_at' => now(),
          'user' => 'Sistema',
          'icon' => '✅',
          'color' => '#4caf50'
        ]
      ];

      Log::info('Recent activity success', $activities);

      return response()->json([
        'success' => true,
        'data' => $activities
      ])->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    } catch (\Exception $e) {
      Log::error('Recent activity error: ' . $e->getMessage());

      return response()->json([
        'success' => false,
        'message' => 'Erro ao obter atividades recentes: ' . $e->getMessage()
      ], 500)->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
  }
}
