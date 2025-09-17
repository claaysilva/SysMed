<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autorização será feita via middleware ou policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Dados básicos (todos opcionais em updates parciais)
            'patient_id' => ['sometimes', 'integer', 'exists:patients,id'],
            'doctor_id' => ['sometimes', 'integer', 'exists:users,id'],
            'consultation_date' => ['sometimes', 'date'],
            'consultation_time' => ['sometimes', 'date_format:H:i'],
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'consultation_type' => ['sometimes', 'string', 'in:consulta,retorno,urgencia'],

            // Dados clínicos
            'chief_complaint' => ['nullable', 'string', 'max:2000'],
            'history_present_illness' => ['nullable', 'string', 'max:5000'],
            'past_medical_history' => ['nullable', 'string', 'max:5000'],
            'medications' => ['nullable', 'string', 'max:2000'],
            'allergies' => ['nullable', 'string', 'max:1000'],

            // Exame físico
            'physical_examination' => ['nullable', 'string', 'max:5000'],
            'vital_signs' => ['nullable', 'array'],
            'vital_signs.systolic_bp' => ['nullable', 'integer', 'min:50', 'max:300'],
            'vital_signs.diastolic_bp' => ['nullable', 'integer', 'min:30', 'max:200'],
            'vital_signs.heart_rate' => ['nullable', 'integer', 'min:30', 'max:250'],
            'vital_signs.temperature' => ['nullable', 'numeric', 'min:30', 'max:45'],
            'vital_signs.respiratory_rate' => ['nullable', 'integer', 'min:5', 'max:60'],
            'vital_signs.oxygen_saturation' => ['nullable', 'integer', 'min:50', 'max:100'],
            'vital_signs.weight' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'vital_signs.height' => ['nullable', 'numeric', 'min:0', 'max:250'],

            // Avaliação e plano
            'assessment' => ['nullable', 'string', 'max:5000'],
            'plan' => ['nullable', 'string', 'max:5000'],
            'observations' => ['nullable', 'string', 'max:2000'],

            // Status e metadados
            'status' => ['sometimes', 'string', 'in:draft,completed,signed'],
            'is_private' => ['sometimes', 'boolean'],
            'metadata' => ['nullable', 'array'],

            // Assinatura digital (apenas para mudança de status)
            'digital_signature' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'patient_id.exists' => 'Paciente não encontrado.',
            'doctor_id.exists' => 'Médico não encontrado.',
            'consultation_date.date' => 'Data da consulta inválida.',
            'consultation_time.date_format' => 'Formato de horário inválido. Use HH:MM.',
            'vital_signs.systolic_bp.min' => 'Pressão sistólica deve ser pelo menos :min mmHg.',
            'vital_signs.systolic_bp.max' => 'Pressão sistólica não pode exceder :max mmHg.',
            'vital_signs.diastolic_bp.min' => 'Pressão diastólica deve ser pelo menos :min mmHg.',
            'vital_signs.diastolic_bp.max' => 'Pressão diastólica não pode exceder :max mmHg.',
            'vital_signs.heart_rate.min' => 'Frequência cardíaca deve ser pelo menos :min bpm.',
            'vital_signs.heart_rate.max' => 'Frequência cardíaca não pode exceder :max bpm.',
            'vital_signs.temperature.min' => 'Temperatura deve ser pelo menos :min°C.',
            'vital_signs.temperature.max' => 'Temperatura não pode exceder :max°C.',
            'status.in' => 'Status inválido. Use: draft, completed ou signed.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'patient_id' => 'paciente',
            'doctor_id' => 'médico',
            'consultation_date' => 'data da consulta',
            'consultation_time' => 'horário da consulta',
            'consultation_type' => 'tipo de consulta',
            'chief_complaint' => 'queixa principal',
            'history_present_illness' => 'história da doença atual',
            'past_medical_history' => 'história médica pregressa',
            'medications' => 'medicações',
            'allergies' => 'alergias',
            'physical_examination' => 'exame físico',
            'assessment' => 'avaliação',
            'plan' => 'plano de tratamento',
            'observations' => 'observações',
            'status' => 'status',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validação personalizada: não permitir edição de prontuários assinados
            if ($this->route('medical_record')) {
                $medicalRecord = $this->route('medical_record');

                if ($medicalRecord->status === 'signed' && $this->has('status') && $this->status !== 'signed') {
                    $validator->errors()->add('status', 'Não é possível alterar o status de um prontuário já assinado.');
                }

                // Só permite assinar se estiver completed
                if ($this->has('status') && $this->status === 'signed') {
                    if ($medicalRecord->status !== 'completed') {
                        $validator->errors()->add('status', 'Só é possível assinar prontuários que estejam completos.');
                    }
                }
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Limpar e formatar dados se necessário
        if ($this->has('vital_signs')) {
            $vitalSigns = $this->vital_signs;

            // Converter strings vazias para null
            foreach ($vitalSigns as $key => $value) {
                if ($value === '' || $value === null) {
                    $vitalSigns[$key] = null;
                }
            }

            $this->merge(['vital_signs' => $vitalSigns]);
        }
    }
}
