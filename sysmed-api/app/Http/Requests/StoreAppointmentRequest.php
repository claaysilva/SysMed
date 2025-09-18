<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class StoreAppointmentRequest extends FormRequest
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
            'patient_id' => 'required|exists:patients,id',
            'user_id' => 'required|exists:users,id',
            'data_hora_inicio' => [
                'required',
                'date',
                'after:now',
                function ($attribute, $value, $fail) {
                    $date = Carbon::parse($value);

                    // Não permitir agendamento em finais de semana
                    if ($date->isWeekend()) {
                        $fail('Não é possível agendar consultas em finais de semana.');
                    }

                    // Não permitir agendamento muito longe no futuro (6 meses)
                    if ($date->gt(now()->addMonths(6))) {
                        $fail('Não é possível agendar consultas com mais de 6 meses de antecedência.');
                    }
                },
            ],
            'data_hora_fim' => [
                'required',
                'date',
                'after:data_hora_inicio',
                function ($attribute, $value, $fail) {
                    $start = Carbon::parse($this->data_hora_inicio);
                    $end = Carbon::parse($value);

                    // Consulta deve ter pelo menos 15 minutos
                    if ($start->diffInMinutes($end) < 15) {
                        $fail('A consulta deve ter pelo menos 15 minutos de duração.');
                    }

                    // Consulta não pode ter mais de 4 horas
                    if ($start->diffInHours($end) > 4) {
                        $fail('A consulta não pode ter mais de 4 horas de duração.');
                    }
                },
            ],
            'observacoes' => 'nullable|string|max:1000',
            'tipo_consulta' => 'nullable|string|in:consulta,retorno,emergencia,exame',
            'valor' => 'nullable|numeric|min:0|max:9999.99',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'patient_id.required' => 'O paciente é obrigatório.',
            'patient_id.exists' => 'Paciente não encontrado.',
            'user_id.required' => 'O médico é obrigatório.',
            'user_id.exists' => 'Médico não encontrado.',
            'data_hora_inicio.required' => 'A data e hora de início são obrigatórias.',
            'data_hora_inicio.date' => 'Data e hora de início inválidas.',
            'data_hora_inicio.after' => 'A consulta deve ser agendada para o futuro.',
            'data_hora_fim.required' => 'A data e hora de fim são obrigatórias.',
            'data_hora_fim.date' => 'Data e hora de fim inválidas.',
            'data_hora_fim.after' => 'A hora de fim deve ser posterior à hora de início.',
            'observacoes.max' => 'As observações não podem exceder 1000 caracteres.',
            'tipo_consulta.in' => 'Tipo de consulta inválido.',
            'valor.numeric' => 'O valor deve ser um número.',
            'valor.min' => 'O valor não pode ser negativo.',
            'valor.max' => 'O valor não pode exceder R$ 9.999,99.',
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
        ];
    }
}
