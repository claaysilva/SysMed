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
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');

            // Informações básicas da consulta
            $table->date('consultation_date');
            $table->time('consultation_time');
            $table->string('consultation_type')->default('consulta'); // consulta, retorno, urgencia

            // Dados clínicos
            $table->text('chief_complaint')->nullable(); // Queixa principal
            $table->text('history_present_illness')->nullable(); // História da doença atual
            $table->text('past_medical_history')->nullable(); // História médica pregressa
            $table->text('medications')->nullable(); // Medicações em uso
            $table->text('allergies')->nullable(); // Alergias

            // Exame físico
            $table->text('physical_examination')->nullable();
            $table->json('vital_signs')->nullable(); // Sinais vitais (JSON: pressao, freq_cardiaca, temperatura, etc)

            // Avaliação e plano
            $table->text('assessment')->nullable(); // Avaliação médica
            $table->text('plan')->nullable(); // Plano de tratamento
            $table->text('observations')->nullable(); // Observações gerais

            // Controle de versão e status
            $table->enum('status', ['draft', 'completed', 'signed'])->default('draft');
            $table->timestamp('signed_at')->nullable();
            $table->string('digital_signature')->nullable(); // Hash da assinatura digital

            // Metadados
            $table->boolean('is_private')->default(false);
            $table->json('metadata')->nullable(); // Dados extras específicos por especialidade

            $table->timestamps();

            // Índices
            $table->index(['patient_id', 'consultation_date']);
            $table->index(['doctor_id', 'consultation_date']);
            $table->index('status');
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
