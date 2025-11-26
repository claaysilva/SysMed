<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Listar notificações
     */
    public function index(Request $request)
    {
        try {
            $query = Notification::with(['user', 'patient', 'appointment'])
                ->orderBy('created_at', 'desc');

            // Filtros
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('unread_only') && $request->unread_only) {
                $query->where('read', false);
            }

            // Paginação
            $perPage = $request->get('per_page', 15);
            $notifications = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $notifications,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar notificações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar nova notificação
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => ['required', Rule::in(['email', 'sms', 'push', 'whatsapp'])],
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'user_id' => 'nullable|exists:users,id',
                'patient_id' => 'nullable|exists:patients,id',
                'recipient_email' => 'nullable|email',
                'recipient_phone' => 'nullable|string',
                'appointment_id' => 'nullable|exists:appointments,id',
                'medical_record_id' => 'nullable|exists:medical_records,id',
                'scheduled_for' => 'nullable|date|after:now',
                'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
                'template' => 'nullable|string',
                'data' => 'nullable|array',
                'send_immediately' => 'boolean',
            ]);

            $notification = Notification::create($validated);

            // Enviar imediatamente se solicitado
            if ($request->get('send_immediately', false)) {
                $this->notificationService->send($notification);
            }

            return response()->json([
                'success' => true,
                'data' => $notification->load(['user', 'patient', 'appointment']),
                'message' => 'Notificação criada com sucesso!'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar notificação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir notificação específica
     */
    public function show($id)
    {
        try {
            $notification = Notification::with(['user', 'patient', 'appointment', 'medicalRecord'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $notification
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notificação não encontrada'
            ], 404);
        }
    }

    /**
     * Atualizar notificação
     */
    public function update(Request $request, $id)
    {
        try {
            $notification = Notification::findOrFail($id);

            // Só permite editar se ainda não foi enviada
            if ($notification->status === Notification::STATUS_SENT) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível editar uma notificação já enviada'
                ], 422);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'message' => 'sometimes|string',
                'scheduled_for' => 'nullable|date|after:now',
                'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
                'data' => 'nullable|array',
            ]);

            $notification->update($validated);

            return response()->json([
                'success' => true,
                'data' => $notification->load(['user', 'patient', 'appointment']),
                'message' => 'Notificação atualizada com sucesso!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar notificação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir notificação
     */
    public function destroy($id)
    {
        try {
            $notification = Notification::findOrFail($id);

            // Só permite excluir se ainda não foi enviada
            if ($notification->status === Notification::STATUS_SENT) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível excluir uma notificação já enviada'
                ], 422);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notificação excluída com sucesso!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir notificação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar como lida
     */
    public function markAsRead($id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notificação marcada como lida!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao marcar notificação como lida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar múltiplas como lidas
     */
    public function markMultipleAsRead(Request $request)
    {
        try {
            $validated = $request->validate([
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'exists:notifications,id'
            ]);

            Notification::whereIn('id', $validated['notification_ids'])
                ->update(['read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notificações marcadas como lidas!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao marcar notificações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reenviar notificação falhada
     */
    public function retry($id)
    {
        try {
            $notification = Notification::findOrFail($id);

            if (!$notification->canRetry()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta notificação não pode ser reenviada'
                ], 422);
            }

            // Resetar status para pending
            $notification->update(['status' => Notification::STATUS_PENDING]);

            // Tentar enviar novamente
            $this->notificationService->send($notification);

            return response()->json([
                'success' => true,
                'message' => 'Notificação reenviada!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao reenviar notificação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar notificação agendada
     */
    public function cancel($id)
    {
        try {
            $notification = Notification::findOrFail($id);

            if ($notification->status !== Notification::STATUS_PENDING) {
                return response()->json([
                    'success' => false,
                    'message' => 'Só é possível cancelar notificações pendentes'
                ], 422);
            }

            $notification->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Notificação cancelada com sucesso!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar notificação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estatísticas de notificações
     */
    public function stats()
    {
        try {
            $stats = [
                'total' => Notification::count(),
                'pending' => Notification::where('status', Notification::STATUS_PENDING)->count(),
                'sent' => Notification::where('status', Notification::STATUS_SENT)->count(),
                'failed' => Notification::where('status', Notification::STATUS_FAILED)->count(),
                'cancelled' => Notification::where('status', Notification::STATUS_CANCELLED)->count(),
                'unread' => Notification::where('read', false)->count(),
                'by_type' => Notification::select('type', DB::raw('count(*) as total'))
                    ->groupBy('type')
                    ->get(),
                'by_priority' => Notification::select('priority', DB::raw('count(*) as total'))
                    ->groupBy('priority')
                    ->get(),
                'recent_activity' => Notification::with(['user', 'patient'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}
