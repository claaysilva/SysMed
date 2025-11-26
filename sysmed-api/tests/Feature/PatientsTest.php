<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PatientsTest extends TestCase
{
  use RefreshDatabase;

  /** @test */
  public function authenticated_user_can_list_patients()
  {
    $user = User::factory()->create();
    Patient::factory()->count(3)->create();

    Sanctum::actingAs($user, ['*']);

    $response = $this->getJson('/api/patients');

    $response
      ->assertStatus(200)
      ->assertJsonStructure([
        'data',
      ]);
  }

  /** @test */
  public function authenticated_user_can_create_patient()
  {
    $user = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($user, ['*']);

    $payload = [
      'nome_completo' => 'Paciente Teste',
      'email' => 'paciente@example.com',
      'telefone' => '(11) 99999-9999',
      'cpf' => '123.456.789-09',
      'data_nascimento' => '1990-01-01',
      'status' => 'ativo',
    ];

    $response = $this->postJson('/api/patients', $payload);

    $response
      ->assertStatus(201)
      ->assertJsonFragment([
        'nome_completo' => 'Paciente Teste',
      ]);

    $this->assertDatabaseHas('patients', [
      'email' => 'paciente@example.com',
    ]);
  }
}
