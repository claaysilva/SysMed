<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Appointment extends Model
{
  use HasFactory;

  protected $fillable = [
    'patient_id',
    'user_id',
    'data_hora_inicio',
    'data_hora_fim',
    'status',
    'observacoes',
    'tipo_consulta',
    'valor',
  ];

  protected $casts = [
    'data_hora_inicio' => 'datetime',
    'data_hora_fim' => 'datetime',
    'valor' => 'decimal:2',
  ];

  // Status possíveis
  const STATUS_AGENDADO = 'agendado';
  const STATUS_CONFIRMADO = 'confirmado';
  const STATUS_REALIZADO = 'realizado';
  const STATUS_CANCELADO = 'cancelado';
  const STATUS_FALTOU = 'faltou';

  // Tipos de consulta
  const TIPO_CONSULTA = 'consulta';
  const TIPO_RETORNO = 'retorno';
  const TIPO_EMERGENCIA = 'emergencia';
  const TIPO_EXAME = 'exame';

  public function patient(): BelongsTo
  {
    return $this->belongsTo(Patient::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  // Scopes
  public function scopeByStatus($query, $status)
  {
    return $query->where('status', $status);
  }

  public function scopeByDoctor($query, $doctorId)
  {
    return $query->where('user_id', $doctorId);
  }

  public function scopeByDate($query, $date)
  {
    return $query->whereDate('data_hora_inicio', $date);
  }

  public function scopeToday($query)
  {
    return $query->whereDate('data_hora_inicio', today());
  }

  public function scopeUpcoming($query)
  {
    return $query->where('data_hora_inicio', '>=', now());
  }

  public function scopeNotCancelled($query)
  {
    return $query->whereNotIn('status', [self::STATUS_CANCELADO]);
  }

  // Accessors
  public function getStatusLabelAttribute()
  {
    $labels = [
      self::STATUS_AGENDADO => 'Agendado',
      self::STATUS_CONFIRMADO => 'Confirmado',
      self::STATUS_REALIZADO => 'Realizado',
      self::STATUS_CANCELADO => 'Cancelado',
      self::STATUS_FALTOU => 'Paciente Faltou',
    ];

    return $labels[$this->status] ?? 'Desconhecido';
  }

  public function getStatusColorAttribute()
  {
    $colors = [
      self::STATUS_AGENDADO => '#f59e0b',
      self::STATUS_CONFIRMADO => '#3b82f6',
      self::STATUS_REALIZADO => '#10b981',
      self::STATUS_CANCELADO => '#ef4444',
      self::STATUS_FALTOU => '#6b7280',
    ];

    return $colors[$this->status] ?? '#6b7280';
  }

  public function getDurationInMinutesAttribute()
  {
    return $this->data_hora_inicio->diffInMinutes($this->data_hora_fim);
  }

  public function getCanBeCancelledAttribute()
  {
    return !in_array($this->status, [self::STATUS_REALIZADO, self::STATUS_CANCELADO]);
  }

  public function getCanBeConfirmedAttribute()
  {
    return $this->status === self::STATUS_AGENDADO;
  }

  public function getIsUpcomingAttribute()
  {
    return $this->data_hora_inicio->isFuture();
  }

  public function getIsTodayAttribute()
  {
    return $this->data_hora_inicio->isToday();
  }

  // Methods
  public function markAsConfirmed()
  {
    $this->update(['status' => self::STATUS_CONFIRMADO]);
  }

  public function markAsCompleted()
  {
    $this->update(['status' => self::STATUS_REALIZADO]);
  }

  public function markAsCancelled()
  {
    if ($this->can_be_cancelled) {
      $this->update(['status' => self::STATUS_CANCELADO]);
    }
  }

  public function markAsNoShow()
  {
    $this->update(['status' => self::STATUS_FALTOU]);
  }
}
