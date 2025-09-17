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
        'appointment_id',
        'doctor_id',
        'consultation_date',
        'consultation_time',
        'consultation_type',
        'chief_complaint',
        'history_present_illness',
        'past_medical_history',
        'medications',
        'allergies',
        'physical_examination',
        'vital_signs',
        'assessment',
        'plan',
        'observations',
        'status',
        'signed_at',
        'digital_signature',
        'is_private',
        'metadata'
    ];

    protected $casts = [
        'consultation_date' => 'date',
        'consultation_time' => 'datetime:H:i',
        'vital_signs' => 'array',
        'metadata' => 'array',
        'signed_at' => 'datetime',
        'is_private' => 'boolean'
    ];

    protected $appends = [
        'consultation_datetime',
        'status_label',
        'consultation_type_label'
    ];

    // Relacionamentos
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MedicalAttachment::class);
    }

    // Accessors
    protected function consultationDatetime(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->consultation_date && $this->consultation_time
                ? Carbon::parse($this->consultation_date->format('Y-m-d') . ' ' . $this->consultation_time)
                : null
        );
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->status) {
                'draft' => 'Rascunho',
                'completed' => 'Concluído',
                'signed' => 'Assinado',
                default => 'Desconhecido'
            }
        );
    }

    protected function consultationTypeLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->consultation_type) {
                'consulta' => 'Consulta',
                'retorno' => 'Retorno',
                'urgencia' => 'Urgência',
                default => 'Outro'
            }
        );
    }

    // Scopes
    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('consultation_date', [$startDate, $endDate]);
    }

    public function scopeSigned($query)
    {
        return $query->where('status', 'signed');
    }

    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    // Métodos auxiliares
    public function isSigned(): bool
    {
        return $this->status === 'signed';
    }

    public function canBeEdited(): bool
    {
        return $this->status === 'draft';
    }

    public function sign(string $signature = null): bool
    {
        $this->update([
            'status' => 'signed',
            'signed_at' => now(),
            'digital_signature' => $signature ?? hash('sha256', $this->id . now()->timestamp)
        ]);

        return true;
    }

    public function getVitalSign(string $key)
    {
        return $this->vital_signs[$key] ?? null;
    }

    public function setVitalSign(string $key, $value): void
    {
        $vitalSigns = $this->vital_signs ?? [];
        $vitalSigns[$key] = $value;
        $this->vital_signs = $vitalSigns;
    }
}
