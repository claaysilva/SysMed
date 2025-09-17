<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Diagnosis extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'code_icd10',
        'description',
        'details',
        'type',
        'status',
        'diagnosed_at',
        'resolved_at',
        'severity',
        'prognosis'
    ];

    protected $casts = [
        'diagnosed_at' => 'date',
        'resolved_at' => 'date'
    ];

    protected $appends = [
        'type_label',
        'status_label',
        'severity_label',
        'is_active',
        'duration_days'
    ];

    // Relacionamentos
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    // Accessors
    protected function typeLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->type) {
                'primary' => 'Principal',
                'secondary' => 'Secundário',
                'differential' => 'Diferencial',
                default => 'Outro'
            }
        );
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->status) {
                'active' => 'Ativo',
                'resolved' => 'Resolvido',
                'chronic' => 'Crônico',
                'suspected' => 'Suspeito',
                default => 'Desconhecido'
            }
        );
    }

    protected function severityLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->severity) {
                'mild' => 'Leve',
                'moderate' => 'Moderado',
                'severe' => 'Grave',
                default => 'Não especificado'
            }
        );
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn() => in_array($this->status, ['active', 'chronic', 'suspected'])
        );
    }

    protected function durationDays(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->diagnosed_at && $this->resolved_at
                ? $this->diagnosed_at->diffInDays($this->resolved_at)
                : ($this->diagnosed_at ? $this->diagnosed_at->diffInDays(now()) : null)
        );
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'chronic', 'suspected']);
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByIcd10($query, $code)
    {
        return $query->where('code_icd10', 'like', "%{$code}%");
    }

    public function scopePrimary($query)
    {
        return $query->where('type', 'primary');
    }

    // Métodos auxiliares
    public function resolve(): bool
    {
        return $this->update([
            'status' => 'resolved',
            'resolved_at' => now()
        ]);
    }

    public function markAsChronic(): bool
    {
        return $this->update([
            'status' => 'chronic',
            'resolved_at' => null
        ]);
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isChronic(): bool
    {
        return $this->status === 'chronic';
    }

    public function isPrimary(): bool
    {
        return $this->type === 'primary';
    }
}
