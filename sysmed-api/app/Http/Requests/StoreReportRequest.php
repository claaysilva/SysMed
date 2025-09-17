<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // TODO: Implementar autorização adequada
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:medical,financial,statistical,custom',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'format' => 'required|string|in:pdf,excel,csv,html',
            'template_id' => 'nullable|exists:report_templates,id',
            'filters' => 'nullable|array',
            'filters.date_from' => 'nullable|date',
            'filters.date_to' => 'nullable|date|after_or_equal:filters.date_from',
            'filters.doctor_id' => 'nullable|exists:users,id',
            'filters.patient_id' => 'nullable|exists:patients,id',
            'filters.consultation_type' => 'nullable|string|in:consulta,retorno,urgencia',
            'filters.status' => 'nullable|string',
            'filters.age_min' => 'nullable|integer|min:0|max:150',
            'filters.age_max' => 'nullable|integer|min:0|max:150|gte:filters.age_min',
            'filters.gender' => 'nullable|string|in:masculino,feminino,outro',
            'expires_at' => 'nullable|date|after:now',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'O título é obrigatório.',
            'title.max' => 'O título não pode ter mais que 255 caracteres.',
            'type.required' => 'O tipo de relatório é obrigatório.',
            'type.in' => 'Tipo de relatório inválido.',
            'category.required' => 'A categoria é obrigatória.',
            'format.required' => 'O formato de exportação é obrigatório.',
            'format.in' => 'Formato de exportação inválido.',
            'template_id.exists' => 'Template selecionado não existe.',
            'filters.date_from.date' => 'Data de início deve ser uma data válida.',
            'filters.date_to.date' => 'Data de fim deve ser uma data válida.',
            'filters.date_to.after_or_equal' => 'Data de fim deve ser igual ou posterior à data de início.',
            'filters.doctor_id.exists' => 'Médico selecionado não existe.',
            'filters.patient_id.exists' => 'Paciente selecionado não existe.',
            'filters.consultation_type.in' => 'Tipo de consulta inválido.',
            'filters.age_min.min' => 'Idade mínima deve ser maior que 0.',
            'filters.age_min.max' => 'Idade mínima deve ser menor que 150.',
            'filters.age_max.min' => 'Idade máxima deve ser maior que 0.',
            'filters.age_max.max' => 'Idade máxima deve ser menor que 150.',
            'filters.age_max.gte' => 'Idade máxima deve ser maior ou igual à idade mínima.',
            'filters.gender.in' => 'Gênero inválido.',
            'expires_at.after' => 'Data de expiração deve ser futura.',
        ];
    }

    protected function prepareForValidation()
    {
        // Limpar filtros vazios
        if ($this->has('filters')) {
            $filters = array_filter($this->filters, function ($value) {
                return $value !== null && $value !== '';
            });
            $this->merge(['filters' => $filters]);
        }
    }
}
