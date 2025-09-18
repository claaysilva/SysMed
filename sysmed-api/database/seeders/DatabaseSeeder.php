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

        // Criar usuários
        $admin = \App\Models\User::updateOrCreate([
            'email' => 'admin@sysmed.com'
        ], [
            'name' => 'Admin Sistema',
            'password' => bcrypt('senha123'),
            'role' => 'admin'
        ]);

        $medico1 = \App\Models\User::updateOrCreate([
            'email' => 'medico@sysmed.com'
        ], [
            'name' => 'Dr. João Silva',
            'password' => bcrypt('senha123'),
            'role' => 'medico'
        ]);

        $medico2 = \App\Models\User::updateOrCreate([
            'email' => 'medico2@sysmed.com'
        ], [
            'name' => 'Dra. Maria Santos',
            'password' => bcrypt('senha123'),
            'role' => 'medico'
        ]);

        // Criar pacientes
        $paciente1 = \App\Models\Patient::updateOrCreate([
            'cpf' => '12345678901'
        ], [
            'nome_completo' => 'Ana Clara Silva',
            'data_nascimento' => '1990-01-01',
            'cpf' => '12345678901',
            'telefone' => '(11) 91234-5678',
            'endereco' => 'Rua das Flores, 123',
        ]);

        $paciente2 = \App\Models\Patient::updateOrCreate([
            'cpf' => '98765432109'
        ], [
            'nome_completo' => 'Pedro Santos',
            'data_nascimento' => '1985-05-15',
            'cpf' => '98765432109',
            'telefone' => '(11) 98765-4321',
            'endereco' => 'Av. Principal, 456',
        ]);

        $paciente3 = \App\Models\Patient::updateOrCreate([
            'cpf' => '11122233344'
        ], [
            'nome_completo' => 'Maria Oliveira',
            'data_nascimento' => '1992-12-10',
            'cpf' => '11122233344',
            'telefone' => '(11) 95555-1234',
            'endereco' => 'Rua Central, 789',
        ]);

        // Criar consultas
        \App\Models\Appointment::updateOrCreate([
            'patient_id' => $paciente1->id,
            'user_id' => $medico1->id,
            'data_hora_inicio' => now()->format('Y-m-d') . ' 09:00:00'
        ], [
            'data_hora_fim' => now()->format('Y-m-d') . ' 09:30:00',
            'status' => 'agendado',
            'observacoes' => 'Paciente em acompanhamento regular'
        ]);

        \App\Models\Appointment::updateOrCreate([
            'patient_id' => $paciente2->id,
            'user_id' => $medico2->id,
            'data_hora_inicio' => now()->format('Y-m-d') . ' 14:30:00'
        ], [
            'data_hora_fim' => now()->format('Y-m-d') . ' 15:00:00',
            'status' => 'confirmado',
            'observacoes' => 'Paciente retornando para avaliação'
        ]);

        \App\Models\Appointment::updateOrCreate([
            'patient_id' => $paciente3->id,
            'user_id' => $medico1->id,
            'data_hora_inicio' => now()->addDay()->format('Y-m-d') . ' 10:00:00'
        ], [
            'data_hora_fim' => now()->addDay()->format('Y-m-d') . ' 10:30:00',
            'status' => 'agendado',
            'observacoes' => 'Paciente novo no sistema'
        ]);

        // Criar prontuários médicos
        \App\Models\MedicalRecord::updateOrCreate([
            'patient_id' => $paciente1->id,
            'user_id' => $medico1->id,
            'data_consulta' => now()->format('Y-m-d'),
        ], [
            'horario_consulta' => '09:00:00',
            'tipo_consulta' => 'consulta',
            'queixa_principal' => 'Dores de cabeça eventuais',
            'exame_fisico_geral' => 'PA: 120x80, FC: 72bpm, Normal',
            'hipotese_diagnostica' => 'Cefaleia tensional',
            'conduta' => 'Orientações gerais e acompanhamento',
            'status' => 'finalizado'
        ]);

        \App\Models\MedicalRecord::updateOrCreate([
            'patient_id' => $paciente2->id,
            'user_id' => $medico2->id,
            'data_consulta' => now()->format('Y-m-d'),
        ], [
            'horario_consulta' => '14:30:00',
            'tipo_consulta' => 'retorno',
            'queixa_principal' => 'Acompanhamento hipertensão',
            'exame_fisico_geral' => 'PA: 140x90, FC: 85bpm',
            'hipotese_diagnostica' => 'Hipertensão arterial',
            'conduta' => 'Ajuste medicamentoso',
            'status' => 'finalizado'
        ]);

        // Executar seeder de templates de relatórios
        $this->call([
            \Database\Seeders\ReportTemplateSeeder::class,
        ]);
    }
}
