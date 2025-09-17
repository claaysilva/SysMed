<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        return $user && $user->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome_completo' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[\p{L}\s\-\.\']+$/u' // Apenas letras, espaços, hífens, pontos e apóstrofes
            ],
            'data_nascimento' => [
                'required',
                'date',
                'before:today',
                'after:1900-01-01' // Data mínima razoável
            ],
            'cpf' => [
                'required',
                'string',
                'regex:/^\d{3}\.\d{3}\.\d{3}-\d{2}$/', // Formato XXX.XXX.XXX-XX
                'unique:patients,cpf',
                function ($attribute, $value, $fail) {
                    if (!$this->validarCpf($value)) {
                        $fail('O CPF informado é inválido.');
                    }
                },
            ],
            'telefone' => [
                'nullable',
                'string',
                'regex:/^\(\d{2}\)\s\d{4,5}-\d{4}$/' // Formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
            ],
            'endereco' => [
                'nullable',
                'string',
                'min:5',
                'max:500'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'nome_completo.required' => 'O nome completo é obrigatório.',
            'nome_completo.min' => 'O nome deve ter pelo menos 2 caracteres.',
            'nome_completo.max' => 'O nome não pode ter mais de 255 caracteres.',
            'nome_completo.regex' => 'O nome deve conter apenas letras, espaços, hífens, pontos e apóstrofes.',

            'data_nascimento.required' => 'A data de nascimento é obrigatória.',
            'data_nascimento.date' => 'A data de nascimento deve ser uma data válida.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'data_nascimento.after' => 'A data de nascimento deve ser posterior a 1900.',

            'cpf.required' => 'O CPF é obrigatório.',
            'cpf.regex' => 'O CPF deve estar no formato XXX.XXX.XXX-XX.',
            'cpf.unique' => 'Este CPF já está cadastrado no sistema.',

            'telefone.regex' => 'O telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.',

            'endereco.min' => 'O endereço deve ter pelo menos 5 caracteres.',
            'endereco.max' => 'O endereço não pode ter mais de 500 caracteres.',
        ];
    }

    /**
     * Valida se o CPF é um número válido
     */
    private function validarCpf($cpf): bool
    {
        // Remove formatação
        $cpf = preg_replace('/[^0-9]/', '', $cpf);

        // Verifica se tem 11 dígitos
        if (strlen($cpf) != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        // Calcula os dígitos verificadores
        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }

        return true;
    }
}
