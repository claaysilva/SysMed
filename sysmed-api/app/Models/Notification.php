<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'user_id',
        'patient_id',
        'recipient_email',
        'recipient_phone',
        'appointment_id',
        'medical_record_id',
        'status',
        'scheduled_for',
        'sent_at',
        'failure_reason',
        'retry_count',
        'max_retries',
        'template',
        'priority',
        'read'
    ];

    protected $casts = [
        'data' => 'array',
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'read' => 'boolean'
    ];

    // Constantes para tipos
    const TYPE_EMAIL = 'email';
    const TYPE_SMS = 'sms';
    const TYPE_PUSH = 'push';
    const TYPE_WHATSAPP = 'whatsapp';

    // Constantes para status
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

    // Constantes para prioridade
    const PRIORITY_LOW = 'low';
    const PRIORITY_NORMAL = 'normal';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    /**
     * Relacionamentos
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeScheduled($query)
    {
        return $query->where('scheduled_for', '<=', Carbon::now())
            ->where('status', self::STATUS_PENDING);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Métodos de ação
     */
    public function markAsSent()
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => Carbon::now(),
        ]);
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'failure_reason' => $reason,
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    public function markAsRead()
    {
        $this->update(['read' => true]);
    }

    public function cancel()
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    public function canRetry()
    {
        return $this->status === self::STATUS_FAILED &&
            $this->retry_count < $this->max_retries;
    }

    public function isScheduled()
    {
        return $this->scheduled_for && $this->scheduled_for->isFuture();
    }

    public function isReadyToSend()
    {
        return $this->status === self::STATUS_PENDING &&
            (!$this->scheduled_for || $this->scheduled_for->isPast());
    }

    /**
     * Accessors
     */
    public function getIsOverdueAttribute()
    {
        return $this->scheduled_for &&
            $this->scheduled_for->isPast() &&
            $this->status === self::STATUS_PENDING;
    }

    public function getFormattedTypeAttribute()
    {
        return match ($this->type) {
            self::TYPE_EMAIL => 'E-mail',
            self::TYPE_SMS => 'SMS',
            self::TYPE_PUSH => 'Push',
            self::TYPE_WHATSAPP => 'WhatsApp',
            default => 'Desconhecido'
        };
    }

    public function getFormattedStatusAttribute()
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pendente',
            self::STATUS_SENT => 'Enviado',
            self::STATUS_FAILED => 'Falhou',
            self::STATUS_CANCELLED => 'Cancelado',
            default => 'Desconhecido'
        };
    }

    public function getFormattedPriorityAttribute()
    {
        return match ($this->priority) {
            self::PRIORITY_LOW => 'Baixa',
            self::PRIORITY_NORMAL => 'Normal',
            self::PRIORITY_HIGH => 'Alta',
            self::PRIORITY_URGENT => 'Urgente',
            default => 'Normal'
        };
    }
}
