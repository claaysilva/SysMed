<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'medication_name',
        'generic_name',
        'dosage',
        'form',
        'frequency',
        'quantity',
        'administration_route',
        'instructions',
        'start_date',
        'end_date',
        'duration_days',
        'status',
        'is_controlled',
        'generic_allowed',
        'contraindications',
        'side_effects',
        'observations'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_controlled' => 'boolean',
        'generic_allowed' => 'boolean'
    ];

    protected $appends = [
        'status_label',
        'administration_route_label',
        'is_active',
        'days_remaining',
        'completion_percentage'
    ];

    // Relacionamentos
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    // Accessors
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->status) {
                'active' => 'Ativo',
                'completed' => 'Concluído',
                'suspended' => 'Suspenso',
                'cancelled' => 'Cancelado',
                default => 'Desconhecido'
            }
        );
    }

    protected function administrationRouteLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->administration_route) {
                'oral' => 'Via Oral',
                'intravenosa' => 'Intravenosa',
                'intramuscular' => 'Intramuscular',
                'subcutanea' => 'Subcutânea',
                'topica' => 'Tópica',
                'ocular' => 'Ocular',
                'nasal' => 'Nasal',
                'auricular' => 'Auricular',
                'retal' => 'Retal',
                'vaginal' => 'Vaginal',
                default => 'Outra'
            }
        );
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->status === 'active' &&
                (!$this->end_date || $this->end_date->isFuture())
        );
    }

    protected function daysRemaining(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->end_date && $this->status === 'active'
                ? max(0, now()->diffInDays($this->end_date, false))
                : null
        );
    }

    protected function completionPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->start_date || !$this->end_date || $this->status !== 'active') {
                    return null;
                }

                $totalDays = $this->start_date->diffInDays($this->end_date);
                $elapsedDays = $this->start_date->diffInDays(now());

                if ($totalDays <= 0) return 100;

                return min(100, max(0, round(($elapsedDays / $totalDays) * 100)));
            }
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeControlled($query)
    {
        return $query->where('is_controlled', true);
    }

    public function scopeByMedication($query, $medication)
    {
        return $query->where('medication_name', 'like', "%{$medication}%")
            ->orWhere('generic_name', 'like', "%{$medication}%");
    }

    public function scopeByRoute($query, $route)
    {
        return $query->where('administration_route', $route);
    }

    public function scopeExpiring($query, $days = 7)
    {
        return $query->where('status', 'active')
            ->where('end_date', '<=', now()->addDays($days))
            ->where('end_date', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'active')
            ->where('end_date', '<', now());
    }

    // Métodos auxiliares
    public function complete(): bool
    {
        return $this->update([
            'status' => 'completed',
            'end_date' => $this->end_date ?? now()
        ]);
    }

    public function suspend(): bool
    {
        return $this->update(['status' => 'suspended']);
    }

    public function cancel(): bool
    {
        return $this->update(['status' => 'cancelled']);
    }

    public function resume(): bool
    {
        return $this->update(['status' => 'active']);
    }

    public function isExpired(): bool
    {
        return $this->end_date && $this->end_date->isPast() && $this->status === 'active';
    }

    public function isExpiring(int $days = 7): bool
    {
        return $this->end_date &&
            $this->end_date->isBetween(now(), now()->addDays($days)) &&
            $this->status === 'active';
    }

    public function getRemainingDuration(): ?string
    {
        if (!$this->end_date || $this->status !== 'active') {
            return null;
        }

        $diff = now()->diff($this->end_date);

        if ($diff->days > 0) {
            return $diff->days . ' dia(s)';
        } elseif ($diff->h > 0) {
            return $diff->h . ' hora(s)';
        } else {
            return 'Menos de 1 hora';
        }
    }
}
