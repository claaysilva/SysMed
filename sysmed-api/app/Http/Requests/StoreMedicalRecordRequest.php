<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalRecordRequest extends FormRequest
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
            // Dados obrigatórios
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'doctor_id' => ['required', 'integer', 'exists:users,id'],
            'consultation_date' => ['required', 'date'],
            'consultation_time' => ['required', 'date_format:H:i'],

            // Dados opcionais básicos
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'consultation_type' => ['string', 'in:consulta,retorno,urgencia'],

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
            'status' => ['string', 'in:draft,completed,signed'],
            'is_private' => ['boolean'],
            'metadata' => ['nullable', 'array'],

            // Arrays relacionados
            'diagnoses' => ['nullable', 'array'],
            'diagnoses.*.code_icd10' => ['nullable', 'string', 'max:10'],
            'diagnoses.*.description' => ['required_with:diagnoses.*', 'string', 'max:500'],
            'diagnoses.*.details' => ['nullable', 'string', 'max:1000'],
            'diagnoses.*.type' => ['string', 'in:primary,secondary,differential'],
            'diagnoses.*.status' => ['string', 'in:active,resolved,chronic,suspected'],
            'diagnoses.*.diagnosed_at' => ['required_with:diagnoses.*', 'date'],
            'diagnoses.*.severity' => ['nullable', 'string', 'in:mild,moderate,severe'],

            'prescriptions' => ['nullable', 'array'],
            'prescriptions.*.medication_name' => ['required_with:prescriptions.*', 'string', 'max:255'],
            'prescriptions.*.generic_name' => ['nullable', 'string', 'max:255'],
            'prescriptions.*.dosage' => ['required_with:prescriptions.*', 'string', 'max:100'],
            'prescriptions.*.form' => ['required_with:prescriptions.*', 'string', 'max:50'],
            'prescriptions.*.frequency' => ['required_with:prescriptions.*', 'string', 'max:100'],
            'prescriptions.*.quantity' => ['required_with:prescriptions.*', 'integer', 'min:1'],
            'prescriptions.*.administration_route' => ['string', 'max:50'],
            'prescriptions.*.instructions' => ['nullable', 'string', 'max:1000'],
            'prescriptions.*.start_date' => ['required_with:prescriptions.*', 'date'],
            'prescriptions.*.end_date' => ['nullable', 'date', 'after:prescriptions.*.start_date'],
            'prescriptions.*.duration_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'prescriptions.*.is_controlled' => ['boolean'],
            'prescriptions.*.generic_allowed' => ['boolean'],
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
            'doctor_id.required' => 'O médico é obrigatório.',
            'doctor_id.exists' => 'Médico não encontrado.',
            'consultation_date.required' => 'A data da consulta é obrigatória.',
            'consultation_date.date' => 'Data da consulta inválida.',
            'consultation_time.required' => 'O horário da consulta é obrigatório.',
            'consultation_time.date_format' => 'Formato de horário inválido. Use HH:MM.',
            'vital_signs.systolic_bp.min' => 'Pressão sistólica deve ser pelo menos :min mmHg.',
            'vital_signs.systolic_bp.max' => 'Pressão sistólica não pode exceder :max mmHg.',
            'vital_signs.diastolic_bp.min' => 'Pressão diastólica deve ser pelo menos :min mmHg.',
            'vital_signs.diastolic_bp.max' => 'Pressão diastólica não pode exceder :max mmHg.',
            'vital_signs.heart_rate.min' => 'Frequência cardíaca deve ser pelo menos :min bpm.',
            'vital_signs.heart_rate.max' => 'Frequência cardíaca não pode exceder :max bpm.',
            'vital_signs.temperature.min' => 'Temperatura deve ser pelo menos :min°C.',
            'vital_signs.temperature.max' => 'Temperatura não pode exceder :max°C.',
            'diagnoses.*.description.required_with' => 'Descrição do diagnóstico é obrigatória.',
            'diagnoses.*.diagnosed_at.required_with' => 'Data do diagnóstico é obrigatória.',
            'prescriptions.*.medication_name.required_with' => 'Nome do medicamento é obrigatório.',
            'prescriptions.*.dosage.required_with' => 'Dosagem é obrigatória.',
            'prescriptions.*.frequency.required_with' => 'Frequência é obrigatória.',
            'prescriptions.*.quantity.required_with' => 'Quantidade é obrigatória.',
            'prescriptions.*.start_date.required_with' => 'Data de início é obrigatória.',
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
        ];
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
