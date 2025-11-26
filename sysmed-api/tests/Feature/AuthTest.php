<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
  use RefreshDatabase;

  /** @test */
  public function user_can_login_with_valid_credentials()
  {
    $password = 'secret123';

    $user = User::factory()->create([
      'password' => bcrypt($password),
    ]);

    $response = $this->postJson('/api/login', [
      'email' => $user->email,
      'password' => $password,
    ]);

    $response
      ->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          'user' => [
            'id',
            'name',
            'email',
          ],
          'token',
        ],
      ]);
  }

  /** @test */
  public function user_cannot_login_with_invalid_credentials()
  {
    $user = User::factory()->create([
      'password' => bcrypt('correct-password'),
    ]);

    $response = $this->postJson('/api/login', [
      'email' => $user->email,
      'password' => 'wrong-password',
    ]);

    $response
      ->assertStatus(401)
      ->assertJson([
        'success' => false,
      ]);
  }
}
