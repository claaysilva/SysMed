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

        // Criar admin fixo
        \App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@sysmed.com',
            'role' => 'admin',
            'password' => bcrypt('senha123'),
        ]);

        // Criar 5 médicos fixos
        $medicos = [];
        for ($i = 1; $i <= 5; $i++) {
            $medicos[] = \App\Models\User::create([
                'name' => "Médico $i",
                'email' => "medico$i@sysmed.com",
                'role' => 'medico',
                'password' => bcrypt('senha123'),
            ]);
        }

        // Criar 10 pacientes comuns brasileiros (role 'user') e seus registros na tabela patients
        $faker = \Faker\Factory::create('pt_BR');
        $usuarios = collect();
        $pacientes = collect();
        for ($i = 0; $i < 10; $i++) {
            // Gera nome que não começa com Dr. ou Dra.
            do {
                $nome = $faker->name();
            } while (preg_match('/^Dr\.?\s|^Dra\.?\s/i', $nome));
            $email = $faker->unique()->safeEmail();
            $user = \App\Models\User::create([
                'name' => $nome,
                'email' => $email,
                'role' => 'user',
                'password' => bcrypt('senha123'),
            ]);
            $usuarios->push($user);
            $paciente = \App\Models\Patient::create([
                'nome_completo' => $nome,
                'data_nascimento' => $faker->date('Y-m-d', '-18 years'),
                'cpf' => $faker->unique()->numerify('###########'),
                'telefone' => $faker->phoneNumber(),
                'endereco' => $faker->address(),
                'email' => $email,
                'status' => 'ativo',
            ]);
            $pacientes->push($paciente);
        }

        // Para cada paciente, criar 2 agendamentos e 2 prontuários
        foreach ($pacientes as $i => $paciente) {
            // Seleciona um médico diferente para cada paciente
            $medico = $medicos[$i % count($medicos)];

            // Agendamentos
            $agendamento1 = \App\Models\Appointment::create([
                'patient_id' => $paciente->id,
                'user_id' => $medico->id,
                'data_hora_inicio' => now()->addDays($i)->setTime(9, 0),
                'data_hora_fim' => now()->addDays($i)->setTime(9, 30),
                'status' => 'agendado',
                'observacoes' => 'Primeira consulta do paciente',
            ]);
            $agendamento2 = \App\Models\Appointment::create([
                'patient_id' => $paciente->id,
                'user_id' => $medico->id,
                'data_hora_inicio' => now()->addDays($i + 1)->setTime(14, 0),
                'data_hora_fim' => now()->addDays($i + 1)->setTime(14, 30),
                'status' => 'confirmado',
                'observacoes' => 'Retorno do paciente',
            ]);

            // Prontuário 1
            \App\Models\MedicalRecord::create([
                'patient_id' => $paciente->id,
                'user_id' => $medico->id,
                'appointment_id' => $agendamento1->id,
                'data_consulta' => $agendamento1->data_hora_inicio->format('Y-m-d'),
                'horario_consulta' => $agendamento1->data_hora_inicio->format('H:i:s'),
                'tipo_consulta' => 'consulta',
                'queixa_principal' => 'Dor de cabeça',
                'historia_doenca_atual' => 'Paciente relata dor de cabeça há 3 dias.',
                'historia_patologica_pregressa' => 'Hipertensão controlada.',
                'historia_familiar' => 'Mãe com diabetes.',
                'historia_social' => 'Não fuma, não bebe.',
                'medicamentos_uso' => 'Losartana 50mg/dia.',
                'alergias' => 'Nenhuma conhecida.',
                'sinais_vitais' => json_encode(['PA' => '120x80', 'FC' => '72bpm']),
                'exame_fisico_geral' => 'PA: 120x80, FC: 72bpm',
                'exame_fisico_especifico' => 'Sem alterações neurológicas.',
                'hipotese_diagnostica' => 'Cefaleia tensional',
                'cid' => 'R51',
                'conduta' => 'Repouso, hidratação e analgésico.',
                'prescricao' => 'Dipirona 500mg se dor.',
                'exames_solicitados' => 'Nenhum no momento.',
                'orientacoes' => 'Retornar se piora.',
                'retorno' => now()->addDays(15)->format('Y-m-d'),
                'observacoes' => 'Paciente orientado quanto aos sinais de alarme.',
                'anexos' => json_encode([]),
                'status' => 'finalizado',
            ]);
            // Prontuário 2
            \App\Models\MedicalRecord::create([
                'patient_id' => $paciente->id,
                'user_id' => $medico->id,
                'appointment_id' => $agendamento2->id,
                'data_consulta' => $agendamento2->data_hora_inicio->format('Y-m-d'),
                'horario_consulta' => $agendamento2->data_hora_inicio->format('H:i:s'),
                'tipo_consulta' => 'retorno',
                'queixa_principal' => 'Acompanhamento da cefaleia',
                'historia_doenca_atual' => 'Melhora parcial da dor após uso de analgésico.',
                'historia_patologica_pregressa' => 'Hipertensão controlada.',
                'historia_familiar' => 'Mãe com diabetes.',
                'historia_social' => 'Não fuma, não bebe.',
                'medicamentos_uso' => 'Losartana 50mg/dia, Dipirona se dor.',
                'alergias' => 'Nenhuma conhecida.',
                'sinais_vitais' => json_encode(['PA' => '130x85', 'FC' => '75bpm']),
                'exame_fisico_geral' => 'PA: 130x85, FC: 75bpm',
                'exame_fisico_especifico' => 'Sem alterações neurológicas.',
                'hipotese_diagnostica' => 'Acompanhamento clínico',
                'cid' => 'R51',
                'conduta' => 'Manter acompanhamento e hidratação.',
                'prescricao' => 'Manter Dipirona se dor.',
                'exames_solicitados' => 'Nenhum no momento.',
                'orientacoes' => 'Retornar em caso de piora.',
                'retorno' => now()->addDays(30)->format('Y-m-d'),
                'observacoes' => 'Paciente evoluindo bem.',
                'anexos' => json_encode([]),
                'status' => 'finalizado',
            ]);
        }

        // Executar seeder de templates de relatórios
        $this->call([
            \Database\Seeders\ReportTemplateSeeder::class,
        ]);
    }
}
