<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'user_id',
        'appointment_id',
        'data_consulta',
        'horario_consulta',
        'tipo_consulta',
        'queixa_principal',
        'historia_doenca_atual',
        'historia_patologica_pregressa',
        'historia_familiar',
        'historia_social',
        'medicamentos_uso',
        'alergias',
        'sinais_vitais',
        'exame_fisico_geral',
        'exame_fisico_especifico',
        'hipotese_diagnostica',
        'cid',
        'conduta',
        'prescricao',
        'exames_solicitados',
        'orientacoes',
        'retorno',
        'observacoes',
        'anexos',
        'status'
    ];

    protected $casts = [
        'data_consulta' => 'date',
        'horario_consulta' => 'datetime:H:i',
        'sinais_vitais' => 'array',
        'anexos' => 'array',
        'retorno' => 'date'
    ];

    protected $appends = [
        'status_label',
        'tipo_consulta_label'
    ];

    // Relacionamentos
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    // Accessors
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->status) {
                'rascunho' => 'Rascunho',
                'finalizado' => 'Finalizado',
                'assinado' => 'Assinado',
                default => 'Desconhecido'
            }
        );
    }

    protected function tipoConsultaLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->tipo_consulta) {
                'consulta' => 'Consulta',
                'retorno' => 'Retorno',
                'emergencia' => 'Emergência',
                'exame' => 'Exame',
                'cirurgia' => 'Cirurgia',
                default => 'Outro'
            }
        );
    }

    // Scopes
    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('data_consulta', [$startDate, $endDate]);
    }

    public function scopeAssinados($query)
    {
        return $query->where('status', 'assinado');
    }

    // Métodos auxiliares
    public function isAssinado(): bool
    {
        return $this->status === 'assinado';
    }

    public function canBeEdited(): bool
    {
        return $this->status === 'rascunho';
    }

    public function getSinalVital(string $key)
    {
        return $this->sinais_vitais[$key] ?? null;
    }

    public function setSinalVital(string $key, $value): void
    {
        $sinaisVitais = $this->sinais_vitais ?? [];
        $sinaisVitais[$key] = $value;
        $this->sinais_vitais = $sinaisVitais;
    }
}
