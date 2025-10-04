<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
  /**
   * Estatísticas gerais do dashboard
   */
  public function dashboardStats(Request $request)
  {
    try {
      $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
      $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

      // Converter para Carbon se necessário
      if (is_string($startDate)) {
        $startDate = Carbon::parse($startDate);
      }
      if (is_string($endDate)) {
        $endDate = Carbon::parse($endDate);
      }

      $stats = [
        'overview' => [
          'totalPatients' => Patient::count(),
          'newPatientsThisMonth' => Patient::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count(),
          'totalAppointments' => Appointment::count(),
          'appointmentsToday' => Appointment::whereDate('data_hora_inicio', Carbon::today())->count(),
          'appointmentsThisWeek' => Appointment::whereBetween('data_hora_inicio', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
          ])->count(),
          'appointmentsThisMonth' => Appointment::whereMonth('data_hora_inicio', Carbon::now()->month)
            ->whereYear('data_hora_inicio', Carbon::now()->year)
            ->count(),
          'totalMedicalRecords' => MedicalRecord::count(),
          'recordsThisMonth' => MedicalRecord::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count(),
        ],

        'appointments' => [
          'byStatus' => Appointment::select('status', DB::raw('count(*) as total'))
            ->whereBetween('data_hora_inicio', [$startDate, $endDate])
            ->groupBy('status')
            ->get(),
          'byType' => Appointment::select('tipo_consulta', DB::raw('count(*) as total'))
            ->whereBetween('data_hora_inicio', [$startDate, $endDate])
            ->whereNotNull('tipo_consulta')
            ->groupBy('tipo_consulta')
            ->get(),
          'byDoctor' => Appointment::select('users.name as doctor_name', DB::raw('count(appointments.id) as total'))
            ->join('users', 'appointments.user_id', '=', 'users.id')
            ->whereBetween('data_hora_inicio', [$startDate, $endDate])
            ->groupBy('users.id', 'users.name')
            ->get(),
        ],

        'revenue' => [
          'totalThisMonth' => Appointment::whereMonth('data_hora_inicio', Carbon::now()->month)
            ->whereYear('data_hora_inicio', Carbon::now()->year)
            ->whereNotNull('valor')
            ->sum('valor'),
          'averagePerAppointment' => Appointment::whereNotNull('valor')
            ->whereBetween('data_hora_inicio', [$startDate, $endDate])
            ->avg('valor'),
          'byMonth' => Appointment::select(
            DB::raw('YEAR(data_hora_inicio) as year'),
            DB::raw('MONTH(data_hora_inicio) as month'),
            DB::raw('COUNT(*) as appointments'),
            DB::raw('SUM(COALESCE(valor, 0)) as revenue')
          )
            ->whereYear('data_hora_inicio', Carbon::now()->year)
            ->groupBy(DB::raw('YEAR(data_hora_inicio)'), DB::raw('MONTH(data_hora_inicio)'))
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get(),
        ],

        'performance' => [
          'attendanceRate' => $this->getAttendanceRate($startDate, $endDate),
          'avgConsultationTime' => $this->getAverageConsultationTime($startDate, $endDate),
          'patientSatisfaction' => 4.2, // Placeholder - implementar sistema de avaliação
          'doctorProductivity' => $this->getDoctorProductivity($startDate, $endDate),
        ]
      ];

      return response()->json([
        'success' => true,
        'data' => $stats,
        'period' => [
          'start' => $startDate->format('Y-m-d'),
          'end' => $endDate->format('Y-m-d')
        ]
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Erro ao gerar estatísticas: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Relatório de consultas
   */
  public function appointmentsReport(Request $request)
  {
    try {
      $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
      $endDate = $request->get('end_date', Carbon::now()->endOfMonth());
      $doctorId = $request->get('doctor_id');
      $status = $request->get('status');
      $type = $request->get('type');

      $query = Appointment::with(['patient', 'user'])
        ->whereBetween('data_hora_inicio', [$startDate, $endDate]);

      if ($doctorId) {
        $query->where('user_id', $doctorId);
      }

      if ($status) {
        $query->where('status', $status);
      }

      if ($type) {
        $query->where('tipo_consulta', $type);
      }

      $appointments = $query->orderBy('data_hora_inicio', 'desc')->get();

      $summary = [
        'total' => $appointments->count(),
        'byStatus' => $appointments->groupBy('status')->map->count(),
        'byType' => $appointments->groupBy('tipo_consulta')->map->count(),
        'totalRevenue' => $appointments->sum('valor'),
        'averageValue' => $appointments->where('valor', '>', 0)->avg('valor'),
      ];

      return response()->json([
        'success' => true,
        'data' => [
          'appointments' => $appointments,
          'summary' => $summary,
          'period' => [
            'start' => $startDate,
            'end' => $endDate
          ]
        ]
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Erro ao gerar relatório de consultas: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Relatório financeiro
   */
  public function financialReport(Request $request)
  {
    try {
      $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
      $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

      $revenue = Appointment::select(
        DB::raw('DATE(data_hora_inicio) as date'),
        DB::raw('COUNT(*) as appointments'),
        DB::raw('SUM(COALESCE(valor, 0)) as total_revenue'),
        DB::raw('AVG(COALESCE(valor, 0)) as avg_revenue')
      )
        ->whereBetween('data_hora_inicio', [$startDate, $endDate])
        ->whereNotNull('valor')
        ->where('valor', '>', 0)
        ->groupBy(DB::raw('DATE(data_hora_inicio)'))
        ->orderBy('date', 'desc')
        ->get();

      $summary = [
        'totalRevenue' => $revenue->sum('total_revenue'),
        'totalAppointments' => $revenue->sum('appointments'),
        'averagePerDay' => $revenue->avg('total_revenue'),
        'averagePerAppointment' => $revenue->avg('avg_revenue'),
        'bestDay' => $revenue->sortByDesc('total_revenue')->first(),
        'revenueByDoctor' => $this->getRevenueByDoctor($startDate, $endDate),
        'revenueByType' => $this->getRevenueByType($startDate, $endDate),
      ];

      return response()->json([
        'success' => true,
        'data' => [
          'dailyRevenue' => $revenue,
          'summary' => $summary,
          'period' => [
            'start' => $startDate,
            'end' => $endDate
          ]
        ]
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Erro ao gerar relatório financeiro: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Relatório de pacientes
   */
  public function patientsReport(Request $request)
  {
    try {
      $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
      $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

      $patients = Patient::with(['appointments' => function ($query) use ($startDate, $endDate) {
        $query->whereBetween('data_hora_inicio', [$startDate, $endDate]);
      }])->get();

      $newPatients = Patient::whereBetween('created_at', [$startDate, $endDate])->get();

      $summary = [
        'totalPatients' => $patients->count(),
        'newPatients' => $newPatients->count(),
        'activePatients' => $patients->filter(function ($patient) {
          return $patient->appointments->count() > 0;
        })->count(),
        'averageAge' => $this->getAveragePatientAge(),
        'genderDistribution' => $this->getGenderDistribution(),
        'appointmentFrequency' => $patients->map(function ($patient) {
          return [
            'patient' => $patient->nome_completo,
            'appointments' => $patient->appointments->count()
          ];
        })->sortByDesc('appointments')->take(10),
      ];

      return response()->json([
        'success' => true,
        'data' => [
          'patients' => $newPatients,
          'summary' => $summary,
          'period' => [
            'start' => $startDate,
            'end' => $endDate
          ]
        ]
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Erro ao gerar relatório de pacientes: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Métodos auxiliares
   */
  private function getAttendanceRate($startDate, $endDate)
  {
    $totalAppointments = Appointment::whereBetween('data_hora_inicio', [$startDate, $endDate])->count();
    $completedAppointments = Appointment::whereBetween('data_hora_inicio', [$startDate, $endDate])
      ->where('status', 'realizado')->count();

    return $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 2) : 0;
  }

  private function getAverageConsultationTime($startDate, $endDate)
  {
    // Placeholder - calcular com base na diferença entre data_hora_inicio e data_hora_fim
    return 30; // minutos
  }

  private function getDoctorProductivity($startDate, $endDate)
  {
    return User::select('users.name', DB::raw('COUNT(appointments.id) as appointments'))
      ->leftJoin('appointments', 'users.id', '=', 'appointments.user_id')
      ->whereBetween('appointments.data_hora_inicio', [$startDate, $endDate])
      ->groupBy('users.id', 'users.name')
      ->orderByDesc('appointments')
      ->get();
  }

  private function getRevenueByDoctor($startDate, $endDate)
  {
    return User::select('users.name', DB::raw('SUM(COALESCE(appointments.valor, 0)) as revenue'))
      ->leftJoin('appointments', 'users.id', '=', 'appointments.user_id')
      ->whereBetween('appointments.data_hora_inicio', [$startDate, $endDate])
      ->whereNotNull('appointments.valor')
      ->groupBy('users.id', 'users.name')
      ->orderByDesc('revenue')
      ->get();
  }

  private function getRevenueByType($startDate, $endDate)
  {
    return Appointment::select('tipo_consulta', DB::raw('SUM(COALESCE(valor, 0)) as revenue'))
      ->whereBetween('data_hora_inicio', [$startDate, $endDate])
      ->whereNotNull('valor')
      ->whereNotNull('tipo_consulta')
      ->groupBy('tipo_consulta')
      ->orderByDesc('revenue')
      ->get();
  }

  private function getAveragePatientAge()
  {
    $patients = Patient::whereNotNull('data_nascimento')->get();
    $totalAge = $patients->sum(function ($patient) {
      return Carbon::parse($patient->data_nascimento)->age;
    });

    return $patients->count() > 0 ? round($totalAge / $patients->count(), 1) : 0;
  }

  private function getGenderDistribution()
  {
    // Placeholder - assumindo que temos campo sexo
    return [
      'masculino' => 45,
      'feminino' => 55
    ];
  }
}