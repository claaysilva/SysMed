<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Médico responsável
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('set null');

            // Dados da consulta
            $table->date('data_consulta');
            $table->time('horario_consulta');
            $table->enum('tipo_consulta', ['consulta', 'retorno', 'emergencia', 'exame', 'cirurgia'])->default('consulta');

            // Anamnese
            $table->text('queixa_principal')->nullable();
            $table->text('historia_doenca_atual')->nullable();
            $table->text('historia_patologica_pregressa')->nullable();
            $table->text('historia_familiar')->nullable();
            $table->text('historia_social')->nullable();
            $table->text('medicamentos_uso')->nullable();
            $table->text('alergias')->nullable();

            // Exame físico
            $table->json('sinais_vitais')->nullable(); // PA, FC, FR, Temp, etc.
            $table->text('exame_fisico_geral')->nullable();
            $table->text('exame_fisico_especifico')->nullable();

            // Avaliação e conduta
            $table->text('hipotese_diagnostica')->nullable();
            $table->text('cid')->nullable(); // Código CID-10
            $table->text('conduta')->nullable();
            $table->text('prescricao')->nullable();
            $table->text('exames_solicitados')->nullable();
            $table->text('orientacoes')->nullable();
            $table->date('retorno')->nullable();

            // Observações e arquivos
            $table->text('observacoes')->nullable();
            $table->json('anexos')->nullable(); // URLs dos arquivos anexados

            // Status
            $table->enum('status', ['rascunho', 'finalizado', 'assinado'])->default('rascunho');

            $table->timestamps();

            // Índices
            $table->index(['patient_id', 'data_consulta']);
            $table->index(['user_id', 'data_consulta']);
            $table->index(['tipo_consulta']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
