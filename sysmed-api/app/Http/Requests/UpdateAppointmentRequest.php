<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class UpdateAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => 'sometimes|exists:patients,id',
            'user_id' => 'sometimes|exists:users,id',
            'data_hora_inicio' => [
                'sometimes',
                'date',
                function ($attribute, $value, $fail) {
                    $date = Carbon::parse($value);

                    // Permitir alteração de consultas passadas apenas para alguns status
                    if ($date->isPast() && !in_array($this->route('appointment')->status, ['agendado', 'confirmado'])) {
                        $fail('Não é possível alterar horário de consultas já realizadas ou canceladas.');
                    }

                    if ($date->isWeekend()) {
                        $fail('Não é possível agendar consultas em finais de semana.');
                    }
                },
            ],
            'data_hora_fim' => [
                'sometimes',
                'date',
                'after:data_hora_inicio',
                function ($attribute, $value, $fail) {
                    $start = Carbon::parse($this->data_hora_inicio ?? $this->route('appointment')->data_hora_inicio);
                    $end = Carbon::parse($value);

                    if ($end->diffInMinutes($start) < 15) {
                        $fail('A consulta deve ter pelo menos 15 minutos de duração.');
                    }

                    if ($end->diffInHours($start) > 4) {
                        $fail('A consulta não pode ter mais de 4 horas de duração.');
                    }
                },
            ],
            'observacoes' => 'nullable|string|max:1000',
            'tipo_consulta' => 'nullable|string|in:consulta,retorno,emergencia,exame',
            'valor' => 'nullable|numeric|min:0|max:9999.99',
            'status' => [
                'sometimes',
                Rule::in(['agendado', 'confirmado', 'realizado', 'cancelado', 'faltou'])
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'patient_id.exists' => 'Paciente não encontrado.',
            'user_id.exists' => 'Médico não encontrado.',
            'data_hora_inicio.date' => 'Data e hora de início inválidas.',
            'data_hora_fim.date' => 'Data e hora de fim inválidas.',
            'data_hora_fim.after' => 'A hora de fim deve ser posterior à hora de início.',
            'observacoes.max' => 'As observações não podem exceder 1000 caracteres.',
            'tipo_consulta.in' => 'Tipo de consulta inválido.',
            'valor.numeric' => 'O valor deve ser um número.',
            'valor.min' => 'O valor não pode ser negativo.',
            'valor.max' => 'O valor não pode exceder R$ 9.999,99.',
            'status.in' => 'Status inválido.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'patient_id' => 'paciente',
            'user_id' => 'médico',
            'data_hora_inicio' => 'data e hora de início',
            'data_hora_fim' => 'data e hora de fim',
            'observacoes' => 'observações',
            'tipo_consulta' => 'tipo de consulta',
            'valor' => 'valor',
            'status' => 'status',
        ];
    }
}
