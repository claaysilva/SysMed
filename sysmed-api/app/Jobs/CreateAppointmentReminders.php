<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Appointment;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CreateAppointmentReminders implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Iniciando criação de lembretes de consulta...');

        $notificationService = app(NotificationService::class);

        // Buscar consultas para os próximos 7 dias que ainda não têm lembretes
        $appointments = Appointment::with(['patient', 'user'])
            ->whereBetween('data_hora_inicio', [
                Carbon::now(),
                Carbon::now()->addDays(7)
            ])
            ->whereIn('status', ['agendado', 'confirmado'])
            ->whereDoesntHave('notifications', function ($query) {
                $query->where('template', 'appointment_reminder');
            })
            ->get();

        $created = 0;

        foreach ($appointments as $appointment) {
            try {
                // Criar lembrete 24 horas antes
                $reminder = $notificationService->createAppointmentReminder($appointment, '24 horas');

                if ($reminder) {
                    $created++;
                    Log::info("Lembrete criado para consulta {$appointment->id}");
                }

                // Para consultas importantes, criar lembrete adicional 2 horas antes
                if ($appointment->tipo_consulta === 'cirurgia' || $appointment->tipo_consulta === 'emergencia') {
                    $reminderUrgent = $notificationService->createAppointmentReminder($appointment, '2 horas');
                    if ($reminderUrgent) {
                        $created++;
                        Log::info("Lembrete urgente criado para consulta {$appointment->id}");
                    }
                }
            } catch (\Exception $e) {
                Log::error("Erro ao criar lembrete para consulta {$appointment->id}: " . $e->getMessage());
            }
        }

        Log::info("Criação de lembretes concluída. Total criados: {$created}");
    }
}
