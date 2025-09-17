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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');

            // Informações do medicamento
            $table->string('medication_name');
            $table->string('generic_name')->nullable();
            $table->string('dosage'); // Ex: 500mg, 10ml
            $table->string('form'); // Ex: comprimido, xarope, cápsula

            // Posologia
            $table->string('frequency'); // Ex: 2x ao dia, 8/8h, 1x semana
            $table->integer('quantity'); // Quantidade total prescrita
            $table->string('administration_route')->default('oral'); // oral, intravenosa, tópica, etc
            $table->text('instructions')->nullable(); // Instruções especiais

            // Período de tratamento
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('duration_days')->nullable();

            // Controle e status
            $table->enum('status', ['active', 'completed', 'suspended', 'cancelled'])->default('active');
            $table->boolean('is_controlled')->default(false); // Medicamento controlado
            $table->boolean('generic_allowed')->default(true); // Permite medicamento genérico

            // Observações
            $table->text('contraindications')->nullable();
            $table->text('side_effects')->nullable();
            $table->text('observations')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['medical_record_id', 'status']);
            $table->index('medication_name');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
