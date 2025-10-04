<?php

namespace App\Models;

use App\Traits\OptimizedQueries;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory, OptimizedQueries;

    // Campos que podem ser preenchidos em massa
    protected $fillable = [
        'nome_completo',
        'data_nascimento',
        'cpf',
        'telefone',
        'endereco',
        'email',
        'status',
    ];

    // Campos de busca para otimização
    protected $searchable = [
        'nome_completo',
        'cpf',
        'telefone',
        'email',
    ];

    // Índices disponíveis para otimização
    protected $indexes = [
        'nome_completo',
        'cpf',
        'created_at',
        'status',
    ];

    // Cast automático de tipos
    protected $casts = [
        'data_nascimento' => 'date',
        'status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Atributos adicionais a serem incluídos automaticamente no JSON
    protected $appends = [
        'formatted_cpf',
        'formatted_phone',
        'age',
    ];

    // Relacionamentos otimizados
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecordEntries(): HasMany
    {
        return $this->hasMany(MedicalRecordEntry::class);
    }

    // Scopes específicos do Patient
    public function scopeActive($query)
    {
        return $query->where('status', 'ativo');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inativo');
    }

    public function scopeByAge($query, $minAge = null, $maxAge = null)
    {
        if ($minAge !== null) {
            $query->whereRaw('TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) >= ?', [$minAge]);
        }

        if ($maxAge !== null) {
            $query->whereRaw('TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) <= ?', [$maxAge]);
        }

        return $query;
    }

    public function scopeRecentlyCreated($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getAgeAttribute(): int
    {
        return $this->data_nascimento?->age ?? 0;
    }

    public function getFormattedCpfAttribute(): string
    {
        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $this->cpf);
    }

    public function getFormattedPhoneAttribute(): string
    {
        if (!$this->telefone) return '';

        $clean = preg_replace('/\D/', '', $this->telefone);

        if (strlen($clean) === 11) {
            return preg_replace('/(\d{2})(\d{5})(\d{4})/', '($1) $2-$3', $clean);
        } elseif (strlen($clean) === 10) {
            return preg_replace('/(\d{2})(\d{4})(\d{4})/', '($1) $2-$3', $clean);
        }

        return $this->telefone;
    }

    // Mutators
    public function setCpfAttribute($value): void
    {
        $this->attributes['cpf'] = preg_replace('/\D/', '', $value);
    }

    public function setTelefoneAttribute($value): void
    {
        $this->attributes['telefone'] = $value ? preg_replace('/\D/', '', $value) : null;
    }

    public function setNomeCompletoAttribute($value): void
    {
        $this->attributes['nome_completo'] = ucwords(strtolower(trim($value)));
    }

    // Colunas otimizadas para relacionamentos
    protected function getAppointmentsColumns(): array
    {
        return ['id', 'patient_id', 'user_id', 'data_hora_inicio', 'data_hora_fim', 'status', 'tipo_consulta'];
    }

    protected function getMedicalRecordsColumns(): array
    {
        return ['id', 'patient_id', 'doctor_id', 'consultation_date', 'consultation_type', 'created_at'];
    }
}
