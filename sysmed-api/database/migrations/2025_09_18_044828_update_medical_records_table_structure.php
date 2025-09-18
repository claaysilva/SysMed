<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            // Renomear colunas existentes
            $table->renameColumn('doctor_id', 'user_id');
            $table->renameColumn('consultation_date', 'data_consulta');
            $table->renameColumn('consultation_time', 'horario_consulta');
            $table->renameColumn('consultation_type', 'tipo_consulta');
            $table->renameColumn('chief_complaint', 'queixa_principal');
            $table->renameColumn('history_present_illness', 'historia_doenca_atual');
            $table->renameColumn('past_medical_history', 'historia_patologica_pregressa');
            $table->renameColumn('medications', 'medicamentos_uso');
            $table->renameColumn('allergies', 'alergias');
            $table->renameColumn('physical_examination', 'exame_fisico_geral');
            $table->renameColumn('vital_signs', 'sinais_vitais');
            $table->renameColumn('assessment', 'hipotese_diagnostica');
            $table->renameColumn('plan', 'conduta');
            $table->renameColumn('observations', 'observacoes');

            // Adicionar novas colunas
            $table->text('historia_familiar')->nullable()->after('historia_patologica_pregressa');
            $table->text('historia_social')->nullable()->after('historia_familiar');
            $table->text('exame_fisico_especifico')->nullable()->after('exame_fisico_geral');
            $table->text('cid')->nullable()->after('hipotese_diagnostica');
            $table->text('prescricao')->nullable()->after('conduta');
            $table->text('exames_solicitados')->nullable()->after('prescricao');
            $table->text('orientacoes')->nullable()->after('exames_solicitados');
            $table->date('retorno')->nullable()->after('orientacoes');
            $table->json('anexos')->nullable()->after('observacoes');

            // Remover colunas não necessárias
            $table->dropColumn(['signed_at', 'digital_signature', 'is_private', 'metadata']);
        });

        // Atualizar enums em uma migration separada devido às limitações do Laravel
        DB::statement("ALTER TABLE medical_records MODIFY COLUMN status ENUM('rascunho', 'finalizado', 'assinado') DEFAULT 'rascunho'");
        DB::statement("ALTER TABLE medical_records MODIFY COLUMN tipo_consulta ENUM('consulta', 'retorno', 'emergencia', 'exame', 'cirurgia') DEFAULT 'consulta'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            // Reverter as alterações
            $table->renameColumn('user_id', 'doctor_id');
            $table->renameColumn('data_consulta', 'consultation_date');
            $table->renameColumn('horario_consulta', 'consultation_time');
            $table->renameColumn('tipo_consulta', 'consultation_type');
            $table->renameColumn('queixa_principal', 'chief_complaint');
            $table->renameColumn('historia_doenca_atual', 'history_present_illness');
            $table->renameColumn('historia_patologica_pregressa', 'past_medical_history');
            $table->renameColumn('medicamentos_uso', 'medications');
            $table->renameColumn('alergias', 'allergies');
            $table->renameColumn('exame_fisico_geral', 'physical_examination');
            $table->renameColumn('sinais_vitais', 'vital_signs');
            $table->renameColumn('hipotese_diagnostica', 'assessment');
            $table->renameColumn('conduta', 'plan');
            $table->renameColumn('observacoes', 'observations');

            // Remover novas colunas
            $table->dropColumn([
                'historia_familiar',
                'historia_social',
                'exame_fisico_especifico',
                'cid',
                'prescricao',
                'exames_solicitados',
                'orientacoes',
                'retorno',
                'anexos'
            ]);

            // Restaurar colunas antigas
            $table->timestamp('signed_at')->nullable();
            $table->string('digital_signature')->nullable();
            $table->boolean('is_private')->default(false);
            $table->json('metadata')->nullable();
        });
    }
};
