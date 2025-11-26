<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
  protected $model = Patient::class;

  public function definition(): array
  {
    return [
      'nome_completo' => $this->faker->name(),
      'data_nascimento' => $this->faker->date('Y-m-d', '-18 years'),
      'cpf' => $this->faker->unique()->numerify('###########'),
      'telefone' => $this->faker->phoneNumber(),
      'endereco' => $this->faker->address(),
      'email' => $this->faker->unique()->safeEmail(),
      'status' => 'ativo',
    ];
  }
}
