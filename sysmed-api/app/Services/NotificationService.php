<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Appointment;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NotificationService
{
  /**
   * Envia notificação
   */
  public function send(array $data)
  {
    $notification = Notification::create([
      'recipient_email' => $data['to'],
      'title' => $data['title'],
      'message' => $data['message'],
      'type' => $data['type'] ?? 'general',
      'template' => $data['template'] ?? null,
      'priority' => $data['priority'] ?? 'normal',
      'status' => 'pending',
      'scheduled_for' => $data['scheduled_at'] ?? now(),
      'data' => $data['data'] ?? [],
      'user_id' => $data['user_id'] ?? null,
      'patient_id' => $data['patient_id'] ?? null,
      'appointment_id' => $data['appointment_id'] ?? null
    ]);

    // Se não for agendada, enviar imediatamente
    if (!isset($data['scheduled_at']) || Carbon::parse($data['scheduled_at'])->isPast()) {
      $this->processNotification($notification);
    }

    return $notification;
  }

  /**
   * Processa notificação
   */
  public function processNotification(Notification $notification)
  {
    try {
      $sent = false;

      switch ($notification->type) {
        case 'email':
          $sent = $this->sendEmail($notification);
          break;
        case 'sms':
          $sent = $this->sendSMS($notification);
          break;
        case 'push':
          $sent = $this->sendPush($notification);
          break;
        case 'whatsapp':
          $sent = $this->sendWhatsApp($notification);
          break;
        default:
          $sent = $this->sendEmail($notification); // default para email
          break;
      }

      $notification->update([
        'status' => $sent ? 'sent' : 'failed',
        'sent_at' => $sent ? now() : null,
        'retry_count' => $notification->retry_count + 1
      ]);

      return $sent;
    } catch (\Exception $e) {
      Log::error("Erro ao processar notificação {$notification->id}: " . $e->getMessage());

      $notification->update([
        'status' => 'failed',
        'failure_reason' => $e->getMessage(),
        'retry_count' => $notification->retry_count + 1
      ]);

      return false;
    }
  }

  /**
   * Processa fila de notificações
   */
  public function processQueue()
  {
    $notifications = Notification::where('status', 'pending')
      ->where('scheduled_for', '<=', now())
      ->orderBy('priority')
      ->orderBy('created_at')
      ->take(100)
      ->get();

    $sent = 0;
    $failed = 0;

    foreach ($notifications as $notification) {
      if ($this->processNotification($notification)) {
        $sent++;
      } else {
        $failed++;
      }
    }

    return [
      'sent' => $sent,
      'failed' => $failed,
      'total' => $notifications->count()
    ];
  }

  /**
   * Criar lembrete de consulta
   */
  public function createAppointmentReminder(Appointment $appointment, $hoursBeforeText = '24 horas')
  {
    $hoursMap = [
      '1 hora' => 1,
      '2 horas' => 2,
      '4 horas' => 4,
      '12 horas' => 12,
      '24 horas' => 24,
      '48 horas' => 48,
      '1 semana' => 168,
    ];

    $hours = $hoursMap[$hoursBeforeText] ?? 24;
    $scheduledFor = $appointment->data_hora_inicio->subHours($hours);

    // Só criar se a data ainda é futura
    if ($scheduledFor->isFuture()) {
      $patient = $appointment->patient;
      $doctor = $appointment->user;

      $notification = Notification::create([
        'recipient_email' => $patient->email,
        'title' => 'Lembrete de Consulta',
        'message' => $this->generateAppointmentReminderMessage($appointment, $hoursBeforeText),
        'type' => 'appointment_reminder',
        'template' => 'appointment_reminder',
        'priority' => $appointment->tipo_consulta === 'cirurgia' ? 'high' : 'normal',
        'status' => 'pending',
        'scheduled_for' => $scheduledFor,
        'data' => [
          'appointment_id' => $appointment->id,
          'timeframe' => $hoursBeforeText,
          'patient_name' => $patient->nome,
          'doctor_name' => $doctor->name,
          'appointment_date' => $appointment->data_hora_inicio->format('d/m/Y H:i'),
          'type' => $appointment->tipo_consulta ?? 'consulta',
          'location' => $appointment->local ?? 'Consultório'
        ],
        'user_id' => $appointment->user_id,
        'patient_id' => $patient->id,
        'appointment_id' => $appointment->id
      ]);

      return $notification;
    }

    return null;
  }

  /**
   * Criar notificação de confirmação de consulta
   */
  public function createAppointmentConfirmation(Appointment $appointment)
  {
    return $this->send([
      'to' => $appointment->patient->email,
      'title' => 'Consulta Confirmada',
      'message' => $this->generateAppointmentConfirmationMessage($appointment),
      'type' => 'appointment_confirmation',
      'template' => 'appointment_confirmation',
      'priority' => 'high',
      'data' => [
        'appointment_id' => $appointment->id,
        'patient_name' => $appointment->patient->nome,
        'doctor_name' => $appointment->user->name,
        'appointment_date' => $appointment->data_hora_inicio->format('d/m/Y H:i')
      ],
      'user_id' => $appointment->user_id,
      'patient_id' => $appointment->patient->id,
      'appointment_id' => $appointment->id
    ]);
  }

  /**
   * Criar notificação de cancelamento de consulta
   */
  public function createAppointmentCancellation(Appointment $appointment, $reason = null)
  {
    return $this->send([
      'to' => $appointment->patient->email,
      'title' => 'Consulta Cancelada',
      'message' => $this->generateAppointmentCancellationMessage($appointment, $reason),
      'type' => 'appointment_cancellation',
      'template' => 'appointment_cancellation',
      'priority' => 'high',
      'data' => [
        'appointment_id' => $appointment->id,
        'patient_name' => $appointment->patient->nome,
        'doctor_name' => $appointment->user->name,
        'appointment_date' => $appointment->data_hora_inicio->format('d/m/Y H:i'),
        'reason' => $reason
      ],
      'user_id' => $appointment->user_id,
      'patient_id' => $appointment->patient->id,
      'appointment_id' => $appointment->id
    ]);
  }

  /**
   * Enviar email
   */
  private function sendEmail(Notification $notification)
  {
    try {
      // Implementar integração com sistema de email
      Log::info("Email enviado para: {$notification->recipient_email}");
      return true;
    } catch (\Exception $e) {
      Log::error("Erro ao enviar email: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Enviar SMS
   */
  private function sendSMS(Notification $notification)
  {
    try {
      // Implementar integração com provedor de SMS
      Log::info("SMS enviado para: {$notification->recipient_phone}");
      return true;
    } catch (\Exception $e) {
      Log::error("Erro ao enviar SMS: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Enviar push notification
   */
  private function sendPush(Notification $notification)
  {
    try {
      // Implementar integração com Firebase ou similar
      Log::info("Push notification enviado para usuário: {$notification->user_id}");
      return true;
    } catch (\Exception $e) {
      Log::error("Erro ao enviar push notification: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Enviar WhatsApp
   */
  private function sendWhatsApp(Notification $notification)
  {
    try {
      // Implementar integração com WhatsApp Business API
      Log::info("WhatsApp enviado para: {$notification->recipient_phone}");
      return true;
    } catch (\Exception $e) {
      Log::error("Erro ao enviar WhatsApp: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Gerar mensagem de lembrete de consulta
   */
  private function generateAppointmentReminderMessage(Appointment $appointment, $timeframe = '24 horas')
  {
    $patient = $appointment->patient;
    $doctor = $appointment->user;
    $dateTime = $appointment->data_hora_inicio;

    return "Olá {$patient->nome}!\n\n" .
      "Este é um lembrete de sua consulta agendada:\n\n" .
      "📅 Data: {$dateTime->format('d/m/Y')}\n" .
      "🕐 Horário: {$dateTime->format('H:i')}\n" .
      "👨‍⚕️ Médico: Dr. {$doctor->name}\n" .
      "📍 Local: " . ($appointment->local ?? 'Consultório') . "\n\n" .
      "Sua consulta está marcada para {$timeframe}.\n\n" .
      "Em caso de necessidade de reagendamento, entre em contato conosco.\n\n" .
      "Atenciosamente,\nEquipe SysMed";
  }

  /**
   * Gerar mensagem de confirmação de consulta
   */
  private function generateAppointmentConfirmationMessage(Appointment $appointment)
  {
    $patient = $appointment->patient;
    $doctor = $appointment->user;
    $dateTime = $appointment->data_hora_inicio;

    return "Olá {$patient->nome}!\n\n" .
      "Sua consulta foi confirmada:\n\n" .
      "📅 Data: {$dateTime->format('d/m/Y')}\n" .
      "🕐 Horário: {$dateTime->format('H:i')}\n" .
      "👨‍⚕️ Médico: Dr. {$doctor->name}\n" .
      "📍 Local: " . ($appointment->local ?? 'Consultório') . "\n\n" .
      "Aguardamos você!\n\n" .
      "Atenciosamente,\nEquipe SysMed";
  }

  /**
   * Gerar mensagem de cancelamento de consulta
   */
  private function generateAppointmentCancellationMessage(Appointment $appointment, $reason = null)
  {
    $patient = $appointment->patient;
    $doctor = $appointment->user;
    $dateTime = $appointment->data_hora_inicio;

    $message = "Olá {$patient->nome}!\n\n" .
      "Infelizmente, sua consulta foi cancelada:\n\n" .
      "📅 Data: {$dateTime->format('d/m/Y')}\n" .
      "🕐 Horário: {$dateTime->format('H:i')}\n" .
      "👨‍⚕️ Médico: Dr. {$doctor->name}\n\n";

    if ($reason) {
      $message .= "Motivo: {$reason}\n\n";
    }

    $message .= "Entre em contato conosco para reagendar.\n\n" .
      "Atenciosamente,\nEquipe SysMed";

    return $message;
  }
}
