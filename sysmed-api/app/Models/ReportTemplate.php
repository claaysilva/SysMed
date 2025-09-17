<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'category',
        'description',
        'fields',
        'default_filters',
        'query_template',
        'html_template',
        'chart_config',
        'is_active',
        'is_system',
        'created_by',
    ];

    protected $casts = [
        'fields' => 'array',
        'default_filters' => 'array',
        'chart_config' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    // Methods
    public function duplicate(string $newName, ?int $userId = null): self
    {
        $template = $this->replicate();
        $template->name = $newName;
        $template->is_system = false;
        $template->created_by = $userId;
        $template->save();

        return $template;
    }

    public static function getSystemTemplates(): array
    {
        return [
            [
                'name' => 'Relatório de Consultas por Período',
                'type' => 'medical',
                'category' => 'appointments',
                'description' => 'Relatório detalhado de todas as consultas realizadas em um período específico',
                'fields' => [
                    'patient_name',
                    'doctor_name',
                    'consultation_date',
                    'consultation_type',
                    'status',
                    'chief_complaint',
                    'diagnosis_count',
                    'prescription_count'
                ],
                'default_filters' => [
                    'date_from' => null,
                    'date_to' => null,
                    'doctor_id' => null,
                    'consultation_type' => null
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Relatório Financeiro Mensal',
                'type' => 'financial',
                'category' => 'revenue',
                'description' => 'Análise financeira mensal com receitas, despesas e resultados',
                'fields' => [
                    'month',
                    'total_revenue',
                    'total_expenses',
                    'net_profit',
                    'consultations_count',
                    'average_ticket',
                    'payment_methods'
                ],
                'default_filters' => [
                    'month' => null,
                    'year' => null,
                    'include_expenses' => true
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Estatísticas de Diagnósticos',
                'type' => 'statistical',
                'category' => 'diagnoses',
                'description' => 'Análise estatística dos diagnósticos mais frequentes',
                'fields' => [
                    'diagnosis_code',
                    'diagnosis_description',
                    'frequency',
                    'percentage',
                    'age_group',
                    'gender_distribution'
                ],
                'default_filters' => [
                    'date_from' => null,
                    'date_to' => null,
                    'age_min' => null,
                    'age_max' => null,
                    'gender' => null
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Relatório de Pacientes',
                'type' => 'medical',
                'category' => 'patients',
                'description' => 'Lista detalhada de pacientes com histórico de consultas',
                'fields' => [
                    'patient_name',
                    'cpf',
                    'birth_date',
                    'phone',
                    'email',
                    'last_consultation',
                    'total_consultations',
                    'active_prescriptions'
                ],
                'default_filters' => [
                    'active_only' => true,
                    'registration_from' => null,
                    'registration_to' => null
                ],
                'is_system' => true,
                'is_active' => true,
            ]
        ];
    }
}
