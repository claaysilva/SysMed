<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        \App\Models\User::updateOrCreate([
            'email' => 'admin@sysmed.com'
        ], [
            'name' => 'Admin',
            'password' => bcrypt('senha123'),
            'role' => 'admin'
        ]);

        \App\Models\User::updateOrCreate([
            'email' => 'medico@sysmed.com'
        ], [
            'name' => 'Medico Exemplo',
            'password' => bcrypt('senha123'),
            'role' => 'medico'
        ]);

        \App\Models\Patient::updateOrCreate([
            'cpf' => '12345678901'
        ], [
            'nome_completo' => 'Paciente Exemplo',
            'data_nascimento' => '1990-01-01',
            'cpf' => '12345678901',
            'telefone' => '(11) 91234-5678',
            'endereco' => 'Rua Exemplo, 123',
        ]);
    }
}
